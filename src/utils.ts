/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, PlayerStats, TournamentStats, TournamentType, KnockoutMatch, KnockoutRound } from './types';

/**
 * Generates fixture round-robin scheduling (Berger system)
 */
export function generateFixture(players: string[], teams: Record<string, string>, type: TournamentType): Match[] {
  let list = [...players];
  const isOdd = list.length % 2 !== 0;
  if (isOdd) {
    list.push('BYE');
  }

  const numPlayers = list.length;
  const rounds = numPlayers - 1;
  const matchesPerRound = numPlayers / 2;
  const matches: Match[] = [];

  let matchIdCounter = 1;

  for (let r = 0; r < rounds; r++) {
    for (let m = 0; m < matchesPerRound; m++) {
      const homeIdx = (r + m) % (numPlayers - 1);
      let awayIdx = (r + numPlayers - 1 - m) % (numPlayers - 1);

      if (m === 0) {
        awayIdx = numPlayers - 1;
      }

      const home = list[homeIdx];
      const away = list[awayIdx];

      // Exclude BYE dummy matches
      if (home !== 'BYE' && away !== 'BYE') {
        matches.push({
          id: `match-${matchIdCounter++}`,
          round: r + 1,
          homePlayer: home,
          awayPlayer: away,
          homeTeam: teams[home] || 'Club',
          awayTeam: teams[away] || 'Club',
          homeGoals: null,
          awayGoals: null,
          played: false,
        });
      }
    }
  }

  // If double round-robin, mirror current fixture list with switched home/away
  if (type === 'ida_vuelta') {
    const originalMatches = [...matches];
    const maxFirstLegRound = Math.max(...originalMatches.map(m => m.round), 0);
    originalMatches.forEach((m) => {
      matches.push({
        id: `match-${matchIdCounter++}`,
        round: m.round + maxFirstLegRound,
        homePlayer: m.awayPlayer,
        awayPlayer: m.homePlayer,
        homeTeam: m.awayTeam,
        awayTeam: m.homeTeam,
        homeGoals: null,
        awayGoals: null,
        played: false,
      });
    });
  }

  // Sort matches by round
  return matches.sort((a, b) => a.round - b.round);
}

/**
 * Calculates current standing table for a tournament
 */
export function calculateStandings(players: string[], teams: Record<string, string>, matches: Match[]): PlayerStats[] {
  const standingsMap: Record<string, PlayerStats> = {};

  players.forEach((player) => {
    standingsMap[player] = {
      player,
      team: teams[player] || 'Club',
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0,
    };
  });

  matches.forEach((m) => {
    // Only count reported regular league matches (exclude semis/finals which are processed separately)
    if (!m.played || m.isSemifinal || m.isFinal) return;

    const home = m.homePlayer;
    const away = m.awayPlayer;
    const hg = m.homeGoals ?? 0;
    const ag = m.awayGoals ?? 0;

    // Ensure player entries exist
    if (!standingsMap[home]) return;
    if (!standingsMap[away]) return;

    standingsMap[home].pj += 1;
    standingsMap[away].pj += 1;

    standingsMap[home].gf += hg;
    standingsMap[home].gc += ag;
    standingsMap[away].gf += ag;
    standingsMap[away].gc += hg;

    if (hg > ag) {
      standingsMap[home].pg += 1;
      standingsMap[home].pts += 3;
      standingsMap[away].pp += 1;
    } else if (hg < ag) {
      standingsMap[away].pg += 1;
      standingsMap[away].pts += 3;
      standingsMap[home].pp += 1;
    } else {
      standingsMap[home].pe += 1;
      standingsMap[home].pts += 1;
      standingsMap[away].pe += 1;
      standingsMap[away].pts += 1;
    }
  });

  // Calculate Goal Difference
  Object.keys(standingsMap).forEach((p) => {
    standingsMap[p].dg = standingsMap[p].gf - standingsMap[p].gc;
  });

  // Convert to array and sort according to requested priorities:
  // 1. PTS (Puntos)
  // 2. DG (Diferencia de Goles)
  // 3. GF (Goles a Favor)
  return Object.values(standingsMap).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });
}

/**
 * Computes special statistics and records for the current tournament
 */
