export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'staff' | 'admin';
  createdAt: string;
  provider: string;
  // Optional staff-specific fields
  department?: string;
  permissions?: string[];
}

// For NextAuth session
export interface ExtendedSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'staff' | 'admin';
  };
  expires: string;
}