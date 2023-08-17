# awesome-minipack

A mini bundler for ESM. | ESM 模块打包器

## start

```bash
npm i awesome-minipack
```

## example

### minipack.config.js

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

### scripts

scripts in package.json

```json
"scripts": {
  "build": "minipack"
},
```

### bundle

```bash
npm run build
# or
npx minipack
# or
npx minipack -c minipack.config.js
```
