import { Outlet, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sparkles, MessageCircle, MoreHorizontal, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MimoAvatar from '@/components/mimo/MimoAvatar';
import DraggableMimo from '@/components/mimo/DraggableMimo';
import ThemeToggle from '@/components/ThemeToggle';
import { SPACES, PRIMARY_SPACES, SECONDARY_SPACES } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      const found = await base44.entities.UserProfile.filter({ created_by_id: user.id });
      setProfile(found[0] || null);
    } catch (e) {
      setProfile(null);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { loadProfile(); }, []);
  useEffect(() => { window.scrollTo(0, 0); setMoreOpen(false); }, [location.pathname]);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!profile || profile.onboarding_completed === false) {
    return <Navigate to="/onboarding" replace />;
  }

  const onAssistant = location.pathname === '/mimo';
  const onHome = location.pathname === '/';
  const secondaryActive = SECONDARY_SPACES.some((space) => space.to === location.pathname);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-sidebar/80 px-5 py-8 backdrop-blur-xl lg:flex">
        <div className="mb-8 px-2">
          <p className="flex items-center gap-1.5 font-display text-2xl leading-none tracking-tight">
            GlowUp <Sparkles className="h-4 w-4 text-primary" />
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Ton espace</p>
        </div>

        <nav className="flex flex-col gap-1">
          {SPACES.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_-16px_hsl(var(--primary))]'
                  : 'text-muted-foreground hover:bg-card/70 hover:text-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => navigate('/mimo')}
          className="mt-6 flex items-center gap-2.5 rounded-2xl border border-primary/25 bg-primary/10 p-2.5 text-left transition-colors hover:bg-primary/20"
        >
          <MimoAvatar mood="accueil" breathing={false} rounded="rounded-full" focalY={0.32} className="h-9 w-9 shrink-0" />
          <span className="min-w-0">
            <span className="block text-xs font-medium">Parler à Mimo</span>
            <span className="block truncate text-[10px] text-muted-foreground">Ton assistant personnel</span>
          </span>
          <MessageCircle className="ml-auto h-4 w-4 shrink-0 text-primary" />
        </button>

        <div className="mt-auto flex items-center justify-between px-1 pt-6">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Thème</span>
          <ThemeToggle />
        </div>
      </aside>

      {!onHome && (
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/40 bg-background/70 px-5 py-3 backdrop-blur-xl lg:hidden">
          <p className="flex items-center gap-1.5 font-display text-xl leading-none tracking-tight">
            GlowUp <Sparkles className="h-3.5 w-3.5 text-primary" />
          </p>
          <ThemeToggle />
        </header>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-3xl px-4 pb-32 pt-4 sm:px-5 lg:max-w-5xl lg:px-8 lg:pb-16 lg:pt-10 xl:max-w-6xl">
          <Outlet context={{ profile, refreshProfile: loadProfile }} />
        </div>
      </main>

      {!onAssistant && !onHome && <DraggableMimo onOpen={() => navigate('/mimo')} />}

      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Fermer le menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
          />
          <div className="glass safe-bottom absolute inset-x-3 bottom-3 rounded-[1.8rem] p-4 shadow-[0_28px_60px_-30px_hsl(var(--primary))]">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="font-display text-sm">Tous les espaces</p>
              <button onClick={() => setMoreOpen(false)} aria-label="Fermer" className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SECONDARY_SPACES.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition-colors',
                    isActive
                      ? 'border-primary/40 bg-primary/15 text-foreground'
                      : 'border-border/60 bg-card/70 text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
            <button
              onClick={() => { setMoreOpen(false); navigate('/mimo'); }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              Parler à Mimo
            </button>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-1 lg:hidden">
        <div className="glass safe-bottom mx-auto flex max-w-md items-center justify-between gap-1 rounded-[1.6rem] px-1.5 py-1.5 shadow-[0_20px_40px_-26px_hsl(var(--primary))]">
          {PRIMARY_SPACES.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-[1.2rem] px-1 py-1.5 text-[10px] transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-[18px] w-[18px] transition-transform', isActive && 'scale-110')} />
                  <span className={cn('truncate', isActive && 'font-medium')}>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => setMoreOpen(true)}
            aria-label="Plus d’espaces"
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 rounded-[1.2rem] px-1 py-1.5 text-[10px] transition-colors',
              secondaryActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            <MoreHorizontal className="h-[18px] w-[18px]" />
            <span className={cn('truncate', secondaryActive && 'font-medium')}>Plus</span>
          </button>
        </div>
      </nav>
    </div>
  );
}