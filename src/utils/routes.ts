export const yearPath = (year: number) => `/calendar/${year}`

export const monthPath = (year: number, month: number) => `${yearPath(year)}/${month}`

/** The calendar route for one day, from a Date or a `YYYY-MM-DD` string. */
export const dayPath = (day: Date | string) => {
  const date = typeof day === 'string' ? new Date(`${day}T00:00:00`) : day
  return `${monthPath(date.getFullYear(), date.getMonth() + 1)}/${date.getDate()}`
}
