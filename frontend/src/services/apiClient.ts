/**
 * Generic API client using the browser's native Fetch API.
 * Requests prefixed with /api are proxied to the Spring Cloud Gateway (:8080).
 */

export class ApiError extends Error {
  status: number
  statusText: string
  details?: unknown

  constructor(message: string, status: number, statusText: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.details = details
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

  // Read stored JWT token to attach Authorization header if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('hm_token') : null
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  try {
    const response = await fetch(endpoint, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...authHeader,
        ...(options.headers || {}),
      },
    })

    if (!response.ok) {
      let errorDetails: unknown
      try {
        errorDetails = await response.json()
      } catch {
        errorDetails = await response.text()
      }

      // Extract detailed server error message if available
      let detailedMessage = `API Request failed with status ${response.status} (${response.statusText})`
      if (typeof errorDetails === 'object' && errorDetails !== null) {
        const errObj = errorDetails as Record<string, unknown>
        if (typeof errObj.message === 'string' && errObj.message) {
          detailedMessage = errObj.message
        } else if (typeof errObj.error === 'string' && errObj.error) {
          detailedMessage = errObj.error
        }
      } else if (typeof errorDetails === 'string' && errorDetails) {
        detailedMessage = errorDetails
      }

      throw new ApiError(
        detailedMessage,
        response.status,
        response.statusText,
        errorDetails
      )
    }

    // Handle empty 204 or 201 without content
    const contentLength = response.headers.get('content-length')
    if (response.status === 204 || contentLength === '0') {
      return {} as T
    }

    return (await response.json()) as T
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out while contacting API Gateway', 408, 'Request Timeout')
    }
    const message = err instanceof Error ? err.message : 'Unknown network error'
    throw new ApiError(`Network error: ${message}`, 0, 'Network Error')
  } finally {
    clearTimeout(timeoutId)
  }
}
