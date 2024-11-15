export interface SessionData {
  id: string
  user_id: string
  token: string
  email: string
  role: string
  created_at: Date
  expires_at: Date
}

export interface UserSession {
  id: string
  email: string
  role: string
  isLoggedIn: boolean
}
