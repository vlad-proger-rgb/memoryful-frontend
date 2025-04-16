import axios from 'axios'
import type { ApiResponse, City } from '@/types'

export const citiesApi = {
  getCities(country_id: string, query: string): Promise<ApiResponse<City[]>> {
    return axios.get(`/api/cities/by-country/${country_id}`, {
      params: { query }
    })
  },
  getCityById(id: string): Promise<ApiResponse<City>> {
    return axios.get(`/api/cities/${id}`)
  },
}
