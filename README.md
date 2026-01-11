<div align="center">

# 幸运营销汇 - 大抽奖营销平台前端

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-支持-2496ED?logo=docker)](https://www.docker.com/)

**基于 Next.js 15 + React 19 的抽奖营销平台前端应用**

</div>

---

## 项目介绍

幸运营销汇是一个功能完善的抽奖营销平台前端项目，为用户提供多种互动抽奖玩法。用户可以通过九宫格抽奖、大转盘等方式获取奖品，支持每日签到领取积分、积分兑换抽奖次数、十连抽等丰富功能。

**项目特点：**
- 采用 Next.js 15 App Router + React 19 最新技术栈
- 基于 `@lucky-canvas/react` 实现流畅的抽奖动画
- Standalone 输出模式，轻量级 Docker 部署
- 响应式设计，适配移动端和桌面端

---

## 系统架构

### 技术架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         用户层 (浏览器)                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  九宫格抽奖  │  │  大转盘抽奖  │  │  积分兑换   │  │  每日签到   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                    Next.js 15 + React 19                             │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      API Layer (src/apis/)                      │  │
│  │  抽奖接口 | 签到接口 | 兑换接口 | 账户查询 | 规则查询           │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                   Component Layer (组件层)                      │  │
│  │  LuckyGrid | LuckyWheel | MemberCard | SkuProduct | Calendar   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                    后端 API 服务 (独立部署)                            │
│           API_HOST_URL: http://127.0.0.1:8091                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 前端数据流

```
用户操作          组件状态          API调用          后端处理
   │               │                │                │
   ├─ 点击抽奖 ──> play() ──────> draw() ──────> 返回抽奖结果
   │               │                │                │
   ├─ 十连抽 ────> play() ──────> tenDraw() ────> 返回10个结果
   │               │                │                │
   ├─ 签到 ──────> 更新状态 ─────> calendarSign() ─> 返还积分
   │               │                │                │
   └─ 兑换 ──────> 刷新次数 ─────> exchangeSku() ─> 扣除积分
```

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **Next.js** | 15.3.5 | React 框架，App Router |
| **React** | 19.0 | UI 库 |
| **TypeScript** | 5.x | 开发语言 |
| **Tailwind CSS** | 4.x | 样式框架 |
| **@lucky-canvas/react** | 0.1.13 | 抽奖动画组件 |

### 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| ESLint | 9.x | 代码规范检查 |
| @types/* | latest | TypeScript 类型定义 |

---

## 功能特性

### 抽奖功能模块

| 功能 | 描述 |
|------|------|
| **九宫格抽奖** | 3x3 网格抽奖，支持单抽和十连抽 |
| **抽奖装配** | 活动初始化，加载奖品配置 |

### 账户管理模块

| 功能 | 描述 |
|------|------|
| **会员卡片** | 展示用户积分、每日抽奖次数、签到状态 |
| **活动账户** | 抽奖次数管理，支持积分兑换 |
| **抽奖记录** | 展示用户历史中奖记录 |

### 积分系统模块

| 功能 | 描述 |
|------|------|
| **每日签到** | 签到获得积分返利 |
| **积分兑换** | 使用积分兑换抽奖次数（SKU商品） |
| **规则权重** | 展示保底奖励进度 |

---

## 效果展示
<!-- TODO: 添加截图 -->

- **首页**  ![img_1.png](img_1.png)
- **九宫格抽奖**  ![img_2.png](img_2.png)
- **积分兑换**  ![img.png](img.png)

---

## 项目结构

```
big_market_front/
├── src/
│   ├── app/                          # Next.js App Router 目录
│   │   ├── components/               # 业务组件
│   │   │   ├── ActivityAccount.tsx   # 活动账户组件
│   │   │   ├── CalendarSign.tsx      # 日历签到组件
│   │   │   ├── DrawRecords.tsx       # 抽奖记录组件
│   │   │   ├── MemberCard.tsx        # 会员卡片组件
│   │   │   ├── SkuProduct.tsx        # 积分兑换组件
│   │   │   ├── StrategyArmory.tsx    # 策略装配（抽奖初始化）
│   │   │   └── StrategyRuleWeight.tsx # 规则权重展示
│   │   ├── pages/                    # 页面组件
│   │   │   └── lucky/                # 抽奖页面
│   │   │       ├── lucky-grid-page.tsx    # 九宫格抽奖页
│   │   │       └── lucky-wheel-page.tsx   # 大转盘抽奖页
│   │   ├── layout.tsx                # 根布局
│   │   ├── page.tsx                  # 首页
│   │   └── globals.css               # 全局样式
│   ├── apis/                         # API 接口层
│   │   └── index.tsx                 # 所有 API 调用函数
│   └── types/                        # TypeScript 类型定义
│       ├── DrawRecordVO.ts           # 抽奖记录类型
│       ├── RaffleAwardVO.ts          # 奖品信息类型
│       ├── SkuProductResponseDTO.ts  # SKU 商品类型
│       ├── StrategyRuleWeightVO.ts   # 规则权重类型
│       ├── TenDrawDTO.ts             # 十连抽类型
│       └── UserActivityAccountVO.ts  # 用户账户类型
├── public/                           # 静态资源
│   ├── raffle-award-*.png            # 奖品图片
│   ├── raffle-button.png             # 抽奖按钮图片
│   └── ...                           # 其他静态资源
├── .claude/                          # Claude Code 配置
│   ├── CLAUDE.md                     # 项目指南
│   └── README.md                     # 参考文档
├── next.config.js                    # Next.js 配置
├── package.json                      # 项目依赖
├── Dockerfile                        # Docker 构建文件
├── build.sh                          # Docker 构建脚本
└── README.md                         # 本文档
```

---

## 快速开始

### 环境要求

| 依赖 | 版本 | 必需 |
|------|------|------|
| Node.js | 18+ | 是 |
| npm / yarn / pnpm | 最新版 | 是 |

### 1. 克隆项目

```bash
git clone <repository_url>
cd big_market_front
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
# 后端 API 地址
API_HOST_URL=http://127.0.0.1:8091
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

**重要提示：** 应用需要以下查询参数才能正常运行：
- `userId` - 用户标识
- `activityId` - 活动 ID

示例：
```
http://localhost:3000/?userId=zxy&activityId=100301
```

### 5. 构建生产版本

```bash
npm run build
npm run start
```

---

## Docker 快速部署

### 使用构建脚本

```bash
# 构建镜像
./build.sh

# 生成的镜像：orbiszx/big-market-front-app:3.4
```

### 手动构建

```bash
docker build -t big-market-front:latest .
```

### 运行容器

```bash
docker run -d -p 3000:3000 -e API_HOST_URL=http://your-backend:8091 --name big-market-front big-market-front:latest
```

### Docker Compose 示例

```yaml
version: '3.8'
services:
  frontend:
    image: orbiszx/big-market-front-app:3.4
    ports:
      - "3000:3000"
    environment:
      - API_HOST_URL=http://backend:8091
    restart: unless-stopped
```

---

## 核心 API 速查

### API 基础路径
```
${API_HOST_URL}/api/v1/raffle/
```

### 主要接口

| 函数名 | 接口路径 | 方法 | 描述 |
|--------|----------|------|------|
| `activityStrategyArmory` | `/activity/armory` | GET | 初始化抽奖策略 |
| `queryRaffleAwardList` | `/strategy/query_raffle_award_list` | POST | 查询奖品列表 |
| `draw` | `/activity/draw` | POST | 单次抽奖 |
| `tenDraw` | `/activity/ten_draw` | POST | 十连抽 |
| `queryUserActivityAccount` | `/activity/query_user_activity_account` | POST | 查询用户抽奖次数 |
| `queryUserCreditAccount` | `/activity/query_user_credit_account` | POST | 查询用户积分 |
| `calendarSignRebate` | `/activity/calendar_sign_rebate` | POST | 每日签到返利 |
| `creditPayExchangeSku` | `/activity/credit_pay_exchange_sku` | POST | 积分兑换抽奖次数 |
| `queryRaffleStrategyRuleWeight` | `/strategy/query_raffle_strategy_rule_weight` | POST | 查询规则权重 |
| `queryUserDrawRecords` | `/activity/query_user_award_record_list` | POST | 查询抽奖记录 |

---

## 十连抽功能说明

十连抽是本项目的特色功能，其流程如下：

```
点击十连按钮 ──> 九宫格开始转 ──> 100ms后请求后端
                                              │
                                              ▼
弹窗展示结果 <── 动画onEnd回调 <── 返回结果stop
```

**实现要点：**
- 调用 `tenDraw` API 获取 10 个抽奖结果
- 使用 `maxAwardIndex` 选择"代表性奖品"作为动画停留位置
- 真正的 10 个奖品在 `onEnd` 回调中的弹窗里展示

---

## 使用场景

| 场景 | 描述 |
|------|------|
| **营销活动** | 企业用于用户增长、促活的抽奖营销活动 |
| **会员福利** | 会员积分体系结合抽奖提升用户粘性 |
| **节日促销** | 节假日主题抽奖活动吸引用户参与 |

---

## 常见问题

### Q: 页面无法加载或 API 调用失败？

检查以下项目：
1. 后端服务是否正常运行（`API_HOST_URL` 配置正确）
2. URL 参数是否包含 `userId` 和 `activityId`
3. 浏览器控制台是否有 CORS 错误

### Q: 抽奖动画没有显示？

确保已先点击「装配抽奖」按钮初始化活动策略。

### Q: TypeScript 类型报错？

`@lucky-canvas/react` 存在类型问题，项目中已使用 `@ts-expect-error` 注释处理。

### Q: Docker 构建失败？

检查 Dockerfile 中的 registry 配置是否可访问，可修改为国内镜像源。


---

## 开发规范

### 代码规范
- 使用 ESLint 进行代码检查
- 组件统一使用 `"use client"` 指令
- API 调用统一在 `src/apis/index.tsx` 中管理

### Git 提交规范
```
<type>: <description>

type: feat | fix | docs | style | refactor | test | chore
```

---

## 相关链接

- [Next.js 官方文档](https://nextjs.org/docs)
- [React 官方文档](https://react.dev)
- [@lucky-canvas 文档](https://100px.net/)

---

## 许可证

<!-- TODO: 添加许可证信息 -->

---

<div align="center">

如果这个项目对你有帮助，请给一个 Star

Made with ❤️ by [orbisz](https://orbisz.github.io/)

</div>
