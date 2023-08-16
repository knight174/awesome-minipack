// 1. 读取 index.js 的文件内容
// 2. 拿到文件依赖，用 @babel/parser 解析代码，拿到抽象语法树 ast（ast.program.body）
// 3. 拿到依赖关系，用 @babel/traverse 从 ast 中找到 import 的节点，拿到所有的依赖关系（{filename, dependencies}）
// 4. 转换成浏览器可运行代码，用 @babel/core 解析 esm 模块代码为浏览器可运行代码 ({filename, dependencies, code})
// 5. 递归生成整个项目的依赖图谱
// 6. 生成最终代码，依赖图谱中的 require 以及 exports 在浏览器不存在，需要构造

const path = require('path');
const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

let options;
try {
  const configPath = path.resolve(__dirname, 'minipack.config.js');
  options = require(configPath);
} catch (err) {
  throw new Error('缺少配置文件：minipack.config.js');
}

// 模块依赖
const moduleAnalyser = (filename) => {
  const content = fs.readFileSync(filename, 'utf-8');
  const ast = parser.parse(content, {
    sourceType: 'module',
  });
  // console.log(ast.program.body);
  const dependencies = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      // console.log(node);
      const dirname = path.dirname(filename); // 文件夹名称
      const newFile = './' + path.join(dirname, node.source.value);
      dependencies[node.source.value] = newFile;
      // console.log(dependencies);
    },
  });
  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env'],
  });

  // console.log(code);

  return {
    filename,
    dependencies,
    code,
  };
};

// 依赖图谱
const makeDependenciesGraph = (entry) => {
  const entryModule = moduleAnalyser(entry);
  const graphArray = [entryModule];
  for (let i = 0; i < graphArray.length; i++) {
    const item = graphArray[i];
    const { dependencies } = item;
    // 递归：如果该模块还有依赖，那么继续放进 moduleAnalyser 拿到下一个 module，然后 push 到 graphArray，最后拿到最终到依赖图
    if (dependencies) {
      for (const dep in dependencies) {
        graphArray.push(moduleAnalyser(dependencies[dep]));
      }
    }
  }
  // 数据结构转换
  const graph = {};
  graphArray.forEach((item) => {
    graph[item.filename] = {
      dependencies: item.dependencies,
      code: item.code,
    };
  });
  return graph;
};

// 生成最终代码（主要是 requrie 方法的构建和 exports 对象的处理）
const generateCode = (entry) => {
  // 将 js 对象转换为字符串
  const graph = JSON.stringify(makeDependenciesGraph(entry));
  // 经过 @babel/core 代码转换，import 语法被处理成 require 方法；export 语法被处理成 exports 对象
  // 传入依赖图谱字符串，如果 eval 出的代码里有 require，那么就执行传入 localRequire 方法
  // localRequire 方法：根据 dependencies[relativePath]，继续递归执行外部作用域的 require 方法，又会再次进入 eval，执行代码
  // exports 对象处理：当执行 require 方法时，如果模块里的通过 exports 导出属性或者方法时，需要有个空对象承接，然后下一个模块才能用这个结果。
  return `(function (graph) {
      function require(module) {
        function localRequire(relativePath) {
          return require(graph[module].dependencies[relativePath]);
        }
        var exports = {};
        (function (require, exports, code) {
          eval(code);
        })(localRequire, exports, graph[module].code);
        return exports;
      }
      require('${entry}');
    })(${graph})`;
};

// const code = generateCode('./src/index.js');
// console.log(code);

(function (options) {
  const folderName = options.output.path;
  fs.mkdir(folderName, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    } else {
      // 创建并写入文件
      const fileName = options.output.filename;
      const fileContent = generateCode(options.entry);

      fs.writeFile(`${folderName}/${fileName}`, fileContent, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Bundle successfully.`);
        }
      });
    }
  });
})(options);
