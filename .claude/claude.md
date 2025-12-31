>任务1：前端十连抽按钮实现

请根据以下信息，编写前端十连抽按钮对接服务端接口:
POST请求接口，由SpringBoot框架实现，如下：

```java
/**
     * 十连抽接口
     *
     * @param request 请求对象
     * @return 十连抽结果
     * <p>
     * 接口：<a href="http://localhost:8091/api/v1/raffle/activity/ten_draw">/api/v1/raffle/activity/ten_draw</a>
     * 入参：{"activityId":100301,"userId":"zxy"}
     * <p>
     * curl --request POST \
     * --url http://localhost:8091/api/v1/raffle/activity/ten_draw \
     * --header 'content-type: application/json' \
     * --data '{
     * "userId":"zxy",
     * "activityId": 100301
     * }'
     */
    @RequestMapping(value = "ten_draw", method = RequestMethod.POST)
    @Override
    public Response<ActivityTenDrawResponseDTO> tenDraw(@RequestBody ActivityTenDrawRequestDTO request) {
        try {
            log.info("十连抽开始 userId:{} activityId:{}", request.getUserId(), request.getActivityId());

            // 1. 参数校验
            if (StringUtils.isBlank(request.getUserId()) || null == request.getActivityId()) {
                throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getInfo());
            }

            // 2. 参与活动 - 创建十连抽订单
            CreateTenPartakeOrderAggregate tenPartakeOrderAggregate = raffleActivityPartakeService.createTenDrawOrder(request.getUserId(), request.getActivityId());
            List<UserRaffleOrderEntity> orderEntities = tenPartakeOrderAggregate.getUserRaffleOrderEntities();
            log.info("十连抽，创建订单完成 userId:{} activityId:{} orderCount:{}", request.getUserId(), request.getActivityId(), orderEntities.size());

            // 3. 抽奖策略 - 并行执行十次单抽
            List<Future<RaffleAwardEntity>> futures = new ArrayList<>(10);
            for (UserRaffleOrderEntity orderEntity : orderEntities) {
                Future<RaffleAwardEntity> future = threadPoolExecutor.submit(() -> {
                    return raffleStrategy.performRaffle(RaffleFactorEntity.builder()
                            .userId(orderEntity.getUserId())
                            .strategyId(orderEntity.getStrategyId())
                            .endDateTime(orderEntity.getEndDateTime())
                            .build());
                });
                futures.add(future);
            }

            // 等待所有抽奖完成并收集结果
            List<RaffleAwardEntity> raffleAwardEntities = new ArrayList<>(10);
            for (int i = 0; i < futures.size(); i++) {
                try {
                    RaffleAwardEntity result = futures.get(i).get(5, TimeUnit.SECONDS);
                    raffleAwardEntities.add(result);
                } catch (Exception e) {
                    log.error("十连抽，第{}次抽奖失败 userId:{} activityId:{}", i + 1, request.getUserId(), request.getActivityId(), e);
                    // 抽奖失败时添加默认结果
                    raffleAwardEntities.add(RaffleAwardEntity.builder()
                            .awardId(0)
                            .awardTitle("未中奖")
                            .sort(0)
                            .build());
                }
            }

            // 4. 存放结果 - 批量写入中奖记录
            List<UserAwardRecordEntity> userAwardRecordEntities = new ArrayList<>(10);
            for (int i = 0; i < orderEntities.size(); i++) {
                UserRaffleOrderEntity orderEntity = orderEntities.get(i);
                RaffleAwardEntity raffleAwardEntity = raffleAwardEntities.get(i);

                UserAwardRecordEntity userAwardRecord = UserAwardRecordEntity.builder()
                        .userId(orderEntity.getUserId())
                        .activityId(orderEntity.getActivityId())
                        .strategyId(orderEntity.getStrategyId())
                        .orderId(orderEntity.getOrderId())
                        .awardId(raffleAwardEntity.getAwardId())
                        .awardTitle(raffleAwardEntity.getAwardTitle())
                        .awardTime(new Date())
                        .awardState(AwardStateVO.create)
                        .awardConfig(raffleAwardEntity.getAwardConfig())
                        .build();
                userAwardRecordEntities.add(userAwardRecord);
            }
            awardService.batchSaveUserAwardRecord(userAwardRecordEntities);

            // 5. 返回结果
            List<ActivityTenDrawResponseDTO.DrawResult> drawResults = raffleAwardEntities.stream()
                    .map(raffleAward -> ActivityTenDrawResponseDTO.DrawResult.builder()
                            .orderId(orderEntities.get(raffleAwardEntities.indexOf(raffleAward)).getOrderId())
                            .awardId(raffleAward.getAwardId())
                            .awardTitle(raffleAward.getAwardTitle())
                            .awardIndex(raffleAward.getSort())
                            .build())
                    .collect(Collectors.toList());

            return Response.<ActivityTenDrawResponseDTO>builder()
                    .code(ResponseCode.SUCCESS.getCode())
                    .info(ResponseCode.SUCCESS.getInfo())
                    .data(ActivityTenDrawResponseDTO.builder()
                            .drawResults(drawResults)
                            .build())
                    .build();
        } catch (AppException e) {
            log.error("十连抽失败 userId:{} activityId:{}", request.getUserId(), request.getActivityId(), e);
            return Response.<ActivityTenDrawResponseDTO>builder()
                    .code(e.getCode())
                    .info(e.getInfo())
                    .build();
        } catch (Exception e) {
            log.error("十连抽失败 userId:{} activityId:{}", request.getUserId(), request.getActivityId(), e);
            return Response.<ActivityTenDrawResponseDTO>builder()
                    .code(ResponseCode.UN_ERROR.getCode())
                    .info(ResponseCode.UN_ERROR.getInfo())
                    .build();
        }
    }
```
POST应答数据，
```json
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
         {
            "orderId": "660103581782",
            "awardId": 107,
            "awardTitle": "华为耳机",
            "awardIndex": 7
         },
         {
            "orderId": "393010764199",
            "awardId": 106,
            "awardTitle": "轻奢办公椅",
            "awardIndex": 6
         },
         {
            "orderId": "660103581782",
            "awardId": 107,
            "awardTitle": "华为耳机",
            "awardIndex": 7
         },
         {
            "orderId": "393010764199",
            "awardId": 106,
            "awardTitle": "轻奢办公椅",
            "awardIndex": 6
         },
         {
            "orderId": "393010764199",
            "awardId": 106,
            "awardTitle": "轻奢办公椅",
            "awardIndex": 6
         },
         {
            "orderId": "393010764199",
            "awardId": 106,
            "awardTitle": "轻奢办公椅",
            "awardIndex": 6
         },
         {
            "orderId": "393010764199",
            "awardId": 106,
            "awardTitle": "轻奢办公椅",
            "awardIndex": 6
         },
         {
            "orderId": "393010764199",
            "awardId": 106,
            "awardTitle": "轻奢办公椅",
            "awardIndex": 6
         },
         {
            "orderId": "393010764199",
            "awardId": 106,
            "awardTitle": "轻奢办公椅",
            "awardIndex": 6
         }
      ]
   }
}
```
如描述说明，帮我编写前端代码
1. 在原本九宫格下增加一个十连抽按钮，点击十连抽按钮，调用服务端流式请求接口，九宫格上的抽奖动画停止到最好奖品上，并作出提示十次抽奖的奖品信息，例如：`奖品列表【算法书籍、算法数据、华为耳机、AI Agent一周体验卡、AI Agent一周体验卡、AI Agent一周体验卡、AI Agent一周体验卡、AI Agent一周体验卡、AI Agent一周体验卡、AI Agent一周体验卡】`
2. 注意整体样式的简洁美观。


