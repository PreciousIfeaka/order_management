export interface ICreateUserPayload {
  name: string;
  email: string;
  password: string;
  admin_secret?: string;
}
