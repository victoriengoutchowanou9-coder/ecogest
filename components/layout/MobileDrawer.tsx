"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useSubscriptionStore } from "@/lib/subscription-store";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeSchool } = useSubscriptionStore();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Fermeture automatique et fluide du tiroir dès que la navigation aboutit
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop with outside click dismissal */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Full Height */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header with Title + Close Button X */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-school-primary text-white flex items-center justify-center font-bold text-sm">
              {activeSchool?.shortName ? activeSchool.shortName.charAt(0).toUpperCase() : "E"}
            </div>
            <div>
              <span className="font-bold text-sm text-school-primary">ECOGEST</span>
              <p className="text-[11px] text-slate-500 truncate max-w-[170px]">
                {activeSchool?.shortName || activeSchool?.name || "Établissement"}
              </p>
            </div>
          </div>

          {/* Close button X - 44px min touch target */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg touch-target"
            aria-label="Fermer le menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Content (triggers onClose on navigation) */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar onNavigate={onClose} className="w-full h-full border-r-0" />
        </div>
      </div>
    </div>
  );
};
