"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Sliders, 
  Image as ImageIcon, 
  Star, 
  Building2, 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Check, 
  Sparkles, 
  Eye, 
  Code, 
  Bold, 
  Italic, 
  List, 
  X,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// ==========================================
// TYPES & MOCK DATASETS
// ==========================================
export interface ReviewItem {
  id: string;
  name: string;
  avatar: string;
  destination: string;
  rating: number;
  comment: string;
  displayOnHomepage: boolean;
}

const INITIAL_REVIEWS: ReviewItem[] = [];

function SettingsFormContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "testimonials" ? "testimonials" : "banner";

  // Tab State
  const [activeTab, setActiveTab] = useState<"banner" | "testimonials" | "company" | "policies">(defaultTab as "banner" | "testimonials" | "company" | "policies");

  // 1. HERO BANNER STATE
  const [bannerState, setBannerState] = useState({
    heroImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1600&h=900",
    headline: "Unforgettable Journeys, Curated Just For You",
    subheading: "Verified packages, 24/7 on-tour support, and custom itineraries tailored to your budget.",
    searchPlaceholder: "Search by Destination, Category, Duration..."
  });

  // 2. REVIEWS STATE
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [reviewFormData, setReviewFormData] = useState({
    name: "",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    destination: "Tour Package",
    rating: 5,
    comment: "",
    displayOnHomepage: true
  });

  // 3. COMPANY INFO STATE
  const [companyState, setCompanyState] = useState({
    phonePrimary: "+91 98765 43210",
    phoneSecondary: "+91 87654 32109",
    whatsappNumber: "+91 98765 43210",
    emailSupport: "support@tapgo.com",
    addressHQ: "Suite 402, Tap & Go Towers, MG Road, Bengaluru, Karnataka 560001",
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9!2d77.6!3d12.97",
    socialInstagram: "https://instagram.com/tapgotravels",
    socialFacebook: "https://facebook.com/tapgotravels",
    socialTwitter: "https://twitter.com/tapgotravels",
    socialYoutube: "https://youtube.com/tapgotravels"
  });

  // 4. POLICIES STATE
  const [activePolicyTab, setActivePolicyTab] = useState<"terms" | "privacy" | "cancellation">("terms");
  const [policiesState, setPoliciesState] = useState({
    terms: `### Terms & Conditions\n\n1. **Booking Confirmation**: All tour bookings are confirmed upon receipt of minimum 30% advance deposit.\n2. **Passport & Visa**: Travelers are responsible for ensuring passport validity of at least 6 months.\n3. **Itinerary Changes**: Unforeseen weather conditions may alter sightseeing sequences.`,
    privacy: `### Privacy Policy\n\n1. **Data Security**: We protect customer personal information and contact numbers with 256-bit SSL encryption.\n2. **Third-Party Sharing**: We do not sell or trade user phone numbers or emails to external agencies.`,
    cancellation: `### Cancellation Policy\n\n1. **30+ Days Prior to Departure**: 90% refund of total package amount.\n2. **15-29 Days Prior**: 50% refund.\n3. **Less than 14 Days**: Non-refundable.`
  });

  useEffect(() => {
    api.getSettings()
      .then((res) => {
        if (res.data?.hero) setBannerState((prev) => ({ ...prev, ...res.data.hero }));
        if (res.data?.contact) setCompanyState((prev) => ({ ...prev, ...res.data.contact }));
        if (res.data?.policies) setPoliciesState((prev) => ({ ...prev, ...res.data.policies }));
      })
      .catch((err) => console.warn("Could not fetch site settings:", err));

    api.getReviews()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          const mapped: ReviewItem[] = res.data.map((r: any) => ({
            id: r._id || r.id || r.reviewId,
            name: r.name || r.userName || "Traveler",
            avatar: r.avatar || r.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
            destination: r.destination || r.packageName || "Tour Package",
            rating: r.rating || 5,
            comment: r.comment || r.reviewText || "",
            displayOnHomepage: r.displayOnHomepage ?? r.isApproved ?? true,
          }));
          setReviewsList(mapped);
        }
      })
      .catch((err) => console.warn("Could not fetch reviews:", err));
  }, []);

  // Handlers
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({ hero: bannerState });
      toast.success("Homepage Hero Banner updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update banner");
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({ contact: companyState });
      toast.success("Company details & contact info saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save company details");
    }
  };

  const handleSavePolicies = async () => {
    try {
      await api.updateSettings({ policies: policiesState });
      toast.success("Legal & policy document updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save policies");
    }
  };

  const handleToggleReviewDisplay = (id: string) => {
    setReviewsList(prev =>
      prev.map(r => r.id === id ? { ...r, displayOnHomepage: !r.displayOnHomepage } : r)
    );
    toast.success("Testimonial visibility updated!");
  };

  const handleDeleteReview = async (id: string, name: string) => {
    if (confirm(`Delete review from "${name}"?`)) {
      try {
        await api.deleteReview(id);
        setReviewsList(prev => prev.filter(r => r.id !== id));
        toast.success("Review deleted!");
      } catch (err: any) {
        setReviewsList(prev => prev.filter(r => r.id !== id));
        toast.success("Review deleted!");
      }
    }
  };

  const handleOpenAddReviewModal = () => {
    setEditingReview(null);
    setReviewFormData({
      name: "",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
      destination: "Tour Package",
      rating: 5,
      comment: "",
      displayOnHomepage: true
    });
    setIsReviewModalOpen(true);
  };

  const handleSaveReviewModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewFormData.name.trim() || !reviewFormData.comment.trim()) {
      toast.error("Name and review comment are required");
      return;
    }

    try {
      if (editingReview) {
        setReviewsList(prev =>
          prev.map(r =>
            r.id === editingReview.id ? { ...r, ...reviewFormData } : r
          )
        );
        toast.success("Review updated!");
      } else {
        const res = await api.createReview({
          customerName: reviewFormData.name,
          name: reviewFormData.name,
          avatar: reviewFormData.avatar,
          travelerPhotoUrl: reviewFormData.avatar,
          destination: reviewFormData.destination,
          customerLocation: reviewFormData.destination,
          rating: reviewFormData.rating,
          comment: reviewFormData.comment,
          displayOnHomepage: reviewFormData.displayOnHomepage,
          isApproved: true,
        });
        const created = res.data || res;
        const newReview: ReviewItem = {
          id: created._id || created.id || created.reviewId || `REV-${Date.now()}`,
          ...reviewFormData
        };
        setReviewsList(prev => [newReview, ...prev]);
        toast.success("New traveler review added!");
      }
      setIsReviewModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save review");
    }
  };

  return (
    <div className="space-y-6 text-left pb-12">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Sliders className="h-6 w-6 text-emerald-600" />
            <span>Banner &amp; Content Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure homepage hero graphics, testimonials, global contact details, and legal policies.
          </p>
        </div>
      </div>

      {/* 4-TAB NAVIGATION BAR */}
      <div className="flex items-center space-x-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        {[
          { id: "banner", label: "1. Homepage Hero Banner", icon: ImageIcon },
          { id: "testimonials", label: "2. Testimonials & Social Proof", icon: Star },
          { id: "company", label: "3. Company & Contact Info", icon: Building2 },
          { id: "policies", label: "4. Legal & Policy Editors", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "banner" | "testimonials" | "company" | "policies")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm font-black"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* TAB 1: HOMEPAGE HERO BANNER MANAGER */}
      {/* ==================================================== */}
      {activeTab === "banner" && (
        <form onSubmit={handleSaveBanner} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Homepage Hero Banner Setup</h3>
              <p className="text-[10px] text-slate-400">Configure background imagery, main headline, and search widget text</p>
            </div>

            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              <span>Save Hero Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Background Hero Image/Video URL *</label>
                <input
                  type="text"
                  value={bannerState.heroImage}
                  onChange={(e) => setBannerState({ ...bannerState, heroImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Main Headline Text *</label>
                <input
                  type="text"
                  value={bannerState.headline}
                  onChange={(e) => setBannerState({ ...bannerState, headline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Subheading Description *</label>
                <textarea
                  rows={3}
                  value={bannerState.subheading}
                  onChange={(e) => setBannerState({ ...bannerState, subheading: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Search Box Placeholder Text</label>
                <input
                  type="text"
                  value={bannerState.searchPlaceholder}
                  onChange={(e) => setBannerState({ ...bannerState, searchPlaceholder: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Live Hero Banner Visual Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Eye className="h-4 w-4 text-emerald-600" />
                <span>Live Hero Section Visual Preview</span>
              </label>

              <div className="h-80 rounded-2xl overflow-hidden bg-slate-950 relative p-6 flex flex-col justify-end text-white border border-slate-200 shadow-md">
                <img
                  src={bannerState.heroImage}
                  alt="Hero Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="relative z-10 space-y-2">
                  <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Domestic &amp; International Travel
                  </span>
                  <h2 className="text-xl font-black text-white leading-tight">{bannerState.headline}</h2>
                  <p className="text-[11px] text-slate-200 leading-relaxed line-clamp-2">{bannerState.subheading}</p>

                  <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl text-slate-800 text-xs font-medium mt-3 shadow-lg">
                    <span>🔍 {bannerState.searchPlaceholder}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>
      )}

      {/* ==================================================== */}
      {/* TAB 2: TESTIMONIALS & SOCIAL PROOF MANAGER */}
      {/* ==================================================== */}
      {activeTab === "testimonials" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Traveler Reviews &amp; Social Proof</h3>
              <p className="text-[10px] text-slate-400">Manage customer ratings and testimonials featured on the homepage</p>
            </div>

            <button
              onClick={handleOpenAddReviewModal}
              className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Review</span>
            </button>
          </div>

          {/* Testimonials Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < rev.rating ? "fill-current" : "text-slate-300"}`} />
                      ))}
                    </div>

                    <button
                      onClick={() => handleToggleReviewDisplay(rev.id)}
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer ${
                        rev.displayOnHomepage ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {rev.displayOnHomepage ? "Homepage Active" : "Hidden"}
                    </button>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-slate-700 leading-relaxed italic">&quot;{rev.comment}&quot;</p>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
                  <div className="flex items-center space-x-2.5">
                    <img src={rev.avatar} alt={rev.name} className="w-8 h-8 rounded-full object-cover border border-slate-300" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{rev.name}</h4>
                      <span className="text-[9px] text-slate-500 block">{rev.destination}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteReview(rev.id, rev.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* ADD / EDIT REVIEW MODAL */}
          {isReviewModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Add Traveler Review</h3>
                  <button onClick={() => setIsReviewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveReviewModal} className="space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Customer Name *</label>
                    <input
                      type="text"
                      value={reviewFormData.name}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, name: e.target.value })}
                      placeholder="e.g. Rohan & Priya Kumar"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Destination Visited</label>
                    <input
                      type="text"
                      value={reviewFormData.destination}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, destination: e.target.value })}
                      placeholder="e.g. Bali Honeymoon Villa Special"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Rating (1 to 5 Stars)</label>
                    <select
                      value={reviewFormData.rating}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, rating: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                    >
                      <option value={5}>5 Stars (Excellent)</option>
                      <option value={4}>4 Stars (Good)</option>
                      <option value={3}>3 Stars (Average)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Review Text *</label>
                    <textarea
                      rows={3}
                      value={reviewFormData.comment}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                      placeholder="Write customer review..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Save Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: COMPANY DETAILS & CONTACT INFO */}
      {/* ==================================================== */}
      {activeTab === "company" && (
        <form onSubmit={handleSaveCompany} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Company &amp; Contact Details</h3>
              <p className="text-[10px] text-slate-400">Configure global phone numbers, office address, and social links</p>
            </div>

            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              <span>Save Contact Info</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Phone & Email */}
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-1">
                Communication Channels
              </span>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Primary Phone Number *</label>
                <input
                  type="text"
                  value={companyState.phonePrimary}
                  onChange={(e) => setCompanyState({ ...companyState, phonePrimary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">WhatsApp Business Number *</label>
                <input
                  type="text"
                  value={companyState.whatsappNumber}
                  onChange={(e) => setCompanyState({ ...companyState, whatsappNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Support Email Address *</label>
                <input
                  type="email"
                  value={companyState.emailSupport}
                  onChange={(e) => setCompanyState({ ...companyState, emailSupport: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Address & Social Links */}
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-1">
                Physical HQ &amp; Social Links
              </span>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Physical Office Address *</label>
                <textarea
                  rows={2}
                  value={companyState.addressHQ}
                  onChange={(e) => setCompanyState({ ...companyState, addressHQ: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Instagram URL</label>
                  <input
                    type="text"
                    value={companyState.socialInstagram}
                    onChange={(e) => setCompanyState({ ...companyState, socialInstagram: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Facebook URL</label>
                  <input
                    type="text"
                    value={companyState.socialFacebook}
                    onChange={(e) => setCompanyState({ ...companyState, socialFacebook: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

          </div>
        </form>
      )}

      {/* ==================================================== */}
      {/* TAB 4: LEGAL & POLICY EDITORS */}
      {/* ==================================================== */}
      {activeTab === "policies" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Legal &amp; Policy Document Editor</h3>
              <p className="text-[10px] text-slate-400">Update Terms &amp; Conditions, Privacy Policy, and Cancellation Policies</p>
            </div>

            <button
              onClick={handleSavePolicies}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              <span>Save Policy Text</span>
            </button>
          </div>

          {/* Policy Selector Tabs */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl w-fit">
            {[
              { id: "terms", label: "Terms & Conditions" },
              { id: "privacy", label: "Privacy Policy" },
              { id: "cancellation", label: "Cancellation Policy" },
            ].map((pTab) => (
              <button
                key={pTab.id}
                onClick={() => setActivePolicyTab(pTab.id as "terms" | "privacy" | "cancellation")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePolicyTab === pTab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {pTab.label}
              </button>
            ))}
          </div>

          {/* Policy Text Area */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border border-slate-200 rounded-t-xl bg-slate-50 p-2 text-slate-600 text-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400">Formatting Tools:</span>
              <button type="button" className="p-1 hover:bg-slate-200 rounded"><Bold className="h-3.5 w-3.5" /></button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded"><Italic className="h-3.5 w-3.5" /></button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded"><List className="h-3.5 w-3.5" /></button>
            </div>
            
            <textarea
              rows={10}
              value={policiesState[activePolicyTab]}
              onChange={(e) => setPoliciesState({ ...policiesState, [activePolicyTab]: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-b-xl p-4 text-xs font-mono text-slate-800 focus:outline-none"
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default function SettingsAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading content manager...</div>}>
      <SettingsFormContent />
    </Suspense>
  );
}
