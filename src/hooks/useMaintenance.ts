import { useMockData } from "@/context/MockDataContext";

export const useMaintenance = () => {
  const { maintenanceLogs, addMaintenanceLog, completeMaintenanceLog } = useMockData();
  
  return {
    data: maintenanceLogs,
    maintenanceLogs,
    addMaintenanceLog,
    completeMaintenanceLog,
    isLoading: false,
    refetch: () => {},
  };
};
