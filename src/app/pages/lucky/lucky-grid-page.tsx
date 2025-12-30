"use client"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {useState, useRef, useEffect, useContext} from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import {LuckyGrid} from '@lucky-canvas/react'
import {draw, queryRaffleAwardList, tenDraw} from "@/apis";
import {RaffleAwardVO} from "@/types/RaffleAwardVO";
import {DrawResult} from "@/types/TenDrawDTO";
import {StrategyRuleWeight} from "@/app/components/StrategyRuleWeight";

/**
 * 大转盘文档：https://100px.net/docs/grid.html
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function LuckyGridPage({handleRefresh}) {
    const [prizes, setPrizes] = useState([{}])
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const myLucky = useRef()
    const [isTenDrawing, setIsTenDrawing] = useState(false)
    // 使用 ref 来跟踪十连抽是否已完成，避免 setState 的异步更新问题
    const isTenDrawInProgress = useRef(false)
    // refresh 状态用于触发 StrategyRuleWeight 更新
    const [refresh, setRefresh] = useState(0)

    const triggerRefresh = () => {
        setRefresh(refresh + 1)
        if (handleRefresh) {
            handleRefresh()
        }
    }

    const queryRaffleAwardListHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const userId = String(queryParams.get('userId'));
        const activityId = Number(queryParams.get('activityId'));
        const result = await queryRaffleAwardList(userId, activityId);
        const {code, info, data}: { code: string; info: string; data: RaffleAwardVO[] } = await result.json();

        if (code != "0000") {
            window.alert("获取抽奖奖品列表失败 code:" + code + " info:" + info)
            return;
        }

        // 创建一个新的奖品数组
        const prizes = [
            {
                x: 0,
                y: 0,
                fonts: [{text: data[0].awardTitle, top: '80%', fontSize: '12px', fontWeight: '800',
                    fill: 'yellow'}],
                imgs: [{src: "/raffle-award-00.png", width: "70px", height: "70px", activeSrc: "/raffle-award.png"}]
            },
            {
                x: 1,
                y: 0,
                fonts: [{text: data[1].awardTitle, top: '80%', fontSize: '12px', fontWeight: '800',
                    fill: '#FFFF00'}],
                imgs: [{src: "/raffle-award-01.png", width: "70px", height: "70px", activeSrc: "/raffle-award.png"}]
            },
            {
                x: 2,
                y: 0,
                fonts: [{text: data[2].awardTitle, top: '80%', fontSize: '12px', fontWeight: '800',
                    fill: '#FFFF00'}],
                imgs: [{src: "/raffle-award-02.png", width: "70px", height: "70px", activeSrc: "/raffle-award.png"}]
            },
            {
                x: 2,
                y: 1,
                fonts: [{text: data[3].awardTitle, top: '80%', fontSize: '12px', fontWeight: '800',
                    fill: '#FFFF00'}],
                imgs: [{src: "/raffle-award-12.png", width: "70px", height: "70px", activeSrc: "/raffle-award.png"}]
            },
            {
                x: 2,
                y: 2,
                fonts: [{
                    text: data[4].awardUnlock ? data[4].awardTitle : '再抽奖' + data[4].waitUnlockCount + '次解锁',
                    top: '80%',
                    fontSize: '12px',
                    fontWeight: '800',
                    fill: '#FFFF00'
                }],
                imgs: [{
                    src: data[4].awardUnlock ? "/raffle-award-22.png" : "/raffle-award-22-lock.png",
                    width: "70px",
                    height: "70px",
                    activeSrc: "/raffle-award.png"
                }]
            },
            {
                x: 1,
                y: 2,
                fonts: [{
                    text: data[5].awardUnlock ? data[5].awardTitle : '再抽奖' + data[5].waitUnlockCount + '次解锁',
                    top: '80%',
                    fontSize: '12px',
                    fontWeight: '800',
                    fill: '#FFFF00'
                }],
                imgs: [{
                    src: data[5].awardUnlock ? "/raffle-award-21.png" : "/raffle-award-21-lock.png",
                    width: "70px",
                    height: "70px",
                    activeSrc: "/raffle-award.png"
                }]
            },
            {
                x: 0,
                y: 2,
                fonts: [{
                    text: data[6].awardUnlock ? data[6].awardTitle : '再抽奖' + data[6].waitUnlockCount + '次解锁',
                    top: '80%',
                    fontSize: '12px',
                    fontWeight: '800',
                    fill: '#FFFF00'
                }],
                imgs: [{
                    src: data[6].awardUnlock ? "/raffle-award-20.png" : "/raffle-award-20-lock.png",
                    width: "70px",
                    height: "70px",
                    activeSrc: "/raffle-award.png"
                }]
            },
            {
                x: 0,
                y: 1,
                fonts: [{text: data[7].awardTitle, top: '80%', fontSize: '12px', fontWeight: '800'}],
                imgs: [{src: "/raffle-award-10.png", width: "70px", height: "70px", activeSrc: "/raffle-award.png"}]
            },
        ]

        // 设置奖品数据
        setPrizes(prizes)

    }

    const randomRaffleHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const userId = String(queryParams.get('userId'));
        const activityId = Number(queryParams.get('activityId'));

        const result = await draw(userId, activityId);
        const {code, info, data} = await result.json();
        if (code != "0000") {
            window.alert("随机抽奖失败 code:" + code + " info:" + info)
            return;
        }

        triggerRefresh()

        // 为了方便测试，mock 的接口直接返回 awardIndex 也就是奖品列表中第几个奖品。
        return data.awardIndex - 1;
    }

    /**
     * 十连抽处理函数
     */
    const tenDrawHandle = async () => {
        if (isTenDrawing || isTenDrawInProgress.current) return;

        const queryParams = new URLSearchParams(window.location.search);
        const userId = String(queryParams.get('userId'));
        const activityId = Number(queryParams.get('activityId'));

        setIsTenDrawing(true);
        isTenDrawInProgress.current = true;

        // 立即播放动画
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        myLucky.current.play();

        // 调用十连抽API
        try {
            const result = await tenDraw(userId, activityId);
            const response = await result.json();

            // 调试日志：输出后端返回的原始数据
            console.log("十连抽后端返回数据:", response);

            const {code, info, data} = response;

            if (code !== "0000") {
                console.error("十连抽失败:", code, info);
                window.alert("十连抽失败 code:" + code + " info:" + info);
                setIsTenDrawing(false);
                isTenDrawInProgress.current = false;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                myLucky.current.stop(0);
                return;
            }

            // 检查数据结构
            if (!data) {
                console.error("十连抽失败：data为空");
                window.alert("十连抽失败：未返回抽奖结果");
                setIsTenDrawing(false);
                isTenDrawInProgress.current = false;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                myLucky.current.stop(0);
                return;
            }

            // 获取抽奖结果数组
            const drawResults = data.drawResults || data;

            if (!drawResults || drawResults.length === 0) {
                console.error("十连抽失败：抽奖结果数组为空");
                window.alert("十连抽失败：未返回抽奖结果");
                setIsTenDrawing(false);
                isTenDrawInProgress.current = false;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                myLucky.current.stop(0);
                return;
            }

            // 调试日志：输出抽奖结果
            console.log("十连抽结果数组:", drawResults);
            console.log("抽奖结果数量:", drawResults.length);

            // 动画播放2.5秒后停止（停在任意位置即可，主要是视觉效果）
            setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                myLucky.current.stop(0); // 停在第0个位置
            }, 2500);

            // 动画结束后显示所有结果
            setTimeout(() => {
                setIsTenDrawing(false);
                isTenDrawInProgress.current = false;
                triggerRefresh();
                queryRaffleAwardListHandle();

                // 按照后端返回的顺序构建奖品列表字符串
                const prizeList = drawResults.map((r: DrawResult) => r.awardTitle).join('、');
                console.log("显示的奖品列表:", prizeList);

                alert(`十连抽完成！\n\n奖品列表【${prizeList}】`);
            }, 5000);

        } catch (error) {
            console.error("十连抽失败:", error);
            window.alert("十连抽失败：" + error);
            setIsTenDrawing(false);
            isTenDrawInProgress.current = false;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            myLucky.current.stop(0);
        }
    }

    const [buttons] = useState([
        {
            x: 1,
            y: 1,
            background: "#7f95d1",
            shadow: '3',
            imgs: [{src: "/raffle-button.png", width: "100px", height: "100px"}]
        }
    ])

    const [defaultStyle] = useState([{background: "#b8c5f2"}])

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        queryRaffleAwardListHandle().then(r => {
        });
    }, [])

    return <>
        {/* 九宫格抽奖区 */}
        <div className="flex justify-center mb-4">
            <LuckyGrid
                ref={myLucky}
                width="300px"
                height="300px"
                rows="3"
                cols="3"
                prizes={prizes}
                defaultStyle={defaultStyle}
                buttons={buttons}
                onStart={() => { // 点击抽奖按钮会触发star回调
                    // 如果是十连抽模式，不执行单抽流程
                    if (isTenDrawing || isTenDrawInProgress.current) {
                        return;
                    }
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    myLucky.current.play()
                    setTimeout(() => {
                        // 抽奖接口
                        randomRaffleHandle().then(prizeIndex => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-expect-error
                                myLucky.current.stop(prizeIndex);
                            }
                        );
                    }, 2500)
                }}
                onEnd={
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    prize => {
                        // 如果是十连抽模式，不执行单抽的结果展示
                        if (isTenDrawing || isTenDrawInProgress.current) {
                            return;
                        }
                        // 加载数据
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        queryRaffleAwardListHandle().then(r => {
                        });
                        // 展示奖品
                        alert('恭喜抽中奖品💐【' + prize.fonts[0].text + '】')
                    }
                }>

            </LuckyGrid>
        </div>

        {/* 暴走十连抽按钮 */}
        <div className="text-center mb-4">
            <button
                onClick={tenDrawHandle}
                disabled={isTenDrawing}
                className={`
                    px-8 py-3 rounded-lg font-bold text-white text-base
                    transition-all duration-300 transform hover:scale-105
                    ${isTenDrawing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                    }
                `}
            >
                {isTenDrawing ? '抽奖中...' : '🎯 暴走10连抽'}
            </button>
        </div>

        {/* 抽奖阶梯信息 */}
        <div>
            <StrategyRuleWeight refresh={refresh} setRefresh={setRefresh}/>
        </div>
    </>
}
