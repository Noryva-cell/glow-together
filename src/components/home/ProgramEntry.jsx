import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import MimoAvatar from '@/components/mimo/MimoAvatar';

export default function ProgramEntry() {
  return (
    <Link to="/programme" className="surface flex items-center gap-3 p-3.5 transition-colors hover:bg-card/85">
      <MimoAvatar mood="explication" rounded="rounded-2xl" className="h-11 w-11 shrink-0" breathing={false} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Mon programme</p>
        <p className="truncate text-[11px] text-muted-foreground">Exercices préparés par Mimo</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
    </Link>
  );
}