import { request, ApiError } from './apiClient'
import type { User, AuthResponse, LoginCredentials, RegisterData } from '../types/user'

const TOKEN_KEY = 'hm_token'
const USER_KEY = 'hm_user'

/**
 * Service to manage authentication and user sessions via Spring Cloud Gateway (:8080)
 * routing to auth-service (:8085).
 */

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(USER_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

function persistSession(auth: AuthResponse): User {
  localStorage.setItem(TOKEN_KEY, auth.token)

  const user: User = {
    id: auth.userId,
    name: auth.name,
    email: auth.email,
    role: auth.role,
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export async function login(credentials: LoginCredentials): Promise<{ user: User; auth: AuthResponse }> {
  const auth = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  const user = persistSession(auth)
  return { user, auth }
}

export async function register(data: RegisterData): Promise<{ user: User; auth: AuthResponse }> {
  const auth = await request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  const user = persistSession(auth)
  return { user, auth }
}

export async function getCurrentUser(): Promise<User> {
  return await request<User>('/api/auth/me')
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
