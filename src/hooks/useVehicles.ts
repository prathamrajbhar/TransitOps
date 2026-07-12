import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Vehicle } from "@/context/MockDataContext";

const VEHICLES_KEY = ["vehicles"] as const;

async function fetchVehicles(): Promise<Vehicle[]> {
  const res = await fetch("/api/vehicles");
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  const body = await res.json();
  return body.data ?? [];
}

export const useVehicles = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: VEHICLES_KEY,
    queryFn: fetchVehicles,
  });

  const addMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to create vehicle");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: unknown }) => {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to update vehicle");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });

  const addVehicle = async (input: Record<string, unknown>) => {
    try {
      await addMutation.mutateAsync(input);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  const retireVehicle = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, status: "RETIRED" });
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  const updateVehicleStatus = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  return {
    data,
    vehicles: data ?? [],
    addVehicle,
    retireVehicle,
    updateVehicleStatus,
    isLoading,
    refetch,
  };
};
