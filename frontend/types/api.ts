export interface ApiResponse<T> { data: T; message?: string }
export interface PaginatedResponse<T> { data: T[]; page: number; pageSize: number; total: number; totalPages: number }
export interface ApiError { message: string; code?: string; fieldErrors?: Record<string, string[]> }
