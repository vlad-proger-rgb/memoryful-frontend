export const STORAGE_KEYS = {
  AUTH: {
    ACCESS_TOKEN: 'memoryful:auth:access-token',
  },
  USER: {
    SETTINGS: 'memoryful:user:settings',
  },
  UI: {
    THEME: 'memoryful:ui:theme',
  },
  DATA: {
    COUNTRIES: 'memoryful:data:countries',
    CITIES: 'memoryful:data:cities',
    YEAR: (year: number) => `memoryful:data:months:${year}`,

  },
};

export default STORAGE_KEYS
