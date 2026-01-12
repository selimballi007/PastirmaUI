// types/common.ts - Shared/common type definitions

/**
 * Generic pagination result wrapper
 * Used across multiple domains (reviews, customers, contact messages, etc.)
 */
export interface PagedResult<T> {
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
