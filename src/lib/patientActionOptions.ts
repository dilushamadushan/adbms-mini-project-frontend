export interface MedicineOption {
  name: string;
  defaultDose?: string;
  defaultRoute?: string;
  defaultFrequency?: string;
  defaultDuration?: string;
  defaultTimeSlots?: string;
  defaultInstructions?: string;
}

export const MEDICINE_SUGGESTIONS: MedicineOption[] = [
  {
    name: 'Paracetamol',
    defaultDose: '500 mg',
    defaultRoute: 'Oral',
    defaultFrequency: 'Every 6 hours',
    defaultDuration: '3 days',
    defaultTimeSlots: 'Morning & Afternoon',
    defaultInstructions: 'Take with food',
  },
  {
    name: 'Amoxicillin',
    defaultDose: '500 mg',
    defaultRoute: 'Oral',
    defaultFrequency: 'Every 8 hours',
    defaultDuration: '5 days',
    defaultTimeSlots: 'Morning & Evening',
    defaultInstructions: 'Complete the course',
  },
  {
    name: 'Cetirizine',
    defaultDose: '10 mg',
    defaultRoute: 'Oral',
    defaultFrequency: 'Once daily',
    defaultDuration: '7 days',
    defaultTimeSlots: 'Night',
    defaultInstructions: 'Take before bedtime',
  },
  {
    name: 'Ibuprofen',
    defaultDose: '400 mg',
    defaultRoute: 'Oral',
    defaultFrequency: 'Every 8 hours',
    defaultDuration: '3 days',
    defaultTimeSlots: 'After meals',
    defaultInstructions: 'Do not take on empty stomach',
  },
  {
    name: 'Azithromycin',
    defaultDose: '500 mg',
    defaultRoute: 'Oral',
    defaultFrequency: 'Once daily',
    defaultDuration: '3 days',
    defaultTimeSlots: 'Morning',
    defaultInstructions: 'Take 1 hour before meal',
  },
  {
    name: 'Metformin',
    defaultDose: '500 mg',
    defaultRoute: 'Oral',
    defaultFrequency: 'Twice daily',
    defaultDuration: '30 days',
    defaultTimeSlots: 'Morning & Evening',
    defaultInstructions: 'Take with breakfast and dinner',
  },
  {
    name: 'Omeprazole',
    defaultDose: '20 mg',
    defaultRoute: 'Oral',
    defaultFrequency: 'Once daily',
    defaultDuration: '14 days',
    defaultTimeSlots: 'Morning',
    defaultInstructions: 'Take 30 mins before breakfast',
  },
  {
    name: 'Salbutamol Inhaler',
    defaultDose: '100 mcg',
    defaultRoute: 'Inhalation',
    defaultFrequency: 'As needed (PRN)',
    defaultDuration: '30 days',
    defaultTimeSlots: 'Morning & Evening',
    defaultInstructions: '2 puffs when short of breath',
  },
];

export const DOSE_OPTIONS: string[] = [
  '5 mg',
  '10 mg',
  '20 mg',
  '50 mg',
  '100 mg',
  '250 mg',
  '400 mg',
  '500 mg',
  '650 mg',
  '1000 mg',
  '5 ml',
  '10 ml',
  '1 drop',
  '2 drops',
  '100 mcg',
];

export const ROUTE_OPTIONS: string[] = [
  'Oral',
  'Intravenous (IV)',
  'Intramuscular (IM)',
  'Sublingual',
  'Topical',
  'Inhalation',
];

export const FREQUENCY_OPTIONS: string[] = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed (PRN)',
];

export const DURATION_OPTIONS: string[] = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '30 days',
  '1 month',
];

export const TIME_SLOT_OPTIONS: string[] = [
  'Morning',
  'Evening',
  'Night',
  'Morning & Afternoon',
  'Morning & Evening',
  'Morning, Afternoon & Evening',
  'Before meals',
  'After meals',
];
