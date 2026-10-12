import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, QrCode, Ticket, X } from "lucide-react";
import { registrationApi } from "@/services/eventApi";
import { formatDate } from "@/utils/format";

interface MyTicketsModalProps {
  onClose: () => void;
}

export function MyTicketsModal({ onClose }: MyTicketsModalProps) {
  const ticketsQuery = useQuery({
    queryKey: ["myTickets"],
    queryFn: () => registrationApi.myTickets({ size: 50 }),
  });

  const tickets = ticketsQuery.data?.content ?? [];

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
        className="relative my-8 w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#10111e] p-6 shadow-[0_30px_100px_-20px_rgba(0,0,0,.9)] sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Ticket size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">My Passes</p>
            <h2 className="text-2xl font-bold tracking-tight">Your Event Tickets</h2>
          </div>
        </div>

        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {ticketsQuery.isLoading && (
            <div className="py-12 text-center text-sm text-white/50">Loading your tickets...</div>
          )}

          {!ticketsQuery.isLoading && tickets.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.05] text-white/40">
                <Ticket />
              </div>
              <p className="text-sm font-semibold text-white/80">No tickets found</p>
              <p className="mt-1 text-xs text-white/45">You haven't registered for any events yet.</p>
              <button
                onClick={onClose}
                className="mt-5 inline-flex rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/30 transition"
              >
                Browse Events
              </button>
            </div>
          )}

          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="space-y-1.5">
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-200 border border-indigo-500/30">
                  {t.tierName}
                </span>
                <h3 className="text-base font-bold text-white">{t.eventTitle}</h3>
                <p className="flex items-center gap-1.5 text-xs text-white/50">
                  <CalendarDays size={13} className="text-indigo-400" /> {formatDate(t.eventStartAt)}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-white/50">
                  <MapPin size={13} className="text-fuchsia-400" /> {t.venueName}, {t.city}
                </p>
                <div className="pt-1 text-xs text-white/40">
                  Seat: <strong className="text-white/80">{t.seatLabel || "General"}</strong> · Holder:{" "}
                  <strong className="text-white/80">{t.holderName}</strong>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-white/[0.07] pt-3 sm:pt-0">
                <div className="flex items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/[0.06] text-white/70 border border-white/10">
                    <QrCode size={26} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-indigo-300">{t.ticketNumber}</p>
                  <span className="inline-block mt-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    {t.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
