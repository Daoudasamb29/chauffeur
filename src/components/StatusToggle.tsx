import { Power } from "lucide-react";

interface StatusToggleProps {
  status: string;
  onToggle: (newStatus: "online" | "offline") => void;
  disabled?: boolean;
}

export default function StatusToggle({ status, onToggle, disabled }: StatusToggleProps) {
  const isOnline = status === "online" || status === "on_ride";

  return (
    <button
      onClick={() => onToggle(isOnline ? "offline" : "online")}
      disabled={disabled || status === "on_ride"}
      className={`
        relative flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-bold text-lg
        transition-all duration-300 w-full max-w-xs mx-auto
        ${
          isOnline
            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
            : "bg-slate-600 hover:bg-slate-500 text-slate-200 shadow-lg shadow-slate-600/20"
        }
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-95"}
      `}
    >
      <Power className={`w-7 h-7 ${isOnline ? "animate-pulse" : ""}`} />
      <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
      {isOnline && (
        <span className="absolute top-2 right-3 w-3 h-3 bg-white rounded-full animate-ping" />
      )}
    </button>
  );
}
