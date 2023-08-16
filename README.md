## webpack bundler demo

模拟一个打包器

```bash
npm i cli-highlight -g # 代码高亮
npm i @babel/parser # 解析出语法树
npm i @babel/traverse # 遍历取出依赖关系
npm i @babel/core # 转换代码
npm i @babel/preset-env # 根据目标环境自动确定要使用的转换和插件
```

## start

```bash
node bundler.js | highlight
```
