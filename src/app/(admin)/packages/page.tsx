"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Copy, 
  ExternalLink, 
  Trash2, 
  Compass, 
  MapPin, 
  Clock, 
  Star, 
  Eye, 
  Check,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// MOCK TOUR PACKAGES DATASET FOR API WIRING
// ==========================================
export interface TourPackageItem {
  id: string;
  title: string;
  slug: string;
  destination: string;
  thumbnail: string;
  durationDays: number;
  durationNights: number;
  originalPrice: number;
  discountedPrice: number;
  badge: "Bestseller" | "Trending" | "Flash Deal" | "Featured" | "Standard";
  categories: string[];
  status: "active" | "draft" | "archived";
  isFeatured: boolean;
  rating: number;
  reviewsCount: number;
  updatedAt: string;
}

const INITIAL_PACKAGES: TourPackageItem[] = [
  {
    id: "PKG-101",
    title: "Bali Romance & Luxury Villas Special",
    slug: "bali-romance-luxury-villas",
    destination: "Bali, Indonesia",
    thumbnail: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=300&h=200",
    durationDays: 6,
    durationNights: 5,
    originalPrice: 58000,
    discountedPrice: 45999,
    badge: "Bestseller",
    categories: ["Honeymoon", "Luxury", "Beach"],
    status: "active",
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 128,
    updatedAt: "18 Aug 2026"
  },
  {
    id: "PKG-102",
    title: "Kerala Houseboats & Munnar Hills Escapes",
    slug: "kerala-houseboats-munnar-hills",
    destination: "Kerala, India",
    thumbnail: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=300&h=200",
    durationDays: 5,
    durationNights: 4,
    originalPrice: 32000,
    discountedPrice: 24999,
    badge: "Trending",
    categories: ["Family", "Nature", "Backwaters"],
    status: "active",
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 94,
    updatedAt: "17 Aug 2026"
  },
  {
    id: "PKG-103",
    title: "Maldives Luxury Overwater Stays Special",
    slug: "maldives-luxury-overwater-stays",
    destination: "Maldives",
    thumbnail: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=300&h=200",
    durationDays: 5,
    durationNights: 4,
    originalPrice: 110000,
    discountedPrice: 89999,
    badge: "Flash Deal",
    categories: ["Honeymoon", "Luxury", "Islands"],
    status: "active",
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 215,
    updatedAt: "16 Aug 2026"
  },
  {
    id: "PKG-104",
    title: "Himachal Scenic Valley & Snow Tops Tour",
    slug: "himachal-scenic-valley-snow-tops",
    destination: "Himachal, India",
    thumbnail: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=300&h=200",
    durationDays: 7,
    durationNights: 6,
    originalPrice: 28000,
    discountedPrice: 21999,
    badge: "Trending",
    categories: ["Adventure", "Family", "Mountains"],
    status: "active",
    isFeatured: false,
    rating: 4.7,
    reviewsCount: 76,
    updatedAt: "15 Aug 2026"
  },
  {
    id: "PKG-105",
    title: "Dubai Heights & Desert Dunes Special",
    slug: "dubai-heights-desert-dunes",
    destination: "Dubai, UAE",
    thumbnail: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=300&h=200",
    durationDays: 6,
    durationNights: 5,
    originalPrice: 65000,
    discountedPrice: 52999,
    badge: "Featured",
    categories: ["Shopping", "City", "Family"],
    status: "draft",
    isFeatured: false,
    rating: 4.6,
    reviewsCount: 42,
    updatedAt: "12 Aug 2026"
  },
  {
    id: "PKG-106",
    title: "Thailand Island Hopping & Coral Reefs",
    slug: "thailand-island-hopping-coral-reefs",
    destination: "Thailand",
    thumbnail: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=300&h=200",
    durationDays: 6,
    durationNights: 5,
    originalPrice: 42000,
    discountedPrice: 34999,
    badge: "Standard",
    categories: ["Beach", "Friends", "Nightlife"],
    status: "archived",
    isFeatured: false,
    rating: 4.5,
    reviewsCount: 38,
    updatedAt: "05 Aug 2026"
  }
];

