import React from "react";
import { RoleName } from "@/context/MockDataContext";

interface RoleBadgeProps {
  role: RoleName;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = "" }) => {
  const styles: Record<RoleName, { bg: string; text: string; label: string; dot: string }> = {
    FLEET_MANAGER: {
      bg: "bg-amber-100/75 border-amber-200/50 backdrop-blur-xs",
      text: "text-amber-800 font-semibold",
      label: "Fleet Manager",
      dot: "bg-amber-500",
    },
    DISPATCHER: {
      bg: "bg-blue-100/75 border-blue-200/50 backdrop-blur-xs",
      text: "text-blue-800 font-semibold",
      label: "Dispatcher",
      dot: "bg-blue-500",
    },
    SAFETY_OFFICER: {
      bg: "bg-emerald-100/75 border-emerald-200/50 backdrop-blur-xs",
      text: "text-emerald-800 font-semibold",
      label: "Safety Officer",
      dot: "bg-emerald-500",
    },
    FINANCIAL_ANALYST: {
      bg: "bg-purple-100/75 border-purple-200/50 backdrop-blur-xs",
      text: "text-purple-800 font-semibold",
      label: "Financial Analyst",
      dot: "bg-purple-500",
    },
  };

  const currentStyle = styles[role] || {
    bg: "bg-slate-100/75 border-slate-200/50 backdrop-blur-xs",
    text: "text-slate-800 font-semibold",
    label: role,
    dot: "bg-slate-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs border rounded-full transition-all duration-300 shadow-xs ${currentStyle.bg} ${currentStyle.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot} animate-pulse`} />
      {currentStyle.label}
    </span>
  );
};

export default RoleBadge;
