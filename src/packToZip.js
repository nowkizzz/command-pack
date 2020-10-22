const path = require("path");
const fs = require("fs");
const JSZip = require("jszip");
const zip = new JSZip();
const logger = require('../utils/logger')
const dayjs = require('dayjs')

// 读取目录及文件
function readDir(obj, nowPath) {
 // 读取目录中的所有文件及文件夹（同步操作）
  let files = fs.readdirSync(nowPath);
  files.forEach(function (fileName, index) {
    // 遍历检测目录中的文件
    let fillPath = nowPath + "/" + fileName;
    // 获取一个文件的属性
    let file = fs.statSync(fillPath); 
    // 如果是目录的话，继续查询
    if (file.isDirectory()) {
      // 压缩对象中生成该目录
      let dirlist = obj.folder(fileName); 
      // 重新检索目录文件
      readDir(dirlist, fillPath); 
    } else {
      // 压缩目录添加文件
      obj.file(fileName, fs.readFileSync(fillPath)); 
    }
  });
}

//开始压缩文件
function startZIP({
  distName = 'dist',
  projectName = 'web',
  isAddDateTip = true
}) {
  console.log('正在读取目录并准备zip压缩')
  const currPath = process.cwd(); //文件的绝对路径 当前当前js所在的绝对路径
  const targetDir = path.join(currPath, "./" + distName);
  const distZip = zip.folder(distName)
  readDir(distZip, targetDir);
  console.log('正在压缩中...')
  zip
    .generateAsync({
      //设置压缩格式，开始打包
      type: "nodebuffer", // nodejs用
      compression: "DEFLATE", // 压缩算法
      compressionOptions: {
        // 压缩级别
        level: 9,
      },
    })
    .then( (content) => {
      const dateTip = isAddDateTip ? dayjs(new Date()).format('YYYY年MM月DD日HH时mm分ss秒') : '';
      // 将打包的内容写入 当前目录下的 xxx.zip中
      fs.writeFileSync(`${currPath}\\${projectName}${dateTip}.zip`, content, "utf-8");
      console.log(`成功压缩为zip,压缩名字为${projectName}${dateTip}.zip`)
      logger.log({
        level: 'info',
        message: `zip压缩成功 ${currPath}\\${projectName}${dateTip}.zip`,
      })
    }).catch(e => {
      console.log('压缩失败', e)
      logger.log({
        level: 'error',
        message: `zip压缩失败: ${e}`,
      })
    });
}


module.exports = startZIP
