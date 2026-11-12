import MimoAvatar from '@/components/mimo/MimoAvatar';
import ActionCard from '@/components/mimo/ActionCard';
import { MOOD_LABEL } from '@/lib/mimo';
import { cn } from '@/lib/utils';

export default function MessageBubble({ message, onSaveAction, onIgnoreAction }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[1.3rem] rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  const actions = message.actions || [];

  return (
    <div className="flex gap-2.5">
      <div className="mt-1 shrink-0">
        <MimoAvatar
          mood={message.mood || 'explication'}
          breathing={false}
          rounded="rounded-full"
          focalY={0.3}
          className="h-9 w-9"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Mimo · {MOOD_LABEL[message.mood] || 'À l’écoute'}
        </p>
        <div className="whitespace-pre-wrap rounded-[1.3rem] rounded-tl-md border border-border/70 bg-card px-4 py-3 text-sm leading-relaxed">
          {message.content}
        </div>
        {actions.map((action, index) => (
          <ActionCard
            key={`${message.id}-${index}`}
            action={action}
            status={action.status}
            onSave={() => onSaveAction(message.id, action)}
            onIgnore={() => onIgnoreAction(message.id, action)}
          />
        ))}
      </div>
    </div>
  );
}