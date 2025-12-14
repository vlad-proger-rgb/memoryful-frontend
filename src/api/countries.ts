import axios from '@/api/client'
import type { ApiResponse, Country } from '@/types'

export const countriesApi = {
  getCountries(query: string): Promise<ApiResponse<Country[]>> {
    return axios.get(`/api/countries/all/`, {
      params: { query }
    })
  },
  getCountryById(id: string): Promise<ApiResponse<Country>> {
    return axios.get(`/api/countries/${id}`)
  },
}

export default countriesApi
