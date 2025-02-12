// src/app/auth/page.js
import { getProviders, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button"; // Custom Button component if you have it

export default async function SignIn() {
  // Fetch available authentication providers on the server-side
  const providers = await getProviders();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign in to your account</h2>
        <div className="space-y-4">
          {providers && Object.values(providers).map((provider) => (
            <div key={provider.name}>
              <Button
                onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })} // Add custom redirect URL here
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
              >
                Sign in with {provider.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
