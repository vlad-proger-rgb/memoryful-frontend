export interface Token {
  access_token: string
  token_type: string
}

export interface AuthResponse {
  tokens: Token
  is_new_user: boolean
  user_id: string
}
