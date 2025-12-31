import {calendarSignRebate, isCalendarSignRebate, queryUserActivityAccount, queryUserCreditAccount} from "@/apis";
import React, {useEffect, useState} from "react";
import {UserActivityAccountVO} from "@/types/UserActivityAccountVO";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function MemberCard({allRefresh}) {
    const [refresh, setRefresh] = useState(0);

    const [dayCount, setDayCount] = useState(0)
    const [creditAmount, setCreditAmount] = useState(0)
    const [sign, setSign] = useState(false);

    const [userId, setUserId] = useState('');

    const getParams = async () => {
        setUserId(String(new URLSearchParams(window.location.search).get('userId')));
    }

    const handleRefresh = () => {
        setRefresh(refresh + 1)
    };

    // 获取当前日期
    const currentDate = new Date();
    // 格式化日期为 YYYY-MM-DD
    const formattedDate = currentDate.getFullYear() + '-'
        + ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-'
        + ('0' + currentDate.getDate()).slice(-2);

    const queryUserActivityAccountHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const result = await queryUserActivityAccount(String(queryParams.get('userId')), Number(queryParams.get('activityId')));
        // 查询账户数据
        const {code, info, data}: { code: string; info: string; data: UserActivityAccountVO } = await result.json();

        if (code != "0000") {
            console.error("查询活动账户额度失败 code:" + code + " info:" + info)
            return;
        }

        // 日可抽奖额度
        setDayCount(data.dayCountSurplus)
    }

    const queryUserCreditAccountHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const result = await queryUserCreditAccount(String(queryParams.get('userId')));
        const {code, info, data}: { code: string; info: string; data: number } = await result.json();

        if (code != "0000") {
            console.error("查询用户积分失败 code:" + code + " info:" + info)
            return;
        }

        // 用户积分
        setCreditAmount(data)
    }

    const calendarSignRebateHandle = async () => {
        if (sign) {
            return;
        }
        const queryParams = new URLSearchParams(window.location.search);
        const result = await calendarSignRebate(String(queryParams.get('userId')));
        const {code, info}: { code: string; info: string; } = await result.json();

        if (code != "0000" && code != "0003") {
            window.alert("日历签到返利接口，接口调用失败 code:" + code + " info:" + info)
            return;
        }

        setSign(true);

        // 设置一个定时器后刷新
        const timer = setTimeout(() => {
            handleRefresh()
        }, 550);

        // 清除定时器，以防组件在执行前被卸载
        return () => clearTimeout(timer);
    }

    const isCalendarSignRebateHandle = async () => {

        const queryParams = new URLSearchParams(window.location.search);
        const result = await isCalendarSignRebate(String(queryParams.get('userId')));
        const {code, info, data}: { code: string; info: string; data: boolean } = await result.json();

        if (code != "0000") {
            console.error("判断是否签到失败 code:" + code + " info:" + info)
            return;
        }

        setSign(data);
    }


    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getParams().then(r => {
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        queryUserActivityAccountHandle().then(r => {
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        queryUserCreditAccountHandle().then(r => {
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        isCalendarSignRebateHandle().then(r => {
        });
    }, [refresh, allRefresh])

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative">
            {/* 标题 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-700">个人账户</h2>
                    {/* 用户ID显示在标题后面 */}
                    <div className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm text-gray-900 font-bold">
                        ID: {userId}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="刷新"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {/* 三个数据项 */}
            <div className="grid grid-cols-3 gap-4">
                {/* 我的积分 */}
                <div className="text-center p-3 rounded-lg" style={{background: 'linear-gradient(135deg, #E6F7FF 0%, #D0ECFF 100%)'}}>
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center text-white text-lg" style={{backgroundColor: '#3B82F6'}}>
                        💰
                    </div>
                    <div className="text-xs text-gray-500 mb-1">我的积分</div>
                    <div className="text-xl font-bold" style={{color: '#3B82F6'}}>{creditAmount}￥</div>
                </div>

                {/* 抽奖次数 */}
                <div className="text-center p-3 rounded-lg" style={{background: 'linear-gradient(135deg, #F3E8FF 0%, #E8D9FF 100%)'}}>
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center text-white text-lg" style={{backgroundColor: '#A855F7'}}>
                        🎯
                    </div>
                    <div className="text-xs text-gray-500 mb-1">抽奖次数</div>
                    <div className="text-xl font-bold" style={{color: '#A855F7'}}>{dayCount}</div>
                </div>

                {/* 签到 */}
                <div className="text-center p-3 rounded-lg" style={{background: 'linear-gradient(135deg, #FFF8E6 0%, #FFE6C8 100%)'}}>
                    {sign ? (
                        <>
                            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center text-white text-lg" style={{backgroundColor: '#10B981'}}>
                                ✅
                            </div>
                            <div className="text-xs text-gray-500 mb-1">已签到</div>
                            <div className="text-sm font-bold" style={{color: '#F59E0B'}}>{formattedDate}</div>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center text-white text-lg" style={{backgroundColor: '#F59E0B'}}>
                                📅
                            </div>
                            <div className="text-xs text-gray-500 mb-1">每日签到</div>
                            <button
                                onClick={calendarSignRebateHandle}
                                className="text-sm font-bold px-3 py-1 rounded-full text-white transition-colors hover:brightness-110"
                                style={{backgroundColor: '#F59E0B'}}
                            >
                                签到
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
