"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  ClipboardList,
  Calendar,
  CalendarDays,
  TrendingUp,
  History,
  GraduationCap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "H\u1ecdc sinh", href: "/students", icon: Users },
  { label: "L\u1edbp h\u1ecdc", href: "/classes", icon: School },
  { label: "M\u00f4n h\u1ecdc", href: "/subjects", icon: BookOpen },
  { label: "Ph\u00e2n c\u00f4ng", href: "/assignments", icon: ClipboardList },
  { label: "L\u1ecbch h\u1ecdc", href: "/schedules", icon: Calendar },
  { label: "Th\u1eddi kh\u00f3a bi\u1ec3u", href: "/schedules/timetable", icon: CalendarDays },
  { label: "Ti\u1ebfn \u0111\u1ed9", href: "/progress", icon: TrendingUp },
  { label: "L\u1ecbch s\u1eed", href: "/history", icon: History },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* App title */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">
              AnvySchedule
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-accent lg:hidden"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 AnvySchedule
          </p>
        </div>
      </aside>
    </>
  );
}
