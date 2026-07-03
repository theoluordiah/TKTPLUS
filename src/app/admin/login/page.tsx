"use client";

import { useActionState } from "react";
import { adminLoginAction } from "@/lib/actions";
import Link from "next/link";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => adminLoginAction(formData),
    undefined,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Enter the admin password</p>
        </div>

        <form action={action} className="bg-white p-8 rounded-lg shadow-sm border space-y-4">
          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{state.error}</div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Admin password"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {pending ? "Logging in..." : "Login as Admin"}
          </button>

          <p className="text-center text-sm text-gray-500">
            <Link href="/" className="text-blue-600 hover:underline">
              Back to Home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
