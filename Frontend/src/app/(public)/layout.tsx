"use client";

import { useEffect } from "react";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import { useHoldSession } from "@/hooks/useHoldSession";
import FloatingHoldBar from "@/components/booking/FloatingHoldBar";
import { getBaseUrl } from "@/lib/api";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, removeHoldItem } = useHoldSession();


  return (
    <div className="app-wrapper">
      <TopNavBar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      <FloatingHoldBar session={session} onRemoveItem={removeHoldItem} />
    </div>
  );
}
