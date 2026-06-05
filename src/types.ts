/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TournamentType = 'ida' | 'ida_vuelta';
export type TournamentStatus = 'setup' | 'active' | 'final_phase' | 'finished';

export interface Match {
  id: string;
  round: number;
  homePlayer: string;
  awayPlayer: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  played: boolean;
  isSemifinal?: boolean;
  isFinal?: boolean;
  semifinalIndex?: number; // 0 or 1
  penaltyWinner?: string | null; // For final phase ties
}

export interface FinalPhase {
  semis: Match[];
  finalMatch: Match | null;
  champion: string | null;
  subchampion: string | null;
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  status: TournamentStatus;
  players: string[];
  teams: Record<string, string>; // player -> team name
  matches: Match[];
  finalPhase: FinalPhase | null;
  createdAt: string;
}

export interface ChampionRecord {
  id: string;
  tournamentName: string;
  champion: string;
  championTeam: string;
  subchampion: string;
  date: string;
}

export interface PlayerStats {
  player: string;
  team: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

export interface TournamentStats {
  topScorer: { player: string; team: string; goals: number } | null;
  bestDefense: { player: string; team: string; goalsAgainst: number } | null;
  bestDg: { player: string; team: string; dg: number } | null;
  biggestWin: { match: Match; diff: number } | null;
  mostGoalsMatch: { match: Match; goals: number } | null;
}
