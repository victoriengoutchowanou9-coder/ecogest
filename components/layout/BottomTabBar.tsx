"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Settings,
  UserCheck,
  BookOpenCheck,
  AlertTriangle,
  BookOpen,
  FileSpreadsheet,
  CheckSquare,
  DollarSign,
  Receipt,
  Users2,
  Home,
  Award,
  Clock,
  CreditCard,
} from "lucide-react";
import { Role, ROLE_NAVIGATIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5 shrink-0" />,
  GraduationCap: <GraduationCap className="w-5 h-5 shrink-0" />,
  Users: <Users className="w-5 h-5 shrink-0" />,
  Settings: <Settings className="w-5 h-5 shrink-0" />,
  UserCheck: <UserCheck className="w-5 h-5 shrink-0" />,
  BookOpenCheck: <BookOpenCheck className="w-5 h-5 shrink-0" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5 shrink-0" />,
  BookOpen: <BookOpen className="w-5 h-5 shrink-0" />,
  FileSpreadsheet: <FileSpreadsheet className="w-5 h-5 shrink-0" />,
  CheckSquare: <CheckSquare className="w-5 h-5 shrink-0" />,
  DollarSign: <DollarSign className="w-5 h-5 shrink-0" />,
  Receipt: <Receipt className="w-5 h-5 shrink-0" />,
  Users2: <Users2 className="w-5 h-5 shrink-0" />,
  Home: <Home className="w-5 h-5 shrink-0" />,
  Award: <Award className="w-5 h-5 shrink-0" />,
  Clock: <Clock className="w-5 h-5 shrink-0" />,
  CreditCard: <CreditCard className="w-5 h-5 shrink-0" />,
};

export const BottomTabBar: React.FC<{ currentRole: Role }> = ({ currentRole }) => {
  const pathname = usePathname();
  const currentNav = ROLE_NAVIGATIONS[currentRole];
  // Take up to 4 most used items for mobile tab bar
  const quickItems = currentNav.items.slice(0, 4);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 flex items-center justify-around py-1 shadow-lg no-print"
      aria-label="Barre d'actions mobiles"
    >
      {quickItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== currentNav.basePath && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1.5 touch-target min-h-[48px] text-[11px] font-medium transition-colors",
              isActive ? "text-school-primary font-bold" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <div className={cn(
              "p-1 rounded-md",
              isActive && "bg-school-50 text-school-primary"
            )}>
              {ICONS[item.iconName] || <Home className="w-5 h-5 shrink-0" />}
            </div>
            <span className="truncate max-w-[70px] mt-0.5">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};