export default function PackagesAdminPage() {
  const [packagesList, setPackagesList] = useState<TourPackageItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    api.getPackages("?status=All&limit=50")
      .then((res) => {
        if (res.data?.packages) {
          const mapped: TourPackageItem[] = res.data.packages.map((p: any) => ({
            id: p.packageId || p._id,
            title: p.title,
            slug: p.slug,
            destination: typeof p.destination === "string" ? p.destination : p.destination?.name || "Global",
            thumbnail: p.media?.thumbnail || p.media?.heroImage || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=300&h=200",
            durationDays: p.duration?.days || 5,
            durationNights: p.duration?.nights || 4,
            originalPrice: p.pricing?.originalPrice || (p.pricing?.startingPrice ? Math.round(p.pricing.startingPrice * 1.2) : 50000),
            discountedPrice: p.pricing?.startingPrice || 45000,
            badge: p.flags?.isBestseller ? "Bestseller" : p.flags?.isTrending ? "Trending" : p.flags?.isFeatured ? "Featured" : "Standard",
            categories: p.category || ["Tour"],
            status: p.flags?.isActive ? "active" : "draft",
            isFeatured: !!p.flags?.isFeatured,
            rating: 4.8,
            reviewsCount: 24,
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "Today",
          }));
          setPackagesList(mapped);
        }
      })
      .catch((err) => console.warn("Could not fetch packages from backend API:", err));
  }, []);

  // Filtered dataset calculation
  const filteredPackages = useMemo(() => {
    return packagesList.filter(pkg => {
      const matchesStatus = statusFilter === "all" || pkg.status === statusFilter;
      const matchesDestination = destinationFilter === "all" || pkg.destination.toLowerCase().includes(destinationFilter.toLowerCase());
      const matchesSearch = 
        pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesDestination && matchesSearch;
    });
  }, [packagesList, statusFilter, destinationFilter, searchQuery]);

  // Action handlers
  const handleToggleFeatured = (id: string) => {
    setPackagesList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFeatured: !item.isFeatured } : item
      )
    );
    toast.success("Featured status updated!");
  };

  const handleStatusChange = (id: string, newStatus: "active" | "draft" | "archived") => {
    setPackagesList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    toast.success(`Package status updated to ${newStatus.toUpperCase()}`);
    setActiveMenuId(null);
  };

  const handleDuplicate = (pkg: TourPackageItem) => {
    const duplicated: TourPackageItem = {
      ...pkg,
      id: `PKG-${Math.floor(100 + Math.random() * 900)}`,
      title: `${pkg.title} (Copy)`,
      slug: `${pkg.slug}-copy`,
      status: "draft",
      isFeatured: false,
      updatedAt: "Just now"
    };
    setPackagesList([duplicated, ...packagesList]);
    toast.success(`Duplicated package: "${pkg.title}"`);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setPackagesList(prev => prev.filter(item => item.id !== id));
      toast.success(`Deleted package "${title}"`);
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Compass className="h-6 w-6 text-emerald-600" />
            <span>Tour Package Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your travel agency tour packages, pricing tiers, itineraries, and website availability.
          </p>
        </div>
        
        {/* Create New Package CTA */}
        <Link
          href="/packages/create"
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Create New Package</span>
        </Link>
      </div>

      {/* TOP TOOLBAR: STATUS TABS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        
        {/* Status Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "all", label: "All Packages", count: packagesList.length },
              { id: "active", label: "Active", count: packagesList.filter(p => p.status === 'active').length },
              { id: "draft", label: "Drafts", count: packagesList.filter(p => p.status === 'draft').length },
              { id: "archived", label: "Archived", count: packagesList.filter(p => p.status === 'archived').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as "all" | "active" | "draft" | "archived")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white text-slate-900 shadow-sm font-black"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 text-[10px] opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-black text-slate-800">{filteredPackages.length}</span> of {packagesList.length} packages
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by package title, ID, location..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Destination Dropdown Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Destinations</option>
              <option value="bali">Bali, Indonesia</option>
              <option value="kerala">Kerala, India</option>
              <option value="maldives">Maldives</option>
              <option value="himachal">Himachal, India</option>
              <option value="dubai">Dubai, UAE</option>
              <option value="thailand">Thailand</option>
            </select>
          </div>

        </div>
      </div>

      {/* PACKAGES DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredPackages.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Package Info</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Badge</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Package Info (Thumbnail & Title) */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3.5 min-w-[240px]">
                        <img
                          src={pkg.thumbnail}
                          alt={pkg.title}
                          className="w-14 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm"
                        />
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block">{pkg.id}</span>
                          <span className="font-extrabold text-slate-900 text-xs block leading-tight hover:text-emerald-600 transition-colors">
                            {pkg.title}
                          </span>
                          <div className="flex items-center space-x-1 mt-1">
                            {pkg.categories.slice(0, 2).map((cat, i) => (
                              <span key={i} className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-4 px-4 text-slate-700 font-semibold whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{pkg.destination}</span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{pkg.durationDays}D / {pkg.durationNights}N</span>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-black text-slate-900 text-sm block">₹{pkg.discountedPrice.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-slate-400 line-through block">₹{pkg.originalPrice.toLocaleString("en-IN")}</span>
                      </div>
                    </td>

                    {/* Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        pkg.badge === "Bestseller" ? "bg-rose-50 text-rose-600 border border-rose-200" :
                        pkg.badge === "Trending" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                        pkg.badge === "Flash Deal" ? "bg-purple-50 text-purple-600 border border-purple-200" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {pkg.badge}
                      </span>
                    </td>

                    {/* Featured Switcher */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(pkg.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          pkg.isFeatured ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-300 hover:text-slate-400"
                        }`}
                        title={pkg.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                      >
                        <Sparkles className="h-4.5 w-4.5 fill-current" />
                      </button>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        pkg.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        pkg.status === "draft" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {pkg.status}
                      </span>
                    </td>

                    {/* Actions Dropdown */}
                    <td className="py-4 px-6 text-right whitespace-nowrap relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === pkg.id ? null : pkg.id);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === pkg.id && (
                        <div 
                          className="absolute right-6 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={`/packages/create?edit=${pkg.id}`}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                            <span>Edit Package</span>
                          </Link>
                          
                          <button
                            onClick={() => handleDuplicate(pkg)}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                            <span>Duplicate</span>
                          </button>

                          <button
                            onClick={() => {
                              toast.info(`Viewing ${pkg.title} on website preview`);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                            <span>View on Website</span>
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          <button
                            onClick={() => handleDelete(pkg.id, pkg.title)}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Compass className="h-8 w-8 mx-auto text-slate-350" />
              <p className="font-semibold text-slate-800 text-sm">No Tour Packages Found</p>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Try clearing search filters or add a new tour package to your inventory.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
