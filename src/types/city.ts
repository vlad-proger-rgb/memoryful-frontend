import type { Country } from './country'

export interface City {
  id: string
  name: string
}

export interface CityDetail extends City {
  country: Country
}
