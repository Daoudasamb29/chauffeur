import { MapPin, Navigation, CheckCircle, XCircle, Clock, Car } from "lucide-react";

interface Ride {
  id: number;
  pickupAddress: string | null;
  destinationAddress: string | null;
  price: string;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
}

interface RideHistoryProps {
  rides: Ride[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  completed: { label: "Terminee", color: "text-emerald-400 bg-emerald-400/10", icon: CheckCircle },
  declined: { label: "Refusee", color: "text-red-400 bg-red-400/10", icon: XCircle },
  cancelled: { label: "Annulee", color: "text-orange-400 bg-orange-400/10", icon: XCircle },
  accepted: { label: "Acceptee", color: "text-blue-400 bg-blue-400/10", icon: Clock },
  in_progress: { label: "En cours", color: "text-amber-400 bg-amber-400/10", icon: Clock },
};

export default function RideHistory({ rides }: RideHistoryProps) {
  if (rides.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Car className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium">Aucune course pour le moment</p>
        <p className="text-sm mt-1">Vos courses apparaitront ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rides.map((ride) => {
        const config = statusConfig[ride.status] || { label: ride.status, color: "text-slate-400 bg-slate-400/10", icon: Clock };
        const StatusIcon = config.icon;
        return (
          <div
            key={ride.id}
            className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-start justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${config.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(ride.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="text-slate-300 truncate">{ride.pickupAddress || "N/A"}</span>
                </div>
                {ride.destinationAddress && (
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span className="text-slate-300 truncate">{ride.destinationAddress}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-black text-white">{parseFloat(ride.price).toFixed(2)}€</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
