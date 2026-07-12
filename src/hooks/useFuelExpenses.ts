import { useMockData } from "@/context/MockDataContext";

export const useFuelExpenses = () => {
  const { fuelLogs, expenses, addFuelLog, addExpense } = useMockData();
  
  return {
    fuelLogs,
    expenses,
    addFuelLog,
    addExpense,
    isLoading: false,
    refetch: () => {},
  };
};
