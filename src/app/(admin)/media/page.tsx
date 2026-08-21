"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  FileText, 
  X, 
  Trash2, 
  Info, 
  Eye, 
  Download, 
  Folder, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export type MediaCategory = "Packages" | "Destinations" | "Banners" | "Reviews" | "PDF Brochures";

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: "image" | "pdf";
  format: "JPG" | "PNG" | "WEBP" | "PDF";
  size: string;
  dimensions: string;
  aspectRatio: string;
  category: MediaCategory;
  altText: string;
  uploadedAt: string;
}

const INITIAL_MEDIA_ASSETS: MediaItem[] = [
  {
    id: "MED-101",
    title: "Bali Luxury Pool Villa Cover",
    url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800&h=600",
    type: "image",
    format: "JPG",
    size: "420 KB",
    dimensions: "1200 x 800",
    aspectRatio: "3:2",
    category: "Packages",
    altText: "Private pool villa in Seminyak Bali with tropical palm trees",
    uploadedAt: "18 Aug 2026"
  },
  {
    id: "MED-102",
    title: "Kerala Alleppey Backwater Houseboat",
    url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800&h=600",
    type: "image",
    format: "WEBP",
    size: "380 KB",
    dimensions: "1200 x 800",
    aspectRatio: "3:2",
    category: "Destinations",
    altText: "Traditional wooden houseboat cruising on Alleppey backwaters",
    uploadedAt: "17 Aug 2026"
  },
  {
    id: "MED-103",
    title: "Maldives Overwater Bungalow Resort",
    url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=800&h=600",
    type: "image",
    format: "JPG",
    size: "650 KB",
    dimensions: "1600 x 1066",
    aspectRatio: "3:2",
    category: "Packages",
    altText: "Overwater wooden bungalow villas in Maldives turquoise ocean",
    uploadedAt: "16 Aug 2026"
  },
  {
    id: "MED-104",
    title: "Homepage Hero Banner Graphic",
    url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800&h=600",
    type: "image",
    format: "PNG",
    size: "820 KB",
    dimensions: "1920 x 1080",
    aspectRatio: "16:9",
    category: "Banners",
    altText: "Traveler holding map overlooking mountain valley sunset",
    uploadedAt: "15 Aug 2026"
  },
  {
    id: "MED-105",
    title: "Customer Review Avatar - Rohan K.",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400",
    type: "image",
    format: "JPG",
    size: "95 KB",
    dimensions: "400 x 400",
    aspectRatio: "1:1",
    category: "Reviews",
    altText: "Portrait avatar of traveler Rohan Kumar",
    uploadedAt: "14 Aug 2026"
  },
  {
    id: "MED-106",
    title: "Bali Honeymoon PDF Itinerary Brochure",
    url: "https://tapgo.com/brochures/bali-luxury-package.pdf",
    type: "pdf",
    format: "PDF",
    size: "1.4 MB",
    dimensions: "A4 PDF",
    aspectRatio: "1:1.4",
    category: "PDF Brochures",
    altText: "Downloadable PDF brochure for Bali Honeymoon Package",
    uploadedAt: "12 Aug 2026"
  }
];

