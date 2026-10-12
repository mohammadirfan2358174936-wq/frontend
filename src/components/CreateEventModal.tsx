import { useState, useEffect, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  DollarSign,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  Sparkles,
  Ticket,
  Users,
  X,
  CheckCircle2,
} from "lucide-react";
import { categoryApi } from "@/services/dashboardApi";
import { eventApi } from "@/services/eventApi";
import { useToastStore } from "@/store/toastStore";
import type { Category } from "@/types";

interface CreateEventModalProps {
  onClose: () => void;
  onSuccess?: (eventId: number) => void;
}

const COVER_PRESETS = [
  {
    name: "Tech Summit",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "Concert & Music",
    url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "Conference & Keynote",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "Art & Exhibition",
    url: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "Dining & Festival",
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85",
  },
];

export function CreateEventModal({ onClose, onSuccess }: CreateEventModalProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const notifySuccess = useToastStore((state) => state.success);
  const notifyError = useToastStore((state) => state.error);

  // Form states
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  
  // Time
  const defaultStart = new Date(Date.now() + 7 * 86400000);
  defaultStart.setHours(10, 0, 0, 0);
  const defaultEnd = new Date(defaultStart.getTime() + 8 * 3600000);
  
  const toLocalIso = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [startAtLocal, setStartAtLocal] = useState(toLocalIso(defaultStart));
  const [endAtLocal, setEndAtLocal] = useState(toLocalIso(defaultEnd));

  // Venue
  const [venueName, setVenueName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [country, setCountry] = useState("India");

  // Spots (Capacity) & Price
  const [capacity, setCapacity] = useState<number>(200);
  const [price, setPrice] = useState<number>(499);
  const [tierName, setTierName] = useState("General Admission");

  // Visuals
  const [coverImageUrl, setCoverImageUrl] = useState(COVER_PRESETS[0].url);
  const [publishImmediately, setPublishImmediately] = useState(true);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Categories query
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list,
  });

  useEffect(() => {
    if (categoriesQuery.data && categoriesQuery.data.length > 0 && categoryId === null) {
      setCategoryId(categoriesQuery.data[0].id);
    }
  }, [categoriesQuery.data, categoryId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError("Please select an event category.");
      return;
    }
    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (new Date(endAtLocal) <= new Date(startAtLocal)) {
      setError("End time must be after start time.");
      return;
    }
    if (capacity < 1) {
      setError("Capacity (spots) must be at least 1.");
      return;
    }
    if (price < 0) {
      setError("Price cannot be negative.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const startAtIso = new Date(startAtLocal).toISOString();
      const endAtIso = new Date(endAtLocal).toISOString();

      const payload = {
        title: title.trim(),
        categoryId,
        shortDescription: shortDescription.trim() || title.trim(),
        description: description.trim() || shortDescription.trim() || title.trim(),
        coverImageUrl: coverImageUrl.trim(),
        startAt: startAtIso,
        endAt: endAtIso,
        venueName: venueName.trim(),
        addressLine: addressLine.trim() || venueName.trim(),
        city: city.trim(),
        country: country.trim(),
        capacity: Number(capacity),
        price: Number(price),
        status: publishImmediately ? "PUBLISHED" : "DRAFT",
        tickets: [
          {
            name: tierName.trim() || "General Admission",
            description: `Full access admission (${capacity} spots)`,
            price: Number(price),
            quantityTotal: Number(capacity),
            maxPerOrder: Math.min(10, Number(capacity)),
          },
        ],
      };

      const created = await eventApi.create(payload);
      notifySuccess("Event Created Successfully!", `"${created.title}" is now live with ${capacity} spots.`);
      
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["featured-events"] });

      onClose();
      if (onSuccess) {
        onSuccess(created.id);
      } else {
        navigate(`/events/${created.id}`);
      }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String(err.message) : "Failed to create event.";
      setError(msg);
      notifyError("Creation Failed", msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-3 sm:p-5 backdrop-blur-md overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="relative my-8 w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#0f101c] p-6 shadow-[0_30px_100px_-20px_rgba(0,0,0,.9)] sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">Organizer Studio</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Create New Event</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-6">
          {error && (
            <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-200">
              {error}
            </div>
          )}

          {/* 1. Core Info */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">1. Basic Details</h3>
            
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <label className="block text-xs font-medium text-white/70">
                Event Title *
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI & Cloud Architecture Summit 2026"
                  className="field-glass mt-1.5 h-11 text-sm font-medium"
                />
              </label>

              <label className="block text-xs font-medium text-white/70">
                Category *
                <select
                  value={categoryId ?? ""}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="field-glass mt-1.5 h-11 text-sm font-medium bg-[#131422]"
                >
                  {categoriesQuery.data?.map((c: Category) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-xs font-medium text-white/70">
              Short Teaser (1-2 sentences) *
              <input
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief highlight shown on search and discovery cards"
                className="field-glass mt-1.5 h-10 text-sm"
              />
            </label>

            <label className="block text-xs font-medium text-white/70">
              Full Event Description
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed schedule, speaker highlights, and agenda..."
                className="field-glass mt-1.5 py-2.5 text-sm"
              />
            </label>
          </div>

          {/* 2. Venue & Time */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">2. Venue & Date / Time</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium text-white/70">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-400" /> Start Date & Time *</span>
                <input
                  type="datetime-local"
                  required
                  value={startAtLocal}
                  onChange={(e) => setStartAtLocal(e.target.value)}
                  className="field-glass mt-1.5 h-11 text-sm"
                />
              </label>

              <label className="block text-xs font-medium text-white/70">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-violet-400" /> End Date & Time *</span>
                <input
                  type="datetime-local"
                  required
                  value={endAtLocal}
                  onChange={(e) => setEndAtLocal(e.target.value)}
                  className="field-glass mt-1.5 h-11 text-sm"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium text-white/70">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-fuchsia-400" /> Venue Name *</span>
                <input
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. HITEX Exhibition Center"
                  className="field-glass mt-1.5 h-11 text-sm"
                />
              </label>

              <label className="block text-xs font-medium text-white/70">
                Street Address *
                <input
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Trade Fair Rd, Izzat Nagar"
                  className="field-glass mt-1.5 h-11 text-sm"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium text-white/70">
                City *
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="field-glass mt-1.5 h-11 text-sm"
                />
              </label>

              <label className="block text-xs font-medium text-white/70">
                Country *
                <input
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India"
                  className="field-glass mt-1.5 h-11 text-sm"
                />
              </label>
            </div>
          </div>

          {/* 3. Spots & Price (The core requested feature!) */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/[0.15] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                3. Spots & Pricing Setup
              </h3>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-200 border border-indigo-500/30">
                Primary Settings
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-xs font-medium text-white/70">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Users size={14} className="text-indigo-400" />
                  Total Spots (Capacity) *
                </span>
                <input
                  type="number"
                  min={1}
                  max={50000}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="field-glass mt-1.5 h-11 text-base font-semibold text-indigo-100"
                />
                <span className="mt-1 block text-[11px] text-white/40">Total available seats</span>
              </label>

              <label className="block text-xs font-medium text-white/70">
                <span className="flex items-center gap-1.5 text-white/90">
                  <DollarSign size={14} className="text-emerald-400" />
                  Price Per Each Spot *
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  required
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="field-glass mt-1.5 h-11 text-base font-semibold text-emerald-300"
                />
                <span className="mt-1 block text-[11px] text-white/40">Enter 0 for free events</span>
              </label>

              <label className="block text-xs font-medium text-white/70">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Ticket size={14} className="text-fuchsia-400" />
                  Ticket Tier Name
                </span>
                <input
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  placeholder="General Admission"
                  className="field-glass mt-1.5 h-11 text-sm font-medium"
                />
                <span className="mt-1 block text-[11px] text-white/40">Label shown on ticket</span>
              </label>
            </div>

            {/* Quick summary calculation */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>
                  Configured: <strong className="text-white">{capacity} spots</strong> at{" "}
                  <strong className="text-emerald-300">{price === 0 ? "Free" : `₹${price} / spot`}</strong>
                </span>
              </span>
              <span className="text-white/45">
                Potential Gross Revenue:{" "}
                <strong className="text-indigo-200">
                  {price === 0 ? "₹0 (Free)" : `₹${(capacity * price).toLocaleString()}`}
                </strong>
              </span>
            </div>
          </div>

          {/* 4. Cover Photo Preset */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">4. Visual Presentation</h3>
            
            <p className="text-xs text-white/55">Choose a cover image preset or enter custom image URL:</p>
            <div className="flex flex-wrap gap-2">
              {COVER_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setCoverImageUrl(preset.url)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                    coverImageUrl === preset.url
                      ? "border-indigo-400 bg-indigo-500/20 text-indigo-100 shadow-sm"
                      : "border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <label className="block text-xs font-medium text-white/70">
              <span className="flex items-center gap-1.5"><ImageIcon size={14} className="text-cyan-400" /> Cover Image URL</span>
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
                className="field-glass mt-1.5 h-10 text-xs text-white/75"
              />
            </label>
          </div>

          {/* 5. Publish Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div>
              <p className="text-sm font-semibold text-white/90">Publish Immediately</p>
              <p className="text-xs text-white/45">Make the event visible to attendees and open ticket booking right away.</p>
            </div>
            <input
              type="checkbox"
              checked={publishImmediately}
              onChange={(e) => setPublishImmediately(e.target.checked)}
              className="h-5 w-5 accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 hover:brightness-110 disabled:opacity-55 transition"
            >
              {submitting && <LoaderCircle size={16} className="animate-spin" />}
              {publishImmediately ? "Publish Event & Open Spots" : "Save as Draft"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
