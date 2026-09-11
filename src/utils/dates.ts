export const startOfDay = (date: Date) => {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export const endOfDay = (date: Date) => {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

export const toIsoDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export const toTimestamp = (date: Date) => Math.floor(date.getTime() / 1000)

export const startOfWeek = (date: Date) => {
  const copy = startOfDay(date)
  const weekday = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - weekday)
  return copy
}

export interface DigestWeek {
  start: Date
  end: Date
  startIso: string
  endIso: string
  /** "24.08 – 30.08.2026" */
  label: string
}

const pad = (value: number) => String(value).padStart(2, '0')

/** Numeric and unambiguous: "10.09.2026". */
export const formatDate = (date: Date) =>
  `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`

const dayAndMonth = (date: Date) => `${pad(date.getDate())}.${pad(date.getMonth() + 1)}`

/** The Monday-to-Sunday week containing `date`. */
export const weekOf = (date: Date): DigestWeek => {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  return {
    start,
    end,
    startIso: toIsoDate(start),
    endIso: toIsoDate(end),
    label: `${dayAndMonth(start)} – ${formatDate(end)}`,
  }
}

/** Parses a `weekStart` ISO date from the API without shifting it into the local timezone. */
export const weekFromIso = (iso: string) => weekOf(new Date(`${iso}T00:00:00`))

/** The last week that has actually ended. */
export const latestFinishedWeek = (from = new Date()): DigestWeek => {
  const monday = startOfWeek(from)
  monday.setDate(monday.getDate() - 7)
  return weekOf(monday)
}
