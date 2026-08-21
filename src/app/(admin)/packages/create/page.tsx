"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Compass, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Image as ImageIcon, 
  FileText, 
  Globe, 
  Plus, 
  Trash2, 
  Upload, 
  Check, 
  Info,
  ChevronRight,
  Eye
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// ZOD VALIDATION SCHEMA
// ==========================================
const itineraryDaySchema = z.object({
  dayNumber: z.number(),
  title: z.string().min(2, "Day title is required"),
  description: z.string().min(5, "Description is required"),
  sightseeing: z.string(),
  meals: z.object({
    breakfast: z.boolean(),
    lunch: z.boolean(),
    dinner: z.boolean(),
  }),
  hotelInfo: z.string(),
});

const packageFormSchema = z.object({
  title: z.string().min(3, "Package title must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  destination: z.string().min(2, "Destination is required"),
  categories: z.array(z.string()).min(1, "Select at least one travel category"),
  durationDays: z.number().min(1, "Days must be at least 1"),
  durationNights: z.number().min(0, "Nights cannot be negative"),
  badge: z.enum(["Bestseller", "Trending", "Flash Deal", "Featured", "Standard"]),
  
  // Pricing Tiers
  priceStandardOriginal: z.number().min(0),
  priceStandardDiscounted: z.number().min(1, "Enter a valid discounted price"),
  priceDeluxeOriginal: z.number().min(0),
  priceDeluxeDiscounted: z.number().min(0),
  priceLuxuryOriginal: z.number().min(0),
  priceLuxuryDiscounted: z.number().min(0),
  minGroupSize: z.number().min(1),
  seasonalNotes: z.string().optional(),

  // Itinerary
  itinerary: z.array(itineraryDaySchema).min(1, "Add at least one itinerary day"),

  // Inclusions & Exclusions
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),

  // Media & Attachments
  coverImage: z.string().min(1, "Cover image URL is required"),
  galleryImages: z.array(z.string()),
  pdfBrochure: z.string().optional(),

  // SEO Config
  metaTitle: z.string().min(3, "Meta title is required"),
  metaDescription: z.string().min(10, "Meta description should be descriptive"),
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

const ALL_CATEGORIES = [
  "Honeymoon", "Family", "Adventure", "Weekend", "Budget", "Luxury", "Beach", "Nature", "Islands"
];

function CreatePackageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // Active Tab State
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "itinerary" | "inclusions" | "media" | "seo">("general");

  // Input states for tag additions
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Live Destinations List state (fetched dynamically from Destinations screen)
  const [destinationsList, setDestinationsList] = useState<string[]>([]);

  useEffect(() => {
    api.getDestinations()
      .then((res) => {
        if (res.data?.destinations && res.data.destinations.length > 0) {
          const names: string[] = res.data.destinations.map((d: any) => d.name);
          setDestinationsList(names);
        }
      })
      .catch((err) => console.warn("Could not fetch live destinations:", err));
  }, []);

  // React Hook Form initialization
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting }
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      destination: "Bali, Indonesia",
      categories: ["Honeymoon", "Luxury"],
      durationDays: 6,
      durationNights: 5,
      badge: "Bestseller",
      priceStandardOriginal: 58000,
      priceStandardDiscounted: 45999,
      priceDeluxeOriginal: 78000,
      priceDeluxeDiscounted: 64999,
      priceLuxuryOriginal: 110000,
      priceLuxuryDiscounted: 89999,
      minGroupSize: 2,
      seasonalNotes: "Peak surcharge applies during December & Christmas holidays.",
      itinerary: [
        {
          dayNumber: 1,
          title: "Arrival in Bali & Private Villa Transfer",
          description: "Arrive at Ngurah Rai International Airport. Meet your private chauffeur and transfer to your luxury honeymoon villa in Seminyak.",
          sightseeing: "Seminyak Beach sunset stroll & welcome drinks.",
          meals: { breakfast: false, lunch: false, dinner: true },
          hotelInfo: "The Kayana Villas Seminyak (Private Pool Villa)"
        }
      ],
      inclusions: [
        "Airport transfers in private AC vehicle",
        "Daily breakfast at villa / hotel"
      ],
      exclusions: [
        "International flight tickets",
        "Personal expenses & tipping"
      ],
      coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600&h=400",
      galleryImages: [],
      pdfBrochure: "",
      metaTitle: "Bali Romance & Luxury Villas Special | Tap & Go Travels",
      metaDescription: "Book exclusive Bali honeymoon packages with private pool villas."
    }
  });

  const populateFormWithPackage = (pkg: any) => {
    const destName = typeof pkg.destination === "object" ? pkg.destination?.name : pkg.destination;
    if (destName && !destinationsList.includes(destName)) {
      setDestinationsList((prev) => Array.from(new Set([destName, ...prev])));
    }

    const deluxeTier = pkg.pricing?.tierPricing?.find((t: any) => t.tierName === "Deluxe");
    const luxuryTier = pkg.pricing?.tierPricing?.find((t: any) => t.tierName === "Luxury");

    reset({
      title: pkg.title || "",
      slug: pkg.slug || "",
      destination: destName || "",
      categories: pkg.category || ["Honeymoon"],
      durationDays: pkg.duration?.days || 4,
      durationNights: pkg.duration?.nights || 3,
      badge: pkg.flags?.isBestseller ? "Bestseller" : (pkg.flags?.isTrending ? "Trending" : (pkg.flags?.isFeatured ? "Featured" : "Standard")),
      priceStandardOriginal: pkg.pricing?.originalPrice || (pkg.pricing?.startingPrice ? Math.round(pkg.pricing.startingPrice * 1.2) : 15000),
      priceStandardDiscounted: pkg.pricing?.startingPrice || 12000,
      priceDeluxeOriginal: deluxeTier ? Math.round(deluxeTier.pricePerPerson * 1.2) : 0,
      priceDeluxeDiscounted: deluxeTier ? deluxeTier.pricePerPerson : 0,
      priceLuxuryOriginal: luxuryTier ? Math.round(luxuryTier.pricePerPerson * 1.2) : 0,
      priceLuxuryDiscounted: luxuryTier ? luxuryTier.pricePerPerson : 0,
      minGroupSize: 2,
      seasonalNotes: "Peak surcharge applies during holidays.",
      itinerary: (pkg.itinerary && pkg.itinerary.length > 0) ? pkg.itinerary.map((d: any, idx: number) => ({
        dayNumber: d.dayNumber || idx + 1,
        title: d.title || "",
        description: d.description || "",
        sightseeing: Array.isArray(d.activityTags) ? d.activityTags.join(", ") : (d.sightseeing || ""),
        meals: {
          breakfast: Array.isArray(d.mealsIncluded) ? d.mealsIncluded.includes("Breakfast") : !!d.meals?.breakfast,
          lunch: Array.isArray(d.mealsIncluded) ? d.mealsIncluded.includes("Lunch") : !!d.meals?.lunch,
          dinner: Array.isArray(d.mealsIncluded) ? d.mealsIncluded.includes("Dinner") : !!d.meals?.dinner,
        },
        hotelInfo: d.stayDetails || d.hotelInfo || "",
      })) : [
        {
          dayNumber: 1,
          title: "Day 1 - Arrival & Check-in",
          description: "Arrive at destination and check in to hotel.",
          sightseeing: "Local sightseeing",
          meals: { breakfast: false, lunch: false, dinner: true },
          hotelInfo: "Resort Stay"
        }
      ],
      inclusions: pkg.inclusions || [],
      exclusions: pkg.exclusions || [],
      coverImage: pkg.media?.heroImage || pkg.media?.thumbnail || "",
      galleryImages: pkg.media?.gallery || [],
      pdfBrochure: pkg.media?.pdfBrochureUrl || "",
      metaTitle: pkg.seo?.metaTitle || `${pkg.title || ''} | Tap & Go`,
      metaDescription: pkg.seo?.metaDescription || pkg.title || "",
    });
  };

  useEffect(() => {
    if (editId) {
      api.getPackages("?limit=100")
        .then((res) => {
          const packages = res.data?.packages || [];
          const pkg = packages.find((p: any) => p.packageId === editId || p._id === editId || p.slug === editId);
          if (pkg) {
            populateFormWithPackage(pkg);
          } else {
            api.getPackageBySlug(editId)
              .then((res2) => {
                const fetchedPkg = res2.data?.package || res2.data;
                if (fetchedPkg) {
                  populateFormWithPackage(fetchedPkg);
                }
              })
              .catch((e) => console.warn("Package not found by slug:", e));
          }
        })
        .catch((err) => console.warn("Failed to fetch packages for edit:", err));
    }
  }, [editId]);

  // Field Array for Dynamic Itinerary Days
  const { fields: itineraryFields, append: appendDay, remove: removeDay } = useFieldArray({
    control,
    name: "itinerary"
  });

  const watchTitle = watch("title");
  const watchCategories = watch("categories") || [];
  const watchInclusions = watch("inclusions") || [];
  const watchExclusions = watch("exclusions") || [];
  const watchGalleryImages = watch("galleryImages") || [];
  const watchCoverImage = watch("coverImage");
  const watchMetaTitle = watch("metaTitle");
  const watchMetaDescription = watch("metaDescription");

  // Auto-generate Slug when Title changes
  useEffect(() => {
    if (watchTitle && !editId) {
      const generatedSlug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", generatedSlug);
      setValue("metaTitle", `${watchTitle} | Tap & Go Travels`);
    }
  }, [watchTitle, setValue, editId]);

  // Tag helper handlers
  const handleAddInclusion = () => {
    if (newInclusion.trim()) {
      setValue("inclusions", [...watchInclusions, newInclusion.trim()]);
      setNewInclusion("");
    }
  };

  const handleRemoveInclusion = (index: number) => {
    setValue("inclusions", watchInclusions.filter((_, i) => i !== index));
  };

  const handleAddExclusion = () => {
    if (newExclusion.trim()) {
      setValue("exclusions", [...watchExclusions, newExclusion.trim()]);
      setNewExclusion("");
    }
  };

  const handleRemoveExclusion = (index: number) => {
    setValue("exclusions", watchExclusions.filter((_, i) => i !== index));
  };

  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setValue("galleryImages", [...watchGalleryImages, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
      toast.success("Image added to gallery!");
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setValue("galleryImages", watchGalleryImages.filter((_, i) => i !== index));
  };

  const toggleCategory = (cat: string) => {
    if (watchCategories.includes(cat)) {
      setValue("categories", watchCategories.filter(c => c !== cat));
    } else {
      setValue("categories", [...watchCategories, cat]);
    }
  };

  // Form Submit Handler
  const onSubmit = async (data: PackageFormValues) => {
    const payload = {
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      destination: data.destination,
      category: data.categories,
      duration: {
        days: Number(data.durationDays),
        nights: Number(data.durationNights),
      },
      pricing: {
        startingPrice: Number(data.priceStandardDiscounted),
        originalPrice: Number(data.priceStandardOriginal || data.priceStandardDiscounted * 1.2),
        currency: "INR",
        tierPricing: [
          { tierName: "Standard", pricePerPerson: Number(data.priceStandardDiscounted), description: "Standard Package" },
          ...(data.priceDeluxeDiscounted ? [{ tierName: "Deluxe", pricePerPerson: Number(data.priceDeluxeDiscounted), description: "Deluxe Villa Package" }] : []),
          ...(data.priceLuxuryDiscounted ? [{ tierName: "Luxury", pricePerPerson: Number(data.priceLuxuryDiscounted), description: "5-Star Luxury Villa Package" }] : []),
        ],
      },
      flags: {
        isFeatured: data.badge === "Featured",
        isTrending: data.badge === "Trending",
        isBestseller: data.badge === "Bestseller",
        isActive: true,
      },
      media: {
        heroImage: data.coverImage,
        thumbnail: data.coverImage,
        gallery: data.galleryImages || [],
        pdfBrochureUrl: data.pdfBrochure || "",
      },
      highlights: (data.inclusions || []).slice(0, 3),
      itinerary: (data.itinerary || []).map((d, idx) => ({
        dayNumber: d.dayNumber || idx + 1,
        title: d.title,
        description: d.description,
        mealsIncluded: Object.keys(d.meals || {}).filter((k) => (d.meals as any)[k as keyof typeof d.meals]),
        stayDetails: d.hotelInfo || "",
        activityTags: d.sightseeing ? d.sightseeing.split(",").map((s) => s.trim()) : [],
      })),
      inclusions: data.inclusions,
      exclusions: data.exclusions,
      termsAndConditions: ["All bookings are subject to availability."],
      cancellationPolicy: "Standard cancellation policy applies.",
      seo: {
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: [data.destination, data.title],
      },
    };

    try {
      if (editId) {
        await api.updatePackage(editId, payload);
        toast.success("Package updated successfully!");
      } else {
        await api.createPackage(payload);
        toast.success("New tour package created successfully!");
      }
      setTimeout(() => {
        router.push("/packages");
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to save tour package to backend API");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left pb-12">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/packages"
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
              {editId ? `Edit Package: ${watchTitle || editId}` : "Build New Tour Package"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the package details, pricing tiers, itinerary, inclusions, and media assets below.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <Link
            href="/packages"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{editId ? "Save Changes" : "Publish Package"}</span>
          </button>
        </div>
      </div>

      {/* 6-TAB NAVIGATION BAR */}
      <div className="flex items-center space-x-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        {[
          { id: "general", label: "1. General Info", icon: Compass, error: errors.title || errors.destination || errors.categories },
          { id: "pricing", label: "2. Pricing & Tiers", icon: DollarSign, error: errors.priceStandardDiscounted },
          { id: "itinerary", label: "3. Day Itinerary", icon: Calendar, error: errors.itinerary },
          { id: "inclusions", label: "4. Inclusions / Exclusions", icon: CheckCircle2, error: false },
          { id: "media", label: "5. Media & PDF", icon: ImageIcon, error: errors.coverImage },
          { id: "seo", label: "6. SEO & Meta", icon: Globe, error: errors.metaTitle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "general" | "pricing" | "itinerary" | "inclusions" | "media" | "seo")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm font-black"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.error && (
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* TAB 1: GENERAL INFO */}
      {/* ==================================================== */}
      {activeTab === "general" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">General Information</h3>
            <p className="text-[10px] text-slate-400">Package titles, destination, categories, and badge tags</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Package Title *</label>
              <input
                type="text"
                {...register("title")}
                placeholder="e.g. Bali Romance & Luxury Villas Special"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold"
              />
              {errors.title && <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.title.message}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">URL Slug *</label>
              <input
                type="text"
                {...register("slug")}
                placeholder="e.g. bali-romance-luxury-villas"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono focus:outline-none"
              />
              {errors.slug && <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.slug.message}</p>}
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Destination *</label>
              <select
                {...register("destination")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                {destinationsList.length > 0 ? (
                  destinationsList.map((destName) => (
                    <option key={destName} value={destName}>
                      {destName}
                    </option>
                  ))
                ) : (
                  <option value="">-- No Destinations Created Yet --</option>
                )}
              </select>
            </div>

            {/* Duration Days & Nights */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Duration Days *</label>
              <input
                type="number"
                {...register("durationDays", { valueAsNumber: true })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Duration Nights *</label>
              <input
                type="number"
                {...register("durationNights", { valueAsNumber: true })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none"
              />
            </div>

            {/* Badge Highlight */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Package Highlight Badge</label>
              <select
                {...register("badge")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Bestseller">Bestseller</option>
                <option value="Trending">Trending</option>
                <option value="Flash Deal">Flash Deal</option>
                <option value="Featured">Featured</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            {/* Category Multi-select */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Travel Categories / Themes *</label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => {
                  const selected = watchCategories.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selected
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{selected ? "✓ " : "+ "}{cat}</span>
                    </button>
                  );
                })}
              </div>
              {errors.categories && <p className="text-[10px] text-rose-500 font-semibold">{errors.categories.message}</p>}
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: PRICING & STAY TIERS */}
      {/* ==================================================== */}
      {activeTab === "pricing" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Pricing &amp; Hotel Stay Tiers</h3>
            <p className="text-[10px] text-slate-400">Configure original vs discounted pricing tiers per guest level</p>
          </div>

          {/* Pricing Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Standard Tier */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-2">
                1. Standard Stay Tier
              </span>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Original Price (₹)</label>
                <input
                  type="number"
                  {...register("priceStandardOriginal", { valueAsNumber: true })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-600 uppercase">Discounted Starting Price (₹) *</label>
                <input
                  type="number"
                  {...register("priceStandardDiscounted", { valueAsNumber: true })}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-black text-emerald-700"
                />
              </div>
            </div>

            {/* Deluxe Tier */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-2">
                2. Deluxe Stay Tier
              </span>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Original Price (₹)</label>
                <input
                  type="number"
                  {...register("priceDeluxeOriginal", { valueAsNumber: true })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-600 uppercase">Discounted Starting Price (₹)</label>
                <input
                  type="number"
                  {...register("priceDeluxeDiscounted", { valueAsNumber: true })}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-black text-emerald-700"
                />
              </div>
            </div>

            {/* Luxury Tier */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-2">
                3. Luxury Villa Tier
              </span>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Original Price (₹)</label>
                <input
                  type="number"
                  {...register("priceLuxuryOriginal", { valueAsNumber: true })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-600 uppercase">Discounted Starting Price (₹)</label>
                <input
                  type="number"
                  {...register("priceLuxuryDiscounted", { valueAsNumber: true })}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-black text-emerald-700"
                />
              </div>
            </div>

          </div>

          {/* Group Requirement & Seasonal Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Minimum Group Size (Pax)</label>
              <input
                type="number"
                {...register("minGroupSize", { valueAsNumber: true })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Seasonal Rate Notes</label>
              <input
                type="text"
                {...register("seasonalNotes")}
                placeholder="e.g. Surcharge applies during festival dates."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: DAY-WISE ITINERARY BUILDER */}
      {/* ==================================================== */}
      {activeTab === "itinerary" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Day-wise Itinerary Builder</h3>
              <p className="text-[10px] text-slate-400">Add dynamic day plans with activities, meals, and hotel stay details</p>
            </div>

            <button
              type="button"
              onClick={() => appendDay({
                dayNumber: itineraryFields.length + 1,
                title: `Day ${itineraryFields.length + 1} Activity Title`,
                description: "Detailed description of the day's itinerary...",
                sightseeing: "Key sightseeing highlights...",
                meals: { breakfast: true, lunch: false, dinner: true },
                hotelInfo: "Hotel / Stay Info"
              })}
              className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Day</span>
            </button>
          </div>

          {/* Dynamic Day Accordion Array */}
          <div className="space-y-4">
            {itineraryFields.map((field, index) => (
              <div key={field.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span>Day {index + 1} Plan</span>
                  </span>

                  {itineraryFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDay(index)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Day"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Day Title */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Day Title *</label>
                    <input
                      type="text"
                      {...register(`itinerary.${index}.title` as const)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Day Description */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Detailed Description *</label>
                    <textarea
                      rows={2}
                      {...register(`itinerary.${index}.description` as const)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  {/* Sightseeing Highlights */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Sightseeing Highlights</label>
                    <input
                      type="text"
                      {...register(`itinerary.${index}.sightseeing` as const)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  {/* Hotel Info */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Hotel / Stay Info</label>
                    <input
                      type="text"
                      {...register(`itinerary.${index}.hotelInfo` as const)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  {/* Meals Included Checkboxes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Meals Included</label>
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(`itinerary.${index}.meals.breakfast` as const)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span>Breakfast</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(`itinerary.${index}.meals.lunch` as const)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span>Lunch</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(`itinerary.${index}.meals.dinner` as const)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span>Dinner</span>
                      </label>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: INCLUSIONS & EXCLUSIONS */}
      {/* ==================================================== */}
      {activeTab === "inclusions" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Inclusions &amp; Exclusions Points</h3>
            <p className="text-[10px] text-slate-400">Add dynamic bullet points displayed in the package comparison section</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Inclusions Tag Manager */}
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Package Inclusions (Green Checks)</span>
              </span>

              {/* Add Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  placeholder="e.g. Daily breakfast & airport transfers"
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddInclusion}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Tags List */}
              <div className="space-y-2">
                {watchInclusions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-slate-800">
                    <span className="flex items-center space-x-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInclusion(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions Tag Manager */}
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-rose-700 uppercase tracking-wider flex items-center space-x-1.5">
                <XCircle className="h-4 w-4 text-rose-500" />
                <span>Package Exclusions (Red Crosses)</span>
              </span>

              {/* Add Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  placeholder="e.g. International flight tickets"
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddExclusion}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Tags List */}
              <div className="space-y-2">
                {watchExclusions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-rose-50/60 border border-rose-200/80 rounded-xl text-xs text-slate-800">
                    <span className="flex items-center space-x-2">
                      <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span>{item}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExclusion(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: MEDIA GALLERY & PDF BROCHURE */}
      {/* ==================================================== */}
      {activeTab === "media" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Media Gallery &amp; PDF Brochure</h3>
            <p className="text-[10px] text-slate-400">Cover photo preview, photo gallery URLs, and downloadable PDF brochure links</p>
          </div>

          <div className="space-y-6">
            
            {/* Cover Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Cover Image URL *</label>
              <input
                type="text"
                {...register("coverImage")}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
              />
              {watchCoverImage && (
                <div className="w-full max-w-sm h-40 rounded-xl overflow-hidden border border-slate-200 relative mt-2">
                  <img src={watchCoverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                    Cover Preview
                  </span>
                </div>
              )}
            </div>

            {/* Gallery Images Grid */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700">Image Gallery URLs</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Add Image
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                {watchGalleryImages.map((url, idx) => (
                  <div key={idx} className="h-28 rounded-xl overflow-hidden border border-slate-200 relative group">
                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF Brochure */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700">PDF Itinerary Brochure Link</label>
              <input
                type="text"
                {...register("pdfBrochure")}
                placeholder="https://tapgo.com/brochures/package.pdf"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
              />
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: SEO & META CONFIG */}
      {/* ==================================================== */}
      {activeTab === "seo" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">SEO &amp; OpenGraph Settings</h3>
            <p className="text-[10px] text-slate-400">Configure search engine titles, descriptions, and preview cards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Meta Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Meta Title *</label>
                <input
                  type="text"
                  {...register("metaTitle")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Meta Description *</label>
                <textarea
                  rows={4}
                  {...register("metaDescription")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Live OpenGraph Preview Card */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Eye className="h-4 w-4 text-emerald-600" />
                <span>Live OpenGraph Share Card Preview</span>
              </label>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm space-y-3 p-4">
                <div className="h-36 rounded-xl overflow-hidden border border-slate-200">
                  <img src={watchCoverImage} alt="OG Preview" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">tapgo.com &gt; packages</span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{watchMetaTitle || "Package Title"}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{watchMetaDescription || "Package description snippet will appear here on Google and WhatsApp shares."}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </form>
  );
}

export default function CreatePackagePage() {
  return (
    <React.Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-semibold text-xs">
        Loading package builder...
      </div>
    }>
      <CreatePackageForm />
    </React.Suspense>
  );
}
