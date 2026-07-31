"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HousekeepingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/housekeeping/tasks");
  }, [router]);
  return null;
}
