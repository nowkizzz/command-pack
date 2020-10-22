const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const currentPath = process.cwd();
const logger = require("../utils/logger");
const { configFile } = require('../config/index')

/**
 * @description 生成压缩参数文件
 * @param {*} serverOption 命令行参数
 */
function buildCommandPackConfig(serverOption) {
  try {
    const tplPath = path.join(__dirname, "../templates/_pack.config.ejs");
    const str = ejs.render(fs.readFileSync(tplPath, "utf-8"), {
      serverOption: serverOption,
    });
    fs.writeFileSync(`${currentPath}/${configFile}`, str);
    console.log(`生成${configFile}成功`)
    logger.log({
      level: "info",
      message: `生成${configFile}成功: ${currentPath}/${configFile}`,
    });
  } catch (e) {
    console.log(`生成${configFile}失败: ${e}`)
    logger.log({
      level: "error",
      message: `生成${configFile}失败: ${e}`,
    });
  }
}

module.exports = buildCommandPackConfig;
