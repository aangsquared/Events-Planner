import NextAuth from "next-auth"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { cert } from "firebase-admin/app"
import GoogleProvider from "next-auth/providers/google"; // Example provider

 
export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,    
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    adapter: FirestoreAdapter({
      credential: cert({
        projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
        clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    }),
  });