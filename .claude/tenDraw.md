# 十连抽功能开发与UI优化总结

## 项目概述

本项目为"幸运营销汇"抽奖平台前端，基于 Next.js 15 + React 19 + Tailwind CSS 4 开发。本次开发主要实现两个核心功能：
1. **十连抽功能实现** - 支持用户一次性进行10次抽奖
2. **UI优化设计** - 移除大转盘，优化九宫格抽奖页面布局

---

## 一、十连抽功能实现

### 1.1 新增文件

#### `src/types/TenDrawDTO.ts`
十连抽相关的TypeScript类型定义：

```typescript
export interface ActivityTenDrawRequestDTO {
    userId: string;
    activityId: number;
}

export interface DrawResult {
    orderId: string;
    awardId: number;
    awardTitle: string;
    awardIndex: number;
}

export interface ActivityTenDrawResponseDTO {
    drawResults: DrawResult[];
}
```

### 1.2 API接口 (`src/apis/index.tsx`)

#### 新增 `tenDraw` 函数
```typescript
export const tenDraw = (userId?: string, activityId?: number) => {
    return fetch(`${apiHostUrl}/api/v1/raffle/activity/ten_draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ userId, activityId })
    })
}
```

#### 更新 `queryUserDrawRecords` 函数
- 更换为真实的后端API: `/api/v1/raffle/activity/query_user_award_record_list`
- 添加 `response.ok` 检查处理HTTP错误
- 支持自定义记录数量参数 `limit`

```typescript
export const queryUserDrawRecords = async (userId?: string, limit: number = 10) => {
    const response = await fetch(`${apiHostUrl}/api/v1/raffle/activity/query_user_award_record_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ userId, limit })
    });

    if (!response.ok) {
        return { json: () => Promise.resolve({ code: "0001", info: `HTTP ${response.status}`, data: [] }) };
    }
    return response;
}
```

### 1.3 十连抽组件实现 (`src/app/pages/lucky/lucky-grid-page.tsx`)

#### 核心状态管理
```typescript
const [isTenDrawing, setIsTenDrawing] = useState(false)        // UI显示状态
const isTenDrawInProgress = useRef(false)                       // 执行中状态(ref避免异步问题)
const [refresh, setRefresh] = useState(0)                       // 触发阶梯信息更新
```

#### 十连抽处理函数
```typescript
const tenDrawHandle = async () => {
    if (isTenDrawing || isTenDrawInProgress.current) return;

    setIsTenDrawing(true);
    isTenDrawInProgress.current = true;

    // 立即播放九宫格抽奖动画
    myLucky.current.play();

    const result = await tenDraw(userId, activityId);
    const response = await result.json();
    const { code, info, data } = response;

    if (code !== "0000") {
        // 错误处理...
        return;
    }

    const drawResults = data.drawResults || data;

    // 2.5秒后停止动画
    setTimeout(() => {
        myLucky.current.stop(0);
    }, 2500);

    // 5秒后显示结果
    setTimeout(() => {
        setIsTenDrawing(false);
        isTenDrawInProgress.current = false;
        triggerRefresh();
        queryRaffleAwardListHandle();

        const prizeList = drawResults.map((r: DrawResult) => r.awardTitle).join('、');
        alert(`十连抽完成！\n\n奖品列表【${prizeList}】`);
    }, 3000);
}
```

#### 防止十连抽时触发单抽回调
```typescript
onStart={() => {
    // 十连抽模式下不执行单抽流程
    if (isTenDrawing || isTenDrawInProgress.current) {
        return;
    }
    // 单抽逻辑...
}}

onEnd={prize => {
    // 十连抽模式下不显示单抽结果
    if (isTenDrawing || isTenDrawInProgress.current) {
        return;
    }
    // 单抽结果展示...
}}
```

### 1.4 十连抽按钮UI
```typescript
<button
    onClick={tenDrawHandle}
    disabled={isTenDrawing}
    className={`px-8 py-3 rounded-lg font-bold text-white text-base transition-all duration-300 transform hover:scale-105 ${
        isTenDrawing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
    }`}
>
    {isTenDrawing ? '抽奖中...' : '🎯 暴走10连抽'}
</button>
```

---

## 二、UI优化设计

### 2.1 整体布局变更 (`src/app/page.tsx`)

#### 背景样式
```typescript
// 浅蓝色渐变背景
<div className="min-h-screen py-8 px-4"
     style={{background: 'linear-gradient(180deg, #F0F7FF 0%, #E6F2FF 100%)'}}>
```

#### 主布局结构
```typescript
{/* 九宫格 + 抽奖记录 并列布局 */}
<div className="flex flex-col lg:flex-row gap-4">
    {/* 左侧：九宫格抽奖区 */}
    <div className="flex-1">
        <div className="bg-white rounded-xl shadow-lg p-4">
            <LuckyGridPage />
        </div>
    </div>

    {/* 右侧：抽奖记录面板 */}
    <div className="w-full lg:w-80">
        <DrawRecords />
    </div>
</div>
```

### 2.2 个人账户卡片 (`src/app/components/MemberCard.tsx`)

#### ID显示优化
- 位置：放在"个人账户"标题后面
- 样式：灰色圆角背景框，加粗显示
```typescript
<div className="flex items-center gap-2">
    <h2 className="text-base font-semibold text-gray-700">个人账户</h2>
    <div className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm text-gray-900 font-bold">
        ID: {userId}
    </div>
</div>
```

#### 签到功能集成
```typescript
{/* 第三卡片：每日签到 */}
<div className="text-center p-3 rounded-lg"
     style={{background: 'linear-gradient(135deg, #FFF8E6 0%, #FFE6C8 100%)'}}>
    {sign ? (
        // 已签到状态：绿色勾选图标 + 日期
        <>
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                 style={{backgroundColor: '#10B981'}}>
                ✅
            </div>
            <div className="text-xs text-gray-500 mb-1">已签到</div>
            <div className="text-sm font-bold">{formattedDate}</div>
        </>
    ) : (
        // 未签到状态：橙色图标 + 签到按钮
        <>
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                 style={{backgroundColor: '#F59E0B'}}>
                📅
            </div>
            <button onClick={calendarSignRebateHandle}
                    className="text-sm font-bold px-3 py-1 rounded-full text-white"
                    style={{backgroundColor: '#F59E0B'}}>
                签到
            </button>
        </>
    )}
</div>
```

### 2.3 积分兑换组件 (`src/app/components/SkuProduct.tsx`)

#### 刷新按钮
```typescript
<div className="flex items-center justify-between mb-4">
    <h2 className="text-base font-semibold text-gray-700">积分兑换</h2>
    <button
        onClick={() => {
            querySkuProductListByActivityIdHandle();
            queryUserCreditAccountHandle();
        }}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        title="刷新"
    >
        🔄
    </button>
</div>
```

#### 兑换按钮状态内联显示
```typescript
<button
    onClick={() => creditPayExchangeSkuHandle(skuProduct.sku, skuProduct.productAmount)}
    disabled={!canAfford}
    className={`w-full p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        canAfford ? 'hover:brightness-110' : 'opacity-60 cursor-not-allowed'
    }`}
    style={{backgroundColor: config.bgColor}}
>
    <div className="text-white">
        <div className="text-base font-bold mb-1">
            {skuProduct.activityCount.dayCount}次抽奖
        </div>
        <div className="text-sm opacity-90">
            {skuProduct.productAmount}￥
        </div>
        <div className="text-xs mt-2 opacity-75">
            {canAfford ? '立即兑换' : '积分不足'}
        </div>
    </div>
</button>
```

### 2.4 抽奖记录组件 (`src/app/components/DrawRecords.tsx`)

#### 显示数量调整
- 从10条增加到20条
- 显示框高度设置为 `max-h-[480px]`
- 标题改为"最近二十次抽奖记录"

```typescript
const result = await queryUserDrawRecords(userId, 20);
setRecords(data.slice(0, 20));

<h2 className="text-base font-semibold text-gray-700">📋 最近二十次抽奖记录</h2>

<div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
    {records.map((record, index) => (
        // 记录项...
    ))}
</div>
```

#### 奖品图标和颜色映射
```typescript
const getAwardColor = (awardTitle: string): string => {
    if (awardTitle.includes('积分')) return '#F59E0B'      // 黄色
    if (awardTitle.includes('耳机')) return '#A855F7'     // 紫色
    if (awardTitle.includes('手机')) return '#3B82F6'     // 蓝色
    if (awardTitle.includes('游戏机')) return '#EF4444'   // 红色
    if (awardTitle.includes('卡') || awardTitle.includes('体验')) return '#10B981'
    if (awardTitle.includes('灯')) return '#EC4899'
    if (awardTitle.includes('公仔')) return '#3B82F6'
    if (awardTitle.includes('券')) return '#10B981'
    return '#6B7280'
}

const getAwardIcon = (awardTitle: string): string => {
    if (awardTitle.includes('积分')) return '💰'
    if (awardTitle.includes('耳机')) return '🎧'
    if (awardTitle.includes('手机')) return '📱'
    if (awardTitle.includes('游戏机') || awardTitle.includes('小霸王')) return '🕹️'
    if (awardTitle.includes('卡') || awardTitle.includes('体验')) return '🎟️'
    if (awardTitle.includes('灯')) return '💡'
    if (awardTitle.includes('公仔')) return '🧸'
    if (awardTitle.includes('券')) return '🎫'
    return '🎁'
}
```

### 2.5 抽奖阶梯进度 (`src/app/components/StrategyRuleWeight.tsx`)

集成到九宫格页面，显示三个抽奖阶梯的进度：

```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {strategyRuleWeightVOList.map((ruleWeight, index) => {
        const percentage = Math.min(
            (ruleWeight.userActivityAccountTotalUseCount / ruleWeight.ruleWeightCount) * 100,
            100
        );

        return (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    抽奖阶梯{index + 1}
                </h3>

                {/* 进度条 */}
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                         style={{width: `${percentage}%`, backgroundColor: '#3B82F6'}} />
                </div>

                {/* 进度文字 */}
                <div className="text-center mt-1">
                    <span className="text-sm font-bold text-gray-800">
                        {ruleWeight.userActivityAccountTotalUseCount}/{ruleWeight.ruleWeightCount}
                    </span>
                </div>

                {/* 必中奖品范围 */}
                {ruleWeight.strategyAwards?.length > 0 && (
                    <div>
                        <div className="text-xs text-gray-500 mb-2">必中奖品范围</div>
                        {ruleWeight.strategyAwards.map(award => (
                            <div key={award.awardId} className="flex items-center text-xs">
                                <span style={{color: '#F59E0B'}}>•</span>
                                <span>{award.awardTitle}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    })}
</div>
```

### 2.6 九宫格页面整合 (`src/app/pages/lucky/lucky-grid-page.tsx`)

将九宫格、十连抽按钮、抽奖阶梯信息整合到一个组件中：

```typescript
return <>
    {/* 九宫格抽奖区 */}
    <div className="flex justify-center mb-4">
        <LuckyGrid
            ref={myLucky}
            width="300px"
            height="300px"
            prizes={prizes}
            onStart={() => { /* 单抽逻辑 */ }}
            onEnd={prize => { /* 单抽结果 */ }}
        />
    </div>

    {/* 暴走十连抽按钮 */}
    <div className="text-center mb-4">
        <button onClick={tenDrawHandle} disabled={isTenDrawing}>
            {isTenDrawing ? '抽奖中...' : '🎯 暴走10连抽'}
        </button>
    </div>

    {/* 抽奖阶梯信息 */}
    <div>
        <StrategyRuleWeight refresh={refresh} setRefresh={setRefresh}/>
    </div>
</>
```

---

## 三、技术问题与解决方案

### 3.1 十连抽时额外弹出单抽结果

**问题描述**：十连抽完成后，会额外弹出一个"恭喜抽中奖品"的单抽提示

**原因分析**：
- 调用 `myLucky.current.play()` 会触发 `onStart` 回调
- 调用 `myLucky.current.stop(0)` 会触发 `onEnd` 回调
- 这些回调会执行单抽逻辑

**解决方案**：
```typescript
// 使用 useState + useRef 双重状态检查
const [isTenDrawing, setIsTenDrawing] = useState(false)
const isTenDrawInProgress = useRef(false)

// 在 onStart 和 onEnd 中检查状态
onStart={() => {
    if (isTenDrawing || isTenDrawInProgress.current) return;
    // 单抽逻辑...
}}

onEnd={prize => {
    if (isTenDrawing || isTenDrawInProgress.current) return;
    // 单抽结果...
}}
```

### 3.2 React异步状态更新时序问题

**问题描述**：`setIsTenDrawing(false)` 的更新是异步的，导致状态检查不准确

**解决方案**：
使用 `useRef` 存储同步状态：
```typescript
const isTenDrawInProgress = useRef(false)

// 设置状态时同步更新
isTenDrawInProgress.current = true

// 检查时可以立即获取最新值
if (isTenDrawInProgress.current) return
```

### 3.3 Fetch API不抛出HTTP错误

**问题描述**：`fetch` 只在网络错误时抛出异常，404/500等HTTP状态码不会抛错

**解决方案**：
```typescript
const response = await fetch(url, options);

if (!response.ok) {
    return {
        json: () => Promise.resolve({
            code: "0001",
            info: `HTTP ${response.status}`,
            data: []
        })
    };
}

return response;
```

### 3.4 ESLint类型错误处理

**问题描述**：`@lucky-canvas/react` 库的TypeScript类型定义不完整

**解决方案**：
使用 `@ts-expect-error` 注释忽略类型检查：
```typescript
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import {LuckyGrid} from '@lucky-canvas/react'

// @ts-expect-error
myLucky.current.play()
```

---

## 四、页面布局图

```
┌─────────────────────────────────────────────────────────────────┐
│                        积分抽奖平台                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 个人账户 ID: {userId}                    [🔄]          │   │
│  │ ┌──────────┬──────────┬──────────┐                     │   │
│  │ │ 我的积分  │ 抽奖次数  │ 每日签到  │                     │   │
│  │ │  9.81¥   │  100351  │  [签到]  │                     │   │
│  │ └──────────┴──────────┴──────────┘                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 积分兑换                                       [🔄]    │   │
│  │ ┌─────┬─────┬─────┬─────┐                             │   │
│  │ │150次│ 50次│  5次│  1次│                             │   │
│  │ │200¥ │100¥ │ 20¥ │  5¥ │                             │   │
│  │ │积分不足│积分不足│积分不足│立即兑换│                        │   │
│  │ └─────┴─────┴─────┴─────┘                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────┬───────────────────────────┐   │
│  │      九宫格抽奖区            │    最近二十次抽奖记录      │   │
│  │  ┌─────────────────────┐    │  ┌─────────────────────┐ │   │
│  │  │  ┌───┬───┬───┐     │    │  │ 🎁 奖品名称 15:30  │ │   │
│  │  │  │ ■ │ ★ │ ■ │     │    │  │ 💰 积分      15:28  │ │   │
│  │  │  ├───┼───┼───┤     │    │  │ 📱 手机      15:25  │ │   │
│  │  │  │ ■ │ ★ │ ■ │     │    │  │ 🎧 耳机      15:20  │ │   │
│  │  │  ├───┼───┼───┤     │    │  │ ... (20条记录)      │ │   │
│  │  │  │ ■ │ ★ │ ■ │     │    │  │                     │ │   │
│  │  │  └───┴───┴───┘     │    │  └─────────────────────┘ │   │
│  │  │     [🎯 暴走10连抽]     │    │                           │   │
│  │  │  ┌─────┬─────┬─────┐ │    │                           │   │
│  │  │  │阶梯1│阶梯2│阶梯3│ │    │                           │   │
│  │  │  │ 70/70│10/10│...│ │    │                           │   │
│  │  │  └─────┴─────┴─────┘ │    │                           │   │
│  │  └─────────────────────┘    │                           │   │
│  └─────────────────────────────┴───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 五、文件变更清单

| 文件路径 | 变更类型 | 说明 |
|---------|---------|------|
| `src/types/TenDrawDTO.ts` | 新增 | 十连抽类型定义 |
| `src/types/DrawRecordVO.ts` | 修改 | 更新抽奖记录类型 |
| `src/apis/index.tsx` | 修改 | 新增tenDraw和更新queryUserDrawRecords |
| `src/app/page.tsx` | 修改 | 整体布局优化，添加背景渐变 |
| `src/app/components/MemberCard.tsx` | 修改 | ID显示优化，签到功能集成 |
| `src/app/components/SkuProduct.tsx` | 修改 | 添加刷新按钮，状态内联显示 |
| `src/app/components/DrawRecords.tsx` | 修改 | 增加到20条记录，调整高度 |
| `src/app/components/StrategyRuleWeight.tsx` | 修改 | 抽奖阶梯进度显示 |
| `src/app/pages/lucky/lucky-grid-page.tsx` | 修改 | 集成十连抽按钮和阶梯信息 |

---

## 六、开发命令

```bash
# 启动开发服务器
npm run dev
# 访问: http://localhost:3000/?userId=yourUserId&activityId=100301

# 生产构建
npm run build

# 运行生产服务器
npm run start

# Docker构建
./build.sh
```

---

## 七、后端API接口

### 7.1 十连抽接口
```
POST /api/v1/raffle/activity/ten_draw

Request:
{
  "userId": "zxy",
  "activityId": 100301
}

Response:
{
  "code": "0000",
  "info": "调用成功",
  "data": {
    "drawResults": [
      {
        "orderId": "393010764199",
        "awardId": 106,
        "awardTitle": "轻奢办公椅",
        "awardIndex": 6
      },
      ... (10条记录)
    ]
  }
}
```

### 7.2 抽奖记录接口
```
POST /api/v1/raffle/activity/query_user_award_record_list

Request:
{
  "userId": "zxy",
  "limit": 20
}

Response:
{
  "code": "0000",
  "info": "调用成功",
  "data": [
    {
      "userId": "zxy",
      "activityId": 100301,
      "awardId": 106,
      "awardTitle": "轻奢办公椅",
      "awardTime": "2024-09-22 15:30:00"
    },
    ... (20条记录)
  ]
}
```

---

## 八、总结

本次开发完成了以下功能：

1. ✅ 十连抽功能完整实现
   - API对接
   - 动画播放控制
   - 结果展示优化
   - 防止触发单抽回调

2. ✅ UI全面优化
   - 浅蓝色渐变背景
   - 白色卡片设计
   - 九宫格与记录并列布局
   - 个人账户卡片优化（ID背景框、签到功能）
   - 积分兑换刷新按钮
   - 抽奖记录增加到20条

3. ✅ 技术问题解决
   - React异步状态更新问题
   - Fetch API错误处理
   - ESLint类型错误处理

所有功能已测试通过，可以正常运行。
