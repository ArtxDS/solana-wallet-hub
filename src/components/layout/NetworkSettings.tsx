"use client";

import { NetworkSwitcher } from "@/components/layout/NetworkSwitcher";
import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type NetworkSettingsProps = {
  compact?: boolean;
  navItem?: boolean;
  placement?: "top" | "bottom";
};

export function NetworkSettings({
  compact = false,
  navItem = false,
  placement = "bottom",
}: NetworkSettingsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSettingsOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSettingsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsOpen]);

  return (
    <div ref={settingsRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Abrir configurações"
        aria-expanded={isSettingsOpen}
        aria-controls="network-settings-menu"
        onClick={() => setIsSettingsOpen((open) => !open)}
        className={`flex items-center rounded-xl justify-center transition-[background-color,border-color,color,transform] duration-200 ${
          navItem
            ? "h-auto min-h-0 w-auto rounded-xl p-0 text-muted/70 hover:bg-white/[0.07] hover:text-white"
            : compact
              ? `h-8 min-h-8 w-8 shrink-0 rounded-lg p-0 ${
                  isSettingsOpen
                    ? "bg-primary/12 text-secondary"
                    : "bg-transparent text-muted/70 hover:bg-white/[0.07] hover:text-white"
                }`
              : `h-12 w-12 rounded-xl border ${
                  isSettingsOpen
                    ? "border-primary/40 bg-primary/12 text-secondary"
                    : "border-white/10 bg-white/[0.035] text-muted hover:border-primary/35 hover:bg-primary/[0.08] hover:text-white"
                }`
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
      >
        <Settings
          size={navItem ? 19 : compact ? 15 : 18}
          strokeWidth={2.25}
          className={`block shrink-0 transition-transform duration-300 ${isSettingsOpen ? "rotate-45" : ""}`}
        />
      </button>

      {isSettingsOpen ? (
        <div
          id="network-settings-menu"
          role="dialog"
          aria-label="Configurações da rede"
          className={`absolute right-0 z-60 w-64 rounded-2xl border border-white/10 bg-[#171026]/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.38),0_0_30px_rgba(153,69,255,0.12)] backdrop-blur-xl ${
            placement === "top"
              ? "bottom-[calc(100%+0.7rem)]"
              : "top-[calc(100%+0.7rem)]"
          }`}
        >
          <NetworkSwitcher
            className="w-full gap-1"
            onSelect={() => setIsSettingsOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
