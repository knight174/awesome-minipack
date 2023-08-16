// 1. 读取 index.js 的文件内容
// 2. 拿到文件依赖，用 @babel/parser 解析代码，拿到抽象语法树 ast（ast.program.body）
// 3. 拿到依赖关系，用 @babel/traverse 从 ast 中找到 import 的节点，拿到所有的依赖关系（{filename, dependencies}）
// 4. 转换成浏览器可运行代码，用 @babel/core 解析 esm 模块代码为浏览器可运行代码 ({filename, dependencies, code})

const path = require('path');
const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

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

const moduleInfo = moduleAnalyser('./src/index.js');
console.log(moduleInfo);
