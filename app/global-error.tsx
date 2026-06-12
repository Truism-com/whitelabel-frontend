"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">A critical error occurred</h2>
            <p className="text-sm text-slate-500">
              The application encountered a fatal error and could not recover automatically.
            </p>
          </div>
          <Button
            className="w-full gap-2"
            onClick={reset}
          >
            <RotateCcw className="h-4 w-4" />
            Reload Application
          </Button>
        </div>
      </body>
    </html>
  );
}
