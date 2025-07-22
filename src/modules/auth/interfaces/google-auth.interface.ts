export interface IGoogleAuth {
  verifyToken(token: string): Promise<{
    email: string,
    firstName?: string,
    lastName?: string
  }>
}