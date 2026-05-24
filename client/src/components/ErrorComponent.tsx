import { AlertTriangle } from "lucide-react";
import type { ErrorComponentProps } from "@tanstack/react-router";

export default function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const message = error && typeof error === "object" && "message" in error ? String(error.message) : "Something went wrong. Please try again later.";

  return (
    <div className="flex pt-20 flex-col items-center justify-center text-white px-6 text-center">
      <img src="/sad.png" alt="Error illustration" className="w-64 mb-6 opacity-90" />

      <span className="flex items-center justify-center gap-2">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <h2 className="text-2xl font-bold">Oops! Something went wrong.</h2>
      </span>

      <p className="text-gray-400 mb-6">{message}</p>

      <div className="flex gap-4">
        {/* Použijeme reset() namiesto router.history.back() */}
        <button onClick={() => reset()} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
          Retry
        </button>
      </div>
    </div>
  );
}
