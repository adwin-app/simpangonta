

export enum UserRole {
  ADMIN = 'ADMIN',
  JURI = 'JURI',
  SEKOLAH = 'SEKOLAH',
}

export interface User {
    id: string;
    username: string;
    role: UserRole;
    assignedCompetitionId?: string;
    assignedCompetitionName?: string;
    assignedTeamType?: 'Putra' | 'Putri' | null;
    assignedCriteriaIds?: string[];
}

export interface School {
  id: string;
  name: string;
  email: string;
}

export interface Criterion {
  id: string;
  name: string;
  maxScore: number;
}

export interface Competition {
  id:string;
  name: string;
  criteria: Criterion[];
}

export interface Team {
  id: string;
  school: string;
  schoolId?: string; // Tautan ke model School
  teamName: string;
  type: 'Putra' | 'Putri';
  coachName: string;
  coachPhone: string;
  members: string[];
  campNumber?: string;
}

export interface Score {
  id: string;
  teamId: string;
  competitionId: string;
  judgeId: string;
  scoresByCriterion: { [criterionId: string]: number };
  totalScore: number;
  notes?: string;
}

export interface LeaderboardEntry {
  rank: number;
  teamId:string;
  teamName: string;
  school: string;
  scoresByCompetition: { [competitionId: string]: number };
  totalScore: number; // Tetap ada untuk referensi, tapi tidak dipakai untuk ranking
  medals: {
      gold: number;
      silver: number;
      bronze: number;
  };
}

export interface DashboardStats {
  totalTeams: number;
  totalParticipants: number;
  teamsByType: { putra: number; putri: number };
  totalCompetitions: number;
  scoresByJudge: { judgeId: string; count: number }[];
}