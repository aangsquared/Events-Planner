import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

// Initialize Firebase client-side SDK
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (avoid reinitializing)
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebaseApp);

// Create a credentials object for Firebase
const credential = cert({
  projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
  clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
});

// Configure auth options
export const authOptions = {
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Facebook OAuth
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

    // Email/Password Authentication
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
          
          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0],
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
    async signIn({ user, account, profile }: any) {
      console.log("Sign in attempt:", { user, account, profile });
      return true;
    },
    async session({ session, user, token }: any) {
      console.log("Session callback:", { session, user, token });
      // Add user id to session
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      // Add user id to token
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt" as const,
  },
  debug: process.env.NODE_ENV === "development",
};

// Create and export the auth handler for App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };