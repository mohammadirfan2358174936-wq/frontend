import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, Compass, MapPin, Search, Sparkles, Users } from "lucide-react";
import { categoryApi, eventApi } from "@/services";
import type { EventCard, EventQuery } from "@/types";
import { formatDate, priceLabel } from "@/utils/format";

const PAGE_SIZE = 9;

export function ExplorePage() {
  const [draftSearch, setDraftSearch] = useState("");
  const [filters, setFilters] = useState<EventQuery>({ page: 0, size: PAGE_SIZE, sort: "startAt,asc" });
  const categories = useQuery({ queryKey: ["categories"], queryFn: categoryApi.list });
  const featured = useQuery({ queryKey: ["featured-events"], queryFn: () => eventApi.featured(3) });
  const events = useQuery({ queryKey: ["events", filters], queryFn: () => eventApi.list(filters) });

  const categoryList = useMemo(() => categories.data ?? [], [categories.data]);
  const page = events.data;
  const hasFilters = Boolean(filters.q || filters.city || filters.category || filters.minPrice !== undefined);
  const activeLabel = useMemo(
    () => categoryList.find((category) => category.slug === filters.category)?.name,
    [categoryList, filters.category],
  );

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters((current) => ({ ...current, q: draftSearch.trim() || undefined, page: 0 }));
  }

  function setCategory(category?: string) {
    setFilters((current) => ({ ...current, category, page: 0 }));
  }

  function setCity(city: string) {
    setFilters((current) => ({ ...current, city: city || undefined, page: 0 }));
  }

  function setPrice(minPrice?: number) {
    setFilters((current) => ({ ...current, minPrice, page: 0 }));
  }

  function clearFilters() {
    setDraftSearch("");
    setFilters({ page: 0, size: PAGE_SIZE, sort: "startAt,asc" });
  }

  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="absolute -right-36 -top-64 h-[650px] w-[650px] rounded-full bg-violet-600/20 blur-[130px]" />
          <div className="absolute -left-36 top-28 h-[400px] w-[520px] rounded-full bg-cyan-500/10 blur-[140px]" />
          <div className="absolute inset-0 opacity-[.12]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.6) .7px, transparent .7px)", backgroundSize: "22px 22px", maskImage: "linear-gradient(to bottom, black, transparent 82%)" }} />
        </div>

        <div className="container-page grid min-h-[520px] items-center gap-8 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
          <div className="relative z-10 max-w-[640px]">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-300/[0.08] px-3.5 py-2 text-xs font-medium text-indigo-100/90">
              <Sparkles size={14} className="text-fuchsia-300" /> A little more life, out there
            </div>
            <h1 className="max-w-[620px] text-5xl font-semibold leading-[1.04] tracking-[-.045em] sm:text-6xl lg:text-[68px]">Go where the <span className="text-gradient">good stuff</span> happens.</h1>
            <p className="mt-6 max-w-[500px] text-base leading-7 text-white/55 sm:text-lg">Find your next favorite night, new idea, or people who just get it.</p>

            <form onSubmit={search} className="mt-9 flex max-w-[590px] items-center rounded-2xl border border-white/[0.12] bg-[#10111d]/90 p-1.5 shadow-[0_18px_60px_-25px_rgba(74,63,180,.65)] backdrop-blur-xl focus-within:border-indigo-300/40">
              <Search size={19} className="ml-3 shrink-0 text-white/35" />
              <input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Try ‘live music’ or ‘design’" aria-label="Search events" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/35" />
              <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:brightness-110">Search <ArrowRight size={16} /></button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/40">
              <span className="mr-1">Trending:</span>
              {["Technology", "Music", "Food & Drink"].map((name) => {
                const category = categoryList.find((item) => item.name.toLowerCase() === name.toLowerCase());
                return <button key={name} onClick={() => setCategory(category?.slug)} className="rounded-full border border-white/[0.08] px-3 py-1.5 transition hover:border-white/25 hover:text-white/80">{name}</button>;
              })}
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-[570px] lg:block">
            <div className="absolute -inset-8 rounded-full bg-fuchsia-500/[0.08] blur-3xl" />
            <div className="relative aspect-[1.13] overflow-hidden rounded-[34px] border border-white/10 bg-[#171524] shadow-[0_40px_100px_-45px_rgba(99,75,201,.65)]">
              <img src={featured.data?.[0]?.coverImageUrl || "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=85"} alt="Crowd enjoying a live event" className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080912] via-[#080912]/10 to-transparent" />
              <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-xs text-white/85 backdrop-blur-lg"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Something’s happening</div>
              <div className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-5">
                <div><p className="mb-2 text-xs uppercase tracking-[.2em] text-white/55">Your next story starts here</p><p className="max-w-[300px] font-display text-2xl font-semibold leading-tight">Make room for a little wonder.</p></div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-xl"><ArrowUpRight size={21} /></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#141521]/95 p-3.5 shadow-2xl backdrop-blur-xl">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Users size={19} /></div>
              <div><p className="font-display text-sm font-semibold">Find your people</p><p className="mt-0.5 text-xs text-white/45">One good plan away</p></div>
              <ArrowRight size={15} className="ml-2 text-white/40" />
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="container-page pt-14 sm:pt-20">
        <div className="flex items-end justify-between gap-5">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-indigo-300">Find your thing</p><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Explore by mood</h2></div>
          <a href="#discover" className="hidden items-center gap-2 text-sm text-white/50 transition hover:text-white sm:flex">All events <ArrowDown size={15} /></a>
        </div>
        <div className="mt-7 flex gap-3 overflow-x-auto pb-3 scrollbar-hidden">
          <button onClick={() => setCategory(undefined)} className={`group flex min-w-[150px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${!filters.category ? "border-indigo-400/30 bg-indigo-400/[0.12]" : "border-white/[0.07] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"}`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-400/15 text-indigo-200"><Compass size={18} /></span><span><span className="block text-sm font-medium">Everything</span><span className="mt-0.5 block text-xs text-white/40">Explore it all</span></span></button>
          {categoryList.map((category, index) => <button key={category.id} onClick={() => setCategory(category.slug)} className={`group flex min-w-[165px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${filters.category === category.slug ? "border-indigo-400/30 bg-indigo-400/[0.12]" : "border-white/[0.07] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"}`}><span className={`grid h-10 w-10 place-items-center rounded-xl ${tileColor(index)}`}>{category.icon ? <span className="text-lg">{iconGlyph(category.icon)}</span> : <Sparkles size={17} />}</span><span><span className="block text-sm font-medium">{category.name}</span><span className="mt-0.5 block text-xs text-white/40">See what’s on</span></span></button>)}
        </div>
      </section>

      {!hasFilters && (featured.data?.length ?? 0) > 0 && <section className="container-page pt-12 sm:pt-16">
        <div className="mb-6 flex items-end justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-fuchsia-300">Handpicked for you</p><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Worth making plans for</h2></div><Link to="#discover" className="hidden items-center gap-2 text-sm text-white/50 hover:text-white sm:flex">See all <ArrowRight size={15} /></Link></div>
        <div className="grid gap-5 md:grid-cols-3">{featured.data?.map((event) => <FeaturedCard key={event.id} event={event} />)}</div>
      </section>}

      <section id="discover" className="container-page pt-16 sm:pt-20">
        <div className="flex flex-col justify-between gap-5 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-cyan-300">Out in the world</p><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{activeLabel ? `Explore ${activeLabel}` : filters.q ? `Results for “${filters.q}”` : "Upcoming events"}</h2><p className="mt-2 text-sm text-white/45">{page ? `${page.totalElements} things to look forward to` : "Good plans are closer than you think"}</p></div>
          <div className="flex flex-wrap gap-2.5">
            <label className="relative"><MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><select aria-label="Filter by city" value={filters.city ?? ""} onChange={(event) => setCity(event.target.value)} className="h-10 appearance-none rounded-xl border border-white/10 bg-[#12131f] pl-9 pr-8 text-sm text-white/75 outline-none focus:border-indigo-400/40"><option value="">Everywhere</option>{["Hyderabad", "Bengaluru", "Mumbai", "Delhi", "Pune", "Chennai"].map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
            <label className="relative"><CircleDollarSign size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><select aria-label="Filter by price" value={filters.minPrice === 0 ? "free" : ""} onChange={(event) => setPrice(event.target.value === "free" ? 0 : undefined)} className="h-10 appearance-none rounded-xl border border-white/10 bg-[#12131f] pl-9 pr-8 text-sm text-white/75 outline-none focus:border-indigo-400/40"><option value="">Any price</option><option value="free">Free events</option></select></label>
            {hasFilters && <button onClick={clearFilters} className="h-10 rounded-xl px-3 text-sm text-white/45 transition hover:text-white">Clear</button>}
          </div>
        </div>

        {events.isLoading ? <div className="grid gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"><div className="aspect-[1.6] animate-pulse bg-white/[0.05]" /><div className="space-y-3 p-5"><div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.06]" /><div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.06]" /><div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" /></div></div>)}</div>
        : events.isError ? <div className="my-8 rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] p-8 text-center"><p className="font-medium text-white">We couldn’t load events just now.</p><p className="mt-2 text-sm text-white/45">Check that the event service is running, then try again.</p><button onClick={() => void events.refetch()} className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/[0.05]">Try again</button></div>
        : !page?.content.length ? <div className="my-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-16 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] text-white/45"><Search size={19} /></div><h3 className="text-xl">No events match that search</h3><p className="mt-2 text-sm text-white/45">Try another category or clear a filter to see what’s happening.</p><button onClick={clearFilters} className="mt-5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15">Clear filters</button></div>
        : <><div className="grid gap-x-5 gap-y-7 py-8 sm:grid-cols-2 lg:grid-cols-3">{page.content.map((event) => <EventCardTile key={event.id} event={event} />)}</div>
          {page.totalPages > 1 && <div className="flex items-center justify-center gap-2 pb-4"><button aria-label="Previous page" disabled={page.first} onClick={() => setFilters((current) => ({ ...current, page: Math.max(0, (current.page ?? 0) - 1) }))} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/65 transition hover:bg-white/[0.05] disabled:opacity-30"><ChevronLeft size={18} /></button><span className="px-3 text-sm text-white/55">Page {(filters.page ?? 0) + 1} of {page.totalPages}</span><button aria-label="Next page" disabled={page.last} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 0) + 1 }))} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/65 transition hover:bg-white/[0.05] disabled:opacity-30"><ChevronRight size={18} /></button></div>}</>}
      </section>
    </main>
  );
}

