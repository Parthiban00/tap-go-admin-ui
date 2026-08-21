function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  return url.replace(/\/+$/, "");
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("tapgo_admin_token") : null;

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
    ...options,
    headers,
    credentials: "omit",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API Request Failed");
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: any) => fetchApi<any>("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  getMe: () => fetchApi<any>("/auth/me"),

  // Leads CRM
  getLeads: (status?: string) => fetchApi<any>(`/leads${status ? `?status=${status}` : ""}`),
  updateLeadStatus: (id: string, status: string, notes?: string) =>
    fetchApi<any>(`/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    }),

  // Package Management
  getPackages: () => fetchApi<any>("/packages"),
  createPackage: (data: any) => fetchApi<any>("/packages", { method: "POST", body: JSON.stringify(data) }),
  updatePackage: (id: string, data: any) => fetchApi<any>(`/packages/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePackage: (id: string) => fetchApi<any>(`/packages/${id}`, { method: "DELETE" }),

  // Destination Management
  getDestinations: () => fetchApi<any>("/destinations"),
  createDestination: (data: any) => fetchApi<any>("/destinations", { method: "POST", body: JSON.stringify(data) }),
  updateDestination: (id: string, data: any) => fetchApi<any>(`/destinations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDestination: (id: string) => fetchApi<any>(`/destinations/${id}`, { method: "DELETE" }),

  // Analytics
  getOverviewAnalytics: () => fetchApi<any>("/analytics/overview"),

  // CMS & Global Settings
  getSettings: () => fetchApi<any>("/settings"),
  updateHeroBanner: (data: any) => fetchApi<any>("/settings/hero", { method: "PUT", body: JSON.stringify(data) }),
  updateInfoBar: (data: any) => fetchApi<any>("/settings/infobar", { method: "PUT", body: JSON.stringify(data) }),

  // Media Library
  uploadMedia: (formData: FormData) => fetchApi<any>("/media/upload", { method: "POST", body: formData }),
  getMedia: () => fetchApi<any>("/media"),
};
