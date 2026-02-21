export const milkYieldData = [
  { id: '1', location: 'Shed A', totalYield: 4820, peakYield: 38.4, milkingPeriod: '305 days', highestMonth: 'March 2024', totalDays: 305, morning: 2600, evening: 2220 },
  { id: '2', location: 'Shed B', totalYield: 3960, peakYield: 32.1, milkingPeriod: '290 days', highestMonth: 'February 2024', totalDays: 290, morning: 2100, evening: 1860 },
];

export const inseminationData = [
  { id: '1', date: '2024-01-15', sire: 'HF Bull #42', pregnancy: 'Confirmed', detDate: '2024-02-20', pdBy: 'Dr. Sharma', expCalving: '2024-10-22', actCalving: '2024-10-24', expHeat: '2024-12-15' },
  { id: '2', date: '2024-03-08', sire: 'Jersey #18',  pregnancy: 'Pending',   detDate: '2024-04-10', pdBy: 'Dr. Patel',  expCalving: '2025-01-05', actCalving: '-',          expHeat: '-' },
];

export const dobData = [
  { id: '1', tag: 'C-001', dob: '2022-05-10', durationBetweenCalvings: '14 months', firstCalving: '2024-07-20', maturityDate: '2023-08-10', deworming: '2023-11-10' },
  { id: '2', tag: 'C-002', dob: '2021-11-22', durationBetweenCalvings: '13 months', firstCalving: '2023-12-15', maturityDate: '2023-02-22', deworming: '2023-05-22' },
];

export const semenData = [
  { id: '1', bull: 'HF Bull #42', femaleCalves: 8, maleCalves: 5, damYield: '7200 L', conception: '1st A/S' },
  { id: '2', bull: 'Jersey #18',  femaleCalves: 6, maleCalves: 4, damYield: '6100 L', conception: '2nd A/S' },
];

export const geneticData = [
  { id: '1', tag: 'C-101', sire: 'HF Bull #42', size: 'Large',  dob: '2024-02-14', status: 'Healthy' },
  { id: '2', tag: 'C-102', sire: 'Jersey #18',  size: 'Medium', dob: '2023-09-05', status: 'Sold'    },
  { id: '3', tag: 'C-103', sire: 'HF Bull #42', size: 'Large',  dob: '2024-10-24', status: 'Healthy' },
];

export const medicalData = [
  { id: '1', tag: 'C-001', lastVaccination: '2024-01-10', nextVaccination: '2025-01-10', lastDeworming: '2024-06-15', nextDeworming: '2024-12-15', status: 'Up to date' },
  { id: '2', tag: 'C-002', lastVaccination: '2023-11-05', nextVaccination: '2024-11-05', lastDeworming: '2024-05-05', nextDeworming: '2024-11-05', status: 'Due Soon'   },
];
