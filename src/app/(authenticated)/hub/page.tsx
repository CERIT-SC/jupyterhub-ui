"use client";
import { useRouter } from "next/navigation";

export default function HubPage() {
  const router = useRouter();

  router.replace("/hub/dashboard");

  return;
}
