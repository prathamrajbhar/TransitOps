import { useMockData } from "@/context/MockDataContext";

export const useVehicles = () => {
  const { vehicles, addVehicle, retireVehicle, updateVehicleStatus } = useMockData();
  
  return {
    data: vehicles,
    vehicles,
    addVehicle,
    retireVehicle,
    updateVehicleStatus,
    isLoading: false,
    refetch: () => {},
  };
};
