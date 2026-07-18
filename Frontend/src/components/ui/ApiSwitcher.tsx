"use client";

import { useEffect, useState } from "react";
import { getBaseUrl } from "@/lib/api";

const LOCAL_URL = "http://localhost:8080/api/v1";
const AWS_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ApiSwitcher() {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true); // default to collapsed for clean UI

  useEffect(() => {
    setCurrentUrl(getBaseUrl());
    const savedState = localStorage.getItem("API_SWITCHER_COLLAPSED");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  const handleSwitch = (url: string) => {
    localStorage.setItem("API_BASE_URL", url);
    setCurrentUrl(url);
    window.location.reload();
  };

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("API_SWITCHER_COLLAPSED", String(nextState));
  };

  if (!currentUrl) return null;

  const isLocal = currentUrl === LOCAL_URL;

  if (isCollapsed) {
    return (
      <button
        onClick={toggleCollapse}
        title="Đổi môi trường API"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          backgroundColor: isLocal ? "var(--color-primary)" : "#10b981",
          color: "white",
          border: "none",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s, opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>
          settings_ethernet
        </span>
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: 9999,
      backgroundColor: "var(--color-pure-surface)",
      border: "1px solid var(--color-whisper-border)",
      borderRadius: "var(--rounded-xl)",
      padding: "12px 14px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontSize: "0.8rem",
      fontFamily: "monospace",
      animation: "fadeIn 0.2s ease-out"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
        <span style={{ fontWeight: "bold", color: "var(--color-on-surface)" }}>
          API Endpoint
        </span>
        <button 
          onClick={toggleCollapse}
          title="Thu nhỏ"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-steel-secondary)",
            display: "flex",
            alignItems: "center",
            padding: "2px",
            borderRadius: "4px"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-steel-secondary)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
            close_fullscreen
          </span>
        </button>
      </div>
      <div style={{ display: "flex", gap: "5px" }}>
        <button 
          onClick={() => handleSwitch(LOCAL_URL)}
          style={{
            flex: 1,
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: isLocal ? "var(--color-primary)" : "var(--color-surface-dim, #f3f4f6)",
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
            flex: 1,
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: !isLocal ? "var(--color-primary)" : "var(--color-surface-dim, #f3f4f6)",
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
