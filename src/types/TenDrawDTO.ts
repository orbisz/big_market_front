/**
 * 十连抽请求参数
 */
export interface ActivityTenDrawRequestDTO {
    userId: string;
    activityId: number;
}

/**
 * 单次抽奖结果
 */
export interface DrawResult {
    orderId: string;
    awardId: number;
    awardTitle: string;
    awardIndex: number;
}

/**
 * 十连抽响应数据
 */
export interface ActivityTenDrawResponseDTO {
    drawResults: DrawResult[];
}

/**
 * API响应包装
 */
export interface TenDrawResponse {
    code: string;
    info: string;
    data?: ActivityTenDrawResponseDTO;
}
