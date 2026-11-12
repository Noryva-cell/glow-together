import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import MimoAvatar from '@/components/mimo/MimoAvatar';
import { cn } from '@/lib/utils';

const REACTIONS = [
  'Coucou ! Je suis content de te voir.',
  'On avance à ton rythme, promis.',
  'Une petite étape aujourd’hui vaut mieux que rien.',
  'Dis-moi juste ce qui te trotte dans la tête.',
  'Je suis là pour t’organiser, pas pour te presser.',
];

export default function Home() {
  const { profile } = useOutletContext();
  const navigate = useNavigate();
  const [mood, setMood] = useState('calme');
  const [reaction, setReaction] = useState(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bel après-midi' : 'Bonsoir';
  const name = profile?.nickname?.trim();
  const hello = `${greeting}${name ? ` ${name}` : ''}.`;

  useEffect(() => {
    if (!reaction) return undefined;
    const timer = window.setTimeout(() => setReaction(null), 3200);
    return () => window.clearTimeout(timer);
  }, [reaction]);

  const touchMimo = () => {
    setMood(Math.random() > 0.5 ? 'enthousiaste' : 'ecoute');
    setReaction(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]);
  };

  return (
    <div className="relative flex min-h-[calc(100svh-11rem)] flex-col items-center justify-center overflow-hidden px-2 py-6 text-center lg:min-h-[calc(100svh-8rem)]">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-chart-3/20 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{hello}</p>

        <div className={cn('mimo-float', reaction && 'mimo-reaction')}>
          <MimoAvatar
            mood={mood}
            onClick={touchMimo}
            rounded="rounded-[2.6rem]"
            className="h-52 w-52 shadow-[0_32px_60px_-32px_hsl(var(--primary)/0.55)] sm:h-60 sm:w-60 lg:h-72 lg:w-72"
          />
        </div>

        <div className="mt-6 flex h-14 items-center justify-center">
          <p
            className={cn(
              'max-w-xs rounded-[1.4rem] px-4 py-2.5 text-sm leading-relaxed transition-all duration-300',
              reaction ? 'bg-card/90 text-foreground shadow-sm backdrop-blur' : 'bg-transparent text-muted-foreground'
            )}
          >
            {reaction || 'Je suis Mimo. Touche-moi, ou parlons de ce que tu veux changer.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/mimo')}
          className="glow-cta mt-4 inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-medium text-primary-foreground transition-transform active:scale-95"
        >
          <MessageCircle className="h-5 w-5" />
          Parler à Mimo
        </button>
      </div>
    </div>
  );
}