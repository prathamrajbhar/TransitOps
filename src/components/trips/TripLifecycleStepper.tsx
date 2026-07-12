"use client";

import React from "react";
import { FileText, Send, Truck, Check, X } from "lucide-react";

interface TripLifecycleStepperProps {
  status: string;
}

export function TripLifecycleStepper({ status }: TripLifecycleStepperProps) {
  const steps = [
    { key: "DRAFT", label: "Planned", icon: FileText },
    { key: "DISPATCHED", label: "Dispatched", icon: Send },
    { key: "IN_TRANSIT", label: "In Transit", icon: Truck },
    { key: "COMPLETED", label: "Delivered", icon: Check },
  ];
  
  const isCancelled = status === "CANCELLED";
  const statusOrder = ["DRAFT", "DISPATCHED", "IN_TRANSIT", "COMPLETED"];
  
  // Set correct active step index
  const activeIndex = status === "DISPATCHED" ? 1 : status === "IN_TRANSIT" ? 2 : statusOrder.indexOf(status);

  const getStepStatus = (stepKey: string, index: number) => {
    if (isCancelled) {
      if (index <= 1) return "cancelled";
      return "grey";
    }
    if (index < activeIndex) return "completed";
    if (index === activeIndex) return "active";
    return "grey";
  };

  const activeSteps = isCancelled ? steps.slice(0, 2) : steps;
  const numSteps = activeSteps.length;
  
  // Track positioning coordinates:
  // For 4 steps, centers are at 12.5%, 37.5%, 62.5%, 87.5% -> track connects 12.5% to 87.5%
  // For 2 steps, centers are at 25%, 75% -> track connects 25% to 75%
  const trackLeft = numSteps === 2 ? "left-[25%]" : "left-[12.5%]";
  const trackRight = numSteps === 2 ? "right-[25%]" : "right-[12.5%]";
  
  const progressPercent = isCancelled 
    ? 100 
    : activeIndex <= 0 
      ? 0 
      : (activeIndex / 3) * 100;

  return (
    <div className="relative w-full py-4 my-2.5 border-t border-b border-slate-100/60 select-none">
      {/* Progress Track Container */}
      <div className={`absolute ${trackLeft} ${trackRight} top-[34px] h-[3px] bg-slate-100 rounded-full -translate-y-1/2 overflow-hidden`}>
        {/* Colored Progress Line Track */}
        <div 
          className={`h-full transition-all duration-1000 ease-out ${
            isCancelled ? "bg-rose-500" : "bg-emerald-500"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps Circles & Text Layout */}
      <div className="relative flex items-start justify-between w-full">
        {activeSteps.map((step, index) => {
          const stepStatus = getStepStatus(step.key, index);
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 text-center group relative">
              {/* Animated pulse ring for active step */}
              {stepStatus === "active" && (
                <span className="absolute top-0 w-9 h-9 rounded-full bg-blue-500/20 animate-ping pointer-events-none" />
              )}
              {stepStatus === "cancelled" && isCancelled && index === 1 && (
                <span className="absolute top-0 w-9 h-9 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
              )}

              {/* Circle Wrapper (increased size to w-9 h-9) */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border font-black text-xs transition-all duration-500 z-10 ${
                  stepStatus === "completed"
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-xs shadow-emerald-500/20 hover:scale-105"
                    : stepStatus === "active"
                    ? "bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/30 scale-110 hover:scale-115"
                    : stepStatus === "cancelled"
                    ? "bg-rose-500 text-white border-rose-600 shadow-xs shadow-rose-500/20 hover:scale-105"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                {stepStatus === "cancelled" ? (
                  <X className="w-4 h-4" />
                ) : stepStatus === "completed" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>

              {/* Step Label (placed BELOW the icon) */}
              <span
                className={`text-[9.5px] font-black uppercase tracking-wider mt-2 transition-colors duration-300 ${
                  stepStatus === "active"
                    ? "text-blue-600 font-black"
                    : stepStatus === "completed"
                    ? "text-emerald-600 font-extrabold"
                    : stepStatus === "cancelled"
                    ? "text-rose-500 font-black"
                    : "text-slate-400 font-bold group-hover:text-slate-600"
                }`}
              >
                {isCancelled && index === 1 ? "Cancelled" : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
