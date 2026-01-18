export interface User {
  _id?: string;
  userId: number;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  password?: string; // Optional for responses
  phone: string;
  age: number;
  role: 'customer' | 'admin' | 'owner'; // customer for user, admin for site admin, owner for business owner
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export interface RegisterData {
   userId: number;
   firstName: string;
   lastName: string;
   gender: string;
   email: string;
   password: string;
   phone: string;
   age: number;
   role: 'customer' | 'admin' | 'owner';
 }

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  firstName: string;
  lastName: string;
  role: string;
  message?: string;
}