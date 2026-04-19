import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { UserPlus, Phone, Car, CreditCard } from "lucide-react";

interface DriverRegisterProps {
  onRegistered: () => void;
}

export default function DriverRegister({ onRegistered }: DriverRegisterProps) {
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  const registerMutation = trpc.driver.register.useMutation({
    onSuccess: () => onRegistered(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    registerMutation.mutate({
      phone: phone.trim(),
      vehicleType: vehicleType.trim() || undefined,
      licensePlate: licensePlate.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Devenir Chauffeur</h1>
          <p className="text-slate-400 text-sm">Completez votre profil pour commencer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="tel"
              placeholder="Numero de telephone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white pl-12 pr-4 py-4 rounded-xl text-lg placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="relative">
            <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Type de vehicule (optionnel)"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white pl-12 pr-4 py-4 rounded-xl text-lg placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Plaque d'immatriculation"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white pl-12 pr-4 py-4 rounded-xl text-lg placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-600/20 mt-2"
          >
            {registerMutation.isPending ? "Creation..." : "COMMENCER"}
          </button>

          {registerMutation.isError && (
            <p className="text-red-400 text-sm text-center mt-2">Erreur: {registerMutation.error.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
