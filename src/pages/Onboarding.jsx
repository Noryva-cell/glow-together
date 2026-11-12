import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { startOfWeek } from 'date-fns';
import { base44 } from '@/api/base44Client';
import ThemeToggle from '@/components/ThemeToggle';
import StepBasics from '@/components/onboarding/StepBasics';
import StepBody from '@/components/onboarding/StepBody';
import StepGoals from '@/components/onboarding/StepGoals';
import StepGoalDetails from '@/components/onboarding/StepGoalDetails';
import StepSchedule from '@/components/onboarding/StepSchedule';
import StepPreferences from '@/components/onboarding/StepPreferences';
import StepSummary from '@/components/onboarding/StepSummary';
import StepDomainGoals from '@/components/onboarding/StepDomainGoals';
import MimoPrompt from '@/components/onboarding/MimoPrompt';
import { ROUTINE_DEFAULT } from '@/lib/constants';
import { buildWeekPlan } from '@/lib/planner';
import { cleanProfile } from '@/lib/profile';

const TOTAL = 8;

// Mimo pose lui-même les questions du questionnaire
const MIMO_MESSAGES = {
  1: 'Salut, moi c’est Mimo. On fait connaissance en quelques questions rapides ?',
  2: 'Ton âge, ta taille, ton poids : c’est pour doser les exercices et les repas, sans aucun jugement.',
  3: 'Qu’est-ce que tu veux améliorer en priorité ? Choisis ce qui compte vraiment pour toi.',
  4: 'Pour chaque objectif, dis-moi le résultat concret que tu attends.',
  5: 'Le plus important : ton objectif précis par domaine. Exemple : « apprendre à faire 10 pompes », « arrêter de grignoter le soir ».',
  6: 'Quand es-tu disponible ? Je placerai les séances autour de tes obligations.',
  7: 'Dernière chose : comment veux-tu que je te parle ?',
  8: 'Je relis tes réponses et je te prépare des exercices adaptés, progressifs et sans danger.',
};

const MIMO_MOODS = { 2: 'explication', 5: 'reflexion', 8: 'encouragement' };

const DEFAULTS = {
  nickname: '', age_range: '', country: '',
  height_cm: '', weight_kg: '', target_weight_kg: '', track_weight: false, activity_level: '',
  monthly_budget: '', free_minutes_per_day: '',
  wake_time: '07:00', sleep_time: '23:00', available_days: [1, 2, 3, 4, 5], auto_planning: true,
  preferred_slots: { sport: 'soir', culture: 'soir', alimentation: 'soir', menage: 'soir', organisation: 'matin' },
  goals_selected: [], primary_goal: '', coaching_style: 'encourageant', reminder_frequency: 'quotidien',
  onboarding_step: 1, onboarding_completed: false,
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [data, setData] = useState(DEFAULTS);
  const [profileId, setProfileId] = useState(null);
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        const found = await base44.entities.UserProfile.filter({ created_by_id: user.id });
        if (found.length) {
          setProfileId(found[0].id);
          setData({ ...DEFAULTS, ...found[0], onboarding_completed: found[0].onboarding_completed });
          setStep(Math.min(Math.max(found[0].onboarding_step || 1, 1), TOTAL));
        } else {
          const created = await base44.entities.UserProfile.create(cleanProfile({ ...DEFAULTS }));
          setProfileId(created.id);
        }
        setGoals(await base44.entities.Goal.filter({}));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (patch) => setData((d) => ({ ...d, ...patch }));

  const saveProfile = async (patch) => {
    const merged = { ...data, ...patch };
    setData(merged);
    if (profileId) {
      await base44.entities.UserProfile.update(profileId, cleanProfile(merged));
    }
    return merged;
  };

  const goTo = (n) => {
    setStep(n);
    if (profileId) base44.entities.UserProfile.update(profileId, { onboarding_step: n });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => goTo(Math.min(step + 1, TOTAL));
  const back = () => goTo(Math.max(step - 1, 1));

  const finish = async () => {
    const merged = await saveProfile({ onboarding_step: TOTAL, onboarding_completed: true });

    const routines = await base44.entities.Routine.filter({});
    if (!routines.length) {
      await base44.entities.Routine.bulkCreate([
        { name: 'Routine du matin', moment: 'matin', category: 'beaute', steps: ROUTINE_DEFAULT.matin, days: [1, 2, 3, 4, 5, 6, 0], active: true },
        { name: 'Routine du soir', moment: 'soir', category: 'beaute', steps: ROUTINE_DEFAULT.soir, days: [1, 2, 3, 4, 5, 6, 0], active: true },
      ]);
    }

    const habits = await base44.entities.Habit.filter({});
    if (!habits.length) {
      await base44.entities.Habit.bulkCreate([
        { name: 'Boire 1,5 L d’eau', frequency: 'quotidien', days: [1, 2, 3, 4, 5, 6, 0], target_per_week: 7, active: true },
        { name: '10 minutes de rangement', frequency: 'quotidien', days: [1, 2, 3, 4, 5, 6, 0], target_per_week: 5, active: true },
        { name: 'Écrans coupés avant le coucher', frequency: 'quotidien', days: [1, 2, 3, 4, 5, 6, 0], target_per_week: 7, active: true },
      ]);
    }

    const tasks = await base44.entities.Task.filter({});
    if (!tasks.length && merged.auto_planning !== false) {
      const blocks = await base44.entities.TimeBlock.filter({});
      const allGoals = await base44.entities.Goal.filter({});
      const plan = buildWeekPlan({
        profile: merged,
        goals: allGoals,
        blocks,
        weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
      });
      if (plan.length) await base44.entities.Task.bulkCreate(plan);
    }

    try {
      await base44.functions.invoke('buildProgram', {});
    } catch (e) {
      // Le programme reste générable à tout moment depuis la page Programme
    }

    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  const common = { data, update, saveProfile, next, back, goals, setGoals, profileId };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-xl px-5 pb-8 pt-5">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-opacity disabled:opacity-30"
            aria-label="Étape précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-display text-lg tracking-tight">GlowUp</p>
          <ThemeToggle />
        </div>

        <div className="mb-8">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(step / TOTAL) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Étape {step} sur {TOTAL}</p>
        </div>

        <MimoPrompt step={step} message={MIMO_MESSAGES[step]} mood={MIMO_MOODS[step] || 'accueil'} />

        <div key={step} className="rise">
          {step === 1 && <StepBasics {...common} />}
          {step === 2 && <StepBody {...common} />}
          {step === 3 && <StepGoals {...common} />}
          {step === 4 && <StepGoalDetails {...common} />}
          {step === 5 && <StepDomainGoals {...common} />}
          {step === 6 && <StepSchedule {...common} />}
          {step === 7 && <StepPreferences {...common} />}
          {step === 8 && <StepSummary {...common} onEdit={goTo} finish={finish} />}
        </div>
      </div>
    </div>
  );
}