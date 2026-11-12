import { useEffect, useRef, useState } from 'react';
import MimoAvatar from '@/components/mimo/MimoAvatar';
import { cn } from '@/lib/utils';

const KEY = 'glowup-mimo-position';
const SIZE = 56;
const MARGIN = 12;

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

const maxRight = () => window.innerWidth - SIZE - MARGIN;
const maxBottom = () => window.innerHeight - SIZE - MARGIN;

function defaultPosition() {
  const wide = window.innerWidth >= 1024;
  return { right: MARGIN + (wide ? 16 : 4), bottom: wide ? 24 : 92 };
}

function readSaved() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    if (saved && Number.isFinite(saved.right) && Number.isFinite(saved.bottom)) {
      return { right: clamp(saved.right, MARGIN, maxRight()), bottom: clamp(saved.bottom, MARGIN, maxBottom()) };
    }
  } catch (e) {
    return null;
  }
  return null;
}

export default function DraggableMimo({ onOpen }) {
  const [position, setPosition] = useState(() => readSaved() || defaultPosition());
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);

  useEffect(() => {
    const onResize = () => setPosition((current) => ({
      right: clamp(current.right, MARGIN, maxRight()),
      bottom: clamp(current.bottom, MARGIN, maxBottom()),
    }));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!dragging) window.localStorage.setItem(KEY, JSON.stringify(position));
  }, [position, dragging]);

  const start = (event) => {
    drag.current = { x: event.clientX, y: event.clientY, right: position.right, bottom: position.bottom, moved: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const move = (event) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    state.moved = Math.max(state.moved, Math.hypot(dx, dy));
    setPosition({
      right: clamp(state.right - dx, MARGIN, maxRight()),
      bottom: clamp(state.bottom - dy, MARGIN, maxBottom()),
    });
  };

  const end = (event) => {
    const state = drag.current;
    drag.current = null;
    setDragging(false);
    if (!state) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (e) {
      // le pointeur est déjà relâché
    }
    if (state.moved < 8) onOpen();
  };

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onOpen();
      }}
      aria-label="Parler à Mimo (tu peux le déplacer)"
      title="Glisse-moi où tu veux"
      style={{ right: position.right, bottom: position.bottom }}
      className={cn(
        'fixed z-30 touch-none select-none rounded-[1.15rem] border border-white/80 shadow-[0_16px_34px_-18px_hsl(var(--primary))] transition-transform',
        dragging ? 'scale-110 cursor-grabbing' : 'cursor-grab active:scale-95'
      )}
    >
      <MimoAvatar
        mood="accueil"
        rounded="rounded-[1.1rem]"
        breathing={!dragging}
        className="pointer-events-none h-14 w-14"
      />
    </button>
  );
}