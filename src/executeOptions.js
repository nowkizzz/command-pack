const fs = require('fs')
const { packToTarGz, packToAddMapHeaderTarGz } = require("./packToTarGz");
const packToZip = require("./packToZip");
const buildCommandPackConfig = require("./buildCommandPackConfig");
const { configFile } = require('../config/index');
const currentPath = process.cwd();
const isHavaBuildPack = fs.existsSync(`${currentPath}/${configFile}`);
let buildPackQuery = {};
if (isHavaBuildPack) {
  buildPackQuery = require(`${currentPath}/${configFile}`);
}

function executeOptions(answers) {
  // 是否使用配置文件 若使用配置文件 修改参数
  if (answers.isUsePackConfig) {
    answers = buildPackQuery
  }
  // 是否生成 config.config.js
  if (answers.isBuildCommandPackConfig) {
    buildCommandPackConfig(answers)
  }
  // 传输服务器类型
  if (answers.packType === "zip") {
    packToZip(answers);
  } else if (answers.packType === "targz") {
    // 有且使用配置文件
    let query = answers.isUseDeployServer
      ? { ...answers, ...develoyServerJson }
      : answers;
    // 是否套多一层文件夹
    answers.isAddMapHeader
      ? packToAddMapHeaderTarGz(query)
      : packToTarGz(query);
  }
}

module.exports = executeOptions;
