import {queryRaffleStrategyRuleWeight} from "@/apis";
import {useEffect, useState} from "react";
import {StrategyRuleWeightVO} from "@/types/StrategyRuleWeightVO";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StrategyRuleWeight({refresh, setRefresh}: {refresh: number, setRefresh?: (value: number) => void}) {

    const [strategyRuleWeightVOList, setStrategyRuleWeightVOList] = useState<StrategyRuleWeightVO[]>([]);

    const queryRaffleStrategyRuleWeightHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const result = await queryRaffleStrategyRuleWeight(String(queryParams.get('userId')), Number(queryParams.get('activityId')));
        const {code, info, data}: { code: string; info: string; data: StrategyRuleWeightVO[] } = await result.json();

        if (code != "0000") {
            console.error("查询策略权重失败 code:" + code + " info:" + info)
            return;
        }

        setStrategyRuleWeightVOList(data)
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        queryRaffleStrategyRuleWeightHandle().then(r => {
        });
    }, [refresh])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategyRuleWeightVOList.map((ruleWeight, index) => {
                const percentage = Math.min((ruleWeight.userActivityAccountTotalUseCount / ruleWeight.ruleWeightCount) * 100, 100);

                return (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                        <div className="mb-3">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">抽奖阶梯{index + 1}</h3>

                            {/* 进度条 */}
                            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: '#3B82F6'
                                    }}
                                />
                            </div>

                            {/* 进度文字 */}
                            <div className="text-center mt-1">
                                <span className="text-sm font-bold text-gray-800">
                                    {ruleWeight.userActivityAccountTotalUseCount}/{ruleWeight.ruleWeightCount}
                                </span>
                            </div>
                        </div>

                        {/* 必中奖品范围 */}
                        {ruleWeight.strategyAwards && ruleWeight.strategyAwards.length > 0 && (
                            <div>
                                <div className="text-xs text-gray-500 mb-2">必中奖品范围</div>
                                <div className="space-y-1">
                                    {ruleWeight.strategyAwards.map((award) => (
                                        <div key={award.awardId} className="flex items-center text-xs text-gray-700">
                                            <span className="mr-1" style={{color: '#F59E0B'}}>•</span>
                                            <span className="truncate">{award.awardTitle}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    )
}
