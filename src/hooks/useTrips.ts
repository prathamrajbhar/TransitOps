import { useMockData } from "@/context/MockDataContext";

export const useTrips = () => {
  const { trips, createTrip, dispatchTrip, cancelTrip, completeTrip } = useMockData();
  
  return {
    data: trips,
    trips,
    createTrip,
    dispatchTrip,
    cancelTrip,
    completeTrip,
    isLoading: false,
    refetch: () => {},
  };
};
