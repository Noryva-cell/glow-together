import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import MimoAvatar from '@/components/mimo/MimoAvatar';

/**
 * Espace en préparation : présente ce que Mimo y construira
 * et permet d'en parler tout de suite dans la conversation.
 */
export default function SpacePreview({ title, subtitle, items }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <header className="px-1">
        <h1 className="font-display text-xl leading-tight">{title}</h1>
        <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-muted-foreground">{subtitle}</p>
      </header>

      <section className="surface p-5">
        <div className="flex items-start gap-3">
          <MimoAvatar mood="reflexion" breathing={false} rounded="rounded-[1.1rem]" className="h-14 w-14 shrink-0" />
          <div>
            <p className="font-display text-base leading-snug">Mimo prépare cet espace</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Cet onglet fait partie de la refonte : il est volontairement vide pour l’instant. Voici ce qui s’y
              trouvera, et ce que Mimo sait déjà faire avec toi aujourd’hui.
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2.5 border-t border-border/60 pt-4">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate('/mimo')}
          className="glow-cta mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-medium text-primary-foreground transition-transform active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          En parler à Mimo
        </button>
      </section>
    </div>
  );
}