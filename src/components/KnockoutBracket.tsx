/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Check, AlertCircle, Sparkles, Sword, Play } from 'lucide-react';
import { Tournament, KnockoutMatch, KnockoutRound } from '../types';

interface KnockoutBracketProps {
  tournament: Tournament;
  onUpdateKnockoutScore: (
    roundIndex: number,
    matchId: string,
    homeGoals: number,
    awayGoals: number,
    penaltyWinner: string | null
  ) => void;
  onAdvanceRound: () => void;
  onFinishKnockout: (champion: string, subchampion: string) => void;
}

export default function KnockoutBracket({
  tournament,
  onUpdateKnockoutScore,
  onAdvanceRound,
  onFinishKnockout,
}: KnockoutBracketProps) {
  const rounds = tournament.knockoutRounds || [];
  const currentRoundIndex = rounds.length - 1;
  const activeRound = rounds[currentRoundIndex];

  // Mobile state: active tab of selected round
  const [mobileRoundIdx, setMobileRoundIdx] = useState(currentRoundIndex);

  // Sync mobile selected round index when new round is generated
  React.useEffect(() => {
    setMobileRoundIdx(currentRoundIndex);
  }, [currentRoundIndex]);

  // Scores state for manual input before confirming
  const [matchScores, setMatchScores] = useState<Record<string, { home: string; away: string; penaltyWinner: string | null }>>({});

  const handleScoreChange = (matchId: string, side: 'home' | 'away', val: string) => {
    // Only allow whole positive numbers
    if (val !== '' && !/^\d+$/.test(val)) return;

    setMatchScores((prev) => {
      const existing = prev[matchId] || { home: '', away: '', penaltyWinner: null };
      const next = { ...existing, [side]: val };
      
      // Reset penalty selection if score changes and is no longer a tie
      const hStr = side === 'home' ? val : existing.home;
      const aStr = side === 'away' ? val : existing.away;
      if (hStr !== '' && aStr !== '' && parseInt(hStr, 10) !== parseInt(aStr, 10)) {
        next.penaltyWinner = null;
      }
      return { ...prev, [matchId]: next };
    });
  };

  const handleSelectPenaltyWinner = (matchId: string, winner: string) => {
    setMatchScores((prev) => {
      const existing = prev[matchId] || { home: '', away: '', penaltyWinner: null };
      return {
        ...prev,
        [matchId]: { ...existing, penaltyWinner: winner },
      };
    });
  };

  const handleSaveMatchScore = (roundIndex: number, match: KnockoutMatch) => {
    const scores = matchScores[match.id];
    if (!scores || scores.home === '' || scores.away === '') return;

    const homeVal = parseInt(scores.home, 10);
    const awayVal = parseInt(scores.away, 10);

    // If it's a tie, they must have selected a penalty winner
    if (homeVal === awayVal && !scores.penaltyWinner) {
      alert('En caso de empate, define el ganador por penales y selecciona manualmente quién avanza.');
      return;
    }

    onUpdateKnockoutScore(roundIndex, match.id, homeVal, awayVal, scores.penaltyWinner);
  };

  // Check if all matches in active round are completed
  const isRoundCompleted = activeRound
    ? activeRound.matches.every((m) => m.played)
    : false;

  // Final match of the whole bracket
  const isFinalRound = activeRound?.name === 'Gran Final' || activeRound?.matches.length === 1;

  // Determine champion and subchampion if final is played
  let champion: string | null = null;
  let subchampion: string | null = null;

  if (isFinalRound && isRoundCompleted && activeRound) {
    const finalMatch = activeRound.matches[0];
    const hg = finalMatch.homeGoals ?? 0;
    const ag = finalMatch.awayGoals ?? 0;
    if (hg > ag) {
      champion = finalMatch.homePlayer;
      subchampion = finalMatch.awayPlayer;
    } else if (hg < ag) {
      champion = finalMatch.awayPlayer;
      subchampion = finalMatch.homePlayer;
    } else {
      champion = finalMatch.penaltyWinner || finalMatch.homePlayer;
      subchampion = champion === finalMatch.homePlayer ? finalMatch.awayPlayer : finalMatch.homePlayer;
    }
  }

  return (
    <div className="space-y-6" id="knockout-bracket-panel">
      {/* Dynamic Navigation for Rounds - Mobile: Tabs, Desktop: Info badge */}
      <div className="flex flex-col gap-4">
        {/* Mobile slide select */}
        <div className="md:hidden flex items-center gap-1.5 bg-slate-950/80 border border-slate-900 rounded-xl p-1 overflow-x-auto no-scrollbar">
          {rounds.map((r, idx) => (
            <button
              key={r.name}
              type="button"
              onClick={() => setMobileRoundIdx(idx)}
              className={`flex-1 shrink-0 px-3 py-2 text-[10px] font-display font-black tracking-wider uppercase rounded-lg transition-all ${
                mobileRoundIdx === idx
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {r.name.replace(' de Final', '')}
            </button>
          ))}
        </div>

        {/* Header decoration */}
        <div className="text-center md:text-left py-2 px-4 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sword className="w-4 h-4 text-orange-500 animate-pulse" />
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">
              Llaves del torneo / Eliminación Directa
            </p>
          </div>
          <span className="hidden md:inline px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider animate-pulse">
            ⚔️ Copa de Muerte Súbita
          </span>
        </div>
      </div>

      {/* Bracket Grid View */}
      <div className="grid grid-cols-1 md:grid-flow-col md:auto-cols-fr gap-6 overflow-x-auto pb-4">
        {rounds.map((round, rIndex) => {
          const isPastRound = rIndex < currentRoundIndex;
          const isActiveRound = rIndex === currentRoundIndex;

          // Render only selected mobile round on small screens, and all rounds on desktop
          return (
            <div
              key={round.name}
              className={`flex flex-col space-y-4 md:block ${
                mobileRoundIdx === rIndex ? 'block' : 'hidden md:block'
              }`}
            >
              {/* Round Title Header */}
              <div
                className={`rounded-xl border ${
                  isActiveRound
                    ? 'border-orange-500 bg-gradient-to-r from-orange-950/30 to-amber-950/30'
                    : 'border-slate-800 bg-slate-900/40'
                } p-2 text-center shadow-md relative overflow-hidden`}
              >
                {isActiveRound && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 animate-pulse" />
                )}
                <h3 className="font-display font-black text-[11px] uppercase tracking-wider text-white">
                  {round.name}
                </h3>
                <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
                  {round.matches.length} {round.matches.length === 1 ? 'Cruce' : 'Cruces'}
                </p>
              </div>

              {/* Match Card List in Round */}
              <div className="space-y-4 md:space-y-6 pt-2">
                {round.matches.map((match) => {
                  const isBye = match.awayPlayer === 'BYE';
                  
                  // Local score values
                  const localScores = matchScores[match.id] || {
                    home: match.homeGoals !== null ? String(match.homeGoals) : '',
                    away: match.awayGoals !== null ? String(match.awayGoals) : '',
                    penaltyWinner: match.penaltyWinner || null,
                  };

                  const isMatchPlayed = match.played;
                  const winner = isMatchPlayed
                    ? isBye
                      ? match.homePlayer
                      : (match.homeGoals ?? 0) > (match.awayGoals ?? 0)
                      ? match.homePlayer
                      : (match.homeGoals ?? 0) < (match.awayGoals ?? 0)
                      ? match.awayPlayer
                      : match.penaltyWinner || match.homePlayer
                    : null;

                  const loser = isMatchPlayed && winner
                    ? winner === match.homePlayer
                      ? match.awayPlayer
                      : match.homePlayer
                    : null;

                  return (
                    <div
                      key={match.id}
                      className={`glow-card rounded-xl border relative transition-all overflow-hidden ${
                        isMatchPlayed
                          ? 'border-slate-800/80 bg-slate-950/40 opacity-90'
                          : isActiveRound
                          ? 'border-orange-500/20 bg-slate-950/80 shadow-[0_4px_20px_rgba(249,115,22,0.05)]'
                          : 'border-slate-800 bg-slate-950/40 opacity-70'
                      }`}
                    >
                      {/* Top border decor for active round matches */}
                      {isActiveRound && !isMatchPlayed && (
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500" />
                      )}

                      {/* BYE overlay/decor */}
                      {isBye && (
                        <div className="absolute top-0 right-0 py-0.5 px-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-l border-b border-amber-500/10 rounded-bl-lg font-mono text-[8px] font-bold text-yellow-400 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 animate-spin" /> pase libre
                        </div>
                      )}

                      <div className="p-3.5 space-y-3">
                        {/* TEAM 1 CONTAINER (Home) */}
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex flex-col min-w-0">
                            <span className={`font-display text-xs truncate ${
                              isMatchPlayed && winner === match.homePlayer
                                ? 'text-yellow-400 font-extrabold flex items-center gap-1 shadow-xs'
                                : isMatchPlayed && loser === match.homePlayer
                                ? 'text-slate-500 line-through'
                                : 'text-white font-bold'
                            }`}>
                              {isMatchPlayed && winner === match.homePlayer && '🏆 '}
                              {match.homePlayer}
                            </span>
                            <span className="font-mono text-[9px] text-slate-400 truncate uppercase mt-0.5">
                              {match.homeTeam}
                            </span>
                          </div>

                          {!isBye && (
                            <input
                              type="text"
                              maxLength={2}
                              value={localScores.home}
                              disabled={isMatchPlayed || isPastRound}
                              onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                              className="w-9 h-9 bg-slate-900 border border-slate-700 text-center text-xs font-bold font-mono text-white rounded-md focus:border-orange-500 disabled:opacity-50 transition-colors shrink-0"
                              placeholder="-"
                            />
                          )}
                        </div>

                        {/* Divider or VS */}
                        <div className="flex items-center justify-center gap-2 py-0.5">
                          <div className="h-px bg-slate-800/50 flex-1" />
                          <span className="font-mono text-[8px] text-slate-600 font-bold uppercase tracking-widest">vs</span>
                          <div className="h-px bg-slate-800/50 flex-1" />
                        </div>

                        {/* TEAM 2 CONTAINER (Away or BYE) */}
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex flex-col min-w-0 flex-1">
                            {isBye ? (
                              <div className="py-2 px-2.5 bg-yellow-500/5 border border-dashed border-yellow-500/20 rounded-lg">
                                <p className="font-display font-extrabold text-[10px] text-yellow-400 leading-tight">
                                  Pase libre a la siguiente ronda
                                </p>
                                <p className="font-mono text-[8px] text-slate-500 uppercase mt-0.5">
                                  Clasificación automática
                                </p>
                              </div>
                            ) : (
                              <>
                                <span className={`font-display text-xs truncate ${
                                  isMatchPlayed && winner === match.awayPlayer
                                    ? 'text-yellow-400 font-extrabold flex items-center gap-1 shadow-xs'
                                    : isMatchPlayed && loser === match.awayPlayer
                                    ? 'text-slate-500 line-through'
                                    : 'text-white font-bold'
                                }`}>
                                  {isMatchPlayed && winner === match.awayPlayer && '🏆 '}
                                  {match.awayPlayer}
                                </span>
                                <span className="font-mono text-[9px] text-slate-400 truncate uppercase mt-0.5">
                                  {match.awayTeam}
                                </span>
                              </>
                            )}
                          </div>

                          {!isBye && (
                            <input
                              type="text"
                              maxLength={2}
                              value={localScores.away}
                              disabled={isMatchPlayed || isPastRound}
                              onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                              className="w-9 h-9 bg-slate-900 border border-slate-700 text-center text-xs font-bold font-mono text-white rounded-md focus:border-orange-500 disabled:opacity-50 transition-colors shrink-0"
                              placeholder="-"
                            />
                          )}
                        </div>

                        {/* Tie Penalties Resolution Input */}
                        {!isBye && !isMatchPlayed && localScores.home !== '' && localScores.away !== '' && parseInt(localScores.home, 10) === parseInt(localScores.away, 10) && (
                          <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-2.5 mt-2 space-y-2">
                            <p className="text-[9px] font-mono text-orange-400 font-bold uppercase tracking-wider text-center mt-0.5">
                              🎯 Define el ganador por penales y selecciona manualmente quién avanza.
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSelectPenaltyWinner(match.id, match.homePlayer)}
                                className={`py-1.5 px-2 rounded font-display text-[9px] font-black uppercase tracking-wider border cursor-pointer text-center truncate ${
                                  localScores.penaltyWinner === match.homePlayer
                                    ? 'bg-orange-500 border-orange-400 text-white font-bold shadow-sm shadow-orange-900/30'
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }`}
                              >
                                {match.homePlayer}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectPenaltyWinner(match.id, match.awayPlayer)}
                                className={`py-1.5 px-2 rounded font-display text-[9px] font-black uppercase tracking-wider border cursor-pointer text-center truncate ${
                                  localScores.penaltyWinner === match.awayPlayer
                                    ? 'bg-orange-500 border-orange-400 text-white font-bold shadow-sm shadow-orange-900/30'
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }`}
                              >
                                {match.awayPlayer}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Save Score Action Block */}
                        {!isBye && !isMatchPlayed && isActiveRound && localScores.home !== '' && localScores.away !== '' && (
                          <button
                            type="button"
                            onClick={() => handleSaveMatchScore(rIndex, match)}
                            className="w-full mt-2.5 py-2 bg-green-600 hover:bg-green-500 text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                          >
                            <Check className="w-3 h-3" /> Registrar Marcador
                          </button>
                        )}

                        {/* Match Results Info Badge if and isPlayed */}
                        {isMatchPlayed && !isBye && (
                          <div className="bg-slate-900/80 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-[9px] text-slate-400 flex items-center justify-between">
                            <span className="uppercase">Resultado:</span>
                            <span className="font-extrabold text-white">
                              {match.homeGoals} - {match.awayGoals}
                              {match.penaltyWinner && (
                                <span className="text-orange-400 font-bold ml-1 text-[8px] uppercase">
                                  (Pen: {match.penaltyWinner})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        
                        {isMatchPlayed && isBye && (
                          <div className="bg-green-950/10 border border-green-900/20 rounded px-2.5 py-1.5 font-mono text-[9px] text-green-400 text-center uppercase tracking-wide font-extrabold">
                            🏆 Pase automático de ronda 🏆
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bracket Actions Footer: Generates Next Round OR Registra Campeón */}
      <AnimatePresence>
        {isRoundCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="glow-card rounded-2xl p-6 text-center border border-yellow-500/20 bg-yellow-500/5 mt-6 relative"
          >
            {isFinalRound ? (
              <div className="space-y-4">
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto animate-bounce" />
                <h4 className="font-display font-black text-white text-base">
                  ¡Gran Final del Torneo Finalizada!
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  El emocionante torneo de Eliminatoria Directa ha coronado a un campeón. Haz clic a continuación para consagrar su victoria histórica en la Copa Family 2026.
                </p>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 max-w-sm mx-auto text-left mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500 uppercase">Campeón:</span>
                    <span className="font-display font-black text-yellow-450 text-sm flex items-center gap-1 text-yellow-400">
                      🏆 {champion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500 uppercase">Subcampeon:</span>
                    <span className="font-display font-bold text-slate-400 text-xs">
                      🥈 {subchampion}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onFinishKnockout(champion!, subchampion!)}
                  className="mt-2 text-slate-950 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-center py-4 px-6 rounded-xl font-display font-black text-xs uppercase tracking-widest cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mx-auto border border-yellow-300"
                >
                  <Trophy className="w-4 h-4 fill-current animate-spin" /> REGISTRAR CAMPEÓN DE LA COPA
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Sparkles className="w-10 h-10 text-orange-400 mx-auto animate-spin" />
                <h4 className="font-display font-black text-white text-sm uppercase tracking-wide">
                  ¡Ronda Terminada con Éxito!
                </h4>
                <p className="text-xs text-slate-300 max-w-lg mx-auto">
                  Todos los partidos de la ronda actual ({activeRound?.name}) se han completado. Presiona para avanzar a todos los ganadores y generar los apasionantes cruces de la siguiente ronda.
                </p>
                <button
                  type="button"
                  onClick={onAdvanceRound}
                  className="mt-4 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-display font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-orange-950/20 hover:brightness-110 flex items-center justify-center gap-2 mx-auto border border-orange-400/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> GENERAR SIGUIENTE RONDA
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
