export const ADMISSION_DEPARTMENTS: string[] = [
  'General Medicine A',
  'General Medicine B',
  'ICU / Critical Care',
  'Emergency Short Stay',
  'Cardiology Ward',
  'Surgical Ward',
  'Pediatric Ward',
];

export const BED_TYPES: string[] = [
  'Standard Care Bed',
  'Semi-Private Bed',
  'Isolation Bed',
  'ICU Ventilator Bed',
  'Telemetry Monitored Bed',
];

export const CARE_PRECAUTIONS: string[] = [
  'NPO (Fasting)',
  'Fall Risk Precautions',
  'Strict I/O Fluid Balance',
  'Oxygen Therapy (>2L/min)',
  'Cardiac Telemetry',
  'Contact / Droplet Isolation',
  'Frequent Vitals Q2H',
];

export const REFERRAL_DESTINATIONS: string[] = [
  'External Tertiary Hospital (National Hospital)',
  'Specialized Heart / Cardiology Institute',
  'National Institute of Infectious Diseases',
  'Neurology & Stroke Center',
  'In-House Specialized Outpatient Clinic',
];

export const REFERRAL_SPECIALTIES: string[] = [
  'Cardiology',
  'Pulmonology',
  'General Surgery',
  'Infectious Disease',
  'Neurology',
  'ENT / Otorhinolaryngology',
  'Gastroenterology',
];

export const TRANSPORT_MODES: string[] = [
  'ALS Ambulance (Critical Care Paramedic)',
  'BLS Standard Ambulance',
  'Private Vehicle (Accompanied by Family)',
  'Wheelchair Hospital Van',
];

export const DISAGREE_REASONS: string[] = [
  'Patient insists on recovering at home',
  'Prefers consultation with personal family physician',
  'Family / Childcare responsibilities',
  'Financial / Insurance coverage constraints',
  'Patient feels symptoms are tolerable / declining inpatient stay',
];

export const DISPOSITION_TYPES = [
  'DAMA (Patient Disagrees / Refuses Admission)',
  'Routine Home Discharge',
  'Outpatient Specialist Follow-up',
] as const;
