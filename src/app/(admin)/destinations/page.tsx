"use client";

import React, { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Clock, 
  Compass, 
  Globe, 
  X, 
  Check, 
  Eye, 
  FileText,
  Calendar,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

export interface DestinationItem {
  id: string;
  name: string;
  slug: string;
  region: "Domestic" | "International";
  coverImage: string;
  gallery?: string[];
  bestTimeToVisit: string;
  topAttractions: string[];
  packageCount: number;
  startingPrice: number;
  isFeatured: boolean;
  overview: string;
  metaTitle: string;
  metaDescription: string;
}

const INITIAL_DESTINATIONS: DestinationItem[] = [
  {
    id: "DEST-01",
    name: "Bali, Indonesia",
    slug: "bali",
    region: "International",
    coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=500&h=300",
    bestTimeToVisit: "Apr - Oct",
    topAttractions: ["Ubud Rice Terraces", "Seminyak Beach", "Tanah Lot Temple", "Nusa Penida"],
    packageCount: 14,
    startingPrice: 45999,
    isFeatured: true,
    overview: "Tropical island paradise known for iconic rice terraces, luxury villas, volcanic mountains, and vibrant culture.",
    metaTitle: "Bali Travel Packages & Tour Guides | Tap & Go",
    metaDescription: "Explore handpicked Bali tour packages with private pool villas, beach tours, and instant booking."
  },
  {
    id: "DEST-02",
    name: "Kerala, India",
    slug: "kerala",
    region: "Domestic",
    coverImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=500&h=300",
    bestTimeToVisit: "Sep - Mar",
    topAttractions: ["Alleppey Backwaters", "Munnar Tea Gardens", "Thekkady Wildlife", "Kovalam Beach"],
    packageCount: 18,
    startingPrice: 24999,
    isFeatured: true,
    overview: "God's Own Country offering tranquil backwater houseboats, misty tea plantations, and pristine beaches.",
    metaTitle: "Kerala Holiday Packages & Backwater Cruises | Tap & Go",
    metaDescription: "Book Kerala houseboats, tea estate tours, and Munnar hill station vacations at best prices."
  },
  {
    id: "DEST-03",
    name: "Maldives",
    slug: "maldives",
    region: "International",
    coverImage: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=500&h=300",
    bestTimeToVisit: "Nov - Apr",
    topAttractions: ["Overwater Bungalows", "Coral Reef Snorkeling", "Private Island Resorts", "Sunset Cruises"],
    packageCount: 10,
    startingPrice: 89999,
    isFeatured: true,
    overview: "Ultra-luxury archipelago featuring crystal-clear lagoons, overwater villas, and world-class diving.",
    metaTitle: "Maldives Luxury Honeymoon Packages | Tap & Go",
    metaDescription: "Experience luxury overwater villa stays and private resort transfers in the Maldives."
  },
  {
    id: "DEST-04",
    name: "Himachal, India",
    slug: "himachal",
    region: "Domestic",
    coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=500&h=300",
    bestTimeToVisit: "Oct - Jun",
    topAttractions: ["Solang Valley", "Manali Mall Road", "Kasol & Parvati Valley", "Shimla Ridge"],
    packageCount: 12,
    startingPrice: 21999,
    isFeatured: false,
    overview: "Majestic Himalayan mountain landscapes, adventure sports, snow peaks, and peaceful hill towns.",
    metaTitle: "Himachal Pradesh Tour Packages & Snow Vacations | Tap & Go",
    metaDescription: "Plan your trip to Manali, Shimla, and Kasol with custom family and adventure packages."
  },
  {
    id: "DEST-05",
    name: "Dubai, UAE",
    slug: "dubai",
    region: "International",
    coverImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=500&h=300",
    bestTimeToVisit: "Nov - Mar",
    topAttractions: ["Burj Khalifa", "Desert Safari Dunes", "Dubai Mall & Fountains", "Marina Cruise"],
    packageCount: 8,
    startingPrice: 52999,
    isFeatured: false,
    overview: "Glamorous city of skyscrapers, luxury shopping malls, desert adventures, and modern architecture.",
    metaTitle: "Dubai City Tours & Desert Safari Deals | Tap & Go",
    metaDescription: "Discover Dubai holiday packages including Burj Khalifa tickets and desert dune bashing."
  },
  {
    id: "DEST-06",
    name: "Thailand",
    slug: "thailand",
    region: "International",
    coverImage: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=500&h=300",
    bestTimeToVisit: "Nov - Apr",
    topAttractions: ["Phuket Beaches", "Phi Phi Islands", "Bangkok Temples", "Chiang Mai Mountains"],
    packageCount: 15,
    startingPrice: 34999,
    isFeatured: false,
    overview: "Land of Smiles offering tropical beaches, royal palaces, ancient ruins, and buzzing street life.",
    metaTitle: "Thailand Island Tours & Phuket Deals | Tap & Go",
    metaDescription: "Book Thailand island hopping, Phuket resorts, and Bangkok shopping holidays."
  }
];

export default function DestinationsAdminPage() {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<"all" | "Domestic" | "International">("all");

  useEffect(() => {
    api.getDestinations()
      .then((res) => {
        if (res.data?.destinations) {
          const mapped: DestinationItem[] = res.data.destinations.map((d: any) => ({
            id: d.destinationId || d._id,
            name: d.name,
            slug: d.slug,
            region: d.isDomestic ? "Domestic" : "International",
            coverImage: d.coverImage || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=500&h=300",
            gallery: Array.isArray(d.gallery) ? d.gallery : [],
            bestTimeToVisit: d.bestTimeToVisit || "Oct - Mar",
            topAttractions: d.topAttractions || ["Attraction 1", "Attraction 2"],
            packageCount: d.packageCount || 8,
            startingPrice: d.startingPrice || 35000,
            isFeatured: !!d.isFeatured,
            overview: d.description || "",
            metaTitle: d.metaTitle || `${d.name} Travel Packages | Tap & Go`,
            metaDescription: d.metaDescription || `Explore best travel deals for ${d.name}`,
          }));
          setDestinations(mapped);
        }
      })
      .catch((err) => console.warn("Could not fetch destinations from backend API:", err));
  }, []);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<DestinationItem | null>(null);

  // Form Fields State for Modal
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    region: "International" as "Domestic" | "International",
    coverImage: "",
    galleryText: "",
    bestTimeToVisit: "",
    topAttractionsText: "",
    startingPrice: 35000,
    packageCount: 5,
    overview: "",
    metaTitle: "",
    metaDescription: ""
  });

  // Filtered dataset
  const filteredDestinations = useMemo(() => {
    return destinations.filter(dest => {
      const matchesRegion = regionFilter === "all" || dest.region === regionFilter;
      const matchesSearch = 
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.topAttractions.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRegion && matchesSearch;
    });
  }, [destinations, regionFilter, searchQuery]);

  // Toggle Featured Handler
  const handleToggleFeatured = (id: string) => {
    setDestinations(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFeatured: !item.isFeatured } : item
      )
    );
    toast.success("Destination featured status updated!");
  };

  // Delete Handler
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete destination "${name}"?`)) {
      api.deleteDestination(id)
        .then(() => {
          setDestinations(prev => prev.filter(item => item.id !== id));
          toast.success(`Deleted destination "${name}"`);
        })
        .catch(err => toast.error(err.message || "Failed to delete destination"));
    }
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingDest(null);
    setFormData({
      name: "",
      slug: "",
      region: "International",
      coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=500&h=300",
      galleryText: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800\nhttps://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800",
      bestTimeToVisit: "Oct - Mar",
      topAttractionsText: "Beach Resort, Sunset Point, Local Markets",
      startingPrice: 35000,
      packageCount: 6,
      overview: "Beautiful vacation destination with rich culture and scenic beauty.",
      metaTitle: "Vacation Packages & Travel Guide | Tap & Go",
      metaDescription: "Discover best tour packages and hotel stays at discount prices."
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (dest: DestinationItem) => {
    setEditingDest(dest);
    setFormData({
      name: dest.name,
      slug: dest.slug,
      region: dest.region,
      coverImage: dest.coverImage,
      galleryText: dest.gallery ? dest.gallery.join("\n") : "",
      bestTimeToVisit: dest.bestTimeToVisit,
      topAttractionsText: dest.topAttractions.join(", "),
      startingPrice: dest.startingPrice,
      packageCount: dest.packageCount,
      overview: dest.overview,
      metaTitle: dest.metaTitle,
      metaDescription: dest.metaDescription
    });
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Destination name is required");
      return;
    }

    const attractionsArray = formData.topAttractionsText.split(",").map(s => s.trim()).filter(Boolean);
    const galleryArray = formData.galleryText.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

    const payload = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      isDomestic: formData.region === "Domestic",
      country: formData.region === "Domestic" ? "India" : "International",
      region: formData.region,
      coverImage: formData.coverImage || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=500&h=300",
      gallery: galleryArray,
      bestTimeToVisit: formData.bestTimeToVisit,
      topAttractions: attractionsArray,
      startingPrice: Number(formData.startingPrice),
      packageCount: Number(formData.packageCount),
      description: formData.overview,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
    };

    try {
      if (editingDest) {
        const res = await api.updateDestination(editingDest.id, payload);
        const updated = res.data;
        setDestinations(prev =>
          prev.map(item =>
            item.id === editingDest.id
              ? {
                  ...item,
                  name: updated?.name || formData.name,
                  slug: updated?.slug || formData.slug,
                  region: formData.region,
                  coverImage: formData.coverImage,
                  gallery: galleryArray,
                  bestTimeToVisit: formData.bestTimeToVisit,
                  topAttractions: attractionsArray,
                  startingPrice: Number(formData.startingPrice),
                  packageCount: Number(formData.packageCount),
                  overview: formData.overview,
                  metaTitle: formData.metaTitle,
                  metaDescription: formData.metaDescription,
                }
              : item
          )
        );
        toast.success(`Updated destination "${formData.name}"`);
      } else {
        const res = await api.createDestination(payload);
        const created = res.data;
        const newDest: DestinationItem = {
          id: created?.destinationId || created?._id || `DEST-${Date.now()}`,
          name: created?.name || formData.name,
          slug: created?.slug || formData.slug,
          region: formData.region,
          coverImage: formData.coverImage,
          gallery: galleryArray,
          bestTimeToVisit: formData.bestTimeToVisit,
          topAttractions: attractionsArray,
          packageCount: Number(formData.packageCount),
          startingPrice: Number(formData.startingPrice),
          isFeatured: false,
          overview: formData.overview,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
        };
        setDestinations(prev => [newDest, ...prev]);
        toast.success(`Created new destination "${formData.name}"`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save destination");
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Globe className="h-6 w-6 text-emerald-600" />
            <span>Destination Manager</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure travel regions, cover imagery, seasonal guides, attractions, and SEO metadata.
          </p>
        </div>

        {/* Add Destination Button */}
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-[0.98] shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Destination</span>
        </button>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Region Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "all", label: "All Regions", count: destinations.length },
            { id: "Domestic", label: "Domestic", count: destinations.filter(d => d.region === "Domestic").length },
            { id: "International", label: "International", count: destinations.filter(d => d.region === "International").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRegionFilter(tab.id as "all" | "Domestic" | "International")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                regionFilter === tab.id
                  ? "bg-white text-slate-900 shadow-sm font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 text-[10px] opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination, attractions..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

      </div>

      {/* DESTINATIONS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((dest) => (
          <div
            key={dest.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
          >
            {/* Image Header with Badges */}
            <div className="h-48 relative overflow-hidden bg-slate-900">
              <img
                src={dest.coverImage}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Region Badge */}
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${
                dest.region === "International" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
              }`}>
                {dest.region}
              </span>

              {/* Featured Star Toggle */}
              <button
                onClick={() => handleToggleFeatured(dest.id)}
                className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors ${
                  dest.isFeatured ? "bg-amber-400 text-slate-950 shadow-md" : "bg-slate-900/60 text-white hover:bg-slate-900"
                }`}
                title={dest.isFeatured ? "Featured Destination" : "Click to Feature"}
              >
                <Sparkles className="h-4 w-4 fill-current" />
              </button>

              {/* Title & Price overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">{dest.id}</span>
                  <h3 className="font-extrabold text-lg leading-tight text-white">{dest.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-300 block">From</span>
                  <span className="font-black text-sm text-emerald-300">₹{dest.startingPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Card Details Body */}
            <div className="p-5 space-y-4 flex-grow flex flex-col justify-between text-xs">
              
              <div className="space-y-3">
                {/* Meta details (Packages count & Best time) */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 border-b border-slate-100 pb-2.5">
                  <span className="flex items-center space-x-1 font-semibold">
                    <Compass className="h-3.5 w-3.5 text-slate-400" />
                    <span>{dest.packageCount} Active Packages</span>
                  </span>
                  <span className="flex items-center space-x-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Calendar className="h-3 w-3 text-amber-500" />
                    <span>Best: {dest.bestTimeToVisit}</span>
                  </span>
                </div>

                {/* Overview snippet */}
                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed italic">
                  &quot;{dest.overview}&quot;
                </p>

                {/* Top Attraction Tags */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Top Attractions:</span>
                  <div className="flex flex-wrap gap-1">
                    {dest.topAttractions.slice(0, 3).map((attr, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[9px] font-semibold px-2 py-0.5 rounded-md">
                        {attr}
                      </span>
                    ))}
                    {dest.topAttractions.length > 3 && (
                      <span className="text-[9px] font-bold text-slate-400 self-center">
                        +{dest.topAttractions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEditModal(dest)}
                  className="inline-flex items-center space-x-1 text-slate-700 hover:text-slate-900 font-bold text-[11px] uppercase tracking-wider bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Edit Destination</span>
                </button>

                <button
                  onClick={() => handleDelete(dest.id, dest.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Destination"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT DESTINATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-sans text-lg font-black text-slate-900">
                  {editingDest ? `Edit Destination: ${editingDest.name}` : "Create New Destination"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure travel region details and meta tags.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-left">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Destination Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Destination Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        name: val,
                        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        metaTitle: `${val} Vacation Packages & Travel Guide | Tap & Go`
                      }));
                    }}
                    placeholder="e.g. Bali, Indonesia"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold"
                    required
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. bali"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                  />
                </div>

                {/* Region Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Region Type *</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value as "Domestic" | "International" })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold cursor-pointer"
                  >
                    <option value="International">International</option>
                    <option value="Domestic">Domestic</option>
                  </select>
                </div>

                {/* Best Time to Visit */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Best Time to Visit</label>
                  <input
                    type="text"
                    value={formData.bestTimeToVisit}
                    onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                    placeholder="e.g. Oct - Mar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold"
                  />
                </div>

                {/* Starting Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Starting Price (₹)</label>
                  <input
                    type="number"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  />
                </div>

                {/* Package Count */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Active Packages Count</label>
                  <input
                    type="number"
                    value={formData.packageCount}
                    onChange={(e) => setFormData({ ...formData, packageCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  />
                </div>

                {/* Cover Image URL */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Featured Cover Image URL *</label>
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                    required
                  />
                </div>

                {/* Destination Photo Gallery */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Destination Gallery Images (One URL per line or comma-separated)</label>
                  <textarea
                    rows={3}
                    value={formData.galleryText}
                    onChange={(e) => setFormData({ ...formData, galleryText: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400">These photos will be rendered in the destination photo gallery modal on the live website.</p>
                </div>

                {/* Top Attractions Comma Separated */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Top Attractions (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.topAttractionsText}
                    onChange={(e) => setFormData({ ...formData, topAttractionsText: e.target.value })}
                    placeholder="Ubud Rice Terraces, Seminyak Beach, Tanah Lot"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>

                {/* Overview Summary */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Overview Summary</label>
                  <textarea
                    rows={2}
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Summary description of the destination..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>

                {/* Meta Title */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">SEO Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>

              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {editingDest ? "Update Destination" : "Create Destination"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
