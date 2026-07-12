"use client";

import { useSession } from "@/src/providers/SessionProvider";
import { useRouter } from "next/navigation";

export function Topbar() {
  const { user, signOut } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          {user?.role ? `${user.role.replace("_", " ")} Panel` : "Loading..."}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.userId?.slice(0, 8)}</span>
        <button
          onClick={handleSignOut}
          className="rounded-md bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
