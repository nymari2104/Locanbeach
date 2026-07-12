"use client";

import { useEffect, useState } from "react";
import { getBaseUrl } from "@/lib/api";

const LOCAL_URL = "http://localhost:8080/api/v1";
const AWS_URL = process.env.NEXT_PUBLIC_API_URL || "https://locanbeach.duckdns.org/api/v1";

export default function ApiSwitcher() {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    setCurrentUrl(getBaseUrl());
  }, []);

  const handleSwitch = (url: string) => {
    localStorage.setItem("API_BASE_URL", url);
    setCurrentUrl(url);
    // Tải lại trang để áp dụng URL mới cho tất cả các component
    window.location.reload();
  };

  if (!currentUrl) return null;

  const isLocal = currentUrl === LOCAL_URL;

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: 9999,
      backgroundColor: "var(--color-pure-surface)",
      border: "1px solid var(--color-whisper-border)",
      borderRadius: "var(--rounded-xl)",
      padding: "10px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontSize: "0.8rem",
      fontFamily: "monospace"
    }}>
      <div style={{ fontWeight: "bold", color: "var(--color-on-surface)", textAlign: "center" }}>
        API Endpoint
      </div>
      <div style={{ display: "flex", gap: "5px" }}>
        <button 
          onClick={() => handleSwitch(LOCAL_URL)}
          style={{
            padding: "5px 10px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: isLocal ? "var(--color-primary)" : "var(--color-surface-dim)",
            color: isLocal ? "white" : "var(--color-on-surface-variant)",
            cursor: "pointer",
            fontWeight: isLocal ? "bold" : "normal"
          }}
        >
          Local
        </button>
        <button 
          onClick={() => handleSwitch(AWS_URL)}
          style={{
            padding: "5px 10px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: !isLocal ? "var(--color-primary)" : "var(--color-surface-dim)",
            color: !isLocal ? "white" : "var(--color-on-surface-variant)",
            cursor: "pointer",
            fontWeight: !isLocal ? "bold" : "normal"
          }}
        >
          AWS
        </button>
      </div>
      <div style={{ fontSize: "0.65rem", color: "var(--color-steel-secondary)", textAlign: "center", marginTop: "2px" }}>
        {currentUrl.replace("http://", "").split("/")[0]}
      </div>
    </div>
  );
}