function EventCardTile({ event }: { event: EventCard }) {
  return <Link to={`/events/${event.id}`} className="group min-w-0 overflow-hidden rounded-2xl border border-white/[0.075] bg-[#11121c]/70 transition duration-300 hover:-translate-y-1 hover:border-indigo-300/25 hover:bg-[#151623] hover:shadow-[0_22px_55px_-32px_rgba(100,82,210,.5)]">
    <div className="relative aspect-[1.72] overflow-hidden bg-gradient-to-br from-indigo-900/70 via-violet-900/50 to-slate-900">{event.coverImageUrl ? <img src={event.coverImageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_70%_20%,rgba(192,132,252,.28),transparent_40%),radial-gradient(circle_at_10%_90%,rgba(34,211,238,.16),transparent_45%)]"><span className="font-display text-5xl font-bold text-white/15">{event.category.name.slice(0, 1)}</span></div>}<div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" /><div className="absolute left-4 top-4 rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur-md">{event.category.name}</div><div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white/85"><CalendarDays size={14} />{formatDate(event.startAt)}</div><div className="absolute bottom-4 right-4 rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-md">{priceLabel(event.price)}</div></div>
    <div className="p-5"><h3 className="line-clamp-1 font-display text-[17px] font-semibold tracking-tight text-white transition group-hover:text-indigo-100">{event.title}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-white/45">{event.shortDescription || "An experience worth putting on your calendar."}</p><div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3.5 text-xs text-white/45"><span className="flex min-w-0 items-center gap-1.5 truncate"><MapPin size={13} className="shrink-0" />{event.city}</span><span className="flex items-center gap-1.5"><span className="hidden sm:inline">{event.availableSeats} spots left</span><ArrowUpRight size={15} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-200" /></span></div></div>
  </Link>;
}

