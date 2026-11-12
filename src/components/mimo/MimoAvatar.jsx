import { useState } from 'react';
import MimoCharacter from '@/components/mimo/MimoCharacter';
import { cn } from '@/lib/utils';

/**
 * Le personnage Mimo, vivant : il flotte, respire, cligne des yeux et réagit au clic.
 */
export default function MimoAvatar({
  mood = 'accueil',
  className,
  rounded = 'rounded-[1.7rem]',
  breathing = true,
  onClick,
  alt = 'Mimo, ton compagnon GlowUp',
}) {
  const [reacting, setReacting] = useState(false);
  const Wrapper = onClick ? 'button' : 'div';

  const handleClick = (event) => {
    setReacting(true);
    window.setTimeout(() => setReacting(false), 560);
    onClick(event);
  };

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick ? handleClick : undefined}
      aria-label={onClick ? 'Parler à Mimo' : alt}
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-secondary/90 via-accent/70 to-primary/15',
        rounded,
        onClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        reacting && 'mimo-reaction',
        className
      )}
    >
      <MimoCharacter
        mood={mood}
        className={cn('h-[94%] w-[94%]', breathing && !reacting && 'mimo-float')}
      />
    </Wrapper>
  );
}