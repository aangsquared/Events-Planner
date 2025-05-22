import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Extend the default User type to include role
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: User;
  }
}

export function useRole() {
  const { data: session, status } = useSession();
  
  const isLoading = status === "loading";
  const user = session?.user;
  const role = user?.role || 'user';
  
  return {
    user,
    role,
    isLoading,
    isAuthenticated: !!user,
    isStaff: role === 'staff' || role === 'admin',
    isAdmin: role === 'admin',
    isUser: role === 'user',
  };
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'user' | 'staff' | 'admin'
) {
  return function AuthComponent(props: P) {
    const { user, role, isLoading } = useRole();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.push('/auth/signin');
        } else if (requiredRole && role !== requiredRole && !(requiredRole === 'staff' && role === 'admin')) {
          router.push('/unauthorized');
        }
      }
    }, [user, role, isLoading, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null;
    }

    if (requiredRole && role !== requiredRole && !(requiredRole === 'staff' && role === 'admin')) {
      return null;
    }

    return <Component {...props} />;
  };
}