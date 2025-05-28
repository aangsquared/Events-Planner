import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LoadingSpinner from "../components/common/LoadingSpinner"

// Extend the default User type to include role
declare module "next-auth" {
  interface User {
    role?: string
  }
  interface Session {
    user: User
  }
}

export function useRole() {
  const { data: session, status } = useSession()

  const isLoading = status === "loading"
  const user = session?.user
  const role = user?.role || "user"

  return {
    user,
    role,
    isLoading,
    isAuthenticated: !!user,
    isStaff: role === "staff" || role === "admin",
    isAdmin: role === "admin",
    isUser: role === "user",
  }
}

// Helper function to check if user has required role
function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  if (requiredRole === "user") return true // All authenticated users can access user routes
  if (requiredRole === "staff")
    return userRole === "staff" || userRole === "admin"
  if (requiredRole === "admin") return userRole === "admin"
  return false
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: "user" | "staff" | "admin"
) {
  return function AuthComponent(props: P) {
    const { user, role, isLoading } = useRole()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.push("/auth/signin")
        } else if (requiredRole && !hasRequiredRole(role, requiredRole)) {
          router.push("/unauthorized")
        }
      }
    }, [user, role, isLoading, router, requiredRole])

    if (isLoading) {
      return <LoadingSpinner />
    }

    if (!user) {
      return null
    }

    if (requiredRole && !hasRequiredRole(role, requiredRole)) {
      return null
    }

    return <Component {...props} />
  }
}
