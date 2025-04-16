export function useAuthUtils() {
  const shakeElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.classList.add('shake-animation')
      setTimeout(() => {
        element.classList.remove('shake-animation')
      }, 500)
    }
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return {
    shakeElement,
    isValidEmail
  }
}
