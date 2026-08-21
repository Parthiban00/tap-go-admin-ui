"use client";

import React, { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  LayoutGrid, 
  Table as TableIcon, 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  X, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Send, 
  UserCheck, 
  TrendingUp, 
  FileText,
  ArrowRight,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// MOCK LEAD CRM TYPES & DATASET
// ==========================================
export type LeadStatus = "new" | "contacted" | "quote_sent" | "negotiation" | "won" | "lost";
export type LeadSource = "Package Page" | "Custom Trip Form" | "WhatsApp Widget";

export interface TimelineLog {
  id: string;
  timestamp: string;
  text: string;
  author: string;
}

export interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  packageTitle: string;
  destination: string;
  travelDate: string;
  adultsCount: number;
  childrenCount: number;
  source: LeadSource;
  status: LeadStatus;
  budget: string;
  createdAt: string;
  notes: string;
  timeline: TimelineLog[];
}

const KANBAN_COLUMNS: { id: LeadStatus; label: string; color: string; badgeColor: string }[] = [
  { id: "new", label: "New Leads", color: "border-t-blue-500 bg-blue-50/20", badgeColor: "bg-blue-100 text-blue-700" },
  { id: "contacted", label: "Contacted", color: "border-t-amber-500 bg-amber-50/20", badgeColor: "bg-amber-100 text-amber-700" },
  { id: "quote_sent", label: "Quote Sent", color: "border-t-purple-500 bg-purple-50/20", badgeColor: "bg-purple-100 text-purple-700" },
  { id: "negotiation", label: "Negotiation", color: "border-t-orange-500 bg-orange-50/20", badgeColor: "bg-orange-100 text-orange-700" },
  { id: "won", label: "Closed / Won", color: "border-t-emerald-500 bg-emerald-50/20", badgeColor: "bg-emerald-100 text-emerald-700" },
  { id: "lost", label: "Lost", color: "border-t-rose-500 bg-rose-50/20", badgeColor: "bg-rose-100 text-rose-700" },
];

