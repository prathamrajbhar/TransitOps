import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FuelLog, Expense } from "@/context/MockDataContext";

const FUEL_KEY = ["fuel-logs"] as const;
const EXPENSES_KEY = ["expenses"] as const;

async function fetchFuelLogs(): Promise<FuelLog[]> {
  const res = await fetch("/api/fuel-logs");
  if (!res.ok) throw new Error("Failed to fetch fuel logs");
  const body = await res.json();
  return body.data ?? [];
}

async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch("/api/expenses");
  if (!res.ok) throw new Error("Failed to fetch expenses");
  const body = await res.json();
  return body.data ?? [];
}

export const useFuelExpenses = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();
  const enabled = options?.enabled ?? true;

  const fuelQuery = useQuery({
    queryKey: FUEL_KEY,
    queryFn: fetchFuelLogs,
    enabled,
  });

  const expensesQuery = useQuery({
    queryKey: EXPENSES_KEY,
    queryFn: fetchExpenses,
    enabled,
  });

  const addFuelLogMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch("/api/fuel-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to create fuel log");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FUEL_KEY }),
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to create expense");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });

  const addFuelLog = async (input: Record<string, unknown>) => {
    try {
      await addFuelLogMutation.mutateAsync(input);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  const addExpense = async (input: Record<string, unknown>) => {
    try {
      await addExpenseMutation.mutateAsync(input);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  return {
    fuelLogs: fuelQuery.data ?? [],
    expenses: expensesQuery.data ?? [],
    addFuelLog,
    addExpense,
    isLoading: fuelQuery.isLoading || expensesQuery.isLoading,
    refetch: () => {
      fuelQuery.refetch();
      expensesQuery.refetch();
    },
  };
};
