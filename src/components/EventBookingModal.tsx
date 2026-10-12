import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  MapPin,
  QrCode,
  ShieldCheck,
  Ticket,
  Wallet,
  X,
} from "lucide-react";
import { registrationApi } from "@/services/eventApi";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { formatDate, formatDateTime, priceLabel } from "@/utils/format";
import type { EventDetail, TicketTier, Registration, PaymentMethod } from "@/types";

interface EventBookingModalProps {
  event: EventDetail;
  onClose: () => void;
}

export function EventBookingModal({ event, onClose }: EventBookingModalProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const notifySuccess = useToastStore((state) => state.success);
  const notifyError = useToastStore((state) => state.error);

  const availableTiers = event.tickets.filter((t) => !t.sold && t.available > 0);
  const defaultTier = availableTiers[0] ?? event.tickets[0];

  const [selectedTier, setSelectedTier] = useState<TicketTier | undefined>(defaultTier);
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Registration | null>(null);

  const maxSelectable = selectedTier
    ? Math.min(selectedTier.maxPerOrder || 5, selectedTier.available, event.availableSeats)
    : 1;

  const unitPrice = selectedTier?.price ?? event.price ?? 0;
  const totalPrice = unitPrice * quantity;

  async function handleBook(e: FormEvent) {
    e.preventDefault();
    if (!selectedTier) {
      setError("Please select a ticket tier.");
      return;
    }
    if (!user) {
      setError("Please sign in first to complete booking.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await registrationApi.register(event.id, {
        ticketTierId: selectedTier.id,
        quantity,
        attendee: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
        paymentMethod,
      });

      setConfirmedBooking(res);
      notifySuccess("Spots Confirmed!", `Successfully booked ${quantity} ticket(s) for ${event.title}`);
      await queryClient.invalidateQueries({ queryKey: ["event", String(event.id)] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String(err.message) : "Failed to book tickets.";
      setError(msg);
      notifyError("Booking Failed", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="relative my-8 w-full max-w-xl rounded-[28px] border border-white/10 bg-[#10111f] p-6 shadow-[0_30px_100px_-20px_rgba(0,0,0,.9)] sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close booking modal"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        {confirmedBooking ? (
          /* CONFIRMED BOOKING SCREEN */
          <div className="space-y-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-400">Booking Confirmed</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold">You're on the guest list!</h2>
              <p className="mt-2 text-sm text-white/60">
                Booking Reference: <strong className="font-mono text-indigo-300">{confirmedBooking.bookingRef}</strong>
              </p>
            </div>

            {/* Ticket Pass Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 text-left space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-200 border border-indigo-500/30">
                    {confirmedBooking.event.category?.name || "Event"}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-white leading-tight">{event.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                    <MapPin size={13} className="text-fuchsia-400" /> {event.venueName}, {event.city}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                    <CalendarDays size={13} className="text-indigo-400" /> {formatDate(event.startAt)} · {formatDateTime(event.startAt)}
                  </p>
                </div>

                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white/[0.08] text-white/80 border border-white/10">
                  <QrCode size={30} />
                </div>
              </div>

              <div className="border-t border-dashed border-white/10 pt-3">
                <p className="text-xs font-medium text-white/40">Issued Passes ({confirmedBooking.quantity}):</p>
                <div className="mt-2 space-y-2">
                  {confirmedBooking.ticket ? (
                    <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2.5 text-xs">
                      <div>
                        <span className="font-mono font-bold text-indigo-200">{confirmedBooking.ticket.ticketNumber}</span>
                        <span className="ml-2 text-white/40">Seat: {confirmedBooking.ticket.seatLabel || "GEN-1"}</span>
                      </div>
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {confirmedBooking.ticket.status}
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white/[0.03] p-2.5 text-xs text-white/60">
                      {confirmedBooking.quantity} Seat(s) Reserved for {confirmedBooking.bookingRef}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/45 pt-1">
                <span>Attendee: <strong className="text-white/80">{fullName}</strong></span>
                <span>Total Paid: <strong className="text-emerald-300">{priceLabel(confirmedBooking.totalAmount)}</strong></span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition shadow-lg shadow-indigo-950/40"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* BOOKING FORM */
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Ticket size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">Reserve Your Spot</p>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{event.title}</h2>
              </div>
            </div>

            <form onSubmit={handleBook} className="mt-6 space-y-5">
              {error && (
                <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              {/* 1. Ticket Tier selection */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2">Select Ticket Tier</label>
                <div className="space-y-2">
                  {event.tickets.map((tier) => {
                    const isSelected = selectedTier?.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => !tier.sold && setSelectedTier(tier)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                          tier.sold
                            ? "opacity-45 border-white/[0.05] bg-white/[0.01] cursor-not-allowed"
                            : isSelected
                            ? "border-indigo-400 bg-indigo-500/15 shadow-sm"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{tier.name}</p>
                          <p className="text-xs text-white/45">{tier.description || `${tier.available} spots left`}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-300">{priceLabel(tier.price)}</p>
                          <p className="text-[11px] text-white/40">{tier.sold ? "Sold out" : `${tier.available} left`}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Quantity Selector */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2">
                  How many spots? (Max {maxSelectable})
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].slice(0, Math.max(1, maxSelectable)).map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setQuantity(n)}
                      className={`h-11 w-12 rounded-xl border text-sm font-bold transition ${
                        quantity === n
                          ? "border-indigo-400 bg-indigo-500 text-white shadow-md shadow-indigo-950/50"
                          : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="text-xs text-white/40 ml-2">
                    {event.availableSeats} spots remain in venue
                  </span>
                </div>
              </div>

              {/* 3. Attendee details */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-white/70">
                  Full Name *
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Name"
                    className="field-glass mt-1.5 h-10 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-white/70">
                  Email Address *
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="field-glass mt-1.5 h-10 text-sm"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70">
                  Phone Number
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="field-glass mt-1.5 h-10 text-sm"
                  />
                </label>
              </div>

              {/* 4. Payment method */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CARD")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                      paymentMethod === "CARD"
                        ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                    }`}
                  >
                    <CreditCard size={15} /> Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                      paymentMethod === "UPI"
                        ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                    }`}
                  >
                    <Wallet size={15} /> UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("NETBANKING")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                      paymentMethod === "NETBANKING"
                        ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                    }`}
                  >
                    <ShieldCheck size={15} /> NetBanking
                  </button>
                </div>
              </div>

              {/* Total & Submit */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40">Total Amount ({quantity} spot{quantity > 1 ? "s" : ""})</p>
                  <p className="text-2xl font-bold font-display text-emerald-300">
                    {priceLabel(totalPrice)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={busy || event.availableSeats === 0}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 hover:brightness-110 disabled:opacity-50 transition"
                >
                  {busy && <LoaderCircle size={16} className="animate-spin" />}
                  Confirm & Reserve
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
