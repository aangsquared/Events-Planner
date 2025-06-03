import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import type { NextAuthOptions, User } from "next-auth";
import type { Session, Account, Profile } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Adapter } from "next-auth/adapters";


// Firebase config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const credential = cert({
    projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
    clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
});

interface CustomUser extends User {
    role?: string;
}

interface CustomSession extends Session {
    user: {
        id: string;
        role: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
    }
}

interface ExtendedUser extends User {
    role?: string;
}

interface ExtendedJWT extends JWT {
    role?: string;
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const userCredential = await signInWithEmailAndPassword(
                        auth,
                        credentials.email,
                        credentials.password
                    );

                    const user = userCredential.user;

                    // Get user role from Firestore
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    const userData = userDoc.data();

                    return {
                        id: user.uid,
                        email: user.email,
                        name: user.displayName || user.email?.split('@')[0],
                        role: userData?.role || 'user',
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
                    return null;
                }
            }
        })
    ],
    adapter: FirestoreAdapter({ credential }),
    callbacks: {
        async signIn({ user, account }: { user: User; account: Account | null }) {
            // For OAuth providers, set default role if user doesn't exist
            if (account?.provider !== 'credentials' && user?.id) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.id));
                    if (!userDoc.exists()) {
                        // New OAuth user - set default role
                        (user as ExtendedUser).role = 'user';
                    } else {
                        // Existing user - get their role
                        (user as ExtendedUser).role = userDoc.data()?.role || 'user';
                    }
                } catch (error) {
                    console.error("Error checking user role:", error);
                    (user as ExtendedUser).role = 'user';
                }
            }
            return true;
        },
        async session({ session, token }: { session: Session; token: ExtendedJWT }): Promise<CustomSession> {
            const customSession = session as CustomSession;
            if (token?.sub) {
                customSession.user = {
                    ...customSession.user,
                    id: token.sub,
                    role: token.role || 'user',
                    email: token.email as string | null,
                    name: token.name as string | null,
                    image: token.picture as string | null,
                };
            }
            return customSession;
        },
        async jwt({ token, user, account, trigger }: {
            token: JWT;
            user?: User;
            account: Account | null;
            trigger?: "signIn" | "signUp" | "update";
        }): Promise<ExtendedJWT> {
            if (user) {
                token.sub = user.id;
                token.role = (user as ExtendedUser).role || 'user';

                // If this is a credentials sign-in, fetch the user's role from Firestore
                if (account?.provider === 'credentials' && user.id) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", user.id));
                        if (userDoc.exists()) {
                            token.role = userDoc.data()?.role || 'user';
                        }
                    } catch (error) {
                        console.error("Error fetching user role:", error);
                    }
                }
            }
            return token as ExtendedJWT;
        }
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt" as const,
    },
    debug: process.env.NODE_ENV === "development",
    useSecureCookies: process.env.NODE_ENV === "production",
}; 