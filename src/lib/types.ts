export type User = {
  id: string
  name: string
  email: string
  role: string
}

export type AuthResponse = {
  access_token: string
  user: User
}
