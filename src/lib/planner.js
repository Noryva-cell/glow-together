import { addDays, format, startOfWeek } from 'date-fns';
import { TASK_TEMPLATES, PRIORITY_ORDER } from './constants';

export const toMinutes = (time) => {
  if (!time) return 0;
  const [h, m] = String(time).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const toTime = (minutes) => {
  const total = Math.max(0, Math.min(24 * 60, Math.round(minutes)));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export const overlap = (s, e, list) => list.some((o) => s < o.end && e > o.start);

export function freeWindows(jsDay, blocks, wake = '07:00', sleep = '23:00') {
  const start = toMinutes(wake);
  const end = toMinutes(sleep) > start ? toMinutes(sleep) : start + 16 * 60;
  const busy = blocks
    .filter((b) => Number(b.day_of_week) === Number(jsDay))
    .map((b) => ({ start: Math.max(start, toMinutes(b.start_time)), end: Math.min(end, toMinutes(b.end_time)) }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  const windows = [];
  let cursor = start;
  busy.forEach((b) => {
    if (b.start > cursor) windows.push({ start: cursor, end: b.start });
    cursor = Math.max(cursor, b.end);
  });
  if (cursor < end) windows.push({ start: cursor, end });
  return windows;
}

function findStart(windows, occupied, duration, slot) {
  const ordered = slot === 'matin' ? windows : slot === 'soir' ? [...windows].reverse() : windows;
  for (const w of ordered) {
    if (slot === 'soir') {
      for (let s = w.end - duration; s >= w.start; s -= 15) {
        if (!overlap(s, s + duration, occupied)) return s;
      }
    } else {
      for (let s = w.start; s + duration <= w.end; s += 15) {
        if (!overlap(s, s + duration, occupied)) return s;
      }
    }
  }
  return null;
}

export function buildWeekPlan({ profile, goals = [], blocks = [], weekStart, maxPerDay = 4 }) {
  const wake = profile?.wake_time || '07:00';
  const sleep = profile?.sleep_time || '23:00';
  const availableDays = profile?.available_days?.length ? profile.available_days.map(Number) : [1, 2, 3, 4, 5, 6, 0];
  const slots = profile?.preferred_slots || {};

  const goalValues = goals.length
    ? goals.filter((g) => g.status !== 'abandonne').map((g) => g.goal_type || 'personnel')
    : (profile?.goals_selected || []);

  const occurrences = [];
  goalValues.forEach((value) => {
    (TASK_TEMPLATES[value] || []).forEach((tpl) => {
      for (let i = 0; i < tpl.perWeek; i += 1) occurrences.push({ ...tpl, goalValue: value });
    });
  });
  if (!occurrences.length) {
    occurrences.push({ title: 'Priorité du jour', category: 'organisation', duration: 15, perWeek: 5, slot: 'matin', goalValue: null });
  }

  const days = [0, 1, 2, 3, 4, 5, 6].filter((d) => availableDays.includes(addDays(weekStart, d).getDay()));
  const occupancy = {};
  const load = {};
  days.forEach((d) => { occupancy[d] = []; load[d] = 0; });

  // On étale les tâches : les plus engageantes d'abord
  occurrences.sort((a, b) => b.duration - a.duration);

  const result = [];
  occurrences.forEach((occ, index) => {
    const slot = slots[occ.category] || occ.slot;
    const candidates = [...days].sort((a, b) => (load[a] - load[b]) || ((a + index) % 7) - ((b + index) % 7));
    for (const dayIdx of candidates) {
      if (load[dayIdx] >= maxPerDay) continue;
      const jsDay = addDays(weekStart, dayIdx).getDay();
      const windows = freeWindows(jsDay, blocks, wake, sleep).filter((w) => w.end - w.start >= occ.duration);
      if (!windows.length) continue;
      const start = findStart(windows, occupancy[dayIdx], occ.duration, slot);
      if (start === null) continue;
      occupancy[dayIdx].push({ start, end: start + occ.duration });
      load[dayIdx] += 1;
      result.push({
        title: occ.title,
        description: '',
        category: occ.category,
        date: format(addDays(weekStart, dayIdx), 'yyyy-MM-dd'),
        start_time: toTime(start),
        duration_minutes: occ.duration,
        priority: load[dayIdx] <= 2 ? 'haute' : 'moyenne',
        status: 'a_faire',
        recurrence: 'aucune',
        goal_type: occ.goalValue,
        generated: true,
      });
      break;
    }
  });

  return result.sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
}

export const sortTasks = (tasks = []) =>
  [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 3;
    const pb = PRIORITY_ORDER[b.priority] ?? 3;
    if (pa !== pb) return pa - pb;
    return String(a.start_time || '23:59').localeCompare(String(b.start_time || '23:59'));
  });

export { startOfWeek };