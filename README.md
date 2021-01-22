# YOOOFUNelectron

### 使用流程
1. npm install electron-builder@20.44.4 -g 全局安装electron-builder。
2. npm run dist 打包windows-64位。
3. npm run start 本地运行调试 ctrl+shift+i 打开debug模式。

### 打包其他系统
electron-builder --xxx 具体参数百度

### 项目介绍
1. 核心代码 app/main.js 支持自动更新
2. installer.nsh exe安装完成之后执行的脚本，开机自启动
3. icon/logo.ico 更换exe logo

### package参数介绍(具体自行百度)
1. build.win windows 打包参数
2. build.nsis 安装包参数