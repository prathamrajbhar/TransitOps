import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MaintenanceLog } from "@/context/MockDataContext";

const MAINTENANCE_KEY = ["maintenance"] as const;

async function fetchMaintenance(): Promise<MaintenanceLog[]> {
  const res = await fetch("/api/maintenance");
  if (!res.ok) throw new Error("Failed to fetch maintenance records");
  const body = await res.json();
  return body.data ?? [];
}

export const useMaintenance = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: MAINTENANCE_KEY,
    queryFn: fetchMaintenance,
  });

  const addMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to create maintenance record");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEY }),
  });

  const closeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/maintenance/${id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to close maintenance record");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEY }),
  });

  const addMaintenanceLog = async (input: Record<string, unknown>) => {
    try {
      await addMutation.mutateAsync(input);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  const completeMaintenanceLog = async (id: string) => {
    try {
      await closeMutation.mutateAsync(id);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  return {
    data,
    maintenanceLogs: data ?? [],
    addMaintenanceLog,
    completeMaintenanceLog,
    isLoading,
    refetch,
  };
};
