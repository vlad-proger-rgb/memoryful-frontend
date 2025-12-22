export function useShake() {
  const shakeElement = (elementId: string, durationMs = 500) => {
    const element = document.getElementById(elementId)
    if (!element) return

    element.classList.remove('shake-animation')
    // Force reflow so re-adding the class always re-triggers the animation
    void element.offsetWidth
    element.classList.add('shake-animation')

    window.setTimeout(() => {
      element.classList.remove('shake-animation')
    }, durationMs)
  }

  return {
    shakeElement,
  }
}
