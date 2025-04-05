type ResponsePaginationMeta = {
  skip: number
  limit: number
  totalCount: number
}
export type ResponseWithPagination<T> = {
  data: T
  meta: ResponsePaginationMeta
}

type RequestPaginationParams = {
  order?: 'desc' | 'asc'
  skip?: number
  limit?: number
  getAll?: boolean
}

export type RequestWithPagination<T> = T & RequestPaginationParams

export type MutationResponse = {
  message?: string
  success: boolean
}
