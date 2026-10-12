/**
 * EVENTORA DOMAIN TYPES
 * =====================
 * These mirror the backend DTOs exactly (see ../../../../ARCHITECTURE.md §3).
 * If a backend field name changes, this file is the only place to fix it.
 */

/* ------------------------------------------------------------------ enums */

export type Role = "ADMIN" | "ORGANIZER" | "ATTENDEE";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type RegistrationStatus = "CONFIRMED" | "PENDING" | "CANCELLED" | "REFUNDED";

export type TicketStatus = "VALID" | "USED" | "REFUNDED" | "EXPIRED";

export type PaymentMethod = "CARD" | "UPI" | "NETBANKING" | "WALLET";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type EventActionType =
  | "CREATE_EVENT"
  | "UPDATE_EVENT"
  | "CHANGE_CAPACITY"
  | "PUBLISH_EVENT"
  | "CANCEL_EVENT"
  | "DELETE_EVENT"
  | "ADD_TICKET"
  | "UPDATE_TICKET";

/* ------------------------------------------------------------- envelopes */

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  errorCode: string;
  timestamp: string;
  path?: string;
  errors?: Record<string, string>;
}

export interface Paged<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/* --------------------------------------------------------------- entities */

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
}

export interface OrganizerSummary {
  id: number;
  name: string;
  avatarUrl?: string | null;
}

export interface TicketTier {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  available: number;
  maxPerOrder: number;
  sold: boolean;
}

export interface Speaker {
  id: number;
  name: string;
  title: string;
  company?: string | null;
  photoUrl?: string | null;
}

export interface AgendaItem {
  id: number;
  startsAt: string;
  title: string;
  description?: string | null;
  speaker?: string | null;
}

export interface Review {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/* ----------------------------------------------------------------- events */

export interface EventCard {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string | null;
  coverImageUrl?: string | null;
  category: Category;
  organizer: OrganizerSummary;
  startAt: string;
  endAt: string;
  venueName: string;
  city: string;
  country: string;
  price: number;
  status: EventStatus;
  capacity: number;
  availableSeats: number;
  registrationCount: number;
  featured: boolean;
  tags: string[];
}

export interface EventDetail extends EventCard {
  description: string;
  addressLine: string;
  latitude?: number | null;
  longitude?: number | null;
  tickets: TicketTier[];
  speakers: Speaker[];
  agenda: AgendaItem[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

/* ----------------------------------------------------------- registration */

export interface AttendeeDetails {
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface RegisterRequest {
  ticketTierId: number;
  quantity: number;
  attendee: AttendeeDetails;
  paymentMethod: PaymentMethod;
  couponCode?: string | null;
}

export interface AuthRegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "ORGANIZER" | "ATTENDEE";
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  qrPayload: string;
  eventTitle: string;
  eventStartAt: string;
  venueName: string;
  city: string;
  holderName: string;
  seatLabel?: string | null;
  tierName: string;
  price: number;
  status: TicketStatus;
}

export interface Registration {
  id: number;
  bookingRef: string;
  event: EventCard;
  quantity: number;
  totalAmount: number;
  status: RegistrationStatus;
  createdAt: string;
  ticket?: Ticket | null;
}

/* ----------------------------------------------------------------- action */

export interface EventAction {
  id: number;
  eventId: number;
  eventTitle: string;
  type: EventActionType;
  description: string;
  actor: { id: number; name: string };
  undone: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------- dashboard */

export interface SeriesPoint {
  month: string;
  revenue: number;
  registrations: number;
}

export interface OrganizerDashboard {
  stats: {
    revenue: number;
    registrations: number;
    events: number;
    attendees: number;
    conversionRate: number;
  };
  series: SeriesPoint[];
  categorySplit: { name: string; value: number }[];
  upcoming: EventCard[];
  recentActivity: EventAction[];
  topEvents: { event: EventCard; registrations: number; revenue: number }[];
}

export interface SystemHealth {
  status: "UP" | "DEGRADED" | "DOWN";
  database: { status: string; responseTimeMs: number };
  memory: { usedMb: number; maxMb: number; percent: number };
  uptimeSeconds: number;
  activeRequests: number;
}

export interface AdminDashboard {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: { role: Role; count: number }[];
  };
  events: { total: number; published: number; cancelled: number; draft: number };
  registrations: { total: number; thisMonth: number; growthPercent: number };
  revenue: { total: number; thisMonth: number; series: SeriesPoint[] };
  popularCategories: { name: string; count: number }[];
  recentRegistrations: {
    id: number;
    attendee: string;
    eventTitle: string;
    amount: number;
    createdAt: string;
  }[];
  recentActivity: EventAction[];
  systemHealth: SystemHealth;
}

/* ---------------------------------------------------------------- filters */

export interface EventQuery {
  page?: number;
  size?: number;
  sort?: string;
  category?: string;
  status?: EventStatus;
  city?: string;
  q?: string;
  from?: string;
  to?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

/* ----------------------------------------------------------------- auth */

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}
