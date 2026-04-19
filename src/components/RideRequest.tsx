import { MapPin, Navigation, Phone, Clock } from "lucide-react";

interface RideRequestProps {
  ride: {
    id: number;
    pickupAddress: string | null;
    destinationAddress: string | null;
    price: string;
    distance: string | null;
    clientPhone: string | null;
    createdAt: Date;
  };
  onAccept: (rideId: number) => void;
  onDecline: (rideId: number) => void;
  loading?: boolean;
}

export default function RideRequest({ ride, onAccept, onDecline, loading }: RideRequestProps) {
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Clock className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wide">Nouvelle course</span>
        </div>
        <span className="text-2xl font-black text-emerald-400">{parseFloat(ride.price).toFixed(2)} €</span>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-start gap-3">
          <MapPin className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Prise en charge</p>
            <p className="text-white font-semibold text-base leading-tight">{ride.pickupAddress || "Non précisé"}</p>
          </div>
        </div>

        {ride.destinationAddress && (
          <div className="flex items-start gap-3">
            <Navigation className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium">Destination</p>
              <p className="text-white font-semibold text-base leading-tight">{ride.destinationAddress}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-1">
          {ride.distance && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Navigation className="w-4 h-4" />
              <span className="text-sm font-medium">{ride.distance} km</span>
            </div>
          )}
          {ride.clientPhone && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">{ride.clientPhone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onDecline(ride.id)}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
        >
          REFUSER
        </button>
        <button
          onClick={() => onAccept(ride.id)}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-600/20"
        >
          ACCEPTER
        </button>
      </div>
    </div>
  );
}
