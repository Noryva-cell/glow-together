import { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MimoAvatar from '@/components/mimo/MimoAvatar';
import MessageBubble from '@/components/mimo/MessageBubble';
import QuickActions from '@/components/mimo/QuickActions';

const parseActions = (json) => {
  try {
    const value = JSON.parse(json || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export default function Assistant() {
  const { profile } = useOutletContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const page = await base44.entities.AssistantMessage.filter({}, { sort: 'created_date', limit: 60 });
      if (!active) return;
      setMessages((page.items || []).map((m) => ({ ...m, actions: parseActions(m.actions_json) })));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, sending]);

  const send = async (raw) => {
    const text = String(raw ?? input).trim();
    if (!text || sending) return;
    setInput('');
    setError('');
    setSending(true);

    const storedUser = await base44.entities.AssistantMessage.create({ role: 'user', content: text });
    const userMessage = { ...storedUser, actions: [] };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await base44.functions.invoke('mimoAssist', {
        message: text,
        history: [...messages, userMessage].slice(-8).map((m) => ({ role: m.role, content: m.content })),
      });
      const data = response.data || {};
      const actions = Array.isArray(data.actions) ? data.actions : [];
      const storedAssistant = await base44.entities.AssistantMessage.create({
        role: 'assistant',
        content: data.reply || '',
        mood: data.mood || 'explication',
        actions_json: JSON.stringify(actions),
      });
      setMessages((prev) => [...prev, { ...storedAssistant, actions }]);
    } catch (e) {
      setError('Mimo n’a pas pu répondre. Réessaie dans un instant.');
    } finally {
      setSending(false);
    }
  };

  const resolveAction = async (messageId, action, status) => {
    const target = messages.find((m) => m.id === messageId);
    if (!target) return;
    const next = (target.actions || []).map((a) => (a === action ? { ...a, status } : a));
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, actions: next } : m)));
    await base44.entities.AssistantMessage.update(messageId, { actions_json: JSON.stringify(next) });
  };

  const lastMood = [...messages].reverse().find((m) => m.role === 'assistant')?.mood || 'accueil';

  return (
    <div className="flex min-h-[70vh] flex-col">
      <header className="flex items-center gap-3 pb-4">
        <button
          onClick={() => navigate('/')}
          aria-label="Retour"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <MimoAvatar mood={lastMood} breathing={false} rounded="rounded-full" focalY={0.3} className="h-10 w-10" />
          <div>
            <p className="font-display text-lg leading-none">Mimo</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Ton compagnon GlowUp</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="surface p-5 text-center">
                <p className="font-display text-base">Salut{profile?.nickname ? ` ${profile.nickname}` : ''} !</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Je connais déjà ton profil, tes objectifs et ton planning : pas besoin de tout répéter.
                  Dis-moi ce qui te bloque ou ce que tu veux préparer.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onSaveAction={async (id, action) => resolveAction(id, action, 'saved')}
                onIgnoreAction={(id, action) => resolveAction(id, action, 'ignored')}
              />
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MimoAvatar mood="reflexion" breathing={false} rounded="rounded-full" focalY={0.3} className="h-7 w-7" /> Mimo réfléchit…
              </div>
            )}

            {error && <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">{error}</p>}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="sticky bottom-20 z-10 mt-4 space-y-2 bg-background/95 pt-2 backdrop-blur lg:bottom-0">
        <QuickActions onPick={send} disabled={sending} />
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Écris à Mimo…"
            className="max-h-32 min-h-[46px] flex-1 resize-none rounded-[1.2rem] border border-input bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            onClick={() => send()}
            disabled={sending || !input.trim()}
            aria-label="Envoyer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
