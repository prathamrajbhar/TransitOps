import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/providers/SessionProvider";
import { useMemo } from "react";
import { RBAC_MATRIX, ModuleName, RoleName, AccessLevel } from "@/context/MockDataContext";

const SETTINGS_KEY = ["settings"] as const;

export interface SystemSettings {
  depotName?: string;
  currency?: string;
  distanceUnit?: string;
  rbac_matrix?: string | Record<RoleName, Record<ModuleName, AccessLevel>>;
  [key: string]: unknown;
}

export const useSettings = (options?: { enabled?: boolean; module?: ModuleName }) => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  const { data, isLoading, refetch } = useQuery<SystemSettings>({
    queryKey: SETTINGS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const body = await res.json();
      return body.data ?? {};
    },
    enabled: options?.enabled,
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: SystemSettings) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to update settings");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });

  const updateSettings = async (settings: SystemSettings) => {
    try {
      await updateMutation.mutateAsync(settings);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  };

  // Compute dynamic RBAC matrix
  const userMatrix = useMemo<Record<RoleName, Record<ModuleName, AccessLevel>>>(() => {
    if (data && data.rbac_matrix) {
      try {
        return typeof data.rbac_matrix === "string"
          ? JSON.parse(data.rbac_matrix)
          : data.rbac_matrix;
      } catch (e) {
        console.error("Failed to parse dynamic RBAC matrix from settings", e);
      }
    }
    return RBAC_MATRIX;
  }, [data]);

  const targetModule = options?.module;

  // Compute if the current user has write access to the module
  const canModify = useMemo(() => {
    if (!user) return false;
    // Fleet Manager is the administrative role and can always modify system settings
    if (user.role === "FLEET_MANAGER" && targetModule === "SETTINGS") return true;
    if (!targetModule) return false;
    return userMatrix[user.role]?.[targetModule] === "FULL";
  }, [user, userMatrix, targetModule]);

  return {
    settings: data ?? {},
    updateSettings,
    userMatrix,
    canModify,
    isLoading,
    refetch,
  };
};
