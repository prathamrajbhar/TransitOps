import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Trip } from "@/context/MockDataContext";

const TRIPS_KEY = ["trips"] as const;

async function fetchTrips(): Promise<Trip[]> {
  const res = await fetch("/api/trips");
  if (!res.ok) throw new Error("Failed to fetch trips");
  const body = await res.json();
  return body.data ?? [];
}

export const useTrips = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: TRIPS_KEY,
    queryFn: fetchTrips,
  });

  const createMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to create trip");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRIPS_KEY }),
  });

  const dispatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trips/${id}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to dispatch trip");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRIPS_KEY }),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trips/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to cancel trip");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRIPS_KEY }),
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: unknown }) => {
      const res = await fetch(`/api/trips/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to complete trip");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRIPS_KEY }),
  });

  const createTrip = async (input: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync(input);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  const dispatchTrip = async (id: string) => {
    try {
      await dispatchMutation.mutateAsync(id);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  const cancelTrip = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  const completeTrip = async (id: string, finalOdometerKm: number, fuelConsumedL: number) => {
    try {
      await completeMutation.mutateAsync({ id, finalOdometerKm, fuelConsumedL });
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  return {
    data,
    trips: data ?? [],
    createTrip,
    dispatchTrip,
    cancelTrip,
    completeTrip,
    isLoading,
    refetch,
  };
};
