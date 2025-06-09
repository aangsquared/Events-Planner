# Events Platform

A comprehensive community events platform that allows users to browse, register for, and manage events from multiple sources including Ticketmaster and custom platform events created by staff members.

## Project Overview

This platform was built for a small community business to create and share events with community members. The application provides two main user experiences:

- **Attendees**: Browse events, register for events, and add events to their Google Calendar
- **Staff Members**: Create and manage events, view registrations, and access an administrative dashboard

## 🚀 Features

### Core Features (MVP)
- **Event Browsing**: Display events from Ticketmaster API and custom platform with filtering
- **Event Registration**: Users can sign up for events with duplicate registration prevention
- **Google Calendar Integration**: Add events directly to Google Calendar
- **Staff Authentication**: Secure staff login with role-based access control
- **Event Management**: Staff can create, edit, and manage events

### Additional Features
- **Dual Authentication**: Email/password and social login (Google, Facebook)
- **Advanced Filtering**: Search by name, category, city, and event source
- **Registration Management**: Comprehensive dashboard for managing attendees
- **Responsive Design**: Mobile-first design that works across all devices
- **Real-time Updates**: Live event data from multiple sources
- **Role-based Access**: Separate interfaces for staff and community members

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Authentication**: NextAuth.js with Firebase Authentication
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS, Material-UI components
- **APIs**: Ticketmaster Discovery API, Google Calendar API
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project with Firestore and Authentication enabled
- Google OAuth credentials
- Ticketmaster API key (optional, for external events)

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd events-platform
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (for server-side operations)
AUTH_FIREBASE_PROJECT_ID=your-project-id
AUTH_FIREBASE_CLIENT_EMAIL=your-service-account-email
AUTH_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Optional: Ticketmaster API (for external events)
TICKETMASTER_API_KEY=your-ticketmaster-api-key
```

### 4. Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication with Email/Password, Google, and Facebook providers
4. Create a service account and download the credentials JSON file
5. Place the service account file in the root directory

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
4. Add your production domain when deployed

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Test Accounts

### Staff Account
- **Email**: staff@eventsplatform.com
- **Password**: StaffTest123!
- **Role**: Staff (can create and manage events)

### Regular User Account
- **Email**: user@eventsplatform.com
- **Password**: UserTest123!
- **Role**: User (can browse and register for events)

### Creating Additional Test Accounts

You can create additional accounts through the sign-up interface. New accounts are assigned "user" role by default. To promote a user to staff:

1. Sign in to Firebase Console
2. Navigate to Firestore Database
3. Find the user in the `users` collection
4. Update the `role` field to "staff"

## 🌐 Deployment

This application is optimized for deployment on Vercel:

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Update Firebase OAuth settings with your production domain
4. Deploy!

### Other Deployment Options

The application can also be deployed to:
- Netlify
- AWS Amplify
- Railway
- Any Node.js hosting platform

## 📱 Usage Guide

### For Community Members

1. **Sign Up/Sign In**: Create an account or sign in with email or social providers
2. **Browse Events**: View events from the main events page with filtering options
3. **Event Details**: Click on any event to view detailed information
4. **Register for Events**: Click "Sign Up for Event" on event detail pages
5. **Add to Calendar**: Use "Add to Calendar" button to add events to Google Calendar
6. **Manage Registrations**: View your registrations in the dashboard

### For Staff Members

1. **Staff Dashboard**: Access comprehensive analytics and management tools
2. **Create Events**: Add new events with detailed information and media
3. **Manage Events**: Edit existing events and view registration statistics
4. **Registration Management**: View and manage all event registrations
5. **User Management**: Monitor platform usage and user activity

## 📊 Key Features Walkthrough

### Event Registration Flow
1. User browses available events
2. Clicks on event for detailed view
3. Registers for event (prevents duplicate registrations)
4. Receives confirmation and calendar integration option
5. Can view registration in personal dashboard

### Staff Event Management
1. Staff member logs into staff portal
2. Creates new event with rich details
3. Event appears in public listing immediately
4. Staff can monitor registrations and attendee data
5. Can edit or cancel events as needed

## 🧪 Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

## 🐛 Common Issues & Troubleshooting

### Authentication Issues
- Ensure Firebase configuration is correct
- Check that OAuth redirect URIs match your domain
- Verify environment variables are properly set

### API Issues
- Ticketmaster API has rate limits - implement caching if needed
- Firebase quota limits may apply for high usage

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS if using additional libraries







