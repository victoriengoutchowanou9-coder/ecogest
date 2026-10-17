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
  Bell,
  MessageSquare,
  UserCircle,
  BookMarked,
  TrendingDown,
  Briefcase,
  Wallet,
  CalendarDays,
  Globe,
  ShieldAlert,
  LifeBuoy,
  School,
  FileText,
  Mail,
  BarChart3,
  Scale,
  Eye,
} from "lucide-react";
import { ROLE_NAVIGATIONS } from "@/lib/permissions";
import { useRoleContext } from "@/lib/context/RoleContext";
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
  Bell: <Bell className="w-5 h-5 shrink-0" />,
  MessageSquare: <MessageSquare className="w-5 h-5 shrink-0" />,
  UserCircle: <UserCircle className="w-5 h-5 shrink-0" />,
  BookMarked: <BookMarked className="w-5 h-5 shrink-0" />,
  TrendingDown: <TrendingDown className="w-5 h-5 shrink-0" />,
  Briefcase: <Briefcase className="w-5 h-5 shrink-0" />,
  Wallet: <Wallet className="w-5 h-5 shrink-0" />,
  CalendarDays: <CalendarDays className="w-5 h-5 shrink-0" />,
  Globe: <Globe className="w-5 h-5 shrink-0" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 shrink-0" />,
  LifeBuoy: <LifeBuoy className="w-5 h-5 shrink-0" />,
  School: <School className="w-5 h-5 shrink-0" />,
  FileText: <FileText className="w-5 h-5 shrink-0" />,
  Mail: <Mail className="w-5 h-5 shrink-0" />,
  BarChart3: <BarChart3 className="w-5 h-5 shrink-0" />,
  Scale: <Scale className="w-5 h-5 shrink-0" />,
  Eye: <Eye className="w-5 h-5 shrink-0" />,
};

export const BottomTabBar: React.FC = () => {
  const pathname = usePathname();
  const { role: currentRole } = useRoleContext();
  const currentNav = ROLE_NAVIGATIONS[currentRole];
  // Sort items by mobileTabPriority (1 = most important), fallback to original order
  const quickItems = [...currentNav.items]
    .sort((a, b) => (a.mobileTabPriority ?? 99) - (b.mobileTabPriority ?? 99))
    .slice(0, 4);

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
