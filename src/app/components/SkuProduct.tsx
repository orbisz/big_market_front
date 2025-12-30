import {useEffect, useState} from "react";
import {SkuProductResponseDTO} from "@/types/SkuProductResponseDTO";
import {creditPayExchangeSku, querySkuProductListByActivityId, queryUserCreditAccount} from "@/apis";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function SkuProduct({handleRefresh}) {
    const [SkuProductResponseDTOList, setSkuProductResponseDTOList] = useState<SkuProductResponseDTO[]>([]);
    const [userCredit, setUserCredit] = useState(0);

    const querySkuProductListByActivityIdHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const result = await querySkuProductListByActivityId(Number(queryParams.get('activityId')));

        const {code, info, data}: { code: string; info: string; data: SkuProductResponseDTO[] } = await result.json();

        if (code != "0000") {
            console.error("查询产品列表失败 code:" + code + " info:" + info)
            return;
        }
        setSkuProductResponseDTOList(data)
    }

    const queryUserCreditAccountHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const result = await queryUserCreditAccount(String(queryParams.get('userId')));
        const {code, info, data}: { code: string; info: string; data: number } = await result.json();

        if (code != "0000") {
            console.error("查询用户积分失败 code:" + code + " info:" + info)
            return;
        }
        setUserCredit(data)
    }

    const creditPayExchangeSkuHandle = async (sku: number, requiredCredit: number) => {
        if (userCredit < requiredCredit) {
            window.alert("积分不足，无法兑换！")
            return;
        }

        const queryParams = new URLSearchParams(window.location.search);
        const result = await creditPayExchangeSku(String(queryParams.get('userId')), sku);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {code, info, data}: { code: string; info: string; data: boolean } = await result.json();

        if (code != "0000") {
            window.alert("兑换抽奖次数失败 code:" + code + " info:" + info)
            return;
        }

        const timer = setTimeout(() => {
            handleRefresh()
            queryUserCreditAccountHandle()
        }, 350);

        // 清除定时器，以防组件在执行前被卸载
        return () => clearTimeout(timer);
    }

    useEffect(() => {
        querySkuProductListByActivityIdHandle().then(() => {});
        queryUserCreditAccountHandle().then(() => {});
    }, [])

    // 定义按钮颜色配置
    const buttonConfigs = [
        { bgColor: '#3B82F6' },  // 蓝色
        { bgColor: '#10B981' },  // 绿色
        { bgColor: '#A855F7' },  // 紫色
        { bgColor: '#EC4899' },  // 粉色
    ]

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative">
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SkuProductResponseDTOList.map((skuProduct, index) => {
                    const config = buttonConfigs[index % buttonConfigs.length];
                    const canAfford = userCredit >= skuProduct.productAmount;

                    return (
                        <button
                            key={index}
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
                    );
                })}
            </div>
        </div>
    )
}