const INITIAL_LEADS: LeadRecord[] = [
  {
    id: "LEAD-301",
    name: "Rohan Kumar",
    phone: "+91 98765 43210",
    email: "rohan.kumar@gmail.com",
    city: "Mumbai",
    packageTitle: "Bali Romance & Luxury Villas Special",
    destination: "Bali, Indonesia",
    travelDate: "12 Oct 2026",
    adultsCount: 2,
    childrenCount: 0,
    source: "Package Page",
    status: "new",
    budget: "Luxury (₹1.5L - ₹2L)",
    createdAt: "20 Aug 2026, 09:30 AM",
    notes: "Client wants flower bed decorations and candle-light dinner on day 2.",
    timeline: [
      { id: "t1", timestamp: "20 Aug 2026, 09:30 AM", text: "Enquiry submitted via Bali Package Page.", author: "System" }
    ]
  },
  {
    id: "LEAD-302",
    name: "Pooja Sharma",
    phone: "+91 87654 32109",
    email: "pooja.sharma@yahoo.com",
    city: "Delhi NCR",
    packageTitle: "Kerala Houseboats & Munnar Hills Escapes",
    destination: "Kerala, India",
    travelDate: "05 Sep 2026",
    adultsCount: 4,
    childrenCount: 2,
    source: "Custom Trip Form",
    status: "contacted",
    budget: "Standard (₹50k - ₹80k)",
    createdAt: "19 Aug 2026, 04:15 PM",
    notes: "Prefers pure vegetarian meals during houseboat stay.",
    timeline: [
      { id: "t1", timestamp: "19 Aug 2026, 04:15 PM", text: "Custom Trip Wizard completed.", author: "System" },
      { id: "t2", timestamp: "19 Aug 2026, 05:30 PM", text: "Staff called customer. Discussion on vegetarian meal options.", author: "Alex Mercer" }
    ]
  },
  {
    id: "LEAD-303",
    name: "Kabir Mehta",
    phone: "+91 76543 21098",
    email: "kabir.mehta@outlook.com",
    city: "Bengaluru",
    packageTitle: "Maldives Luxury Overwater Stays Special",
    destination: "Maldives",
    travelDate: "20 Dec 2026",
    adultsCount: 2,
    childrenCount: 0,
    source: "WhatsApp Widget",
    status: "quote_sent",
    budget: "Premium (₹2L+)",
    createdAt: "18 Aug 2026, 11:20 AM",
    notes: "Sent PDF proposal with water villa transfers included.",
    timeline: [
      { id: "t1", timestamp: "18 Aug 2026, 11:20 AM", text: "Initiated chat on WhatsApp floating widget.", author: "System" },
      { id: "t2", timestamp: "18 Aug 2026, 02:00 PM", text: "Official quote sent via Email & WhatsApp.", author: "Alex Mercer" }
    ]
  },
  {
    id: "LEAD-304",
    name: "Dr. Ananya Nair",
    phone: "+91 99887 76655",
    email: "ananya.nair@apollo.org",
    city: "Chennai",
    packageTitle: "Himachal Scenic Valley & Snow Tops Tour",
    destination: "Himachal, India",
    travelDate: "15 Oct 2026",
    adultsCount: 3,
    childrenCount: 1,
    source: "Package Page",
    status: "negotiation",
    budget: "Standard (₹70k)",
    createdAt: "17 Aug 2026, 02:40 PM",
    notes: "Requesting 5% family discount on hotel upgrades.",
    timeline: [
      { id: "t1", timestamp: "17 Aug 2026, 02:40 PM", text: "Package page enquiry submitted.", author: "System" },
      { id: "t2", timestamp: "18 Aug 2026, 10:00 AM", text: "Negotiating room upgrade rates.", author: "Priya Sharma" }
    ]
  },
  {
    id: "LEAD-305",
    name: "Vikram Singh",
    phone: "+91 88776 65544",
    email: "vikram.singh@gmail.com",
    city: "Chandigarh",
    packageTitle: "Dubai Heights & Desert Dunes Special",
    destination: "Dubai, UAE",
    travelDate: "10 Nov 2026",
    adultsCount: 2,
    childrenCount: 0,
    source: "Custom Trip Form",
    status: "won",
    budget: "Luxury (₹1.8L)",
    createdAt: "15 Aug 2026, 01:10 PM",
    notes: "Booking confirmed! Advance deposit received.",
    timeline: [
      { id: "t1", timestamp: "15 Aug 2026, 01:10 PM", text: "Lead registered via Custom Wizard.", author: "System" },
      { id: "t2", timestamp: "16 Aug 2026, 11:30 AM", text: "Advance deposit received. Booking confirmed!", author: "Alex Mercer" }
    ]
  },
  {
    id: "LEAD-306",
    name: "Meera Sen",
    phone: "+91 77665 54433",
    email: "meera.sen@wipro.com",
    city: "Kolkata",
    packageTitle: "Thailand Island Hopping & Coral Reefs",
    destination: "Thailand",
    travelDate: "01 Sep 2026",
    adultsCount: 2,
    childrenCount: 0,
    source: "Package Page",
    status: "lost",
    budget: "Budget (₹30k)",
    createdAt: "10 Aug 2026, 05:00 PM",
    notes: "Customer booked alternative local travel operator.",
    timeline: [
      { id: "t1", timestamp: "10 Aug 2026, 05:00 PM", text: "Enquiry logged.", author: "System" },
      { id: "t2", timestamp: "12 Aug 2026, 04:00 PM", text: "Customer opted out. Lead closed as Lost.", author: "Priya Sharma" }
    ]
  }
];

