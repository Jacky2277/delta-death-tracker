# Delta Death Tracker

《三角洲行动》撤离失败 / 死亡原因统计桌面应用。

作者：Jacky2277  
GitHub：https://github.com/Jacky2277

## 当前版本

v0.2.0 MVP

### 已实现

- 自定义干员
- 自定义死亡 / 撤离失败原因
- 自定义地图
- 一键记录本局
- 撤离成功 / 失败统计
- 按干员统计
- 按死亡原因统计
- 干员独立详情
- 地图维度统计
- 死亡原因反向查看干员
- 历史记录
- 本地数据保存
- JSON 导入 / 导出
- Windows NSIS 安装包构建配置

## 开发环境

建议使用 Node.js LTS + npm。

```bash
npm install
npm start
```

## 构建 Windows 安装程序

```bash
npm run build:win
```

完成后安装包位于 `release/`。

项目使用 Electron 构建桌面应用。
