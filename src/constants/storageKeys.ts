export const STORAGE_KEYS = {
  AUTH: {
    ACCESS_TOKEN: 'memoryful:auth:access-token',
  },
  USER: {
    SETTINGS: 'memoryful:user:settings',
  },
  UI: {
    THEME: 'memoryful:ui:theme',
    DIGEST_SEEN_WEEK: 'memoryful:ui:digest-seen-week',
  },
  DATA: {
    COUNTRIES: 'memoryful:data:countries',
    CITIES: 'memoryful:data:cities',
    YEAR: (year: number) => `memoryful:data:months:${year}`,
    DAY_DRAFT: (timestamp: number) => `memoryful:data:day-draft:${timestamp}`,
  },
}

export default STORAGE_KEYS
