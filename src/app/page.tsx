"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMockData } from "@/context/MockDataContext";

export default function RootPage() {
  const router = useRouter();
  const { currentUser } = useMockData();

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
    </div>
  );
}
