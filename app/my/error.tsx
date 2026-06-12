"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Portal Error</h2>
          <p className="text-sm text-slate-500">
            An error occurred while loading this page. Please try again.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => router.push("/my/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={reset}
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
