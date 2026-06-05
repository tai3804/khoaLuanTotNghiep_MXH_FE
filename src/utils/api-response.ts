export type ApiResponse<T> = {
    statusCode: number;
    message: string;
    data: T;
};

export type PaginatedData<T> = {
    pageNumber: number;
    pageSize: number;
    totalRecord: number;
    totalPages: number;
    totalAmounts?: number;
    items: T[];
};

export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;

export function extractPaginatedData<T>(response: PaginatedApiResponse<T>) {
    const { data } = response;
    return {
        items: data.items,
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalRecord: data.totalRecord,
        totalPages: data.totalPages,
    };
}

export function extractData<T>(response: ApiResponse<T>): T {
    return response.data;
}

export function isSuccessResponse<T>(response: ApiResponse<T>): boolean {
    return response.statusCode >= 200 && response.statusCode < 300;
}

export function getErrorMessage<T>(response: ApiResponse<T>): string {
    return response.message || 'Đã xảy ra lỗi không xác định';
}
