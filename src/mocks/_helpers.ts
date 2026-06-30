export const mockDelay = (base = 300, jitter = 300): Promise<void> =>
  new Promise(r => setTimeout(r, base + Math.random() * jitter))

export function shouldSimulateError(key: string): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return (
    params.get('mock_error') === key ||
    localStorage.getItem(`susu_mock_error_${key}`) === 'true'
  )
}

export class MockApiError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = 'MockApiError'
    this.status = status
  }
}
