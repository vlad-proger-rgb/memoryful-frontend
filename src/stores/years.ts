import { ref } from 'vue'
import { defineStore } from 'pinia'
import yearApi from '@/api/years.ts'
import type { Month } from '@/types'
import storage from '@/utils/storage.ts'
import STORAGE_KEYS from '@/constants/storageKeys'
import { useApiError } from '@/composables'

export const useYearsStore = defineStore('years', () => {
  const { errorMessage, isLoading, withLoading } = useApiError()

  const years = ref<Record<number, Month[]>>({})

  async function getYear(yearNumber: number): Promise<Month[] | false> {
    return await withLoading(async () => {
      const key = STORAGE_KEYS.DATA.YEAR(yearNumber)
      let months = years.value?.[yearNumber]

      if (!months) {
        const response = await yearApi.getYear(yearNumber)
        console.log('response: ', response)
        months = response.data ?? []
        years.value = { ...years.value, [yearNumber]: months }
        storage.set(key, months)
      }

      return months
    })
  }

  async function getMonth(
    yearNumber: number,
    monthNumber: number,
  ): Promise<Month | false | undefined> {
    // Check if we already have the month in our store
    if (years.value?.[yearNumber]) {
      const month = years.value[yearNumber].find((m) => m.month === monthNumber)
      if (month) {
        return month
      }
    }

    // If not found in store, attempt to fetch the year data first
    const monthsInYear = await getYear(yearNumber)
    if (monthsInYear && Array.isArray(monthsInYear)) {
      const month = monthsInYear.find((m) => m.month === monthNumber)
      if (month) {
        return month
      }
    }

    // If still not found, try to fetch the individual month
    return await withLoading(async () => {
      const response = await yearApi.getMonth(yearNumber, monthNumber)

      if (response.data) {
        if (!years.value[yearNumber]) {
          years.value[yearNumber] = []
        }

        const existingIndex = years.value[yearNumber].findIndex((m) => m.month === monthNumber)
        if (existingIndex >= 0) {
          years.value[yearNumber][existingIndex] = response.data
        } else {
          years.value[yearNumber].push(response.data)
        }

        const key = STORAGE_KEYS.DATA.YEAR(yearNumber)
        storage.set(key, years.value[yearNumber])
      }

      return response.data
    })
  }

  async function createMonth(month: Month): Promise<false | void> {
    return await withLoading(async () => {
      const existingMonth = await getMonth(month.year, month.month)
      if (!existingMonth) {
        await yearApi.createMonth(month)

        if (!years.value[month.year]) {
          years.value[month.year] = []
        }
        years.value[month.year].push(month)

        const key = STORAGE_KEYS.DATA.YEAR(month.year)
        storage.set(key, years.value[month.year])
      }
    })
  }

  async function updateMonth(month: Month): Promise<false | void> {
    return await withLoading(async () => {
      const existingMonth = await getMonth(month.year, month.month)
      if (existingMonth) {
        await yearApi.updateMonth(month)

        const monthIndex = years.value[month.year].findIndex((m) => m.month === month.month)
        if (monthIndex >= 0) {
          years.value[month.year][monthIndex] = month

          const key = STORAGE_KEYS.DATA.YEAR(month.year)
          storage.set(key, years.value[month.year])
        }
      }
    })
  }

  return {
    years,
    isLoading,
    errorMessage,
    getYear,
    getMonth,
    createMonth,
    updateMonth,
  }
})

export default useYearsStore
