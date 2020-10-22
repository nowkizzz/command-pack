const path = require("path");
const fs = require("fs");
const tar = require("tar-fs");
const zlib = require("zlib");
const node_ssh = require("node-ssh");
const ssh = new node_ssh();
const currentPath = process.cwd();
const logger = require("../utils/logger");

/**
 * @description tar.gz压缩
 * @param {Object} serverOption 服务器选项
 */
function packToTarGz(serverOption) {
  // 压缩文件
  try {
    console.log("==========================================");
    console.log("开始进行tar.gz压缩");
    tar
      .pack(path.resolve(currentPath, "./" + serverOption.distName), {
        // map: function(header) {
        //   // console.log(header, '头部栏')
        //   header.name = serverOption.distName + '/' + header.name;
        //   return header;
        // },
        finish: function (sameAsMypack) {
          console.log("压缩成tar.gz文件");
          let frReader = fs
            .createReadStream(
              path.resolve(currentPath, serverOption.projectName + ".tar")
            )
            .pipe(zlib.createGzip())
            .pipe(
              fs.createWriteStream(
                path.resolve(currentPath, serverOption.projectName + ".tar.gz")
              )
            );
          frReader.on("finish", () => {
            // console.log('成功压缩文件就连接服务器');
            fs.unlink(
              path.resolve(currentPath, serverOption.projectName + ".tar"),
              (err) => {
                if (err) throw err;
                console.log("已成功删除" + serverOption.projectName + ".tar");
                console.log("==========================================");
              }
            );
            console.log("已压缩为tar.gz文件");
            logger.log({
              level: "info",
              message: `targz 套多一层文件夹 压缩成功 ${currentPath}\\${serverOption.projectName}.tar.gz`,
            });
            if (serverOption.isToServer) {
              putFileToServer(serverOption);
            }
          });
        },
      })
      .pipe(
        fs.createWriteStream(
          path.resolve(currentPath, serverOption.projectName + ".tar")
        )
      );
  } catch (e) {
    logger.log({
      level: "error",
      message: `targz压缩失败: ${e}`,
    });
  }
};

/**
 * @description tar.gz压缩 添加多一个文件夹
 * @param {Object} serverOption 服务器选项
 */
function packToAddMapHeaderTarGz(serverOption) {
  try {
    console.log("==========================================");
    console.log("开始进行tar.gz加头部header压缩");
    // 压缩文件
    tar
      .pack(path.resolve(currentPath, "./" + serverOption.distName), {
        map: function (header) {
          header.name = serverOption.projectName + "/" + header.name;
          return header;
        },
        finish: function (sameAsMypack) {
          console.log("压缩成tar.gz文件");
          let frReader = fs
            .createReadStream(
              path.resolve(currentPath, serverOption.projectName + ".tar")
            )
            .pipe(zlib.createGzip())
            .pipe(
              fs.createWriteStream(
                path.resolve(currentPath, serverOption.projectName + ".tar.gz")
              )
            );
          frReader.on("finish", () => {
            fs.unlink(
              path.resolve(currentPath, serverOption.projectName + ".tar"),
              (err) => {
                if (err) throw err;
                console.log("已成功删除" + serverOption.projectName + ".tar");
                console.log("==========================================");
              }
            );
            console.log("已压缩为tar.gz文件");
            logger.log({
              level: "info",
              message: `targz 套多一层文件夹 压缩成功 ${currentPath}\\${serverOption.projectName}.tar.gz`,
            });
            if (serverOption.isToServer) {
              putFileToServer(serverOption);
            } 
          });
        },
      })
      .pipe(
        fs.createWriteStream(
          path.resolve(currentPath, serverOption.projectName + ".tar")
        )
      );
  } catch (e) {
    logger.log({
      level: "error",
      message: `targz套多一层文件夹 压缩失败: ${e}`,
    });
  }
};

/**
 * @description 压缩包发送到服务器
 * @param {*} serverOption 服务器选项
 */
function putFileToServer(serverOption) {
  // node连接ssh
  console.log("正在连接服务器...");
  ssh
    .connect({
      host: serverOption.serverHost,
      username: serverOption.username,
      port: serverOption.port,
      password: serverOption.password,
      tyrKeyboard: true,
      onKeyboardInteractive: (
        name,
        instructions,
        instructionsLang,
        prompts,
        finish
      ) => {
        if (
          prompts.length > 0 &&
          prompts[0].prompt.toLowerCase().includes("password")
        ) {
          finish([serverOption.password]);
        }
      },
    })
    .then(function () {
      // 放文件
      ssh
        .putFile(
          path.resolve(currentPath, serverOption.projectName + ".tar.gz"),
          serverOption.serverPath + serverOption.projectName + ".tar.gz"
        )
        .then(
          function () {
            console.log("压缩包已上传到服务器");
            ssh
              .execCommand(
                "tar -zxvf " + serverOption.projectName + ".tar.gz",
                {
                  cwd: serverOption.serverPath,
                }
              )
              .then(function (result) {
                console.log(
                  "解压压缩包",
                  result.stderr ? "失败：" + result.stderr : "成功"
                );

                ssh
                  .execCommand(
                    "rm -f " + serverOption.projectName + ".tar.gz",
                    {
                      cwd: serverOption.serverPath,
                    }
                  )
                  .then(function (result) {
                    console.log(
                      "删除压缩包",
                      result.stderr ? "失败：" + result.stderr : "成功"
                    );
                    ssh.dispose();

                    console.log("执行成功,任务完成");
                    logger.log({
                      level: "info",
                      message: `传输到服务器成功: ${serverOption.serverHost}:${serverOption.port} ${serverOption.serverPath}`,
                    });
                  });
              });
          },
          function (error) {
            console.log("传输到服务器失败", error);
            logger.log({
              level: "error",
              message: `传输到服务器失败: ${error}`,
            });
          }
        );
    });
}

module.exports = {
  packToTarGz,
  packToAddMapHeaderTarGz
}
