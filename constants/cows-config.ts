// constants/cows-config.ts — Shared cow list
// API_BASE services/api.ts se import karo

export interface Cow {
  id: string;
  name: string;
  tag_id?: string;
}

export const COWS: Cow[] = [
  { id: 'cow_1', name: 'Cow 1', tag_id: 'T001' },
  { id: 'cow_2', name: 'Cow 2', tag_id: 'T002' },
  { id: 'cow_3', name: 'Cow 3', tag_id: 'T003' },
  { id: 'cow_4', name: 'Cow 4', tag_id: 'T004' },
  { id: 'cow_5', name: 'Cow 5', tag_id: 'T005' },
];