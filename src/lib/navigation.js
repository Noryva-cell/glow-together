import { Home, CalendarDays, Target, Sparkles, UtensilsCrossed, Droplets, BookOpen, User } from 'lucide-react';

/**
 * Les huit espaces de GlowUp. Source unique pour la navigation
 * (barre mobile, menu « Plus » et colonne sur ordinateur).
 */
export const SPACES = [
  { to: '/', label: 'Accueil', icon: Home, primary: true },
  { to: '/planning', label: 'Planning', icon: CalendarDays, primary: true },
  { to: '/objectifs', label: 'Objectifs', icon: Target, primary: true },
  { to: '/routines', label: 'Routines', icon: Sparkles, primary: true },
  { to: '/repas', label: 'Repas', icon: UtensilsCrossed },
  { to: '/soins', label: 'Soins', icon: Droplets },
  { to: '/culture', label: 'Culture', icon: BookOpen },
  { to: '/profil', label: 'Profil', icon: User },
];

export const PRIMARY_SPACES = SPACES.filter((space) => space.primary);
export const SECONDARY_SPACES = SPACES.filter((space) => !space.primary);