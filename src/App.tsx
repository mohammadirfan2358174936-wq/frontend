import { useEffect, useState, type FormEvent } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  LoaderCircle,
  Plus,
  Sparkles,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import { Toaster } from "@/components/ui/Toaster";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { EventDetailPage } from "@/pages/EventDetailPage";
import { ExplorePage } from "@/pages/ExplorePage";
import { CreateEventModal } from "@/components/CreateEventModal";
import { MyTicketsModal } from "@/components/MyTicketsModal";
import { OrganizerEventsModal } from "@/components/OrganizerEventsModal";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function App() {
  const user = useAuthStore((state) => state.user);
  const loadMe = useAuthStore((state) => state.loadMe);
  const logout = useAuthStore((state) => state.logout);

  const [authOpen, setAuthOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [myTicketsOpen, setMyTicketsOpen] = useState(false);
  const [organizerEventsOpen, setOrganizerEventsOpen] = useState(false);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  function handleCreateEventClick() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (user.role === "ATTENDEE") {
      return;
    }
    setCreateEventOpen(true);
  }

  const isOrganizerOrAdmin = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#090a13]/80 backdrop-blur-2xl">
          <div className="container-page flex h-[76px] items-center justify-between gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2.5" aria-label="Eventforge home">
              <img src="/eventforge-mark.svg" alt="" className="h-10 w-10" />
              <span className="font-display text-[19px] font-bold tracking-tight text-white">eventforge</span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-white/55 md:flex" aria-label="Main navigation">
              <Link className="flex items-center gap-2 text-white/90 transition hover:text-white" to="/">
                <Compass size={16} /> Explore
              </Link>
              <a className="transition hover:text-white" href="#categories">Categories</a>
              <a className="transition hover:text-white" href="#about">About</a>
            </nav>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Primary "Create Event" CTA - only for logged in Organizers / Admins */}
              {isOrganizerOrAdmin && (
                <button
                  onClick={handleCreateEventClick}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 hover:brightness-110 transition"
                >
                  <Plus size={16} />
                  <span>Create Event</span>
                </button>
              )}

              {/* Organizer / Attendee quick view buttons */}
              {user && (
                <>
                  {isOrganizerOrAdmin ? (
                    <button
                      onClick={() => setOrganizerEventsOpen(true)}
                      className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-indigo-200 hover:bg-white/[0.08] transition"
                    >
                      <Sparkles size={14} /> My Events
                    </button>
                  ) : (
                    <button
                      onClick={() => setMyTicketsOpen(true)}
                      className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-cyan-200 hover:bg-white/[0.08] transition"
                    >
                      <Ticket size={14} /> My Tickets
                    </button>
                  )}
                </>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-xs font-semibold text-white/90">{user.name}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.055] px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                  >
                    <UserRound size={15} /> Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer id="about" className="mt-24 border-t border-white/[0.07]">
          <div className="container-page flex flex-col gap-4 py-8 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="font-display font-semibold text-white/75">eventforge</Link>
            <span>Find your people. Make a night of it.</span>
            <span>© {new Date().getFullYear()} Eventforge</span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} />}
      {createEventOpen && isOrganizerOrAdmin && (
        <CreateEventModal
          onClose={() => setCreateEventOpen(false)}
        />
      )}
      {myTicketsOpen && <MyTicketsModal onClose={() => setMyTicketsOpen(false)} />}
      {organizerEventsOpen && (
        <OrganizerEventsModal
          onClose={() => setOrganizerEventsOpen(false)}
          onCreateNew={() => setCreateEventOpen(true)}
        />
      )}

      <Toaster />
    </>
  );
}

function AuthDialog({ onClose }: { onClose: () => void }) {
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ATTENDEE" | "ORGANIZER">("ORGANIZER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const notify = useToastStore((state) => state.success);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (registering) await register({ name: name.trim(), email: email.trim(), password, role });
      else await login(email.trim(), password);
      notify(registering ? "Welcome to Eventforge" : "You’re signed in", "Glad you’re here.");
      onClose();
    } catch (failure) {
      setError(
        failure && typeof failure === "object" && "message" in failure
          ? String(failure.message)
          : "We couldn’t sign you in. Try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function quickDemoLogin(demoEmail: string) {
    setBusy(true);
    setError(null);
    try {
      await login(demoEmail, "Admin@123");
      notify("Signed in with Demo Account", `Logged in as ${demoEmail}`);
      onClose();
    } catch (failure) {
      setError("Demo sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-md overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="relative my-8 w-full max-w-[440px] rounded-[26px] border border-white/10 bg-[#11121e] p-6 shadow-[0_30px_100px_-25px_rgba(0,0,0,.9)] sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close sign in"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <X size={17} />
        </button>
        <img src="/eventforge-mark.svg" alt="" className="h-11 w-11" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">You’re in good company</p>
        <h2 id="auth-title" className="mt-2 text-3xl font-semibold">
          {registering ? "Make an account" : "Welcome back"}
        </h2>
        <p className="mt-2 text-sm text-white/45">
          {registering ? "Start finding or hosting events." : "Sign in to manage and create events."}
        </p>

        {/* 1-Click Demo accounts */}
        {!registering && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-2">1-Click Demo Login:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void quickDemoLogin("organizer@eventora.io")}
                className="rounded-lg border border-indigo-400/30 bg-indigo-500/15 py-1.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25 transition"
              >
                Organizer Demo
              </button>
              <button
                type="button"
                onClick={() => void quickDemoLogin("attendee@eventora.io")}
                className="rounded-lg border border-cyan-400/30 bg-cyan-500/15 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/25 transition"
              >
                Attendee Demo
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
          {registering && (
            <label className="block text-sm font-medium text-white/70">
              Your name
              <input
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="field-glass mt-2 h-11 text-sm"
                placeholder="Alex Morgan"
              />
            </label>
          )}
          <label className="block text-sm font-medium text-white/70">
            Email address
            <input
              autoComplete="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field-glass mt-2 h-11 text-sm"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm font-medium text-white/70">
            Password
            <input
              autoComplete={registering ? "new-password" : "current-password"}
              type="password"
              required
              minLength={8}
              maxLength={72}
              pattern={registering ? "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,72}" : undefined}
              title={registering ? "Use at least 8 characters with uppercase, lowercase and a number." : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-glass mt-2 h-11 text-sm"
              placeholder={registering ? "Uppercase, lowercase and a number" : "Your password"}
            />
          </label>
          {registering && (
            <label className="block text-sm font-medium text-white/70">
              I’m here as
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as "ATTENDEE" | "ORGANIZER")}
                className="field-glass mt-2 h-11 text-sm bg-[#131422]"
              >
                <option value="ORGANIZER">Event organizer</option>
                <option value="ATTENDEE">Attendee</option>
              </select>
            </label>
          )}
          {error && (
            <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-3.5 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:brightness-110 disabled:opacity-55"
          >
            {busy && <LoaderCircle size={16} className="animate-spin" />}
            {registering ? "Create account" : "Sign in"}
            <ArrowRight size={16} />
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-white/45">
          {registering ? "Already part of Eventforge?" : "New around here?"}{" "}
          <button
            onClick={() => {
              setRegistering((current) => !current);
              setError(null);
            }}
            className="font-semibold text-indigo-200 hover:text-white"
          >
            {registering ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </div>
  );
}

function NotFound() {
  return (
    <main className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.06] text-indigo-300">
          <CalendarDays />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-300">Nothing here</p>
        <h1 className="mt-3 text-4xl">We lost that page.</h1>
        <Link to="/" className="mt-7 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-white">
          Back to exploring <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}

export default App;
