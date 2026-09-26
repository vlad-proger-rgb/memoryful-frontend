export interface NavDestination {
  key: 'dashboard' | 'settings'
  to: string
  label: string
  icon: string
  /** Only used while the `navIconColors` experiment is on. */
  color: string
}

/** The app's top-level destinations, shared by the desktop header and the mobile bottom bar. */
export const navDestinations: NavDestination[] = [
  { key: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: 'house', color: '#8ab4ff' },
  { key: 'settings', to: '/settings', label: 'Settings', icon: 'user', color: '#ffb4a2' },
]

export const isDestinationActive = (destination: NavDestination, path: string): boolean =>
  path === destination.to || path.startsWith(`${destination.to}/`)
