import Link from 'next/link';

export default function TestDeploy() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ✅ Deployment Working!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your Events Platform is successfully deployed
        </p>
        <div className="space-y-4">
          <Link 
            href="/events" 
            className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Go to Events Page
          </Link>
          <Link 
            href="/auth/signin" 
            className="block bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 