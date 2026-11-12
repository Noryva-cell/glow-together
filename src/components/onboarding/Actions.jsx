import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Actions({ onBack, onNext, nextLabel = 'Continuer', busy = false, disabled = false }) {
  return (
    <div className="mt-8 flex items-center gap-2 pb-4">
      {onBack && (
        <Button variant="ghost" className="rounded-full text-muted-foreground" onClick={onBack}>
          Retour
        </Button>
      )}
      <Button className="flex-1 rounded-full py-6 text-sm" onClick={onNext} disabled={busy || disabled}>
        {busy ? 'Enregistrement…' : nextLabel}
        {!busy && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
}