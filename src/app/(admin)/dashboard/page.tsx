"use client";

import React, { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  Users, 
  Compass, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
  MessageSquare,
  Search,
  Filter,
  Check,
  Plus,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// MOCK DATA ARRAYS FOR API WIRING
// ==========================================

const METRIC_CARDS_DATA = [
  { 
    id: "enquiries",
    name: "Total Enquiries", 
    value: "324", 
    change: "+12.4%", 
    isPositive: true, 
    timeframe: "vs last month",
    icon: MessageSquare, 
    color: "bg-blue-500 text-white" 
  },
  { 
    id: "revenue",
    name: "Revenue Generated", 
    value: "₹18,42,000", 
    change: "+15.2%", 
    isPositive: true, 
    timeframe: "vs last month",
    icon: DollarSign, 
    color: "bg-emerald-500 text-white" 
  },
  { 
    id: "packages",
    name: "Active Packages", 
    value: "18", 
    change: "+4 added", 
    isPositive: true, 
    timeframe: "this month",
    icon: Compass, 
    color: "bg-indigo-500 text-white" 
  },
  { 
    id: "destinations",
    name: "Top Destination", 
    value: "Bali, Indonesia", 
    change: "47 Bookings", 
    isPositive: true, 
    timeframe: "highest converter",
    icon: MapPin, 
    color: "bg-amber-500 text-white" 
  }
];

const PIPELINE_STATUS_DATA = [
  { id: "all", label: "All Leads", count: 12, color: "border-slate-300 text-slate-800 bg-slate-50" },
  { id: "new", label: "New Leads", count: 4, color: "border-blue-300 text-blue-700 bg-blue-50/50" },
  { id: "in_progress", label: "In Progress", count: 3, color: "border-amber-300 text-amber-700 bg-amber-50/50" },
  { id: "quote_sent", label: "Quote Sent", count: 3, color: "border-purple-300 text-purple-700 bg-purple-50/50" },
  { id: "won", label: "Won", count: 2, color: "border-emerald-300 text-emerald-700 bg-emerald-50/50" }
];

const RECENT_ENQUIRIES_DATA = [
  {
    id: "ENQ-001",
    name: "Rohan Kumar",
    phone: "+91 98765 43210",
    email: "rohan.kumar@gmail.com",
    packageTitle: "Bali Romance & Luxury Villas Special",
    date: "19 Aug 2026",
    status: "new",
    notes: "Requires flower decorations and private candle-light dinner setup."
  },
  {
    id: "ENQ-002",
    name: "Pooja Sharma",
    phone: "+91 87654 32109",
    email: "pooja.sharma@yahoo.com",
    packageTitle: "Kerala Houseboats & Munnar Hills Escapes",
    date: "18 Aug 2026",
    status: "in_progress",
    notes: "Prefers pure vegetarian meals and standard SUV transfers."
  },
  {
    id: "ENQ-003",
    name: "Kabir Mehta",
    phone: "+91 76543 21098",
    email: "kabir.mehta@outlook.com",
    packageTitle: "Maldives Luxury Overwater Stays Special",
    date: "17 Aug 2026",
    status: "quote_sent",
    notes: "Asking for dynamic pricing adjustments on water activities bundle."
  },
  {
    id: "ENQ-004",
    name: "Dr. Ananya Nair",
    phone: "+91 99887 76655",
    email: "ananya.nair@apollo.org",
    packageTitle: "Ooty Botanical Hills & Tea Estates Special",
    date: "16 Aug 2026",
    status: "won",
    notes: "Deposit paid. Booking confirmed for 4 adults."
  },
  {
    id: "ENQ-005",
    name: "Vikram Singh",
    phone: "+91 88776 65544",
    email: "vikram.singh@gmail.com",
    packageTitle: "Shimla Budget Special Tour",
    date: "15 Aug 2026",
    status: "new",
    notes: "Planning a quick weekend trip for 2 people."
  },
  {
    id: "ENQ-006",
    name: "Meera Sen",
    phone: "+91 77665 54433",
    email: "meera.sen@wipro.com",
    packageTitle: "Dubai Heights & Desert Dunes Special",
    date: "14 Aug 2026",
    status: "in_progress",
    notes: "Requires a wheelchair-accessible hotel room."
  }
];

const ENQUIRIES_CHART_RAW = {
  daily: [
    { label: "Mon", value: 12 },
    { label: "Tue", value: 18 },
    { label: "Wed", value: 15 },
    { label: "Thu", value: 25 },
    { label: "Fri", value: 22 },
    { label: "Sat", value: 30 },
    { label: "Sun", value: 28 },
  ],
  weekly: [
    { label: "Week 1", value: 75 },
    { label: "Week 2", value: 92 },
    { label: "Week 3", value: 80 },
    { label: "Week 4", value: 110 },
  ],
  monthly: [
    { label: "Mar", value: 280 },
    { label: "Apr", value: 320 },
    { label: "May", value: 290 },
    { label: "Jun", value: 350 },
    { label: "Jul", value: 310 },
    { label: "Aug", value: 420 },
  ]
};

const CATEGORY_DONUT_DATA = [
  { name: "Honeymoon & Romantic", count: 145, percentage: 45, color: "#FF3E7F" },
  { name: "Family Holidays", count: 96, percentage: 30, color: "#FF8C37" },
  { name: "Adventure & Hills", count: 48, percentage: 15, color: "#009B9E" },
  { name: "Corporate Travels", count: 35, percentage: 10, color: "#6366F1" },
];

const PENDING_TASKS_DATA = [
  { id: 1, text: "Finalize customized itinerary proposal for Rohan Kumar (Bali)", done: false, priority: "High", date: "Today" },
  { id: 2, text: "Call Pooja Sharma regarding vegetarian food requests (Kerala)", done: false, priority: "Medium", date: "Today" },
  { id: 3, text: "Upload updated rate cards for Shimla Winter Package", done: false, priority: "Low", date: "Tomorrow" },
  { id: 4, text: "Approve pending review submitted by Dr. Ananya Nair", done: false, priority: "Low", date: "21 Aug" }
];

export default function DashboardPage() {
  // ------------------------------------------
  // STATE MANAGEMENT
  // ------------------------------------------
  const [pipelineFilter, setPipelineFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [chartTimeframe, setChartTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");
  const [tasks, setTasks] = useState(PENDING_TASKS_DATA);
  const [hoveredDonut, setHoveredDonut] = useState<number | null>(null);
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    api.getDashboardStats()
      .then((res) => {
        if (res.data) {
          setLiveStats(res.data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch live dashboard stats:", err);
      });
  }, []);

  // ------------------------------------------
  // INTERACTIVE GRAPHICS HELPERS
  // ------------------------------------------
  const activeChartPoints = useMemo(() => {
    return ENQUIRIES_CHART_RAW[chartTimeframe];
  }, [chartTimeframe]);

  // Find max chart value to scale SVG height
  const maxChartValue = useMemo(() => {
    if (!activeChartPoints || activeChartPoints.length === 0) return 1;
    const vals = activeChartPoints.map(p => p?.value || 0);
    return Math.max(...vals, 1);
  }, [activeChartPoints]);

  const chartPaths = useMemo(() => {
    if (!activeChartPoints || activeChartPoints.length === 0) {
      return { area: "", line: "" };
    }
    const pointsCount = activeChartPoints.length;
    const denominator = pointsCount > 1 ? pointsCount - 1 : 1;
    
    const startY = 180 - (((activeChartPoints[0]?.value || 0) / maxChartValue) * 140);
    
    const pathSegments = activeChartPoints.map((point, index) => {
      const x = 40 + (index / denominator) * 520;
      const y = 180 - (((point?.value || 0) / maxChartValue) * 140);
      return `L ${x},${y}`;
    }).join(" ");
    
    const area = `M 40,${startY} ${pathSegments} L 560,180 L 40,180 Z`;
    const line = `M 40,${startY} ${pathSegments}`;
    
    return { area, line };
  }, [activeChartPoints, maxChartValue]);

  const enquiriesList = useMemo(() => {
    if (!liveStats?.recentLeadsStream) return [];
    return liveStats.recentLeadsStream.map((l: any) => ({
      id: l.leadId || l._id,
      name: l.customer?.name || "Anonymous",
      phone: l.customer?.phone || "+91 98765 43210",
      email: l.customer?.email || "customer@example.com",
      packageTitle: l.packageTitle || l.destination || "Custom Tour",
      date: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "Today",
      status: l.leadStatus === "converted" ? "won" : (l.leadStatus || "new"),
      notes: l.specialRequirements || "Lead enquiry submitted online.",
    }));
  }, [liveStats]);

  // Filtered Leads list
  const filteredEnquiries = useMemo(() => {
    return enquiriesList.filter((enq: any) => {
      const matchesPipeline = pipelineFilter === "all" || enq.status === pipelineFilter;
      const matchesSearch = 
        enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.phone.includes(searchTerm) ||
        enq.packageTitle.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPipeline && matchesSearch;
    });
  }, [enquiriesList, pipelineFilter, searchTerm]);

  // ------------------------------------------
  // EVENT ACTIONS
  // ------------------------------------------
  const handleTaskToggle = (id: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
    toast.success("Task status updated!");
  };

  const handleWhatsappTrigger = (name: string, phone: string) => {
    const text = encodeURIComponent(`Hello ${name}, thank you for your travel enquiry with Tap & Go. A travel planner is preparing your customized itinerary quote.`);
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${text}`;
    toast.success(`Redirecting to WhatsApp for traveler: ${name}`);
    setTimeout(() => {
      window.open(url, "_blank");
    }, 800);
  };

  const metricsCards = useMemo(() => {
    return [
      { 
        id: "enquiries",
        name: "Total Enquiries", 
        value: liveStats?.metrics?.totalLeads ?? "0", 
        change: `${liveStats?.metrics?.weeklyGrowthPercentage > 0 ? '+' : ''}${liveStats?.metrics?.weeklyGrowthPercentage || 0}%`, 
        isPositive: (liveStats?.metrics?.weeklyGrowthPercentage || 0) >= 0, 
        timeframe: "vs last week",
        icon: MessageSquare, 
        color: "bg-blue-500 text-white" 
      },
      { 
        id: "revenue",
        name: "Revenue Generated", 
        value: "₹0", 
        change: "0%", 
        isPositive: true, 
        timeframe: "this month",
        icon: DollarSign, 
        color: "bg-emerald-500 text-white" 
      },
      { 
        id: "packages",
        name: "Active Packages", 
        value: liveStats?.metrics?.totalActivePackages ?? "0", 
        change: "0 added", 
        isPositive: true, 
        timeframe: "this month",
        icon: Compass, 
        color: "bg-indigo-500 text-white" 
      },
      { 
        id: "destinations",
        name: "Active Destinations", 
        value: liveStats?.metrics?.totalDestinations ?? "0", 
        change: "Active regions", 
        isPositive: true, 
        timeframe: "total regions",
        icon: MapPin, 
        color: "bg-amber-500 text-white" 
      }
    ];
  }, [liveStats]);

  const pipelineStatusData = useMemo(() => {
    const sb = liveStats?.statusBreakdown || {};
    const total = liveStats?.metrics?.totalLeads || 0;
    return [
      { id: "all", label: "All Leads", count: total, color: "border-slate-300 text-slate-800 bg-slate-50" },
      { id: "new", label: "New Leads", count: sb.new || 0, color: "border-blue-300 text-blue-700 bg-blue-50/50" },
      { id: "in_progress", label: "In Progress", count: (sb.contacted || 0) + (sb.negotiating || 0), color: "border-amber-300 text-amber-700 bg-amber-50/50" },
      { id: "quote_sent", label: "Quote Sent", count: sb.quote_sent || 0, color: "border-purple-300 text-purple-700 bg-purple-50/50" },
      { id: "won", label: "Won", count: sb.converted || 0, color: "border-emerald-300 text-emerald-700 bg-emerald-50/50" }
    ];
  }, [liveStats]);

  return (
    <div className="space-y-8 text-left">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze enquiry conversion pipelines, customer leads, and website operations metrics.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>Data Refreshed: Just Now</span>
        </div>
      </div>

      {/* 1. KEY PERFORMANCE METRIC CARDS (Top Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{card.name}</span>
                <h3 className="text-2xl font-black text-slate-900 leading-none">{card.value}</h3>
                <div className="flex items-center space-x-1">
                  <span className={`text-[10px] font-extrabold flex items-center ${card.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {card.isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {card.change}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">{card.timeframe}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center shadow-md shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. LEAD PIPELINE OVERVIEW (Middle Section) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Pipeline Summary Cards Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <div>
            <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Lead Conversion Pipeline</h3>
            <p className="text-[10px] text-slate-400">Click any card below to filter recent incoming enquiries by pipeline stage</p>
          </div>
          
          {/* Interactive Pipeline Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {pipelineStatusData.map((status) => (
              <button
                key={status.id}
                onClick={() => setPipelineFilter(status.id)}
                className={`border rounded-xl p-3 text-left transition-all relative cursor-pointer active:scale-[0.98] ${status.color} ${
                  pipelineFilter === status.id 
                    ? "ring-2 ring-slate-450 border-transparent shadow-sm" 
                    : "hover:scale-[1.01]"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider block opacity-70">{status.label}</span>
                <span className="text-xl font-black block mt-1">{status.count}</span>
                <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">Records active</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search enquiries by traveler name, package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none"
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Stage:</span>
            <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {pipelineFilter === "all" ? "All Stages" : pipelineFilter.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Recent Enquiries Table */}
        <div className="overflow-x-auto">
          {filteredEnquiries.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">ID &amp; Traveler</th>
                  <th className="py-3 px-6">Target Trip</th>
                  <th className="py-3 px-6">Travel Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEnquiries.map((enq: any) => (
                  <tr key={enq.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* ID & Traveler */}
                    <td className="py-4.5 px-6">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">{enq.id}</span>
                        <span className="font-bold text-slate-800 text-sm block">{enq.name}</span>
                        <span className="text-[10px] text-slate-500 block">{enq.email}</span>
                      </div>
                    </td>
                    
                    {/* Target Trip */}
                    <td className="py-4.5 px-6 max-w-xs">
                      <div>
                        <span className="font-semibold text-slate-700 block line-clamp-1">{enq.packageTitle}</span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1 italic mt-0.5">&quot;{enq.notes}&quot;</span>
                      </div>
                    </td>

                    {/* Travel Date */}
                    <td className="py-4.5 px-6 text-slate-600 font-medium">
                      {enq.date}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4.5 px-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        enq.status === 'new' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        enq.status === 'in_progress' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        enq.status === 'quote_sent' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                        'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {enq.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-4.5 px-6 text-right">
                      <button
                        onClick={() => handleWhatsappTrigger(enq.name, enq.phone)}
                        className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all border border-emerald-250 cursor-pointer active:scale-[0.98]"
                      >
                        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.202-1.362a9.92 9.92 0 0 0 4.81 1.238h.005c5.507 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.178-2.923-7.062A9.92 9.92 0 0 0 12.012 2zm5.726 14.194c-.25.7-1.444 1.282-1.986 1.354-.49.063-.974.296-3.141-.607-2.775-1.155-4.574-3.98-4.713-4.164-.139-.185-1.127-1.503-1.127-2.868 0-1.366.712-2.036.966-2.308.254-.272.56-.34.746-.34.187 0 .374.002.535.008.17.007.397-.065.622.48.232.56.792 1.93.86 2.062.068.136.113.294.022.477-.09.183-.135.295-.27.452-.136.158-.285.353-.408.473-.136.136-.28.285-.12.56.16.275.71 1.17 1.523 1.89.195.173.376.326.545.457.942.73 1.636.786 2.072.573.435-.213.953-.873 1.077-1.154.124-.282.25-.24.42-.178.17.062 1.077.508 1.263.6.186.093.31.139.356.22.046.082.046.474-.204 1.173z" />
                        </svg>
                        <span>Chat WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <AlertCircle className="h-8 w-8 mx-auto text-slate-350" />
              <p className="font-semibold text-slate-800 text-sm">No Enquiries Found</p>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">No records matched your search parameters. Try adjusting filters or keyword searches.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. ANALYTICS CHARTS (Bottom Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Enquiries Over Time Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Enquiry Traffic Logs</h3>
              <p className="text-[10px] text-slate-400">Total incoming leads traffic activity</p>
            </div>
            
            {/* Daily/Weekly/Monthly Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/30">
              {["daily", "weekly", "monthly"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf as "daily" | "weekly" | "monthly")}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    chartTimeframe === tf 
                      ? "bg-white text-slate-900 shadow-sm font-black" 
                      : "text-slate-550 hover:text-slate-800"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Custom SVG Simulated Interactive Chart */}
          <div className="relative h-64 w-full flex items-end pt-8">
            <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#009B9E" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#009B9E" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line 
                  key={i} 
                  x1="0" 
                  y1={20 + ratio * 150} 
                  x2="600" 
                  y2={20 + ratio * 150} 
                  stroke="#E2E8F0" 
                  strokeDasharray="4 4" 
                  strokeWidth="1" 
                />
              ))}

              {/* Area path */}
              <path
                d={chartPaths.area}
                fill="url(#chartGradient)"
              />

              {/* Line path */}
              <path
                d={chartPaths.line}
                fill="none"
                stroke="#009B9E"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Circles & Labels */}
              {activeChartPoints.map((point, index) => {
                const pointsCount = activeChartPoints.length;
                const denominator = pointsCount > 1 ? pointsCount - 1 : 1;
                const x = 40 + (index / denominator) * 520;
                const y = 180 - (((point?.value || 0) / maxChartValue) * 140);
                return (
                  <g key={index} className="group/node cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#FFF"
                      stroke="#009B9E"
                      strokeWidth="3"
                      className="transition-transform duration-200 group-hover/node:scale-150"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="#009B9E"
                      fillOpacity="0"
                      className="hover:fill-opacity-10 transition-all"
                    />
                    {/* Node Tooltip Label */}
                    <g className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-200">
                      <rect 
                        x={x - 25} 
                        y={y - 35} 
                        width="50" 
                        height="24" 
                        rx="6" 
                        fill="#0F172A" 
                        className="shadow-md"
                      />
                      <text 
                        x={x} 
                        y={y - 19} 
                        fill="#FFF" 
                        fontSize="10" 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {point.value}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Custom Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {activeChartPoints.map((point, i) => (
                <span key={i}>{point.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Donut Chart: Enquiries breakdown by Travel Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="text-left border-b border-slate-100 pb-3">
            <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Category Breakdown</h3>
            <p className="text-[10px] text-slate-400">Enquiries classified by package theme</p>
          </div>

          {/* Interactive Donut Render */}
          <div className="relative h-44 flex items-center justify-center">
            <svg width="180" height="180" viewBox="0 0 100 100" className="transform -rotate-90">
              {CATEGORY_DONUT_DATA.map((cat, idx) => {
                const strokeDasharray = `${cat.percentage} ${100 - cat.percentage}`;
                const strokeDashoffset = 100 - CATEGORY_DONUT_DATA.slice(0, idx).reduce((sum, c) => sum + c.percentage, 0);
                
                return (
                  <circle
                    key={cat.name}
                    cx="50"
                    cy="50"
                    r="35"
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth="11"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 hover:stroke-[13] cursor-pointer"
                    onMouseEnter={() => setHoveredDonut(idx)}
                    onMouseLeave={() => setHoveredDonut(null)}
                  />
                );
              })}
              <circle cx="50" cy="50" r="28" fill="#FFF" />
            </svg>

            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800 leading-none">
                {hoveredDonut !== null ? `${CATEGORY_DONUT_DATA[hoveredDonut].percentage}%` : "324"}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 leading-none">
                {hoveredDonut !== null ? CATEGORY_DONUT_DATA[hoveredDonut].name.split(" ")[0] : "Leads Total"}
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-[10px]">
            {CATEGORY_DONUT_DATA.map((cat, i) => (
              <div 
                key={cat.name} 
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                  hoveredDonut === i ? "bg-slate-50 font-bold" : ""
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-650 tracking-wide">{cat.name}</span>
                </div>
                <div className="text-right font-black text-slate-900">
                  <span>{cat.count} ({cat.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. QUICK TASKS / REMINDERS WIDGET */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Urgent Action Reminders</h3>
            <p className="text-[10px] text-slate-400">Important tasks requiring immediate action today</p>
          </div>
          <button 
            onClick={() => toast.success("Feature to add custom tasks coming soon!")}
            className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 font-bold text-[10px] uppercase tracking-wider cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
                task.done 
                  ? "bg-slate-50/50 border-slate-150 opacity-60 line-through" 
                  : "bg-white border-slate-200/80 shadow-sm hover:border-slate-300"
              }`}
            >
              <div className="flex items-start space-x-3 text-xs">
                {/* Task checkbox */}
                <button
                  onClick={() => handleTaskToggle(task.id)}
                  className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all cursor-pointer mt-0.5 shrink-0 ${
                    task.done 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-slate-300 hover:border-slate-400 text-transparent"
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[3]" />
                </button>
                
                <div className="space-y-1">
                  <p className={`font-semibold text-slate-700 leading-relaxed ${task.done ? 'text-slate-400' : ''}`}>{task.text}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] text-slate-400 font-medium">Due: {task.date}</span>
                    <span className="text-[8px] font-bold uppercase tracking-wider">•</span>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      task.priority === "High" ? "text-rose-500" :
                      task.priority === "Medium" ? "text-amber-500" : "text-slate-400"
                    }`}>{task.priority} Priority</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
