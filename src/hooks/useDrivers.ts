import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Driver } from "@/context/MockDataContext";

const DRIVERS_KEY = ["drivers"] as const;

async function fetchDrivers(): Promise<Driver[]> {
  const res = await fetch("/api/drivers");
  if (!res.ok) throw new Error("Failed to fetch drivers");
  const body = await res.json();
  return body.data ?? [];
}

export const useDrivers = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: DRIVERS_KEY,
    queryFn: fetchDrivers,
  });

  const addMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to create driver");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DRIVERS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: unknown }) => {
      const res = await fetch(`/api/drivers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to update driver");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DRIVERS_KEY }),
  });

  const addDriver = async (input: Record<string, unknown>) => {
    try {
      await addMutation.mutateAsync(input);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  const updateDriverStatus = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  return {
    data,
    drivers: data ?? [],
    addDriver,
    updateDriverStatus,
    isLoading,
    refetch,
  };
};
