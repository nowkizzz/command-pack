## 前端压缩包命令行工具

### 任务处理
- [x] zip,tar.gz压缩
- [x] 添加日志功能
- [x] 基于配置文件处理打包
- [ ] 设备debug环境

### 说明
1. 提供zip和targz压缩处理。targz提供压缩并可上传到服务器处理。 
2. 执行一次命令后，可处理是否生成 `pack.config.js`文件

### 使用
1. 全局安装 pack-command
```js
npm i -g pack-command
```

2. 在当前目录使用命令行
```js
pack-command 
```

3. 若有`pack.config.js`文件，可使用以下命令运行默认配置文件
```js
pack-command -dc
```
or  使用指定js文件压缩
```js
pack-command -c pack.config.js
```
4. 生成默认配置文件，首先会检测目录下是否有`pack.config.js`，若有则提示是否使用默认配置文件。（默认配置文件也可进行修改）