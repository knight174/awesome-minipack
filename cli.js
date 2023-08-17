#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const minipack = require('./index');

program
  .version('1.0.0')
  .option('-c, config <path>', 'specify the webpack config file')
  .parse(process.argv);

const configFile = program.config || 'minipack.config.js';

if (!fs.existsSync(configFile)) {
  console.error(`Config file "${configFile}" not found.`);
  process.exit(1);
}

const minipackConfig = require(path.resolve(process.cwd(), configFile));
minipack(minipackConfig, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Bundle completed successfully.');
});