>任务2：网页UI优化设计，优化整体的网页布局，移除大转盘抽奖模块，仅保留九宫格抽奖形式。在九宫格抽奖区右侧添加"最近十次抽奖记录"面板；每条记录包含:用户ID、抽奖时间、获得奖品信息；确保记录列表清晰易读，支持滚动查看。保持原设计中未提及的其他内容不变；确保所有元素布局协调，响应式设计适配不同设备；优化交互体验，添加适当的动画和过渡效果，参考图片.claude/example.png

具体的网页页面UIU设计可参考图片example.png 。该UI页面的设计提示词描述如下：
### 🧩 页面整体布局（Layout）
背景：浅蓝色渐变背景（#F0F7FF 到 #E6F2FF），从上到下柔和过渡。
主容器：居中白色卡片式布局，圆角 12px，阴影 0 4px 12px rgba(0,0,0,0.05)，内边距 24px。
标题：顶部居中显示「积分抽奖平台」，字体为 PingFang SC, 字重 600, 字号 24px, 颜色 #333。

### 📦 第一部分：个人账户信息栏（Personal Account）
容器：白色卡片，圆角 8px，边框 1px solid #E0E0E0，内边距 16px。
左对齐内容：
标签：个人账户，字号 14px, 颜色 #666。
三个横向并列数据项（等宽，间距 16px）：
1. 我的积分
   图标：蓝色圆形图标（#3B82F6），内含白色用户头像简笔画。
   文字：我的积分，字号 12px, 颜色 #999。
   数值：9.81¥，字号 20px, 字体加粗，颜色 #3B82F6。
   背景：浅蓝渐变（#E6F7FF → #D0ECFF），圆角 8px。
2. 抽奖次数
   图标：紫色圆形图标（#A855F7），内含白色奖杯简笔画。
   文字：抽奖次数，字号 12px, 颜色 #999。
   数值：100351，字号 20px, 加粗，颜色 #A855F7。
   背景：淡紫渐变（#F3E8FF → #E8D9FF），圆角 8px。
3. 日期
   图标：橙色圆形图标（#F59E0B），内含白色日历简笔画。
   文字：有效期至，字号 12px, 颜色 #999。
   数值：2024-09-22，字号 20px, 加粗，颜色 #F59E0B。
   背景：淡橙渐变（#FFF8E6 → #FFE6C8），圆角 8px。
   右上角：小字 ID: xiaofuge，字号 12px, 颜色 #666，带浅灰底色圆角标签。