function FeaturedCard({ event }: { event: EventCard }) {
  return <Link to={`/events/${event.id}`} className="group relative min-h-[270px] overflow-hidden rounded-2xl border border-white/10 bg-[#151521]">
    {event.coverImageUrl ? <img src={event.coverImageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(192,132,252,.3),transparent_40%),linear-gradient(135deg,#292245,#10121e_65%)]" />}
    <div className="absolute inset-0 bg-gradient-to-t from-[#090a12] via-[#090a12]/45 to-transparent" />
    <div className="absolute inset-x-5 bottom-5"><span className="inline-flex rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] text-white/85 backdrop-blur">{event.category.name} <span className="mx-2 text-white/30">·</span>{formatDate(event.startAt)}</span><h3 className="mt-3 line-clamp-1 font-display text-xl font-semibold">{event.title}</h3><div className="mt-2 flex items-center justify-between gap-4 text-sm text-white/60"><span className="flex items-center gap-1.5"><MapPin size={14} />{event.city}</span><span className="font-semibold text-white">{priceLabel(event.price)}</span></div></div>
    <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur transition group-hover:bg-white/15"><ArrowUpRight size={16} /></span>
  </Link>;
}

function tileColor(index: number) {
  return ["bg-violet-400/15 text-violet-200", "bg-cyan-400/15 text-cyan-200", "bg-rose-400/15 text-rose-200", "bg-amber-400/15 text-amber-200", "bg-emerald-400/15 text-emerald-200"][index % 5];
}

function iconGlyph(icon: string) {
  const icons: Record<string, string> = { cpu: "✳", music: "♫", utensils: "✦", palette: "◈", heart: "♡", briefcase: "▰", camera: "◎", dumbbell: "↗", trophy: "♜", film: "▣" };
  return icons[icon.toLowerCase()] ?? "✧";
}
