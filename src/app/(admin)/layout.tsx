"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Compass, 
  Users, 
  MapPin, 
  Image as ImageIcon, 
  Star, 
  Sliders, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Search, 
  Plus, 
  ChevronDown, 
  LogOut, 
  Globe,
  Settings,
  User,
  ShieldCheck,
  Check
} from "lucide-react";

// Sidebar navigation items
const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tour Packages", href: "/packages", icon: Compass },
  { name: "Lead CRM", href: "/leads", icon: Users },
  { name: "Destinations", href: "/destinations", icon: MapPin },
  { name: "Media Library", href: "/media", icon: ImageIcon },
  { name: "Testimonials & Reviews", href: "/testimonials", icon: Star },
  { name: "Banner & Site Settings", href: "/settings", icon: Sliders },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Dropdowns state
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  
  // Auto-close dropdowns on outside clicks
  useEffect(() => {
    const handleOutsideClick = () => {
      setProfileOpen(false);
      setNotificationsOpen(false);
      setActionsOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tapgo_admin_token");
      if (!token && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return () => window.removeEventListener("click", handleOutsideClick);
  }, [pathname]);

  // Quick Action Handler
  const handleQuickAction = (actionName: string) => {
    toast.success(`Action triggered: ${actionName}`);
  };

  // Environment status
  const environment = "Production";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* ---------------------------------------------------- */}
      {/* 1. SIDEBAR (Desktop Collapsible & Mobile Drawer) */}
      {/* ---------------------------------------------------- */}
      
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col transition-all duration-300 ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shrink-0">
              T
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col text-left shrink-0">
                <span className="text-sm font-extrabold uppercase tracking-wide text-white leading-none">
                  Tap &amp; Go
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>
          
          {/* Close mobile menu */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-grow py-6 px-3 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group relative ${
                  isActive 
                    ? "bg-slate-800 text-emerald-400 shadow-sm" 
                    : "hover:bg-slate-800/50 hover:text-white text-slate-450"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`} />
                {(!isCollapsed || isMobileOpen) ? (
                  <span>{item.name}</span>
                ) : (
                  /* Tooltip for Collapsed Sidebar */
                  <span className="absolute left-16 scale-0 bg-slate-950 text-white border border-slate-800 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider z-50 group-hover:scale-100 transition-all shadow-lg whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Collapse Toggle) */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{environment} Mode</span>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-450 hover:text-white rounded-lg transition-colors hidden lg:block ml-auto"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* 2. MAIN CONTAINER */}
      {/* ---------------------------------------------------- */}
      <div 
        className={`flex-grow flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
          
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-650 lg:hidden shrink-0 mr-2"
          >
            <Menu className="h-5.5 w-5.5" />
          </button>

          {/* Environment Status & Search */}
          <div className="flex items-center space-x-4 flex-grow max-w-lg">
            {/* Environment Badge */}
            <span className="hidden md:flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{environment}</span>
            </span>

            {/* Global Search Bar */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search across packages, CRM records..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-350 focus:border-slate-350 transition-all"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Right Header Navigation Icons */}
          <div className="flex items-center space-x-3 shrink-0 ml-4">
            
            {/* Quick Actions Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setActionsOpen(!actionsOpen)}
                className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Quick Action</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {actionsOpen && (
                <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                  <button
                    onClick={() => { handleQuickAction("Add New Package"); setActionsOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Plus className="h-3.5 w-3.5 text-slate-400" />
                    <span>Add New Package</span>
                  </button>
                  <button
                    onClick={() => { handleQuickAction("Create New Lead"); setActionsOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Plus className="h-3.5 w-3.5 text-slate-400" />
                    <span>Add New Lead</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                  3
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
                    <span className="bg-rose-100 text-rose-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">3 New Leads</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 py-2.5 hover:bg-slate-50 text-left">
                      <p className="text-xs text-slate-800 font-semibold mb-0.5">New Custom Tour Request</p>
                      <p className="text-[10px] text-slate-500">Rohan Kumar (Bali, Honeymoon, Budget: Luxury)</p>
                      <span className="text-[9px] text-slate-400 block mt-1">2 mins ago</span>
                    </div>
                    <div className="px-4 py-2.5 hover:bg-slate-50 text-left">
                      <p className="text-xs text-slate-800 font-semibold mb-0.5">Kerala Packages Enquiry</p>
                      <p className="text-[10px] text-slate-500">Pooja Sharma (Phone: +91 98765 43210)</p>
                      <span className="text-[9px] text-slate-400 block mt-1">15 mins ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-left"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8.5 h-8.5 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8.5 h-8.5 rounded-xl bg-slate-205 flex items-center justify-center text-xs font-bold text-slate-600">
                    U
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-none mb-0.5">{user?.name || "Admin"}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{user?.role || "Super Admin"}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 text-left">
                    <p className="text-xs font-bold text-slate-800 leading-none mb-1">{user?.name || "Admin"}</p>
                    <p className="text-[10px] text-slate-500 leading-none">{user?.email || "admin@tapgo.com"}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => { 
                        logout(); 
                        setProfileOpen(false); 
                        toast.info("Logged out successfully."); 
                        window.location.href = "/login";
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
