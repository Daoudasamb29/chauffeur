import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import MapView from "@/components/MapView";
import StatusToggle from "@/components/StatusToggle";
import RideRequest from "@/components/RideRequest";
import EarningsCounter from "@/components/EarningsCounter";
import RideHistory from "@/components/RideHistory";
import DriverRegister from "@/components/DriverRegister";
import { LogOut, Menu, X, History, Banknote, ChevronUp, ChevronDown, Navigation } from "lucide-react";

const DEFAULT_LAT = 48.8566;
const DEFAULT_LNG = 2.3522;

export default function Home() {
  const { user, logout, isLoading: authLoading, isLocal } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const { data: driverData, isLoading: driverLoading } = trpc.driver.me.useQuery(undefined, {
    enabled: !!user && !isLocal,
  });
  const [isOnline, setIsOnline] = useState(false);

  const localDriver = isLocal
    ? {
        id: 0,
        userId: typeof user?.id === "number" ? user.id : 0,
        phone: "",
        status: isOnline ? "online" : "offline",
        currentLat: String(DEFAULT_LAT),
        currentLng: String(DEFAULT_LNG),
        dailyEarnings: "0",
        totalEarnings: "0",
        totalRides: 0,
        rating: "5.0",
        vehicleType: "",
        licensePlate: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : undefined;
  const driver = driverData ?? localDriver;
  const { data: myRides = [] } = trpc.ride.list.useQuery(undefined, {
    enabled: !!driver && !isLocal,
  });
  const { data: pendingRides = [] } = trpc.ride.pending.useQuery(undefined, {
    enabled: !!driver && !isLocal && driver.status === "online",
    refetchInterval: !isLocal && driver?.status === "online" ? 5000 : false,
  });
  const { data: activeRide } = trpc.ride.myActiveRide.useQuery(undefined, {
    enabled: !!driver && !isLocal && (driver.status === "on_ride" || driver.status === "busy"),
    refetchInterval: !isLocal ? 5000 : false,
  });
  const { data: earningsData } = trpc.earnings.today.useQuery(undefined, {
    enabled: !!driver && !isLocal,
  });

  const statusMutation = trpc.driver.updateStatus.useMutation({
    onSuccess: () => utils.driver.me.invalidate(),
  });
  const locationMutation = trpc.driver.updateLocation.useMutation();
  const acceptMutation = trpc.ride.accept.useMutation({
    onSuccess: () => {
      utils.ride.pending.invalidate();
      utils.ride.myActiveRide.invalidate();
      utils.driver.me.invalidate();
    },
  });
  const declineMutation = trpc.ride.decline.useMutation({
    onSuccess: () => utils.ride.pending.invalidate(),
  });
  const startMutation = trpc.ride.startRide.useMutation({
    onSuccess: () => {
      utils.ride.myActiveRide.invalidate();
      utils.driver.me.invalidate();
    },
  });
  const completeMutation = trpc.ride.complete.useMutation({
    onSuccess: () => {
      utils.ride.myActiveRide.invalidate();
      utils.ride.list.invalidate();
      utils.driver.me.invalidate();
      utils.earnings.today.invalidate();
    },
  });
  const cancelMutation = trpc.ride.cancel.useMutation({
    onSuccess: () => {
      utils.ride.myActiveRide.invalidate();
      utils.driver.me.invalidate();
    },
  });

  const [showHistory, setShowHistory] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const lastLocationUpdate = useRef(0);

  const geo = useGeolocation(isOnline);

  useEffect(() => {
    if (driver) {
      setIsOnline(driver.status === "online" || driver.status === "on_ride" || driver.status === "busy");
    }
  }, [driver]);

  // Update location on server every 30 seconds max
  useEffect(() => {
    if (geo.latitude && geo.longitude && driver && isOnline) {
      const now = Date.now();
      if (now - lastLocationUpdate.current > 30000) {
        lastLocationUpdate.current = now;
        locationMutation.mutate({ lat: geo.latitude, lng: geo.longitude });
      }
    }
  }, [geo.latitude, geo.longitude, driver, isOnline]);

  const handleStatusToggle = useCallback(
    (newStatus: "online" | "offline") => {
      if (isLocal) {
        setIsOnline(newStatus === "online");
        return;
      }
      statusMutation.mutate({ status: newStatus });
    },
    [statusMutation, isLocal]
  );

  const handleAccept = useCallback(
    (rideId: number) => {
      acceptMutation.mutate({ rideId });
    },
    [acceptMutation]
  );

  const handleDecline = useCallback(
    (rideId: number) => {
      declineMutation.mutate({ rideId });
    },
    [declineMutation]
  );

  const handleStartRide = useCallback(() => {
    if (activeRide) {
      startMutation.mutate({ rideId: activeRide.id });
    }
  }, [activeRide, startMutation]);

  const handleCompleteRide = useCallback(() => {
    if (activeRide) {
      completeMutation.mutate({ rideId: activeRide.id });
    }
  }, [activeRide, completeMutation]);

  const handleCancelRide = useCallback(() => {
    if (activeRide) {
      cancelMutation.mutate({ rideId: activeRide.id });
    }
  }, [activeRide, cancelMutation]);

  if (authLoading || driverLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!driver) {
    return <DriverRegister onRegistered={() => utils.driver.me.invalidate()} />;
  }

  const currentRide = activeRide || (pendingRides.length > 0 && driver.status === "online" ? pendingRides[0] : null);
  const showRideRequest = driver.status === "online" && pendingRides.length > 0 && !activeRide;
  const showActiveRide = !!activeRide;

  const mapLat = geo.latitude ?? (driver.currentLat ? parseFloat(driver.currentLat) : DEFAULT_LAT);
  const mapLng = geo.longitude ?? (driver.currentLng ? parseFloat(driver.currentLng) : DEFAULT_LNG);

  const completedRides = myRides.filter((r) => r.status === "completed" || r.status === "declined" || r.status === "cancelled");

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div>
            <h1 className="text-lg font-black leading-tight">Chauffeur VTC</h1>
            <p className="text-xs text-slate-400">{user.name || "Chauffeur"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Menu dropdown */}
      {showMenu && (
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          <button
            onClick={() => { setShowHistory(!showHistory); setShowMenu(false); }}
            className="flex items-center gap-3 w-full p-3 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <History className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">Historique des courses</span>
          </button>
          <div className="flex items-center gap-3 p-3">
            <Banknote className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-400">Gains aujourd'hui</p>
              <p className="font-bold text-lg">{(earningsData?.daily ?? parseFloat(driver.dailyEarnings)).toFixed(2)} €</p>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Counter - Always visible */}
      <div className="px-4 pt-4">
        <EarningsCounter
          daily={earningsData?.daily ?? parseFloat(driver.dailyEarnings)}
          total={earningsData?.total ?? parseFloat(driver.totalEarnings)}
          rides={earningsData?.rides ?? driver.totalRides}
        />
      </div>

      {/* Status Toggle */}
      <div className="px-4 pt-4">
        <StatusToggle
          status={driver.status}
          onToggle={handleStatusToggle}
          disabled={statusMutation.isPending || driver.status === "on_ride"}
        />
      </div>

      {/* Active Ride Controls */}
      {showActiveRide && activeRide && (
        <div className="px-4 pt-4">
          <div className="bg-blue-900/30 border border-blue-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                {activeRide.status === "accepted" ? "Course acceptee" : "Course en cours"}
              </span>
              <span className="text-2xl font-black text-white">{parseFloat(activeRide.price).toFixed(2)} €</span>
            </div>
            <p className="text-slate-300 text-sm mb-4 truncate">{activeRide.pickupAddress}</p>
            <div className="grid grid-cols-2 gap-3">
              {activeRide.status === "accepted" && (
                <button
                  onClick={handleStartRide}
                  disabled={startMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 col-span-2"
                >
                  {startMutation.isPending ? "..." : "DEMARRER LA COURSE"}
                </button>
              )}
              {activeRide.status === "in_progress" && (
                <button
                  onClick={handleCompleteRide}
                  disabled={completeMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {completeMutation.isPending ? "..." : "TERMINER"}
                </button>
              )}
              <button
                onClick={handleCancelRide}
                disabled={cancelMutation.isPending}
                className={`bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 ${activeRide.status === "accepted" ? "" : "col-start-2"}`}
              >
                {cancelMutation.isPending ? "..." : "ANNULER"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="px-4 pt-4">
        <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-lg">
          <MapView
            latitude={mapLat}
            longitude={mapLng}
            pickupLat={currentRide?.pickupLat ? parseFloat(currentRide.pickupLat) : null}
            pickupLng={currentRide?.pickupLng ? parseFloat(currentRide.pickupLng) : null}
            destLat={currentRide?.destinationLat ? parseFloat(currentRide.destinationLat) : null}
            destLng={currentRide?.destinationLng ? parseFloat(currentRide.destinationLng) : null}
            height="45vh"
          />
        </div>
      </div>

      {/* Ride Request */}
      {showRideRequest && pendingRides[0] && (
        <div className="px-4 pt-4 pb-4">
          <RideRequest
            ride={pendingRides[0]}
            onAccept={handleAccept}
            onDecline={handleDecline}
            loading={acceptMutation.isPending || declineMutation.isPending}
          />
        </div>
      )}

      {/* History Section */}
      <div className="px-4 pt-4 pb-4">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-between w-full bg-slate-800 border border-slate-700 rounded-xl p-4 mb-3 hover:bg-slate-750 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span className="font-bold">Historique des courses</span>
            <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{completedRides.length}</span>
          </div>
          {showHistory ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
        </button>

        {showHistory && <RideHistory rides={completedRides} />}
      </div>

      {/* Footer spacing */}
      <div className="h-6" />
    </div>
  );
}
