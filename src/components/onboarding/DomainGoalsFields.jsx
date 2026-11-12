import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DOMAINS, GOAL_OPTIONS } from '@/lib/constants';

export function relevantDomains(goalsSelected) {
  const categories = new Set(
    (goalsSelected || [])
      .map((goal) => GOAL_OPTIONS.find((option) => option.value === goal)?.category)
      .filter(Boolean)
  );
  const list = DOMAINS.filter((domain) => categories.has(domain.value));
  return list.length ? list : DOMAINS.slice(0, 5);
}

export default function DomainGoalsFields({ value = {}, onChange, goalsSelected = [] }) {
  const [showAll, setShowAll] = useState(false);
  const relevant = relevantDomains(goalsSelected);
  const visible = showAll ? DOMAINS : relevant;
  const hidden = DOMAINS.filter((d) => !relevant.some((r) => r.value === d.value));

  const set = (domain, text) => onChange({ ...value, [domain]: text });

  return (
    <div className="space-y-4">
      {visible.map((domain) => (
        <div key={domain.value}>
          <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{domain.label}</Label>
          <Textarea
            rows={2}
            value={value[domain.value] || ''}
            onChange={(e) => set(domain.value, e.target.value)}
            placeholder={domain.placeholder}
            className="mt-1 resize-none"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">{domain.hint}</p>
        </div>
      ))}

      {!showAll && hidden.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-[11px] text-primary hover:underline"
        >
          Ajouter un autre domaine
        </button>
      )}
    </div>
  );
}