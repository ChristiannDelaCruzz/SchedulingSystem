// src/mocks/yearLevels.ts
import type { YearLevel } from '../types';

const yl = (id: string, programId: string, name: string, level: number): YearLevel => ({
  id, program_id: programId, name, level, createdAt: '2026-01-01T00:00:00Z',
});

export const mockYearLevels: YearLevel[] = [
  // BSIT
  yl('yl-bsit-1', 'prog-bsit', '1st Year', 1),
  yl('yl-bsit-2', 'prog-bsit', '2nd Year', 2),
  yl('yl-bsit-3', 'prog-bsit', '3rd Year', 3),
  yl('yl-bsit-4', 'prog-bsit', '4th Year', 4),
  // BSCS
  yl('yl-bscs-1', 'prog-bscs', '1st Year', 1),
  yl('yl-bscs-2', 'prog-bscs', '2nd Year', 2),
  yl('yl-bscs-3', 'prog-bscs', '3rd Year', 3),
  yl('yl-bscs-4', 'prog-bscs', '4th Year', 4),
  // BSEMC
  yl('yl-bsemc-1', 'prog-bsemc', '1st Year', 1),
  yl('yl-bsemc-2', 'prog-bsemc', '2nd Year', 2),
  yl('yl-bsemc-3', 'prog-bsemc', '3rd Year', 3),
  yl('yl-bsemc-4', 'prog-bsemc', '4th Year', 4),
  // BSIS
  yl('yl-bsis-1', 'prog-bsis', '1st Year', 1),
  yl('yl-bsis-2', 'prog-bsis', '2nd Year', 2),
  yl('yl-bsis-3', 'prog-bsis', '3rd Year', 3),
  yl('yl-bsis-4', 'prog-bsis', '4th Year', 4),
];