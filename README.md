# SuperKeyboard 官网

SuperKeyboard 的独立官方介绍页。暖白与墨绿的视觉风格，支持中英文、日夜间模式、主题外观演示、字体预览、真实 App 截图、隐私说明及下载入口。

## 本地查看

无需安装依赖。使用 Node.js 20 或更新版本：

```sh
cd /Users/adam/SuperKeyboard_Web
npm start
```

浏览器打开 <http://127.0.0.1:4173>。使用 `PORT=4174 npm start` 可更换端口。按 `Ctrl+C` 关闭预览服务器。

## 页面内容

- 24 套主题，含 6 套免费主题与 18 套 Pro 主题。配色、材料与字体来自原生 App 的主题目录。
- 6 款精选免费字体的字形预览；App 还包含 3 种系统样式，共 9 种字体样式。
- 中文全拼与九宫格、自定义创作、实时预览与试打、主题收藏与分享。
- 5 张原生 App 截图：主题画廊、创作页、字体选择、试打和系统键盘扩展。截图展示中文 App 界面。
- 隐私说明、完全访问说明、字体许可及启用键盘的常见问题。
- App Store 与 TestFlight 暂留入口，默认明确显示“即将上线”。

官网中的绘制键盘是外观演示，不提供真实输入法功能。功能文案基于当前原生项目；网站的双语展示不代表原生 App 界面已经双语化。

## 修改下载链接

编辑 `content.js` 顶部的配置：

```js
config: {
  appStoreURL: null,
  testFlightURL: null
}
```

将对应的 `null` 替换为真实 HTTPS 地址，入口会自动变为可点击的链接。没有填写的入口保持不可用。正式发布时同时更新首页与下载区的发布状态文案，以及 `faq.where.a`、`download.note`，避免上线后仍显示“即将上线”。不包含虚构的商店地址、发布日期、用户评价或售价。

## 内容与资源

| 文件 | 用途 |
| --- | --- |
| `index.html` | 页面结构与 SEO 元信息 |
| `styles.css` | 响应式布局、日夜间外观与键帽样式 |
| `content.js` | 双语文案、下载配置、字体和截图列表 |
| `themes.js` | 24 套主题的原生配色及样式 |
| `app.js` | 语言、外观、画廊、字体预览与对话框交互 |
| `assets/screenshots/` | 原生 App 截图 |
| `assets/fonts/` | 本地字体，未修改原始二进制 |
| `assets/licenses/` | 字体的完整 SIL OFL 1.1 许可与版权声明 |
| `assets/font-sources.json` | 字体来源、版本及 SHA-256 校验值 |
| `scripts/serve.mjs` | 不依赖第三方包的本地静态服务器 |

品牌图标与 iOS 项目保持一致，采用白色日间和炭黑夜间的软键 `S_` 图标。页头、首页和页脚随网页外观切换，浏览器标签图标也同步切换；Apple Touch 图标和分享缩略图使用白色日间版本。原始 PNG 与原生项目一致，小尺寸网页资源由 macOS sips 导出，来源与校验值见 `assets/app-icon-sources.json`。

语言与外观选择仅保存在浏览器本地；未手动选择外观时，页面和图标跟随系统设置及其变化。可用 `?lang=zh&theme=light` 或 `?lang=en&theme=dark` 指定初始显示。网站不接入广告、统计、追踪或远程字体服务。

## 校验

```sh
npm run check
```

检查脚本语法、双语文案、主题数量、站内锚点、本地资源与字体/许可原始哈希。浏览器视觉与交互检查记录见 `docs/verification.md`。

## 发布准备

本项目为纯静态站点，不需要构建步骤。正式部署时上传 `index.html`、`styles.css`、`content.js`、`themes.js`、`app.js` 和 `assets/`。域名确定后将 `og:image` 改为完整 HTTPS 地址，并补充正式网站 URL。本次只生成本地项目，未发布到外部网站。
