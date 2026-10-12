import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Plus,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { eventApi } from "@/services/eventApi";
import { dashboardApi } from "@/services/dashboardApi";
import { useToastStore } from "@/store/toastStore";
import { formatDate, priceLabel } from "@/utils/format";
import type { EventCard } from "@/types";

interface OrganizerEventsModalProps {
  onClose: () => void;
  onCreateNew: () => void;
}

export function OrganizerEventsModal({ onClose, onCreateNew }: OrganizerEventsModalProps) {
  const queryClient = useQueryClient();
  const notifySuccess = useToastStore((state) => state.success);
  const notifyError = useToastStore((state) => state.error);

  const dashboardQuery = useQuery({
    queryKey: ["organizerDashboard"],
    queryFn: dashboardApi.organizer,
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => eventApi.publish(id),
    onSuccess: (data) => {
      notifySuccess("Event Published", `"${data.title}" is now open for bookings.`);
      void queryClient.invalidateQueries({ queryKey: ["organizerDashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: any) => notifyError("Publish Failed", err?.message || "Failed to publish."),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => eventApi.cancel(id),
    onSuccess: (data) => {
      notifySuccess("Event Cancelled", `"${data.title}" has been cancelled.`);
      void queryClient.invalidateQueries({ queryKey: ["organizerDashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: any) => notifyError("Cancel Failed", err?.message || "Failed to cancel."),
  });

  const stats = dashboardQuery.data?.stats;
  const events = dashboardQuery.data?.upcoming ?? [];

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="relative my-8 w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#10111e] p-6 shadow-[0_30px_100px_-20px_rgba(0,0,0,.9)] sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">Organizer Portal</p>
              <h2 className="text-2xl font-bold tracking-tight">Your Hosted Events</h2>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onCreateNew();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-950/40 hover:brightness-110 transition"
          >
            <Plus size={15} /> Create Event
          </button>
        </div>

        {/* Stats strip */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-[11px] uppercase tracking-wider text-white/40">Total Events</p>
              <p className="mt-1 text-xl font-bold text-white">{stats.events}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-[11px] uppercase tracking-wider text-white/40">Registrations</p>
              <p className="mt-1 text-xl font-bold text-indigo-300">{stats.registrations}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-[11px] uppercase tracking-wider text-white/40">Attendees</p>
              <p className="mt-1 text-xl font-bold text-cyan-300">{stats.attendees}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-[11px] uppercase tracking-wider text-white/40">Total Revenue</p>
              <p className="mt-1 text-xl font-bold text-emerald-300">{priceLabel(stats.revenue)}</p>
            </div>
          </div>
        )}

        {/* Events list */}
        <div className="mt-6 space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
          {dashboardQuery.isLoading && (
            <div className="py-12 text-center text-sm text-white/50">Loading your events...</div>
          )}

          {!dashboardQuery.isLoading && events.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.05] text-white/40">
                <CalendarDays />
              </div>
              <p className="text-sm font-semibold text-white/80">No events created yet</p>
              <p className="mt-1 text-xs text-white/45">Start by publishing your first event with custom spots and price.</p>
              <button
                onClick={() => {
                  onClose();
                  onCreateNew();
                }}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/30 transition"
              >
                <Plus size={14} /> Create Event Now
              </button>
            </div>
          )}

          {events.map((ev: EventCard) => (
            <div
              key={ev.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-200 border border-indigo-500/30">
                    {ev.category?.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      ev.status === "PUBLISHED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : ev.status === "DRAFT"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{ev.title}</h3>
                <p className="flex items-center gap-1.5 text-xs text-white/50">
                  <CalendarDays size={13} className="text-indigo-400" /> {formatDate(ev.startAt)}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-white/50">
                  <MapPin size={13} className="text-fuchsia-400" /> {ev.venueName}, {ev.city}
                </p>

                {/* Spots / Capacity bar */}
                <div className="pt-2 text-xs text-white/60">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span>
                      Spots: <strong className="text-white">{ev.capacity - ev.availableSeats} / {ev.capacity}</strong> filled
                    </span>
                    <span className="text-emerald-300 font-semibold">{priceLabel(ev.price)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round(((ev.capacity - ev.availableSeats) / Math.max(1, ev.capacity)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-white/[0.07] pt-3 sm:pt-0">
                <Link
                  to={`/events/${ev.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 transition"
                >
                  <ExternalLink size={13} /> View Page
                </Link>

                {ev.status === "DRAFT" && (
                  <button
                    onClick={() => publishMutation.mutate(ev.id)}
                    disabled={publishMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30 transition"
                  >
                    <CheckCircle2 size={13} /> Publish
                  </button>
                )}

                {ev.status === "PUBLISHED" && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to cancel "${ev.title}"?`)) {
                        cancelMutation.mutate(ev.id);
                      }
                    }}
                    disabled={cancelMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
                  >
                    <XCircle size={13} /> Cancel Event
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
