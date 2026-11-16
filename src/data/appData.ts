import questionData from './questions.json';
import libraryData from './library.json';
import scheduleData from './ceisc56.json';

export type OabQuestion = {
  id: string;
  subjectId: string;
  subjectTitle: string;
  number: number;
  prompt: string;
  choices: Record<'A' | 'B' | 'C' | 'D', string>;
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  source: string;
};

export const questions = questionData as OabQuestion[];

export type LibraryMaterial = { subjectId: string; title: string; pdf: string; docx: string };
export const libraryFiles = libraryData as { zip: string; materials: LibraryMaterial[] };

export type CeiscDay = { day: number; date: string; focus: string; study: string; timeNotes: string };
export const ceiscSchedule = scheduleData as CeiscDay[];
