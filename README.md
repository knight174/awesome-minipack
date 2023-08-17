# awesome-minipack

ESM 模块打包器

## start

```bash
npm i awesome-minipack

# bundle
minipack
# or
minipack -c minipack.config.js
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

### bundle

```bash
npx minipack
# or
npx minipack -c minipack.config.js
```
