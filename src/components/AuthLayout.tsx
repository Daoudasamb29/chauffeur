import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}