export function calculateTournamentStats(matches: Match[], teams: Record<string, string>): TournamentStats {
  const playerGoals: Record<string, number> = {};
  const playerGoalsConceded: Record<string, number> = {};
  const playerGamesPlayed: Record<string, number> = {};

  matches.forEach((m) => {
    if (!m.played || m.isSemifinal || m.isFinal) return;

    const h = m.homePlayer;
    const a = m.awayPlayer;
    const hg = m.homeGoals ?? 0;
    const ag = m.awayGoals ?? 0;

    playerGoals[h] = (playerGoals[h] || 0) + hg;
    playerGoals[a] = (playerGoals[a] || 0) + ag;

    playerGoalsConceded[h] = (playerGoalsConceded[h] || 0) + ag;
    playerGoalsConceded[a] = (playerGoalsConceded[a] || 0) + hg;

    playerGamesPlayed[h] = (playerGamesPlayed[h] || 0) + 1;
    playerGamesPlayed[a] = (playerGamesPlayed[a] || 0) + 1;
  });

  // Top scorer list
  let topScorer: { player: string; team: string; goals: number } | null = null;
  Object.keys(playerGoals).forEach((player) => {
    const goals = playerGoals[player];
    if (!topScorer || goals > topScorer.goals) {
      topScorer = { player, team: teams[player] || 'Club', goals };
    }
  });

  // Best defense list (min 1 match played to be qualified)
  let bestDefense: { player: string; team: string; goalsAgainst: number } | null = null;
  Object.keys(playerGoalsConceded).forEach((player) => {
    if ((playerGamesPlayed[player] || 0) === 0) return;
    const ga = playerGoalsConceded[player];
    if (!bestDefense || ga < bestDefense.goalsAgainst) {
      bestDefense = { player, team: teams[player] || 'Club', goalsAgainst: ga };
    }
  });

  // Best goal difference
  let bestDg: { player: string; team: string; dg: number } | null = null;
  Object.keys(playerGoals).forEach((p) => {
    if ((playerGamesPlayed[p] || 0) === 0) return;
    const dg = (playerGoals[p] || 0) - (playerGoalsConceded[p] || 0);
    if (!bestDg || dg > bestDg.dg) {
      bestDg = { player: p, team: teams[p] || 'Club', dg };
    }
  });

  // Biggest blowout victory
  let biggestWin: { match: Match; diff: number } | null = null;
  // Match with most total goals
  let mostGoalsMatch: { match: Match; goals: number } | null = null;

  matches.forEach((m) => {
    if (!m.played) return;
    const hg = m.homeGoals ?? 0;
    const ag = m.awayGoals ?? 0;
    const diff = Math.abs(hg - ag);
    const sum = hg + ag;

    if (!biggestWin || diff > biggestWin.diff) {
      biggestWin = { match: m, diff };
    } else if (biggestWin && diff === biggestWin.diff) {
      // Tie breaker: one with more goals scored by the winner
      const currentMaxWinnerGoals = Math.max(biggestWin.match.homeGoals ?? 0, biggestWin.match.awayGoals ?? 0);
      const challengerWinnerGoals = Math.max(hg, ag);
      if (challengerWinnerGoals > currentMaxWinnerGoals) {
        biggestWin = { match: m, diff };
      }
    }

    if (!mostGoalsMatch || sum > mostGoalsMatch.goals) {
      mostGoalsMatch = { match: m, goals: sum };
    }
  });

  return {
    topScorer,
    bestDefense,
    bestDg,
    biggestWin,
    mostGoalsMatch,
  };
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateKnockoutRounds(players: string[], teams: Record<string, string>): KnockoutRound[] {
  const shuffled = shuffleArray(players);
  const n = shuffled.length;
  
  let roundName = '';
  if (n > 8) {
    roundName = 'Octavos de Final';
  } else if (n > 4) {
    roundName = 'Cuartos de Final';
  } else if (n > 2) {
    roundName = 'Semifinales';
  } else {
    roundName = 'Gran Final';
  }

  const matches: KnockoutMatch[] = [];
  let matchIdCounter = 1;

  const isOdd = n % 2 !== 0;
  const numPairs = Math.floor(n / 2);

  for (let i = 0; i < numPairs; i++) {
    const home = shuffled[i * 2];
    const away = shuffled[i * 2 + 1];
    matches.push({
      id: `ko-match-${Date.now()}-${matchIdCounter++}`,
      homePlayer: home,
      awayPlayer: away,
      homeTeam: teams[home] || 'Club',
      awayTeam: teams[away] || 'Club',
      homeGoals: null,
      awayGoals: null,
      played: false,
    });
  }

  if (isOdd) {
    const luckyPlayer = shuffled[n - 1];
    matches.push({
      id: `ko-match-${Date.now()}-${matchIdCounter++}`,
      homePlayer: luckyPlayer,
      awayPlayer: 'BYE',
      homeTeam: teams[luckyPlayer] || 'Club',
      awayTeam: 'Pase Libre',
      homeGoals: null,
      awayGoals: null,
      played: true, // already advanced
    });
  }

  return [{
    name: roundName,
    matches,
  }];
}

export function generateNextKnockoutRound(currentRound: KnockoutRound, teams: Record<string, string>): KnockoutRound {
  const winners: string[] = [];
  
  currentRound.matches.forEach((m) => {
    if (m.awayPlayer === 'BYE') {
      winners.push(m.homePlayer);
    } else {
      const hg = m.homeGoals ?? 0;
      const ag = m.awayGoals ?? 0;
      if (hg > ag) {
        winners.push(m.homePlayer);
      } else if (hg < ag) {
        winners.push(m.awayPlayer);
      } else {
        winners.push(m.penaltyWinner || m.homePlayer);
      }
    }
  });

  const n = winners.length;
  let roundName = '';
  if (n > 8) {
    roundName = 'Octavos de Final';
  } else if (n > 4) {
    roundName = 'Cuartos de Final';
  } else if (n > 2) {
    roundName = 'Semifinales';
  } else if (n === 2) {
    roundName = 'Gran Final';
  } else {
    roundName = 'Campeón Definido';
  }

  const matches: KnockoutMatch[] = [];
  let matchIdCounter = 1;

  const isOdd = n % 2 !== 0;
  const numPairs = Math.floor(n / 2);

  for (let i = 0; i < numPairs; i++) {
    const home = winners[i * 2];
    const away = winners[i * 2 + 1];
    matches.push({
      id: `ko-match-${Date.now()}-${matchIdCounter++}`,
      homePlayer: home,
      awayPlayer: away,
      homeTeam: teams[home] || 'Club',
      awayTeam: teams[away] || 'Club',
      homeGoals: null,
      awayGoals: null,
      played: false,
    });
  }

  if (isOdd) {
    const luckyPlayer = winners[n - 1];
    matches.push({
      id: `ko-match-${Date.now()}-${matchIdCounter++}`,
      homePlayer: luckyPlayer,
      awayPlayer: 'BYE',
      homeTeam: teams[luckyPlayer] || 'Club',
      awayTeam: 'Pase Libre',
      homeGoals: null,
      awayGoals: null,
      played: true, // already advanced
    });
  }

  return {
    name: roundName,
    matches,
  };
}
