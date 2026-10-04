# 官网验收记录

验收时间：2026-10-04。项目目录：`/Users/adam/SuperKeyboard_Web`。

## 内容来源

页面介绍基于原生项目 `/Users/adam/SuperKeyboard`，提交 `163f474`。

- 主题数据来自 `Shared/Theme.swift`：24 套主题，其中 6 套免费、18 套 Pro；包含浅深配色、字体、键帽材料及渐变。
- 六款字体及完整许可原样复制自 `Resources/Fonts/`。官网字体文件名经过简化，文件内容未修改；`assets/font-sources.json` 保留原名、固定来源版本、版权许可和哈希。
- 五张 App 截图原样复制自 `Docs/Screenshots/Theme-Collection/`，均为 1206 × 2622 像素。没有生成虚构 App 界面。
- 下载 URL 暂为 `null`；页面明确显示“即将上线”，没有虚构发布日期、价格、商店评分或用户评价。

## 静态检查

在最终项目目录执行 `npm run check`，结果：

```text
PASS · 24 themes (6 free), 6 fonts, 5 screenshots
PASS · 117 bilingual strings, section anchors and 19 local assets
PASS · All 6 font binaries and license files match their original SHA-256 hashes
```

JavaScript 语法检查通过；中英文文案及动态占位符完整，站内锚点和本地资源可用，六款字体及其许可的 SHA-256 与原始来源一致。

## 浏览器检查

在 Codex 内置浏览器中使用本机静态服务器进行验证，首页返回 HTTP 200。已检查 1440px、1280px、768px、390px、320px 宽度。最终各尺寸的页面宽度与视口宽度一致，没有页面横向滚动。

| 检查 | 结果 |
| --- | --- |
| 中英文切换 | 页面标题、正文、按钮、分类、截图说明、ARIA 标签同步切换 |
| 日夜间切换 | 背景、正文、交互控件及主视觉键盘同步更新 |
| 偏好保存 | 切换后刷新，语言与外观保留；查询参数可指定初始语言和外观 |
| 主题画廊 | 默认 6 套精选，展开为 24 套；柔和 7、极简 4、经典 7、缤纷 6，收起恢复精选 |
| 主题外观演示 | 选择潮汐蓝后，主视觉名称、配色及按钮状态同步更新 |
| 字体字形预览 | 六款字体均正确加载；320px 与 390px 下逐一选择，完整显示样本文字 |
| App 截图 | 五个标签对应真实截图；切换标题、正文和 01/05 至 05/05 计数 |
| 截图放大 | 打开原图对话框，关闭按钮可用 |
| 隐私与许可 | 对话框打开正常；Esc 可关闭；六份完整许可可访问 |
| 常见问题 | 原生 details 展开及收起正常 |
| 手机导航 | 打开后导航可见，选择链接后收起；Esc 收起并将焦点返回导航按钮 |
| 下载占位 | App Store / TestFlight 无 href，aria-disabled=true，tabindex=-1 |
| 控制台 | 最终检查无 error 或 warn |

在浏览器检查中修正了装饰元素引起的横向溢出、320px 英文按钮折行、手机说明文字与色块间距，以及等宽字体样本被截断的问题。字体预览按实际可用宽度自适应缩放，六款字体均完整显示。

本次验证使用内置浏览器，没有在实体 iPhone 或 Safari 上进行完整浏览器兼容性验收。下载真实跳转未验证，因为当前没有正式下载地址。

## 预览截图

- `preview-zh-light.png`：中文日间版首屏，1440 × 1000。
- `preview-zh-light-full.png`：中文日间版全页。
- `preview-en-dark.png`：英文夜间版首屏，1440 × 1000。
- `preview-mobile.png`：390 × 1050 的手机中文日间版。

截图由真实浏览器页面直接截取，未重新绘制或美化。通过 `npm start` 启动本地预览；本次没有发布外部网站。
