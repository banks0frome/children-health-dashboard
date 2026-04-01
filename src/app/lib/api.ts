const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text().catch(() => "Unknown error");
    throw new Error(`API error ${res.status}: ${error}`);
  }
  return res.json();
}

export const api = {
  // Submissions
  listSubmissions: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ submissions: import("./types").Submission[] }>(`/submissions${qs}`);
  },
  getSubmission: (id: string) =>
    request<{ submission: import("./types").Submission }>(`/submissions/${id}`),
  updateSubmission: (id: string, data: Record<string, unknown>) =>
    request<{ submission: import("./types").Submission }>(`/submissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  approveSubmission: (id: string) =>
    request<{ submission: import("./types").Submission }>(`/submissions/${id}/approve`, {
      method: "POST",
    }),
  denySubmission: (id: string, reason: string) =>
    request<{ submission: import("./types").Submission }>(`/submissions/${id}/deny`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  // Stats
  getStatsOverview: () =>
    request<import("./types").StatsOverview>("/stats/overview"),
  getStatsAnalytics: (range?: string) =>
    request<Record<string, unknown>>(`/stats/analytics${range ? `?range=${range}` : ""}`),

  // AI
  classifySubmission: (id: string) =>
    request<{ classification: import("./types").AIClassification }>(`/ai/classify`, {
      method: "POST",
      body: JSON.stringify({ submission_id: id }),
    }),
  getInsights: (id: string) =>
    request<Record<string, unknown>>(`/ai/insights/${id}`, { method: "POST" }),
  getStaffRecommendation: (id: string) =>
    request<Record<string, unknown>>(`/ai/staff/${id}`, { method: "POST" }),
  chat: (message: string) =>
    request<{ response: string }>(`/ai/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  markReviewed: (id: string) =>
    request<{ submission: import("./types").Submission }>(`/submissions/${id}/mark-reviewed`, {
      method: "POST",
    }),
};
