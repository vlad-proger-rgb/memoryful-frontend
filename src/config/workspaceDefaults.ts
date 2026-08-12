import type { WorkspaceBackground, WorkspacePageKey } from '@/types/workspace'

const BASE = (import.meta.env.VITE_PUBLIC_ASSET_BASE_URL || '/memoryful').replace(/\/$/, '')

const asset = (name: string) => `${BASE}/users/defaults/workspace/${name}`

const DASHBOARD_LQIP =
  'data:image/webp;base64,UklGRogBAABXRUJQVlA4IHwBAABQCACdASogABYAPsFMn0qnpCKhsAgA8BgJbACdMoR+N5zw9' +
  'OuLYZ2iMxhSGmO7yvMSSJp5VSzz+7ZQc69qz+cQU/RAq9KQ6NB1XoAAlDpvEFcr15/IfinxXIIicDgKJc6VGIlTXyS/h+Md8' +
  'PIC3GHt14DsQmYkuWrn2Z/9Ml5t4vPf2D/Hqmf/lLGboObEaZZGVmBTuQd81x8Y5qknYkc1jzuFcLhaJxmS++wbvm23tuwxV' +
  'eV8GHcJf4wP4w33sZeCE9MDMkKsfbKz6EHdt8AnN4sPdqxjQTJ1D1nh67JFSH1W3Tt7oBeWm99Ng4lcikYo02Oz8XypWCE9c' +
  'KbI5YIGPcy4g5VP2shhJhED4Yk86vzNzsG2YPc9BqRd2vukknU3xiNBxmpy4P2v3d/fBiP9V/7Rw9lt/QDzkPw63ikpTHe00' +
  'ShSUo4OjZfWM55dbtzs1KgUZe9fk7Ocjln+rpRUHhGxCa2np93oR07GPy/uFoF835B1177mwqAAAA=='

const DAY_LQIP =
  'data:image/webp;base64,UklGRrYAAABXRUJQVlA4IKoAAAAQBQCdASogABIAPsFWok2npKMiKAqo8BgJbACdM2QFJure2' +
  'p4xRDHlm7FSD9M/JmgAAP7ZO2nBOOpFy323rXuSTIQlLCaykVWRaRlf6r569nuZ6Fv0sLr37yv84pnlX+6Etf25pq8Ut91Zd' +
  'B/Yh0XJdTYeYNJ2C4LYIBZF4SBkaBKAGMgH6iWBTJLsv0ZqJ4/9V9Ibzhz31tKQZmiiTE9V3KG59vKmS10AAA=='

const SEARCH_LQIP =
  'data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAADQAwCdASogABIAPsFOn0qnpCKhsAgA8BgJQBecBDv6szleq' +
  'GgF96IA/vQiwliqGr/9d0FohHZCQQyLtPdKBP+vuZLcXw2QVk3nKB9Wti0sUxlARcRUazDpwRNhybRpncIAAA=='

const MONTH_LQIP =
  'data:image/webp;base64,UklGRgQBAABXRUJQVlA4IPgAAADQBQCdASogABgAPsFWoUwnpKMiMBgIAPAYCUAWo3Al' +
  'ICuVKHKPBfOqByFUEN22PMPMPBBj0MKAAPGXk7gYj3vnLZFuZuE4uJELrpI/qe4TqBNtyPNHYi8Ehsf4ob6PEnH3Q6x' +
  'cvDRIpjNG2mZlw03cBdDKghimMpaWfxTsdKzvMIniirqRSKk4amppKXgOX3mo+54BD7xQN/80U1IN/ur2bjeuwLzJgbv' +
  'f8E+gyl9CXvEdqegVIxukQOJ0w0gYBuvxUUFFUglSii9LrTliLr60aUh6mvk3nS03nC33qRubGs/6H1k+fuyZwz7CrIZ' +
  'buDClcldBMpYAAA=='

// settings_bg is byte-identical to dashboard_bg today.
const SETTINGS_LQIP = DASHBOARD_LQIP

export const DEFAULT_BACKGROUNDS: Record<WorkspacePageKey, WorkspaceBackground> = {
  dashboard: { url: asset('dashboard_bg.webp'), placeholder: DASHBOARD_LQIP },
  day: { url: asset('day_bg.webp'), placeholder: DAY_LQIP },
  month: { url: asset('month_bg.webp'), placeholder: MONTH_LQIP },
  search: {
    url: asset('search_bg.mp4'),
    isVideo: true,
    posterUrl: asset('search_bg_poster.webp'),
    placeholder: SEARCH_LQIP,
  },
  settings: { url: asset('settings_bg.webp'), placeholder: SETTINGS_LQIP },
}
