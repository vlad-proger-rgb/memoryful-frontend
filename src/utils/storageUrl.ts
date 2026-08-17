export function viaDevProxy(url: string): string {
  if (!import.meta.env.DEV || !url) return url

  try {
    const { origin, pathname, search } = new URL(url)
    return origin === window.location.origin ? url : `${pathname}${search}`
  } catch {
    return url
  }
}

export default viaDevProxy
