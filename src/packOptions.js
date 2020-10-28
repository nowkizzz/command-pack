const inquirer = require("inquirer");
const chalk = require("chalk");
const executeOptions = require('./executeOptions')
const fs = require("fs");
const logger = require("../utils/logger");
const currentPath = process.cwd();
const { configFile } = require('../config/index');
let pkg = {}
const isHavaBuildPack = fs.existsSync(`${currentPath}/${configFile}`);


try {
  pkg = require(currentPath + "/package.json");
} catch(e) {

}


// 执行指令
function packAllOptions() {
  console.log(chalk.cyan("======================="));
  console.log(chalk.cyan("欢迎使用前端压缩包命令行工具"));
  console.log(chalk.cyan("======================="));
  if (isHavaBuildPack) {
    packUsePackConfig()
  } else {
    packOptions()
  }
}

// pack是否使用配置指令
function packUsePackConfig() {
  inquirer
  .prompt([
    {
      type: "confirm",
      name: "isUsePackConfig",
      message: `检测到有${configFile}文件，是否使用该文件参数执行命令？`,
      default: true,
      // when: isHavaBuildPack,
    },
  ]).then((answers) => {
    // console.log("answers", answers);
    if (answers.isUsePackConfig) {
      executeOptions(answers)
    } else {
      packOptions()
    }
  })
  .catch((error) => {
    console.log("执行选项失败:", error);
    logger.log({
      level: "error",
      message: `执行选项失败: ${error}`,
    });
  });
}

// 执行一般指令
function packOptions() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "distName",
        message: "请输入需要压缩的文件夹名：",
        default: "dist",
        validate: function (input) {
          let done = this.async()
          let fillPath = currentPath + '/' + input
          let file = fs.statSync(fillPath)
          if (!file.isDirectory()) {
              done(`${input}不是当前目录下的文件夹`)
              return;
          }
          done(null, true)
        }
      },
      {
        type: "list",
        name: "packType",
        message: "请选择压缩模式？（zip, tar.gz）",
        choices: [
          {
            value: "zip",
            name: "zip压缩: 一般发给后台开发打包更新，常用于旧项目",
          },
          {
            value: "targz",
            name: "tar.gz压缩: 一般直接到后台管理系统上传更新，常用于新项目",
          },
        ],
      },
      {
        type: "input",
        name: "projectName",
        message: "请输入压缩包名",
        default: pkg.name ? pkg.name.trim() : "web",
        when: (answers) => answers.packType === "zip",
      },
      {
        type: "input",
        name: "projectName",
        message: "请输入压缩包名",
        default: "web",
        when: (answers) => answers.packType === "targz",
      },
      {
        type: "confirm",
        name: "isAddDateTip",
        message: "压缩后名称是否添加时间标识？",
        default: true,
        when: (answers) => answers.packType === "zip",
      },
      {
        type: "confirm",
        name: "isAddMapHeader",
        message: "是否套多一层文件夹压缩？",
        default: false,
        when: (answers) => answers.packType === "targz",
      },
      {
        type: "confirm",
        name: "isToServer",
        message: "是否发送到服务器？",
        default: false,
        when: (answers) => answers.packType === "targz",
      },
      {
        type: "input",
        name: "serverHost",
        message: "请输入服务器IP地址：",
        default: "192.168.199.216",
        when: (answers) =>
          answers.packType === "targz" &&
          answers.isToServer &&
          !answers.isUseDeployServer,
        // 添加valiadate
        validate: function (input) {
          let done = this.async()
          if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(input)) {
            done('IP地址格式不正确,请重新修改')
            return;
          }
          done(null, true)
        }
      },
      {
        type: "input",
        name: "username",
        message: "请输入服务器账号：",
        default: "root",
        when: (answers) =>
          answers.packType === "targz" &&
          answers.isToServer &&
          !answers.isUseDeployServer,
      },
      {
        type: "password",
        name: "password",
        message: "请输入服务器密码：",
        default: "root",
        when: (answers) =>
          answers.packType === "targz" &&
          answers.isToServer &&
          !answers.isUseDeployServer,
      },
      {
        type: "number",
        name: "port",
        message: "请输入服务器端口号：",
        default: 22,
        when: (answers) =>
          answers.packType === "targz" &&
          answers.isToServer &&
          !answers.isUseDeployServer,
      },
      {
        type: "input",
        name: "serverPath",
        message: "请输入服务器前端目录：(最后需加上斜杠)",
        default: "/user/project/app/",
        when: (answers) =>
          answers.packType === "targz" &&
          answers.isToServer &&
          !answers.isUseDeployServer,
      },
      {
        type: "confirm",
        name: "isBuildCommandPackConfig",
        message: "是否生成压缩配置文件？",
        default: true,
      },
    ])
    .then((answers) => {
      // console.log("answers", answers);
      executeOptions(answers)
    })
    .catch((error) => {
      console.log("执行选项失败:", error);
      logger.log({
        level: "error",
        message: `执行选项失败: ${error}`,
      });
    });
}

module.exports = packAllOptions;
