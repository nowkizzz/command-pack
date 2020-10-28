#!/usr/bin/env node
const chalk = require("chalk");
const fs = require("fs");
const path = require('path')
const packOptions = require("./src/packOptions");
const executeOptions = require('./src/executeOptions')
const { program } = require("commander");
const { configFile } = require('./config/index')
const currentPath = process.cwd();
const isHaveDefaultDeployConfig = fs.existsSync(`${currentPath}/${configFile}`);
let pkg = {}
try {
  pkg = require("./package.json");
} catch(e) {
 // console.log(e)
}
program
  .version(pkg.version || '1.0.0')
  .option("-a, --all", "获取全部参数")
  .option("-c, --config <configPath>", "压缩的js配置文件")
  .option(
    "-dc, --defaultConfig ",
    "压缩的js默认配置文件",
    configFile
  );

program.parse(process.argv);

if (program.all) console.log(program.opts());


// 配置文件
if (program.config) {
  const pathFile = path.resolve(currentPath, program.config)
  const isHaveConfig = fs.existsSync(pathFile);
  if (isHaveConfig) {
    if (!/.js$/.test(program.config)) {
      console.log(chalk.red("文件需要为js文件"));
      return;
    }
    let deployConfig = require(pathFile);
    // console.log('deployConfig',deployConfig);
    if (typeof deployConfig === 'object' && deployConfig !== null) {
      executeOptions(deployConfig)
    } else {
      console.log(chalk.red("对象不存在"));
    }
  } else {
    console.log(chalk.red(pathFile + "文件不存在"));
  }
}

// 默认配置
if (program.defaultConfig) {
  if (isHaveDefaultDeployConfig) {
    let deployConfig = require(`${currentPath}/${configFile}`);
    if (deployConfig) {
      executeOptions(deployConfig)
    }
  } else {
    console.log(chalk.red(`${configFile}/文件不存在`));
  }
}

// 没有配置文件 就进入命令行模式
if (!program.config && !program.defaultConfig) {
  packOptions()
}
