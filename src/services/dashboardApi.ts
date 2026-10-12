import { apiClient, toQuery, unwrap } from "./apiClient";
import type { AdminDashboard, Category, EventCard, OrganizerDashboard, Paged } from "@/types";

export const categoryApi = {
  async list(): Promise<Category[]> {
    const r = await apiClient.get("/categories");
    return r.data.data;
  },

  async events(slug: string, params: { page?: number; size?: number } = {}): Promise<Paged<EventCard>> {
    const r = await apiClient.get(`/categories/${encodeURIComponent(slug)}/events${toQuery(params)}`);
    return r.data.data;
  },
};

export const dashboardApi = {
  async organizer(): Promise<OrganizerDashboard> {
    return unwrap(apiClient.get("/dashboard/organizer"));
  },

  async admin(): Promise<AdminDashboard> {
    return unwrap(apiClient.get("/dashboard/admin"));
  },
};
