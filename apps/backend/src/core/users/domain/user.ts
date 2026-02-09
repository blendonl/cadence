export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
