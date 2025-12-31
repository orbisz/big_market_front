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

            const result = await queryUserDrawRecords(userId, 20)
            const response = await result.json()
            const { code, info, data } = response

            if (code === "0000" && data) {
                setRecords(data.slice(0, 20))
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
     * 根据奖品标题获取对应的图标颜色
     */
    const getAwardColor = (awardTitle: string): string => {
        if (awardTitle.includes('积分')) return '#F59E0B'      // 黄色
        if (awardTitle.includes('耳机')) return '#A855F7'     // 紫色
        if (awardTitle.includes('手机')) return '#3B82F6'     // 蓝色
        if (awardTitle.includes('游戏机')) return '#EF4444'   // 红色
        if (awardTitle.includes('卡') || awardTitle.includes('体验')) return '#10B981'  // 绿色
        if (awardTitle.includes('灯')) return '#EC4899'       // 粉色
        if (awardTitle.includes('公仔')) return '#3B82F6'     // 蓝色
        if (awardTitle.includes('券')) return '#10B981'       // 绿色
        return '#6B7280'  // 默认灰色
    }

    /**
     * 根据奖品标题获取对应的图标
     */
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

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-700">📋 最近二十次抽奖记录</h2>
                <button
                    onClick={fetchRecords}
                    className="p-1.5 rounded bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors text-sm"
                    title="刷新"
                >
                    🔄
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                    加载中...
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                    暂无抽奖记录
                </div>
            ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {records.map((record, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                {/* 奖品图标 */}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                                    style={{ backgroundColor: getAwardColor(record.awardTitle) + '20' }}
                                >
                                    <span style={{ color: getAwardColor(record.awardTitle) }}>
                                        {getAwardIcon(record.awardTitle)}
                                    </span>
                                </div>

                                {/* 奖品信息 */}
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium text-gray-800 text-sm truncate">
                                        {record.awardTitle}
                                    </div>
                                </div>
                            </div>

                            {/* 时间 */}
                            <div className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                {formatAwardTime(record.awardTime).split(' ')[1]}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
