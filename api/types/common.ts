export type Uuid = string;
export type IsoTimestamp = string;

export type CustomerType = "CLIENT" | "GUEST";

export interface PageResponse<T> {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    content: T;
}

export interface PageParams {
    page?: number;
    size?: number;
}

export interface ApiErrorResponse {
    status: number;
    error: string;
    message: string;
    timestamp: IsoTimestamp;
}
