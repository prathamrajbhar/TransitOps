/**
 * Root page — redirects to dashboard (or login via middleware).
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
