"use client";

import {LuckyGridPage} from "@/app/pages/lucky/lucky-grid-page";
import dynamic from "next/dynamic";
import {useState} from "react";

const StrategyArmoryButton = dynamic(async () => (await import("./components/StrategyArmory")).StrategyArmory)
const MemberCardButton = dynamic(async () => (await import("./components/MemberCard")).MemberCard)
const SkuProductButton = dynamic(async () => (await import("./components/SkuProduct")).SkuProduct)
const DrawRecords = dynamic(async () => (await import("./components/DrawRecords")).DrawRecords)

export default function Home() {

    const [refresh, setRefresh] = useState(0);

    const handleRefresh = () => {
        setRefresh(refresh + 1)
    };


    return (
        <div className="min-h-screen py-8 px-4"
             style={{
                 background: 'linear-gradient(180deg, #F0F7FF 0%, #E6F2FF 100%)'
             }}>

            {/* 主容器：居中白色卡片式布局 */}
            <div className="max-w-7xl mx-auto">

                {/* 标题 */}
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800" style={{fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif'}}>
                        幸运营销汇<br/>
                        🎉超级大奖福利<span style={{color: "#FFD700"}}>限量抽</span>🎉
                    </h1>
                </header>

                {/* 个人账户信息栏 */}
                <div className="mb-4">
                    <MemberCardButton allRefresh={refresh}/>
                </div>

                {/* 装配抽奖按钮 */}
                <div className="mb-4">
                    <StrategyArmoryButton/>
                </div>

                {/* 积分兑换区 */}
                <div className="mb-4">
                    <SkuProductButton handleRefresh={handleRefresh}/>
                </div>

                {/* 九宫格抽奖区（包含十连抽按钮和阶梯信息）+ 抽奖历史记录 */}
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                    {/* 九宫格抽奖区域 */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-lg p-4" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                            <LuckyGridPage handleRefresh={handleRefresh}/>
                        </div>
                    </div>

                    {/* 抽奖历史记录 */}
                    <div className="w-full lg:w-80">
                        <DrawRecords/>
                    </div>
                </div>

                {/* 底部文案 */}
                <footer className="text-center text-gray-600 py-4 text-sm">
                    幸运营销汇 <a href='https://orbisz.github.io/' target='_blank' rel="noopener noreferrer"
                                   className="text-blue-500 hover:text-blue-600">
                        https://orbisz.github.io/
                    </a> @orbisz
                </footer>
            </div>
        </div>
    );
}
