"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/actions";
import Link from "next/link";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => registerAction(formData),
    undefined,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Register with your name and a 4-digit code</p>
        </div>

        <form action={action} className="bg-white p-8 rounded-lg shadow-sm border space-y-4">
          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{state.error}</div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              4-Digit Code
            </label>
            <input
              id="code"
              name="code"
              type="password"
              inputMode="numeric"
              maxLength={4}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1234"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Code
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              inputMode="numeric"
              maxLength={4}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1234"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {pending ? "Creating account..." : "Register"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
