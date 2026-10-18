"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, ShieldAlert, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const DevBottomTabBar: React.FC = () => {
  const pathname = usePathname();

  const tabs = [
    { title: "Dashboard", href: "/dev-admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Écoles", href: "/dev-admin/etablissements", icon: <Building2 className="w-5 h-5" /> },
    { title: "Utilisateurs", href: "/dev-admin/utilisateurs", icon: <Users className="w-5 h-5" /> },
    { title: "Activités", href: "/dev-admin/activites", icon: <ShieldAlert className="w-5 h-5" /> },
    { title: "Profil", href: "/dev-admin/profil", icon: <UserCircle className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around h-16 px-1 shadow-lg"
      aria-label="Navigation mobile"
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/dev-admin"
            ? pathname === "/dev-admin"
            : pathname === tab.href || pathname?.startsWith(tab.href + "/");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition text-[10px] font-semibold",
              isActive ? "text-school-primary font-bold" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-lg transition-colors",
                isActive ? "bg-school-50 text-school-primary" : "text-slate-500"
              )}
            >
              {tab.icon}
            </div>
            <span className="truncate mt-0.5">{tab.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};
