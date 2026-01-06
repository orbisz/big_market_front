> 任务:优化十连抽功能
>
十连抽流程如下：

点击十连按钮 → 九宫格开始转 → 100ms 后请求后端十连抽 → 用返回结果计算一个停留格子并 stop → 动画结束 onEnd → 弹窗展示 ten 的奖品列表（或单抽结果）并刷新列表。

用 maxAwardIndex 选择了一个“代表性奖品”作为停留展示，而真正的十个奖品是在 onEnd 的弹窗里一次性展示出来。

可以参考以下前端代码：
```js
// 调用十连随机抽奖
    const randomTenRaffleHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const userId = String(queryParams.get('userId'));
        const activityId = Number(queryParams.get('activityId'));
        const result = await tenDraw(userId, activityId);
        const {code, info, data} = await result.json();
        if (code != "0000") {
            window.alert("随机抽奖失败 code:" + code + " info:" + info)
            return;
        }
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("返回的数据不是有效的数组或数组为空");
        }
        setLastDrawIsTen(true);
        setLastTen(data);
        return data;
    }

//  十连抽 button的handle
const handleTenDraw = async () => {
        // 抽奖接口
        // @ts-ignore
        myLucky.current.play(); // 开始抽奖
        // 使用 setTimeout 模拟抽奖持续时间
        setTimeout(async () => {
            const data = await randomTenRaffleHandle();
            // @ts-ignore
            const maxAwardIndex = Math.max(...data.map(item => item.awardIndex));
            // @ts-ignore
            myLucky.current.stop(maxAwardIndex-1); // 停止抽奖
        }, 100); // 抽奖持续时间，可以根据需要调整
        queryRaffleAwardListHandle().then(r => {
        });

    };
//  在原本九宫格下增加一个按钮
return <>
        <LuckyGrid
            ref={myLucky}
            width="300px"
            height="300px"
            rows="3"
            cols="3"
            prizes={prizes}
            defaultStyle={defaultStyle}
            buttons={buttons}
            onStart={() => { // 点击抽奖按钮会触发start回调
                // @ts-ignore
                myLucky.current.play()
                setTimeout(() => {
                    // 抽奖接口
                    randomRaffleHandle().then(prizeIndex => {
                            // @ts-ignore
                            myLucky.current.stop(prizeIndex);
                        }
                    );
                }, 100)
            }}
            onEnd={
                // @ts-ignore
                () => {
                    // 加载数据
                    queryRaffleAwardListHandle().then(r => {
                    });
                    // 展示奖品
                    if(lastDrawIsTen){
                        const prizeTitles = lastTen.map(prize => prize.awardTitle).join(', ');
                        alert('奖品列表【' + prizeTitles + '】');
                    }else{
                        // @ts-ignore
                        alert('恭喜抽中奖品💐【' + lastOne.awardTitle + '】');
                    }

                }
            }>

        </LuckyGrid>
        {/* 添加十连抽按钮 */}
        <button
            style={{

                width: '300px',
                height: '100px',
                marginTop: '20px', // 可以根据需要调整上边距
                backgroundColor: '#4CAF50', // 按钮背景颜色
                color: 'white', // 字体颜色
                border: 'none', // 去掉边框
                borderRadius: '5px', // 圆角边框
                fontSize: '20px', // 字体大小
                cursor: 'pointer' // 鼠标样式
            }}
            onClick={handleTenDraw}
        >
            <img
                src="/ten-raffle-button.jpg"
                alt="十连抽按钮"
                style={{
                    width: '300px',  // 根据需求调整图片大小
                    height: '100px',
                }}
            />
        </button>
    </>
```