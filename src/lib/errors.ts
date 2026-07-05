export class ApiError extends Error {
  status: number
  messages: string[]
  body: unknown

  constructor(message: string, options: { status: number; messages?: string[]; body?: unknown }) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.messages = options.messages?.length ? options.messages : [message]
    this.body = options.body
  }
}

export interface GlobalErrorPayload {
  id: number
  title: string
  messages: string[]
}

type Listener = (error: GlobalErrorPayload) => void

let nextId = 1
const listeners = new Set<Listener>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function collectErrorMessages(errors: unknown): string[] {
  if (Array.isArray(errors)) {
    return errors
      .flatMap(error => collectErrorMessages(error))
      .filter(Boolean)
  }

  if (typeof errors === 'string') return [errors]

  if (isRecord(errors)) {
    return Object.values(errors)
      .flatMap(value => collectErrorMessages(value))
      .filter(Boolean)
  }

  return []
}

export function createApiError(body: unknown, status: number, statusText?: string): ApiError {
  const responseMessage = isRecord(body) && typeof body.message === 'string'
    ? body.message
    : statusText || 'Request failed'
  const validationMessages = isRecord(body) ? collectErrorMessages(body.errors) : []
  const messages = validationMessages.length ? validationMessages : [responseMessage]

  return new ApiError(responseMessage, {
    status,
    messages,
    body,
  })
}

export function getErrorMessages(error: unknown, fallback = 'Something went wrong.'): string[] {
  if (error instanceof ApiError) return error.messages
  if (error instanceof Error) return [error.message || fallback]
  if (typeof error === 'string') return [error]
  return [fallback]
}

export function reportGlobalError(error: unknown, fallback?: string) {
  const messages = getErrorMessages(error, fallback)
  const title = error instanceof ApiError ? error.message : 'Something went wrong'

  listeners.forEach(listener => {
    listener({
      id: nextId++,
      title,
      messages,
    })
  })
}

export function subscribeGlobalErrors(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
