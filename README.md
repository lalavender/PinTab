
# PinTab

[中文](README.md) | [English](README_en.md)

PinTab 是一个开源的新标签页浏览器插件，基于 [PintreeNewTab](https://github.com/tangxiaoqi-tangxiao/PintreeNewTab.git) 构建。

它可以将浏览器书签转换成一个美观、清晰、易用的导航页面，让原本不方便管理和浏览的书签变成你的专属新标签页主页。

![封面](.github/imgs/og.png)

## 功能特点

- 将浏览器书签展示为新标签页导航页面
- 自动读取并展示浏览器书签
- 支持多级书签目录结构
- 界面简洁，适合作为日常主页使用
- 根据浏览器语言自动切换界面语言
- 开源、轻量、易于本地运行和二次开发

## 支持语言

- 简体中文
- English

## 本地开发

### 环境要求

推荐使用 `Node.js v20` 或更高版本。

### 安装依赖

```bash
pnpm install
```

### 启动开发环境

```bash
pnpm run dev
```

运行后，项目会自动打开浏览器并安装开发版本扩展。  
后续修改代码时，扩展会自动刷新，方便调试。

## 项目打包

执行以下命令进行打包：

```bash
pnpm run build
```

打包后的文件会生成在 `.output` 目录中。

## 后续计划

- 优化书签展示样式
- 支持更多自定义配置
- 优化移动端显示效果
- 增强书签搜索能力
- 完善国际化文案

## 致谢

本项目基于 [PintreeNewTab](https://github.com/tangxiaoqi-tangxiao/PintreeNewTab.git) 构建，感谢原项目提供的优秀基础能力和设计思路。
