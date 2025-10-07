import { useRouter } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

export default function Error({ error }: { error?: unknown }) {
  const router = useRouter();

  const message = error && typeof error === "object" && "message" in error ? String((error as { message?: string }).message) : "Something went wrong. Please try again later.";

  return (
    <div className="flex pt-20 flex-col items-center justify-center text-white px-6 text-center">
      <h1 className="font-bold text-4xl md:text-6xl">TWILIGHT</h1>

      <img src="/sad.png" alt="Error illustration" className="w-64 mb-6 opacity-90" />

      <span className="flex items-center justify-center gap-2">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <h2 className="text-2xl font-bold">Oops! An error occurred</h2>
      </span>

      <p className="text-gray-400 mb-6">{message}</p>

      <div className="flex gap-4">
        <button onClick={() => router.history.back()} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
          Go Back
        </button>
      </div>
    </div>
  );
}