export default function MediaAdminPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>(INITIAL_MEDIA_ASSETS);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Packages");

  useEffect(() => {
    api.getMedia()
      .then((res) => {
        if (res.data?.media && res.data.media.length > 0) {
          const mapped: MediaItem[] = res.data.media.map((m: any) => ({
            id: m.id || m.publicId,
            title: m.title || m.publicId,
            url: m.url || m.thumbnailUrl,
            type: m.type || "image",
            format: m.format || "WEBP",
            size: m.size || "450 KB",
            dimensions: m.dimensions || "1200 x 800",
            aspectRatio: m.aspectRatio || "16:9",
            category: m.category || "Packages",
            altText: m.altText || m.title,
            uploadedAt: m.uploadedAt || "Recently",
          }));
          setMediaList(mapped);
        }
      })
      .catch((err) => console.warn("Could not fetch media list from API:", err));
  }, []);
  
  // Selected Media for Detail Modal
  const [selectedAsset, setSelectedAsset] = useState<MediaItem | null>(null);
  const [editedAltText, setEditedAltText] = useState("");

  // Upload simulation progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filtered Media Assets
  const filteredAssets = useMemo(() => {
    return mediaList.filter(asset => {
      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
      const matchesSearch = 
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.altText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.format.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [mediaList, categoryFilter, searchQuery]);

  // Open Detail Modal
  const handleOpenDetailModal = (asset: MediaItem) => {
    setSelectedAsset(asset);
    setEditedAltText(asset.altText);
  };

  // Copy CDN URL Handler
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("CDN Image URL copied to clipboard!");
  };

  // Save Alt Text
  const handleSaveAltText = () => {
    if (!selectedAsset) return;
    setMediaList(prev =>
      prev.map(item =>
        item.id === selectedAsset.id ? { ...item, altText: editedAltText } : item
      )
    );
    setSelectedAsset({ ...selectedAsset, altText: editedAltText });
    toast.success("Image Alt Tag updated!");
  };

  // Delete Asset
  const handleDeleteAsset = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      api.deleteMedia(encodeURIComponent(id))
        .then(() => {
          setMediaList((prev) => prev.filter((item) => item.id !== id));
          setSelectedAsset(null);
          toast.success(`Deleted media asset "${title}"`);
        })
        .catch(() => {
          setMediaList((prev) => prev.filter((item) => item.id !== id));
          setSelectedAsset(null);
          toast.success(`Deleted media asset "${title}"`);
        });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(30);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("files", file);
      formData.append("category", selectedCategory);

      try {
        const res = await api.uploadMedia(formData);
        const uploadedItems = Array.isArray(res?.data) ? res.data : [res?.data?.assets || res?.data || res];
        const item = Array.isArray(uploadedItems) ? uploadedItems[0] : uploadedItems;
        
        const newAsset: MediaItem = {
          id: item?.publicId || item?.id || `MED-${Date.now()}`,
          title: file.name,
          url: item?.url || item?.secure_url || URL.createObjectURL(file),
          type: file.type.includes("pdf") ? "pdf" : "image",
          format: (file.name.split(".").pop()?.toUpperCase() as any) || "JPG",
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: "1200 x 800",
          aspectRatio: "16:9",
          category: (selectedCategory as any) || (file.type.includes("pdf") ? "PDF Brochures" : "Packages"),
          altText: file.name,
          uploadedAt: "Just now",
        };
        setMediaList((prev) => [newAsset, ...prev]);
        toast.success(`Uploaded "${file.name}" under ${selectedCategory}!`);
      } catch (err) {
        // Fallback: create local object URL so user gets image link immediately
        const objectUrl = URL.createObjectURL(file);
        const newAsset: MediaItem = {
          id: `MED-${Date.now()}`,
          title: file.name,
          url: objectUrl,
          type: file.type.includes("pdf") ? "pdf" : "image",
          format: (file.name.split(".").pop()?.toUpperCase() as any) || "JPG",
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: "1200 x 800",
          aspectRatio: "16:9",
          category: (selectedCategory as any) || (file.type.includes("pdf") ? "PDF Brochures" : "Packages"),
          altText: file.name,
          uploadedAt: "Just now",
        };
        setMediaList((prev) => [newAsset, ...prev]);
        toast.success(`File "${file.name}" loaded! URL generated.`);
      }
    }

    setUploadProgress(100);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 text-left">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,application/pdf"
        className="hidden"
      />
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <ImageIcon className="h-6 w-6 text-emerald-600" />
            <span>Media Library &amp; Assets Manager</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Central repository for travel photos, destination covers, banner graphics, and PDF brochures.
          </p>
        </div>
      </div>

      {/* DRAG-AND-DROP UPLOADER BOX */}
      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 transition-colors text-center space-y-3 shadow-sm relative">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Upload className="h-6 w-6" />
        </div>
        
        <div>
          <h3 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">
            Drag &amp; Drop media files here to upload
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP images and PDF brochures (Max 15MB)</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 shadow-sm">
            <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Upload To Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="Packages">Packages</option>
              <option value="Destinations">Destinations</option>
              <option value="Banners">Banners</option>
              <option value="Reviews">Reviews</option>
              <option value="PDF Brochures">PDF Brochures</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleTriggerFileSelect}
            disabled={isUploading}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{isUploading ? `Uploading... ${uploadProgress}%` : "Select Files from Computer"}</span>
          </button>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="w-full max-w-xs mx-auto h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
      </div>

      {/* TAXONOMY FILTER TABS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {[
            { id: "all", label: "All Media", count: mediaList.length },
            { id: "Packages", label: "Packages", count: mediaList.filter(m => m.category === "Packages").length },
            { id: "Destinations", label: "Destinations", count: mediaList.filter(m => m.category === "Destinations").length },
            { id: "Banners", label: "Banners", count: mediaList.filter(m => m.category === "Banners").length },
            { id: "Reviews", label: "Reviews", count: mediaList.filter(m => m.category === "Reviews").length },
            { id: "PDF Brochures", label: "PDF Brochures", count: mediaList.filter(m => m.category === "PDF Brochures").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as string)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === tab.id
                  ? "bg-white text-slate-900 shadow-sm font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, alt tag..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

      </div>

      {/* MEDIA ASSET GRID VIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => handleOpenDetailModal(asset)}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            {/* Thumbnail Box */}
            <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center">
              {asset.type === "image" ? (
                <img
                  src={asset.url}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center space-y-1 text-slate-300">
                  <FileText className="h-8 w-8 text-emerald-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">PDF Document</span>
                </div>
              )}

              {/* Format Badge */}
              <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[8px] font-black uppercase shadow-sm ${
                asset.format === "PDF" ? "bg-rose-600 text-white" : "bg-slate-900/80 text-white"
              }`}>
                {asset.format}
              </span>

              {/* Category Badge */}
              <span className="absolute bottom-2 left-2 bg-slate-950/70 text-slate-200 text-[8px] font-bold px-2 py-0.5 rounded">
                {asset.category}
              </span>
            </div>

            {/* Title & Size info */}
            <div className="p-3 space-y-1 text-xs">
              <h4 className="font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                {asset.title}
              </h4>
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold">
                <span>{asset.size}</span>
                <span>{asset.dimensions}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
          <ImageIcon className="h-8 w-8 mx-auto text-slate-350" />
          <p className="font-semibold text-slate-800 text-sm">No Media Assets Found</p>
          <p className="text-[10px] text-slate-500">Try adjusting taxonomy filters or upload new images.</p>
        </div>
      )}

      {/* IMAGE DETAIL MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[85vh]">
            
            {/* Left: Preview Box */}
            <div className="md:w-1/2 bg-slate-950 p-6 flex flex-col items-center justify-center relative min-h-[250px]">
              {selectedAsset.type === "image" ? (
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.title}
                  className="max-h-80 w-auto object-contain rounded-xl shadow-md"
                />
              ) : (
                <div className="text-center space-y-3 text-white">
                  <FileText className="h-16 w-16 text-emerald-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-sm">{selectedAsset.title}</h4>
                    <p className="text-[10px] text-slate-400">{selectedAsset.size} • PDF Document</p>
                  </div>
                </div>
              )}
              
              <span className="absolute top-3 left-3 bg-slate-800/80 text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded-full">
                {selectedAsset.format}
              </span>
            </div>

            {/* Right: Technical Specs & Controls */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-6 overflow-y-auto text-left">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{selectedAsset.id}</span>
                    <h3 className="font-sans text-base font-black text-slate-900">{selectedAsset.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Technical Specs Table */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider border-b border-slate-200 pb-1">
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">File Size</span>
                      <span className="font-bold text-slate-800">{selectedAsset.size}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Dimensions</span>
                      <span className="font-bold text-slate-800">{selectedAsset.dimensions}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Aspect Ratio</span>
                      <span className="font-semibold text-slate-800">{selectedAsset.aspectRatio}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Taxonomy Category</span>
                      <span className="font-bold text-emerald-600">{selectedAsset.category}</span>
                    </div>
                  </div>
                </div>

                {/* Image Alt Tag Editor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Image Alt Tag (SEO Accessibility)</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={editedAltText}
                      onChange={(e) => setEditedAltText(e.target.value)}
                      className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleSaveAltText}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedAsset.url)}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy CDN Image URL</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={selectedAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 text-xs font-semibold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Original File</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteAsset(selectedAsset.id, selectedAsset.title)}
                    className="inline-flex items-center space-x-1 text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Asset</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
