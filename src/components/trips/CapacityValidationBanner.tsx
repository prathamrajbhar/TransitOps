"use client";

import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface Vehicle {
  id: string;
  nameModel: string;
  registrationNo: string;
  maxLoadCapacityKg: number;
}

interface CapacityValidationBannerProps {
  selectedVehicle?: Vehicle;
  cargoWeight: string | number;
}

export function CapacityValidationBanner({
  selectedVehicle,
  cargoWeight,
}: CapacityValidationBannerProps) {
  if (!selectedVehicle || !cargoWeight) return null;

  const weight = Number(cargoWeight);
  const capacityExceeded = weight > selectedVehicle.maxLoadCapacityKg;

  return (
    <div
      className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all duration-300 ${
        capacityExceeded
          ? "bg-red-50/80 border-red-200 text-red-700 shadow-xs"
          : "bg-emerald-50/80 border-emerald-200 text-emerald-700 shadow-xs"
      }`}
    >
      {capacityExceeded ? (
        <>
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            Exceeds capacity! {weight.toLocaleString()} kg &gt;{" "}
            {selectedVehicle.maxLoadCapacityKg.toLocaleString()} kg max
          </span>
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Within capacity: {weight.toLocaleString()} kg /{" "}
            {selectedVehicle.maxLoadCapacityKg.toLocaleString()} kg max
          </span>
        </>
      )}
    </div>
  );
}