export default function LeadsAdminPage() {
  // View mode switcher: "kanban" or "table"
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  
  // Leads Dataset State
  const [leadsList, setLeadsList] = useState<LeadRecord[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  
  // Selected Lead for Drawer Modal
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");

  useEffect(() => {
    api.getLeads("?status=all&limit=50")
      .then((res) => {
        if (res.data?.leads) {
          const mapped: LeadRecord[] = res.data.leads.map((l: any) => ({
            id: l.leadId || l._id,
            name: l.customer?.name || "Anonymous",
            phone: l.customer?.phone || "+91 98765 43210",
            email: l.customer?.email || "customer@example.com",
            city: l.customer?.city || "Mumbai",
            packageTitle: l.packageTitle || l.travelDetails?.destination || "Custom Trip Request",
            destination: l.travelDetails?.destination || l.destination || "Bali, Indonesia",
            travelDate: l.travelDetails?.preferredDate ? new Date(l.travelDetails.preferredDate).toLocaleDateString() : "Flexible",
            adultsCount: l.travelDetails?.adultsCount || 2,
            childrenCount: l.travelDetails?.childrenCount || 0,
            source: l.leadType === "pdf_download" ? "WhatsApp Widget" : l.leadType === "custom_tour" ? "Custom Trip Form" : "Package Page",
            status: l.leadStatus === "converted" ? "won" : l.leadStatus === "negotiating" ? "negotiation" : (l.leadStatus || "new"),
            budget: l.travelDetails?.budgetRange || "Standard",
            createdAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "Just Now",
            notes: l.specialRequirements || "Lead enquiry submitted online.",
            timeline: (l.notes || []).map((n: any, idx: number) => ({
              id: `t-${idx}`,
              timestamp: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Today",
              text: n.note || "Activity log",
              author: n.addedBy ? "Staff" : "System",
            })),
          }));
          setLeadsList(mapped);
        }
      })
      .catch((err) => console.warn("Could not fetch leads from backend API:", err));
  }, []);

  // Filtered Leads Calculation
  const filteredLeads = useMemo(() => {
    return leadsList.filter(lead => {
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
      const matchesDestination = destinationFilter === "all" || lead.destination.toLowerCase().includes(destinationFilter.toLowerCase());
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.packageTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSource && matchesDestination && matchesSearch;
    });
  }, [leadsList, statusFilter, sourceFilter, destinationFilter, searchQuery]);

  // Lead Status Change Handler
  const handleUpdateStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeadsList(prev =>
      prev.map(item => {
        if (item.id === leadId) {
          const updatedTimeline = [
            ...item.timeline,
            {
              id: `t_${Date.now()}`,
              timestamp: "Just now",
              text: `Status updated to ${newStatus.replace("_", " ").toUpperCase()}`,
              author: "Alex Mercer"
            }
          ];
          return { ...item, status: newStatus, timeline: updatedTimeline };
        }
        return item;
      })
    );

    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? {
        ...prev,
        status: newStatus,
        timeline: [
          ...prev.timeline,
          {
            id: `t_${Date.now()}`,
            timestamp: "Just now",
            text: `Status updated to ${newStatus.replace("_", " ").toUpperCase()}`,
            author: "Alex Mercer"
          }
        ]
      } : null);
    }

    toast.success(`Lead status changed to ${newStatus.toUpperCase()}`);
  };

  // Add Note Handler
  const handleAddNote = () => {
    if (!selectedLead || !newNoteText.trim()) return;

    const newLog: TimelineLog = {
      id: `t_${Date.now()}`,
      timestamp: "Just now",
      text: newNoteText.trim(),
      author: "Alex Mercer"
    };

    setLeadsList(prev =>
      prev.map(item =>
        item.id === selectedLead.id
          ? { ...item, timeline: [...item.timeline, newLog] }
          : item
      )
    );

    setSelectedLead({
      ...selectedLead,
      timeline: [...selectedLead.timeline, newLog]
    });

    setNewNoteText("");
    toast.success("Staff note added to timeline!");
  };

  // Export to CSV Feature
  const exportToCSV = () => {
    const headers = ["ID", "Name", "Phone", "Email", "City", "Destination", "Package", "Travel Date", "Adults", "Children", "Source", "Status", "Created At"];
    const rows = filteredLeads.map(l => [
      l.id,
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.city}"`,
      `"${l.destination}"`,
      `"${l.packageTitle}"`,
      `"${l.travelDate}"`,
      l.adultsCount,
      l.childrenCount,
      `"${l.source}"`,
      `"${l.status}"`,
      `"${l.createdAt}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TapGo_Leads_CRM_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredLeads.length} leads to CSV file!`);
  };

  // Quick Action: WhatsApp Trigger
  const triggerWhatsApp = (name: string, phone: string, packageTitle: string) => {
    const msg = encodeURIComponent(`Hello ${name}, thank you for inquiring about "${packageTitle}" with Tap & Go Travels! I have prepared your customized itinerary quote. Should we discuss it over a quick call?`);
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${msg}`;
    toast.success(`Opening WhatsApp Chat for ${name}...`);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="h-6 w-6 text-emerald-600" />
            <span>Lead CRM Console</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track vacation enquiries, manage sales pipelines, log staff activity notes, and connect via WhatsApp.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* CSV Export Button */}
          <button
            onClick={exportToCSV}
            className="inline-flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          {/* Dual Layout View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>

        </div>
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, email, package..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Lead Sources</option>
              <option value="Package Page">Package Page</option>
              <option value="Custom Trip Form">Custom Trip Form</option>
              <option value="WhatsApp Widget">WhatsApp Widget</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Lead Stages</option>
              <option value="new">New Leads</option>
              <option value="contacted">Contacted</option>
              <option value="quote_sent">Quote Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Closed / Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Destination Filter */}
          <div>
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Destinations</option>
              <option value="bali">Bali</option>
              <option value="kerala">Kerala</option>
              <option value="maldives">Maldives</option>
              <option value="himachal">Himachal</option>
              <option value="dubai">Dubai</option>
              <option value="thailand">Thailand</option>
            </select>
          </div>

        </div>
      </div>

      {/* ==================================================== */}
      {/* VIEW MODE 1: INTERACTIVE KANBAN BOARD */}
      {/* ==================================================== */}
      {viewMode === "kanban" && (
        <div className="w-full max-w-full overflow-x-auto pb-6 pt-2">
          <div className="flex items-start space-x-4 min-w-max">
          {KANBAN_COLUMNS.map((col) => {
            const colLeads = filteredLeads.filter(l => l.status === col.id);
            return (
              <div 
                key={col.id} 
                className={`rounded-2xl border border-slate-200/80 p-4 flex flex-col space-y-4 w-72 shrink-0 ${col.color} shadow-sm`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{col.label}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${col.badgeColor}`}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-grow overflow-y-auto max-h-[650px] pr-1">
                  {colLeads.length === 0 ? (
                    <div className="text-center py-8 px-4 border border-dashed border-slate-200/80 rounded-xl">
                      <p className="text-xs font-semibold text-slate-400">No leads</p>
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer space-y-3 group relative"
                      >
                        {/* Header: Lead ID & Source Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{lead.id}</span>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200/60 uppercase">
                            {lead.source.split(" ")[0]}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div>
                          <h4 className="font-black text-slate-900 text-sm tracking-tight group-hover:text-emerald-600 transition-colors">
                            {lead.name}
                          </h4>
                          <div className="flex items-center space-x-1 text-[11px] font-medium text-slate-500 mt-0.5">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.city || "Location N/A"}</span>
                          </div>
                        </div>

                        {/* Package & Trip Details Box */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                          <p className="font-bold text-slate-800 text-xs truncate">{lead.packageTitle}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200/60">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span>{lead.travelDate}</span>
                            </span>
                            <span className="font-extrabold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {lead.adultsCount}A / {lead.childrenCount}C
                            </span>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerWhatsApp(lead.name, lead.phone, lead.packageTitle);
                            }}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-all border border-emerald-200/60"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="h-3 w-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>

                          <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            {col.id !== "new" && (
                              <button
                                type="button"
                                onClick={() => {
                                  const idx = KANBAN_COLUMNS.findIndex(c => c.id === col.id);
                                  if (idx > 0) handleUpdateStatus(lead.id, KANBAN_COLUMNS[idx - 1].id);
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
                                title="Move to Previous Stage"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {col.id !== "lost" && col.id !== "won" && (
                              <button
                                type="button"
                                onClick={() => {
                                  const idx = KANBAN_COLUMNS.findIndex(c => c.id === col.id);
                                  if (idx < KANBAN_COLUMNS.length - 1) handleUpdateStatus(lead.id, KANBAN_COLUMNS[idx + 1].id);
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
                                title="Move to Next Stage"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    )}

      {/* ==================================================== */}
      {/* VIEW MODE 2: ADVANCED DATA TABLE */}
      {/* ==================================================== */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {filteredLeads.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Customer &amp; Contact</th>
                    <th className="py-3.5 px-4">Trip Package</th>
                    <th className="py-3.5 px-4">Travel Date &amp; Pax</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      {/* Customer & Contact */}
                      <td className="py-4 px-6">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block">{lead.id}</span>
                          <span className="font-extrabold text-slate-900 text-xs block">{lead.name}</span>
                          <span className="text-[10px] text-slate-500 block">{lead.phone} • {lead.city}</span>
                        </div>
                      </td>

                      {/* Trip Package */}
                      <td className="py-4 px-4 max-w-xs">
                        <div>
                          <span className="font-bold text-slate-800 block line-clamp-1">{lead.packageTitle}</span>
                          <span className="text-[10px] text-slate-500 block">{lead.destination}</span>
                        </div>
                      </td>

                      {/* Travel Date & Pax */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div>
                          <span className="font-bold text-slate-800 block">{lead.travelDate}</span>
                          <span className="text-[10px] text-slate-500 block">{lead.adultsCount} Adults, {lead.childrenCount} Children</span>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                          {lead.source}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          lead.status === "new" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          lead.status === "contacted" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          lead.status === "quote_sent" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                          lead.status === "negotiation" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                          lead.status === "won" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {lead.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => triggerWhatsApp(lead.name, lead.phone, lead.packageTitle)}
                          className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl border border-emerald-250 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Users className="h-8 w-8 mx-auto text-slate-350" />
                <p className="font-semibold text-slate-800 text-sm">No Leads Found</p>
                <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Try clearing search filters or check another lead stage.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* LEAD DETAIL DRAWER / MODAL */}
      {/* ==================================================== */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{selectedLead.id}</span>
                <h3 className="font-sans text-lg font-black text-slate-900">{selectedLead.name}</h3>
                <span className="text-xs text-slate-500">{selectedLead.city} • Enquired on {selectedLead.createdAt}</span>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="p-6 space-y-6 flex-grow overflow-y-auto text-left">
              
              {/* Quick Action Toolbar */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => triggerWhatsApp(selectedLead.name, selectedLead.phone, selectedLead.packageTitle)}
                  className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </button>

                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Lead</span>
                </a>

                <a
                  href={`mailto:${selectedLead.email}?subject=Tour Quote for ${encodeURIComponent(selectedLead.packageTitle)}`}
                  className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>Email Quote</span>
                </a>
              </div>

              {/* Status Updater */}
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Update Lead Status Stage</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value as LeadStatus)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="new">1. New Lead</option>
                  <option value="contacted">2. Contacted</option>
                  <option value="quote_sent">3. Quote Sent</option>
                  <option value="negotiation">4. Negotiation</option>
                  <option value="won">5. Closed / Won</option>
                  <option value="lost">6. Lost</option>
                </select>
              </div>

              {/* Trip & Contact Details Grid */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 uppercase tracking-wider text-[10px]">Trip Specifications</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Enquired Package</span>
                    <span className="font-bold text-slate-900 block">{selectedLead.packageTitle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Destination</span>
                    <span className="font-bold text-slate-900 block">{selectedLead.destination}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Travel Date</span>
                    <span className="font-semibold text-slate-800 block">{selectedLead.travelDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Travelers Count</span>
                    <span className="font-semibold text-slate-800 block">{selectedLead.adultsCount} Adults, {selectedLead.childrenCount} Children</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lead Source</span>
                    <span className="font-bold text-emerald-600 block">{selectedLead.source}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Budget Preference</span>
                    <span className="font-semibold text-slate-800 block">{selectedLead.budget}</span>
                  </div>
                </div>
              </div>

              {/* Customer Initial Request Note */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Notes / Special Demands</span>
                <p className="text-xs text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 italic">
                  &quot;{selectedLead.notes}&quot;
                </p>
              </div>

              {/* Activity Timeline & Staff Notes */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>Activity Timeline &amp; Staff Notes</span>
                </h4>

                {/* Add Note Box */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add follow-up note or call log..."
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>

                {/* Timeline Logs List */}
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-200">
                  {selectedLead.timeline.map((log) => (
                    <div key={log.id} className="relative space-y-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1 border-2 border-white" />
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>{log.author}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-800 font-semibold">{log.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
