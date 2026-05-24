# Count Me In - 部署到 GitHub Pages 指南

## 📁 项目结构

```
count-me-in/
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署配置
├── src/                          # 源代码
│   ├── components/               # React 组件
│   ├── audio/                    # 音频引擎
│   ├── utils/                    # 工具函数
│   └── types/                    # TypeScript 类型
├── dist/                         # 构建输出目录
└── vite.config.ts                # Vite 配置
```

## 🚀 部署步骤

### 1. 创建 GitHub 仓库

1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 仓库名称：`count-me-in`（或你喜欢的名字）
4. 选择 "Public"（公开）
5. 点击 "Create repository"

### 2. 推送代码到 GitHub

```bash
# 进入项目目录
cd count-me-in

# 初始化 git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Count Me In 节拍器"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/count-me-in.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 3. 配置 GitHub Pages

1. 进入仓库页面
2. 点击 "Settings" 标签
3. 左侧菜单选择 "Pages"
4. "Source" 选择 "GitHub Actions"
5. 保存设置

### 4. 等待自动部署

- GitHub Actions 会自动运行部署流程
- 进入仓库的 "Actions" 标签查看部署状态
- 部署完成后，会显示访问链接

### 5. 配置自定义域名（可选）

1. 在 `public/` 目录创建 `CNAME` 文件：
   ```
   your-domain.com
   ```

2. 在你的域名 DNS 设置中添加 CNAME 记录：
   - 主机记录：`www` 或 `@`
   - 记录值：`你的用户名.github.io`

3. 在 GitHub Pages 设置中输入你的自定义域名

4. 等待 DNS 生效（通常几分钟到几小时）

## 📝 URL 参数说明

部署后，你可以通过 URL 参数分享配置：

```
https://your-domain.com/?bpm=120&ts=4-4&sub=2&vm=counting#g100-50-0.v100-80-60-30
```

| 参数 | 说明 | 示例 |
|------|------|------|
| `bpm` | 速度 | 60-300 |
| `ts` | 拍号 | 4-4, 7-8 |
| `sub` | 细分级别 | 1,2,3,4,swing8 |
| `vm` | 语音模式 | counting, takadimi |
| `bg` | 拍组 | 3.3.2 (3+3+2) |
| `#g...` | 通道音量 | g100-50-0 |
| `#v...` | 细分音量 | v100-80-60-30 |

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 🎵 功能特性

- ✅ BPM 控制（20-300）
- ✅ TAP 测速
- ✅ 多种拍号（4/4, 3/4, 6/8, 7/8, 5/8, 等）
- ✅ 自定义拍组（如 3+3+2）
- ✅ 细分级别（四分/八分/三连音/十六分/Swing）
- ✅ 语音计数（1 e + a / Ta ka di mi）
- ✅ 咔嗒声
- ✅ 鼓声
- ✅ 独立音量控制
- ✅ URL 状态同步
- ✅ 本地存储记忆
- ✅ 空格键播放/停止

## 📄 文件说明

| 文件 | 说明 |
|------|------|
| `src/audio/AudioEngine.ts` | Web Audio API 音频引擎 |
| `src/audio/SampleGenerator.ts` | 音频样本合成器 |
| `src/App.tsx` | 主应用组件 |
| `src/App.css` | 样式文件 |
| `src/utils/urlState.ts` | URL 状态管理 |
| `src/utils/timeSignature.ts` | 拍号计算工具 |

## 🐛 常见问题

### 音频无法播放
- 确保浏览器支持 Web Audio API
- 点击页面任意位置激活音频上下文

### 部署后页面空白
- 检查 `vite.config.ts` 中的 `base` 配置
- 如果使用子目录，设为 `/仓库名/`
- 如果使用自定义域名，设为 `./`

### URL 参数不生效
- 确保参数格式正确
- 检查浏览器控制台是否有错误

## 📞 支持

如有问题，请查看：
- GitHub Issues
- Web Audio API 文档
- React 文档
