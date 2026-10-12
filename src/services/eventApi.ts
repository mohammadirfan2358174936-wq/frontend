import { apiClient, toQuery, unwrap } from "./apiClient";
import type {
  AuthResponse,
  EventAction,
  EventCard,
  EventDetail,
  EventQuery,
  LoginRequest,
  Paged,
  RegisterRequest,
  Registration,
  Ticket,
  User,
} from "@/types";

/** Registration & ticketing */
export const registrationApi = {
  async register(eventId: number, body: RegisterRequest): Promise<Registration> {
    return unwrap(apiClient.post(`/events/${eventId}/register`, body));
  },

  async cancel(eventId: number): Promise<void> {
    await apiClient.delete(`/events/${eventId}/register`);
  },

  async myEvents(params: { page?: number; size?: number } = {}): Promise<Paged<EventCard>> {
    const r = await apiClient.get(`/users/me/events${toQuery({ ...params, sort: "startAt,asc" })}`);
    return r.data;
  },

  async myRegistrations(params: { page?: number; size?: number } = {}): Promise<Paged<Registration>> {
    const r = await apiClient.get(`/users/me/registrations${toQuery({ ...params, sort: "createdAt,desc" })}`);
    return r.data;
  },

  async myTickets(params: { page?: number; size?: number } = {}): Promise<Paged<Ticket>> {
    const r = await apiClient.get(`/users/me/tickets${toQuery({ ...params, sort: "id,desc" })}`);
    return r.data;
  },

  async ticket(ticketNumber: string): Promise<Ticket> {
    return unwrap(apiClient.get(`/tickets/${encodeURIComponent(ticketNumber)}`));
  },
};

/** Events & the stack-based activity history. */
export const eventApi = {
  async list(params: EventQuery = {}): Promise<Paged<EventCard>> {
    const r = await apiClient.get(`/events${toQuery({ sort: "startAt,asc", ...params })}`);
    // ApiResponse.paged flattens pagination fields beside the envelope rather
    // than nesting them under `data` (unlike non-paged responses).
    return r.data;
  },

  async featured(size = 6): Promise<EventCard[]> {
    const r = await apiClient.get(`/events/featured${toQuery({ size })}`);
    return r.data.data;
  },

  async byId(id: number | string): Promise<EventDetail> {
    return unwrap(apiClient.get(`/events/${id}`));
  },

  async create(body: unknown): Promise<EventDetail> {
    return unwrap(apiClient.post("/events", body));
  },

  async update(id: number, body: unknown): Promise<EventDetail> {
    return unwrap(apiClient.put(`/events/${id}`, body));
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  async publish(id: number): Promise<EventDetail> {
    return unwrap(apiClient.post(`/events/${id}/publish`));
  },

  async cancel(id: number): Promise<EventDetail> {
    return unwrap(apiClient.post(`/events/${id}/cancel`));
  },

  /** LIFO history — newest action first. */
  async history(id: number): Promise<EventAction[]> {
    const r = await apiClient.get(`/events/${id}/history`);
    return r.data.data;
  },

  /** Pop and reverse the latest action (LIFO). */
  async undo(id: number): Promise<EventAction> {
    return unwrap(apiClient.post(`/events/${id}/undo`));
  },
};

/** Auth */
export const authApi = {
  async register(body: import("@/types").AuthRegisterRequest): Promise<AuthResponse> {
    return unwrap(apiClient.post("/auth/register", body));
  },

  async login(body: LoginRequest): Promise<AuthResponse> {
    return unwrap(apiClient.post("/auth/login", body));
  },

  async me(): Promise<User> {
    return unwrap(apiClient.get("/auth/me"));
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
};
