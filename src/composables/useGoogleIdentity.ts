export interface GoogleCredentialResponse {
  credential?: string
}

export interface GoogleButtonOptions {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'small' | 'medium' | 'large'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: number
}

export interface GoogleAccountsId {
  initialize(config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    ux_mode?: 'popup' | 'redirect'
    auto_select?: boolean
  }): void
  renderButton(parent: HTMLElement, options: GoogleButtonOptions): void
  disableAutoSelect(): void
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } }
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'

let loading: Promise<GoogleAccountsId> | null = null

/** Loads Google Identity Services on demand — only the auth screens ever need it. */
export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  loading ??= new Promise<GoogleAccountsId>((resolve, reject) => {
    const ready = () => {
      const api = window.google?.accounts?.id
      if (api) resolve(api)
      else reject(new Error('Google Identity Services loaded without an accounts API'))
    }

    if (window.google?.accounts?.id) {
      ready()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    const el = existing ?? document.createElement('script')

    el.addEventListener('load', ready)
    el.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')))

    if (!existing) {
      el.src = GSI_SRC
      el.async = true
      document.head.appendChild(el)
    }
  }).catch((error: unknown) => {
    // A cached rejected promise would poison every later attempt on the same page.
    loading = null
    throw error
  })

  return loading
}

/** Stops Google silently re-signing the user in straight after they log out. */
export function googleSignOut(): void {
  window.google?.accounts?.id?.disableAutoSelect()
}
