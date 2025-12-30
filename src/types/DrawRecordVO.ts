/**
 * 用户抽奖中奖记录
 * 对应后端 UserAwardRecordResponseDTO
 */
export interface DrawRecordVO {
    userId: string;
    activityId: number;
    strategyId: string;
    orderId: string;
    awardId: number;
    awardTitle: string;
    awardTime: string; // ISO 8601 格式的时间字符串
    awardState: string; // create: "create", confirmed: "confirmed"
}

/**
 * 抽奖记录响应
 */
export interface DrawRecordResponse {
    code: string;
    info: string;
    data?: DrawRecordVO[];
}
