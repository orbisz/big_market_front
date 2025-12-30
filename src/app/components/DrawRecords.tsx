"use client"

import { useState, useEffect } from 'react'
import { queryUserDrawRecords } from '@/apis'
import { DrawRecordVO } from '@/types/DrawRecordVO'

/**
 * 抽奖历史记录组件
 * 显示最近10次抽奖记录
 */
export function DrawRecords() {
    const [records, setRecords] = useState<DrawRecordVO[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRecords()
    }, [])

    /**
     * 格式化时间显示
     * 将 ISO 8601 格式转换为本地时间格式
     */
    const formatAwardTime = (awardTime: string): string => {
        try {
            const date = new Date(awardTime)
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })
        } catch {
            return awardTime
        }
    }

    const fetchRecords = async () => {
        setLoading(true)
        try {
            const queryParams = new URLSearchParams(window.location.search)
            const userId = queryParams.get('userId') || undefined

            const result = await queryUserDrawRecords(userId, 10)
            const response = await result.json()
            const { code, info, data } = response

            if (code === "0000" && data) {
                setRecords(data.slice(0, 10)) // 只显示最近10条
            } else {
                console.error("获取抽奖记录失败:", info)
            }
        } catch (error) {
            console.error("获取抽奖记录失败:", error)
        } finally {
            setLoading(false)
        }
    }

    /**
     * 根据奖品ID获取对应的图标颜色
     */
    const getAwardColor = (awardId: number): string => {
        const colorMap: Record<number, string> = {
            101: '#3B82F6', // 蓝色 - 华为手机
            102: '#A855F7', // 紫色 - 荣耀耳机
            103: '#F59E0B', // 黄色 - 随机积分
            104: '#EF4444', // 红色 - 小霸王游戏机
            105: '#10B981', // 绿色 - AI Agent体验卡
            106: '#EC4899', // 粉色 - 温馨小灯
            107: '#3B82F6', // 蓝色 - 本体公仔
            108: '#10B981', // 绿色 - 享玩券
            109: '#A855F7', // 紫色 - 林奈卡
        }
        return colorMap[awardId] || '#6B7280'
    }

    /**
     * 根据奖品ID获取对应的图标
     */
    const getAwardIcon = (awardTitle: string): string => {
        if (awardTitle.includes('积分')) return '💰'
        if (awardTitle.includes('耳机')) return '🎧'
        if (awardTitle.includes('手机')) return '📱'
        if (awardTitle.includes('游戏机')) return '🕹️'
        if (awardTitle.includes('卡')) return '🎟️'
        if (awardTitle.includes('灯')) return '💡'
        if (awardTitle.includes('公仔')) return '🧸'
        if (awardTitle.includes('券')) return '🎫'
        return '🎁'
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">📋 最近十次抽奖记录</h2>
                <button
                    onClick={fetchRecords}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    刷新
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">
                    加载中...
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    暂无抽奖记录
                </div>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {records.map((record, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                {/* 奖品图标 */}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                    style={{ backgroundColor: getAwardColor(record.awardId) + '20' }}
                                >
                                    <span style={{ color: getAwardColor(record.awardId) }}>
                                        {getAwardIcon(record.awardTitle)}
                                    </span>
                                </div>

                                {/* 奖品信息 */}
                                <div>
                                    <div className="font-medium text-gray-800">
                                        {record.awardTitle}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        用户ID: {record.userId}
                                    </div>
                                </div>
                            </div>

                            {/* 抽奖时间 */}
                            <div className="text-sm text-gray-500">
                                {formatAwardTime(record.awardTime)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
