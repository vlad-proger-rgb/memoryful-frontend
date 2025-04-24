export interface Token {
  accessToken: string
  tokenType: string
}

export interface AuthResponse {
  tokens: Token
  isNewUser: boolean
  userId: string
}
