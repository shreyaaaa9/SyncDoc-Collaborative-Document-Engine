export interface CollaboratorPersona {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  color: string;
  badge: string;
  initials: string;
}

export const COLLABORATION_PERSONAS: CollaboratorPersona[] = [
  {
    id: 'user_1',
    name: 'Kirubakar',
    email: 'kirubakar@engineering.org',
    role: 'Staff Systems Engineer',
    avatarColor: 'from-indigo-600 to-indigo-700',
    color: '#4f46e5',
    badge: 'Primary Author',
    initials: 'K',
  },
  {
    id: 'user_2',
    name: 'Sarah Chen',
    email: 'sarah.chen@engineering.org',
    role: 'Principal Architect',
    avatarColor: 'from-emerald-600 to-teal-700',
    color: '#059669',
    badge: 'Architect',
    initials: 'S',
  },
  {
    id: 'user_3',
    name: 'Alex Dev',
    email: 'alex.dev@engineering.org',
    role: 'Platform Lead',
    avatarColor: 'from-amber-500 to-orange-600',
    color: '#d97706',
    badge: 'Lead',
    initials: 'A',
  },
  {
    id: 'user_4',
    name: 'Elena Rostova',
    email: 'elena.rostova@engineering.org',
    role: 'Security Engineer',
    avatarColor: 'from-rose-600 to-pink-700',
    color: '#e11d48',
    badge: 'Security',
    initials: 'E',
  },
];
