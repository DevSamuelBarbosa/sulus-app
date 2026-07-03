import { httpClient } from '@/shared/api/httpClient'

export interface Category {
  id: number
  name: string
  slug: string
}

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const { data } = await httpClient.get<{ data: Category[] }>('/categories')
    return data.data
  },
}
