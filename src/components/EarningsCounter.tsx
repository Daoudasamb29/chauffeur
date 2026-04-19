import { Wallet, TrendingUp, Car } from "lucide-react";

interface EarningsCounterProps {
  daily: number;
  total: number;
  rides: number;
}

export default function EarningsCounter({ daily, total, rides }: EarningsCounterProps) {
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-2xl p-4 shadow-lg">
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Aujourd'hui</span>
          </div>
          <p className="text-2xl font-black text-white">{daily.toFixed(2)}<span className="text-sm font-medium text-slate-400">€</span></p>
        </div>
        <div className="text-center border-x border-slate-600">
          <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Total</span>
          </div>
          <p className="text-2xl font-black text-white">{total.toFixed(2)}<span className="text-sm font-medium text-slate-400">€</span></p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
            <Car className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Courses</span>
          </div>
          <p className="text-2xl font-black text-white">{rides}</p>
        </div>
      </div>
    </div>
  );
}
