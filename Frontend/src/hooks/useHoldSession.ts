"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

export interface HoldItem {
  itemId: string;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  accommodationId: string;
  accommodationCode: string;
  checkinDate: string;
  checkoutDate: string;
  numNights: number;
  pricePerNight: number;
  itemTotalAmount: number;
}

export interface HoldSession {
  guestToken: string;
  items: HoldItem[];
  totalAmount: number;
  depositAmount: number;
  expiresAt?: string;
  expiresAtTimestamp?: number;
}

const CHANNEL_NAME = "locan_hold_session_channel";

export function useHoldSession() {
  const [session, setSession] = useState<HoldSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await apiGet<HoldSession>("/bookings/hold/session");
      setSession(res);
    } catch (err) {
      console.error("Error fetching hold session:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const notifyOtherTabs = useCallback(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({ type: "HOLD_SESSION_UPDATED", timestamp: Date.now() });
        bc.close();
      } catch (e) {
        console.error("BroadcastChannel error:", e);
      }
    }
  }, []);

  const addHoldRoom = async (categoryId: string, checkinDate: string, checkoutDate: string) => {
    try {
      setLoading(true);
      await apiPost("/bookings/hold", {
        categoryId,
        checkinDate,
        checkoutDate
      });
      await fetchSession();
      notifyOtherTabs();
    } catch (err) {
      console.error("Error adding hold room:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeHoldItem = async (itemId: string) => {
    try {
      setLoading(true);
      const updated = await apiDelete<HoldSession>(`/bookings/hold/items/${itemId}`);
      setSession(updated);
      notifyOtherTabs();
    } catch (err) {
      console.error("Error removing hold item:", err);
    } finally {
      setLoading(false);
    }
  };

  const releaseSession = async () => {
    try {
      setLoading(true);
      await apiDelete("/bookings/hold");
      setSession(null);
      notifyOtherTabs();
    } catch (err) {
      console.error("Error releasing hold session:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    // BroadcastChannel listener
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data?.type === "HOLD_SESSION_UPDATED") {
          fetchSession();
        }
      };
    }

    // VisibilityChange listener (when switching tabs back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchSession();
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchSession]);

  return {
    session,
    loading,
    fetchSession,
    addHoldRoom,
    removeHoldItem,
    releaseSession
  };
}
