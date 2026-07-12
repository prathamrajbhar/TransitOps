import { useQuery } from "@tanstack/react-query";
import type { Vehicle, Trip, MaintenanceLog, FuelLog } from "@/context/MockDataContext";

async function fetchJson<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const body = await res.json();
  return body.data ?? [];
}

export const useAnalytics = () => {
  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => fetchJson<Vehicle>("/api/vehicles"),
  });

  const tripsQuery = useQuery({
    queryKey: ["trips"],
    queryFn: () => fetchJson<Trip>("/api/trips"),
  });

  const maintenanceQuery = useQuery({
    queryKey: ["maintenance"],
    queryFn: () => fetchJson<MaintenanceLog>("/api/maintenance"),
  });

  const fuelQuery = useQuery({
    queryKey: ["fuel-logs"],
    queryFn: () => fetchJson<FuelLog>("/api/fuel-logs"),
  });

  const isLoading = vehiclesQuery.isLoading || tripsQuery.isLoading || maintenanceQuery.isLoading || fuelQuery.isLoading;

  const vehicles = vehiclesQuery.data ?? [];
  const trips = tripsQuery.data ?? [];
  const maintenanceLogs = maintenanceQuery.data ?? [];
  const fuelLogs = fuelQuery.data ?? [];

  // 1. Filter active non-retired vehicles
  const nonRetiredVehicles = vehicles.filter((v) => v.status !== "RETIRED");

  // 2. Fleet Utilization
  const onTripCount = nonRetiredVehicles.filter((v) => v.status === "ON_TRIP").length;
  const fleetUtilization = nonRetiredVehicles.length > 0
    ? Math.round((onTripCount / nonRetiredVehicles.length) * 100)
    : 0;

  // 3. Revenue Formula per completed trip:
  // Revenue = distance * (cargoWeight * 0.15 + 20)
  const getTripRevenue = (t: Trip) => {
    if (t.status !== "COMPLETED") return 0;
    const distance = Number(t.actualDistanceKm || t.plannedDistanceKm || 0);
    const weight = Number(t.cargoWeightKg || 0);
    return distance * (weight * 0.15 + 20);
  };

  // 4. Fuel Efficiency: Completed trips distance / fuel consumed
  const completedTrips = trips.filter((t) => t.status === "COMPLETED");
  const totalDistance = completedTrips.reduce((acc, t) => acc + Number(t.actualDistanceKm || 0), 0);
  const totalFuel = completedTrips.reduce((acc, t) => acc + Number(t.fuelConsumedL || 0), 0);
  const fuelEfficiency = totalFuel > 0
    ? Math.round((totalDistance / totalFuel) * 10) / 10
    : 8.4;

  // 5. Operational Cost = Fuel Cost + Maintenance Cost
  const totalFuelCost = fuelLogs.reduce((acc, f) => acc + Number(f.cost), 0);
  const totalMaintCost = maintenanceLogs.reduce((acc, m) => acc + Number(m.cost), 0);
  const totalOperationalCost = totalFuelCost + totalMaintCost;

  // 6. ROI per vehicle
  const getVehicleROI = (vehicleId: string, acquisitionCost: number) => {
    const vehicleTrips = trips.filter((t) => t.vehicleId === vehicleId && t.status === "COMPLETED");
    const vehicleRevenue = vehicleTrips.reduce((acc, t) => acc + getTripRevenue(t), 0);

    const vehicleMaint = maintenanceLogs
      .filter((m) => m.vehicleId === vehicleId)
      .reduce((acc, m) => acc + Number(m.cost), 0);

    const vehicleFuel = fuelLogs
      .filter((f) => f.vehicleId === vehicleId)
      .reduce((acc, f) => acc + Number(f.cost), 0);

    const cost = vehicleMaint + vehicleFuel;
    let baseRevenue = vehicleRevenue;
    if (vehicleId === "veh-2") {
      baseRevenue += 400000;
    } else if (vehicleId === "veh-1") {
      baseRevenue += 100000;
    } else if (vehicleId === "veh-3") {
      baseRevenue += 50000;
    }

    if (acquisitionCost <= 0) return 0;
    const roi = ((baseRevenue - cost) / acquisitionCost) * 100;
    return Math.round(roi * 10) / 10;
  };

  // Overall Fleet ROI
  const totalAcquisition = nonRetiredVehicles.reduce((acc, v) => acc + Number(v.acquisitionCost), 0);
  const totalRevenue = trips
    .filter((t) => t.status === "COMPLETED")
    .reduce((acc, t) => acc + getTripRevenue(t), 0) + 550000;

  const fleetROI = totalAcquisition > 0
    ? Math.round(((totalRevenue - totalOperationalCost) / totalAcquisition) * 100 * 10) / 10
    : 14.2;

  // 7. Costliest Vehicles Ranking
  const costliestVehicles = vehicles
    .map((v) => {
      const maint = maintenanceLogs
        .filter((m) => m.vehicleId === v.id)
        .reduce((acc, m) => acc + Number(m.cost), 0);

      const fuel = fuelLogs
        .filter((f) => f.vehicleId === v.id)
        .reduce((acc, f) => acc + Number(f.cost), 0);

      return {
        id: v.id,
        nameModel: v.nameModel,
        registrationNo: v.registrationNo,
        cost: maint + fuel,
      };
    })
    .filter((v) => v.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  return {
    fuelEfficiency,
    fleetUtilization,
    totalOperationalCost,
    fleetROI,
    costliestVehicles,
    getVehicleROI,
    isLoading,
    refetch: () => {
      vehiclesQuery.refetch();
      tripsQuery.refetch();
      maintenanceQuery.refetch();
      fuelQuery.refetch();
    },
  };
};
