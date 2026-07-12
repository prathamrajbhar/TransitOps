import { useMockData } from "@/context/MockDataContext";

export const useDrivers = () => {
  const { drivers, addDriver, updateDriverStatus } = useMockData();
  
  return {
    data: drivers,
    drivers,
    addDriver,
    updateDriverStatus,
    isLoading: false,
    refetch: () => {},
  };
};
