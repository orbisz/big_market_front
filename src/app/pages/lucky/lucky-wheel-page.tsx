"use client";

import React, {useState, useRef, useEffect} from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import {LuckyWheel} from '@lucky-canvas/react'

import {queryRaffleAwardList, randomRaffle} from '@/apis'
import {RaffleAwardVO} from "@/types/RaffleAwardVO";

export function LuckyWheelPage() {
    const [prizes, setPrizes] = useState([{}])
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const myLucky = useRef()
    /*
    const [blocks] = useState([
        {padding: '10px', background: '#869cfa', imgs: [{src: "https://bugstack.cn/images/system/blog-03.png"}]}
    ])
    */
    const [buttons] = useState([
        {radius: '40%', background: '#617df2'},
        {radius: '35%', background: '#afc8ff'},
        {
            radius: '30%', background: '#869cfa',
            pointer: true,
            fonts: [{text: '开始', top: '-10px'}]
        }
    ])

    // 查询奖品列表
    const queryRaffleAwardListHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const strategyId = Number(queryParams.get('strategyId'));
        const result = await queryRaffleAwardList(strategyId);
        const {code, info, data} = await result.json();
        if (code != "0000") {
            window.alert("获取抽奖奖品列表失败 code:" + code + " info:" + info)
            return;
        }

        // 创建一个新的奖品数组
        const prizes = data.map((award: RaffleAwardVO, index: number) => {
            const background = index % 2 === 0 ? '#e9e8fe' : '#b8c5f2';
            return {
                background: background,
                fonts: [{id: award.awardId, text: award.awardTitle, top: '15px'}]
            };
        });

        // 设置奖品数据
        setPrizes(prizes)
    }

    // 调用随机抽奖
    const randomRaffleHandle = async () => {

        const queryParams = new URLSearchParams(window.location.search);
        const strategyId = Number(queryParams.get('strategyId'));
        const result = await randomRaffle(strategyId);
        const {code, info, data} = await result.json();
        if (code != "0000") {
            window.alert("获取抽奖奖品列表失败 code:" + code + " info:" + info)
            return;
        }
        // 为了方便测试，mock 的接口直接返回 awardIndex 也就是奖品列表中第几个奖品。
        return data.awardIndex - 1;
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        queryRaffleAwardListHandle().then(r => {
        });
    }, [])

    return <div>
        <LuckyWheel
            ref={myLucky}
            width="300px"
            height="300px"
            //blocks={blocks}
            prizes={prizes}
            buttons={buttons}
            onStart={() => {
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
                    alert('恭喜你抽到【' + prize.fonts[0].text + '】奖品ID【' + prize.fonts[0].id + '】')
                }
            }>

        </LuckyWheel>
    </div>
}
