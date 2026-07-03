import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Ticket System</h1>
          <p className="text-gray-600 dark:text-gray-400">Submit and manage support tickets</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/register"
            className="block w-full py-3 px-6 text-center bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Register
          </Link>

          <Link
            href="/login"
            className="block w-full py-3 px-6 text-center bg-white dark:bg-gray-800 text-blue-600 border-2 border-blue-600 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            Login
          </Link>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/login"
              className="block w-full py-2 px-6 text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
