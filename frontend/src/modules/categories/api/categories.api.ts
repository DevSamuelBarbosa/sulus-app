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
  async create(name: string): Promise<Category> {
    const { data } = await httpClient.post<{ data: Category }>('/admin/categories', { name })
    return data.data
  },
  async update(id: number, name: string): Promise<Category> {
    const { data } = await httpClient.put<{ data: Category }>(`/admin/categories/${id}`, { name })
    return data.data
  },
  async remove(id: number): Promise<void> {
    await httpClient.delete(`/admin/categories/${id}`)
  },
}
