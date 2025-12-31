import {activityStrategyArmory} from "@/apis";

export function StrategyArmory() {
    const strategyArmoryHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const activityId = Number(queryParams.get('activityId'));
        if (!activityId){
            window.alert("请在请求地址中，配置 activityId 值，如：http://117.72.164.204:3000/?userId=zxy&activityId=100301")
            return;
        }
        const res = await activityStrategyArmory(activityId);
        const {code, info} = await res.json();
        if (code != "0000") {
            window.alert("抽奖活动策略装配失败 code:" + code + " info:" + info)
            return;
        }

        window.alert("装配完成，开始体验吧!")
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">装配抽奖</h2>
                    <p className="text-xs text-gray-500">测试自动开启随机抽选</p>
                </div>
                <button
                    onClick={strategyArmoryHandle}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors"
                >
                    装配抽奖
                </button>
            </div>
        </div>
    );
}