### 🔁 第二部分：按钮 - “装配抽奖”
位置：个人账户下方居中。
样式：橙色圆角按钮，文字 装配抽奖，字号 14px, 白色字体，背景 #F59E0B，悬停变深。
辅助文字：右侧小字 测试自动开启随机抽选，字号 12px, 颜色 #999。

### 💵 第三部分：积分兑换区（Exchange Options）
标题：积分兑换，字号 16px, 加粗，颜色 #333，左对齐。
四个横向按钮（等宽，间距 12px）：
1. 150次抽奖
   背景：蓝色（#3B82F6）
   主文字：150次抽奖，字号 16px, 白色
   副文字：200¥，字号 14px
   底部状态：积分不足，字号 12px, 红色
2. 50次抽奖
   背景：绿色（#10B981）
   主文字：50次抽奖，字号 16px, 白色
   副文字：100¥，字号 14px
   底部状态：积分不足，字号 12px, 红色
3. 5次抽奖
   背景：紫色（#A855F7）
   主文字：5次抽奖，字号 16px, 白色
   副文字：20¥，字号 14px
   底部状态：积分不足，字号 12px, 红色
4. 1次抽奖
   背景：粉色（#EC4899）
   主文字：1次抽奖，字号 16px, 白色
   副文字：5¥，字号 14px
   底部状态：立即兑换，字号 12px, 白色（可点击）

### 🎯 第四部分：抽奖主区域（Main Lottery Grid）
容器：白色卡片，圆角 12px，阴影 0 4px 12px rgba(0,0,0,0.05)，内边距 24px。
顶部文字：剩余抽奖次数：100351，字号 14px, 颜色 #333，居中。
中心抽奖格子：
外框：红色粗线（#EF4444, 宽度 6px），边长 300px，九宫格布局。
每个格子：100px × 100px，圆角 8px，背景白，边框 1px solid #E0E0E0。
中间格子：红色背景（#EF4444），文字 点击抽奖，白色，字号 20px, 加粗。
其他八个格子：
每个包含一个圆形图标（直径 40px）+ 一行文字（字号 12px）。
图标颜色与奖励类型对应：
黄色：幸运积分（图标：$）
紫色：林奈卡（图标：🎮）
粉色：温馨小灯（图标：💡）
蓝色：本体公仔（图标：🧸）
绿色：享玩券（图标：🎟️）
红色：小霸王游戏机（图标：🕹️）
蓝紫：荣耀耳机（图标：🎧）
橙色：华为手机（图标：📱）
底部按钮：
橙色圆角按钮，文字 暴走10连抽，字号 16px, 白色字体，背景 #F59E0B，宽度 200px，居中。

### 第五部分：抽奖阶梯进度条（Progress Bars）
三列并排（等宽，间距 16px）：
每列包含：
1. 标题：抽奖阶梯1 / 2 / 3，字号 14px, 颜色 #333
2. 进度条：
   蓝色进度条（#3B82F6），长度根据数值决定。
   例如：70/70 表示满进度，10/10 表示满，1000/1000 表示满。
3. 必中奖品范围（列表）：
   必中奖品范围，字号 12px, 颜色 #999
   项目前加黄色圆点（•），字号 12px, 颜色 #F59E0B

### 📋 第六部分：抽奖历史记录（Lottery History）
容器：白色卡片，圆角 8px，边框 1px solid #E0E0E0，内边距 16px。
标题：抽奖历史，字号 16px, 加粗，颜色 #333。
列表项（每项高度 48px，间距 12px）：
左侧：圆形图标（对应奖品类型）+ 用户名（如 user123）
中间：奖品名称（如 随机积分）
右侧：时间戳（如 2024-09-22 15:00:22）
图标颜色：
黄色：积分
紫色：VIP 卡
绿色：优惠券
橙色：实体商品
蓝色：游戏设备
红色：小霸王
粉色：小灯
蓝紫：体感设备

🎨 整体视觉风格总结
色彩主题：以蓝、绿、紫、粉为主色调，突出不同功能。
字体：统一使用 PingFang SC 或 Microsoft YaHei，无衬线。
间距：采用 8px 倍数网格系统，保持一致性。
圆角：所有卡片和按钮均为 8px~12px 圆角。
阴影：轻量级阴影，提升层次感但不突兀。
响应式：适配桌面端，未设计移动端断点。

✅ 关键词

UI Design Prompt: 积分抽奖平台
Layout: Centered white card on light blue gradient background
Components:
1. Personal Account Card (3 data items with icons and gradients)
2. "装配抽奖" button with subtitle
3. Exchange Buttons (4 colored buttons for different draw counts)
4. Main Lottery Grid (9-grid with central "点击抽奖" red button)
5. Progress Bars (3 stages with labels and rewards)
6. Lottery History List (with icons, usernames, prizes, timestamps)
   Colors: Blue (#3B82F6), Green (#10B981), Purple (#A855F7), Pink (#EC4899), Orange (#F59E0B)
   Fonts: PingFang SC, 12-24px, bold where needed
   Spacing: 8px grid system, consistent padding and margins
   Interactions: Hover effects on buttons, clickable elements
   No animations or transitions specified
