import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check, Clock3, MapPin, Share2, Ticket, Users } from "lucide-react";
import { eventApi } from "@/services";
import { formatDate, formatDateTime, priceLabel } from "@/utils/format";
import { EventBookingModal } from "@/components/EventBookingModal";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const event = useQuery({ queryKey: ["event", id], queryFn: () => eventApi.byId(id!), enabled: Boolean(id) });

  async function share() {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: event.data?.title, url });
    else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  if (event.isLoading) return <main className="container-page py-12"><div className="aspect-[2.3] animate-pulse rounded-[28px] bg-white/[0.05]" /><div className="mt-8 h-8 w-1/2 animate-pulse rounded bg-white/[0.05]" /></main>;
  if (event.isError || !event.data) return <main className="container-page grid min-h-[65vh] place-items-center py-20 text-center"><div><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] text-white/50"><Ticket /></div><h1 className="text-3xl">This event is unavailable</h1><p className="mt-3 text-sm text-white/50">It may have moved, or the event service is taking a break.</p><Link to="/" className="mt-6 inline-flex rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15">Back to events</Link></div></main>;

  const item = event.data;
  return <main className="container-page pb-20 pt-8 sm:pt-12">
    <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Back to exploring</Link>

    <section className="relative mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-[#141521]">
      <div className="relative aspect-[1.45] max-h-[560px] min-h-[300px] sm:aspect-[2.25]">{item.coverImageUrl ? <img src={item.coverImageUrl} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[radial-gradient(circle_at_75%_15%,rgba(192,132,252,.3),transparent_38%),radial-gradient(circle_at_5%_100%,rgba(34,211,238,.17),transparent_40%),linear-gradient(135deg,#211d3b,#10121e_68%)]" />}<div className="absolute inset-0 bg-gradient-to-t from-[#090a12] via-[#090a12]/25 to-black/5" />
        <div className="absolute inset-x-5 bottom-5 flex flex-col justify-between gap-6 sm:inset-x-9 sm:bottom-9 md:flex-row md:items-end"><div className="max-w-3xl"><span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">{item.category.name}</span><h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{item.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">{item.shortDescription}</p></div><button onClick={() => void share()} className="inline-flex h-11 w-fit shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-black/25 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"><Share2 size={16} />{copied ? "Copied" : "Share event"}{copied ? <Check size={15} className="text-emerald-300" /> : null}</button></div>
      </div>
    </section>

    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
      <div className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-3">
          <InfoTile icon={<CalendarDays size={18} />} eyebrow="When" title={formatDate(item.startAt)} detail={formatDateTime(item.startAt)} />
          <InfoTile icon={<MapPin size={18} />} eyebrow="Where" title={item.venueName} detail={[item.city, item.country].filter(Boolean).join(", ")} />
          <InfoTile icon={<Users size={18} />} eyebrow="The room" title={`${item.availableSeats} spots left`} detail={`${item.registrationCount} people are going`} />
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">The experience</p><h2 className="mt-2 text-2xl font-semibold">A little about this one</h2><p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-white/60">{item.description || item.shortDescription || "More details about this event are coming soon."}</p>{item.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-xs text-white/55">#{tag}</span>)}</div>}</section>

        {item.speakers.length > 0 && <section><p className="text-xs font-semibold uppercase tracking-[.2em] text-fuchsia-300">People you’ll meet</p><h2 className="mt-2 text-2xl font-semibold">On the mic</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{item.speakers.map((speaker) => <div key={speaker.id} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">{speaker.photoUrl ? <img src={speaker.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-400/25 to-fuchsia-400/20 font-semibold text-indigo-100">{speaker.name.slice(0, 1)}</div>}<div><p className="font-semibold text-white/90">{speaker.name}</p><p className="mt-1 text-sm text-white/45">{[speaker.title, speaker.company].filter(Boolean).join(" · ")}</p></div></div>)}</div></section>}

        {item.agenda.length > 0 && <section><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-300">The plan</p><h2 className="mt-2 text-2xl font-semibold">A look at the day</h2><div className="mt-5 space-y-3">{item.agenda.map((agenda) => <div key={agenda.id} className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5"><div className="flex min-w-[86px] items-start gap-2 pt-0.5 text-sm font-medium text-cyan-200"><Clock3 size={15} className="mt-0.5" />{new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", hour: "numeric", minute: "2-digit" }).format(new Date(agenda.startsAt))}</div><div><p className="font-semibold">{agenda.title}</p>{agenda.description && <p className="mt-1.5 text-sm leading-6 text-white/50">{agenda.description}</p>}{agenda.speaker && <p className="mt-2 text-xs text-indigo-200/75">with {agenda.speaker}</p>}</div></div>)}</div></section>}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-white/[0.09] bg-[#11121d]/90 p-5 shadow-[0_24px_70px_-40px_rgba(112,88,230,.4)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[.17em] text-white/40">Tickets & pricing</p>
              <p className="mt-1 font-display text-3xl font-semibold">{priceLabel(item.price)}</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-400/10 text-indigo-200">
              <Ticket size={19} />
            </span>
          </div>

          <div className="my-5 h-px bg-white/[0.08]" />

          {item.tickets.length > 0 ? (
            <div className="space-y-3">
              {item.tickets.map((tier) => (
                <div key={tier.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
                  <div>
                    <p className="text-sm font-semibold">{tier.name}</p>
                    {tier.description && <p className="mt-1 text-xs text-white/40">{tier.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{priceLabel(tier.price)}</p>
                    <p className="mt-1 text-[11px] text-white/40">{tier.sold ? "Sold out" : `${tier.available} left`}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/55">Ticket information is coming soon.</p>
          )}

          <div className="mt-5 rounded-xl bg-indigo-400/[0.08] p-3.5 text-xs leading-5 text-indigo-100/80">
            <span className="font-semibold">A heads up:</span>{" "}
            {item.availableSeats > 0 ? `${item.availableSeats} spots remain. The good ones tend to go quickly.` : "This event is fully booked."}
          </div>

          <button
            onClick={() => setBookingOpen(true)}
            disabled={item.availableSeats === 0}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-indigo-950/50 hover:brightness-110 disabled:opacity-45 transition"
          >
            <Ticket size={16} />
            {item.availableSeats > 0 ? "Book Tickets Now" : "Sold Out"}
          </button>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40">
            <CalendarDays size={14} />{formatDate(item.startAt)} · {item.city}
          </p>
        </div>
        <p className="mt-4 text-center text-xs leading-5 text-white/35">
          Hosted by <span className="text-white/65">{item.organizer.name}</span>
        </p>
      </aside>
    </div>

    {bookingOpen && <EventBookingModal event={item} onClose={() => setBookingOpen(false)} />}
  </main>;
}

function InfoTile({ icon, eyebrow, title, detail }: { icon: ReactNode; eyebrow: string; title: string; detail: string }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-indigo-200">{icon}</span><p className="mt-4 text-[11px] font-semibold uppercase tracking-[.16em] text-white/35">{eyebrow}</p><p className="mt-1 line-clamp-1 text-sm font-semibold text-white/90">{title}</p><p className="mt-1 line-clamp-1 text-xs text-white/45">{detail}</p></div>;
}
