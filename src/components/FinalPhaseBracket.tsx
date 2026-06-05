/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Match, FinalPhase } from '../types';
import { Trophy, Check, Swords, HelpCircle, Shuffle } from 'lucide-react';

interface FinalPhaseBracketProps {
  finalPhase: FinalPhase;
  onUpdateSemiScore: (index: number, homeGoals: number, awayGoals: number, penaltyWinner: string | null) => void;
  onUpdateFinalScore: (homeGoals: number, awayGoals: number, penaltyWinner: string | null) => void;
  onFinishTournament: () => void;
}

export default function FinalPhaseBracket({
  finalPhase,
  onUpdateSemiScore,
  onUpdateFinalScore,
  onFinishTournament,
}: FinalPhaseBracketProps) {
  const { semis, finalMatch, champion } = finalPhase;

  // Local state for scores of Semis and Finals
  const [semiScores, setSemiScores] = useState<
    Record<number, { home: string; away: string; penaltyWinner: string | null }>
  >({
    0: {
      home: semis[0]?.homeGoals !== null && semis[0]?.homeGoals !== undefined ? String(semis[0].homeGoals) : '',
      away: semis[0]?.awayGoals !== null && semis[0]?.awayGoals !== undefined ? String(semis[0].awayGoals) : '',
      penaltyWinner: semis[0]?.penaltyWinner || null,
    },
    1: {
      home: semis[1]?.homeGoals !== null && semis[1]?.homeGoals !== undefined ? String(semis[1].homeGoals) : '',
      away: semis[1]?.awayGoals !== null && semis[1]?.awayGoals !== undefined ? String(semis[1].awayGoals) : '',
      penaltyWinner: semis[1]?.penaltyWinner || null,
    },
  });

  const [finalScore, setFinalScore] = useState<{ home: string; away: string; penaltyWinner: string | null }>({
    home: finalMatch?.homeGoals !== null && finalMatch?.homeGoals !== undefined ? String(finalMatch.homeGoals) : '',
    away: finalMatch?.awayGoals !== null && finalMatch?.awayGoals !== undefined ? String(finalMatch.awayGoals) : '',
    penaltyWinner: finalMatch?.penaltyWinner || null,
  });

  // Sync states when matches are generated or updated externally
  React.useEffect(() => {
    setSemiScores({
      0: {
        home: semis[0]?.homeGoals !== null && semis[0]?.homeGoals !== undefined ? String(semis[0].homeGoals) : '',
        away: semis[0]?.awayGoals !== null && semis[0]?.awayGoals !== undefined ? String(semis[0].awayGoals) : '',
        penaltyWinner: semis[0]?.penaltyWinner || null,
      },
      1: {
        home: semis[1]?.homeGoals !== null && semis[1]?.homeGoals !== undefined ? String(semis[1].homeGoals) : '',
        away: semis[1]?.awayGoals !== null && semis[1]?.awayGoals !== undefined ? String(semis[1].awayGoals) : '',
        penaltyWinner: semis[1]?.penaltyWinner || null,
      },
    });
  }, [
    semis[0]?.homePlayer,
    semis[0]?.awayPlayer,
    semis[0]?.homeGoals,
    semis[0]?.awayGoals,
    semis[0]?.penaltyWinner,
    semis[1]?.homePlayer,
    semis[1]?.awayPlayer,
    semis[1]?.homeGoals,
    semis[1]?.awayGoals,
    semis[1]?.penaltyWinner,
  ]);

  React.useEffect(() => {
    setFinalScore({
      home: finalMatch?.homeGoals !== null && finalMatch?.homeGoals !== undefined ? String(finalMatch.homeGoals) : '',
      away: finalMatch?.awayGoals !== null && finalMatch?.awayGoals !== undefined ? String(finalMatch.awayGoals) : '',
      penaltyWinner: finalMatch?.penaltyWinner || null,
    });
  }, [
    finalMatch?.homePlayer,
    finalMatch?.awayPlayer,
    finalMatch?.homeGoals,
    finalMatch?.awayGoals,
    finalMatch?.penaltyWinner,
  ]);

  const handleSemiScoreChange = (index: number, side: 'home' | 'away', val: string) => {
    const clean = val.replace(/\D/g, '');
    setSemiScores((prev) => {
      const current = { ...prev[index], [side]: clean };
      // Clear penalty winner if scores are modified to not be equal
      const isTie = current.home !== '' && current.away !== '' && parseInt(current.home, 10) === parseInt(current.away, 10);
      if (!isTie) {
        current.penaltyWinner = null;
      }
      return { ...prev, [index]: current };
    });
  };

  const handleSemiPenaltySelect = (index: number, winner: string) => {
    setSemiScores((prev) => ({
      ...prev,
      [index]: { ...prev[index], penaltyWinner: winner },
    }));
  };

  const handleSaveSemi = (index: number) => {
    const s = semiScores[index];
    const hG = parseInt(s.home, 10);
    const aG = parseInt(s.away, 10);

    if (isNaN(hG) || isNaN(aG)) {
      alert('Ingresa goles válidos para la semifinal.');
      return;
    }

    // Check penalty shootout tie-break requirement
    if (hG === aG && !s.penaltyWinner) {
      alert('Al ser un formato de eliminación directa, debes elegir al ganador en tanda de penales.');
      return;
    }

    const match = semis[index];
    onUpdateSemiScore(index, hG, aG, hG === aG ? s.penaltyWinner : null);
  };

  // Final matches handlers
  const handleFinalScoreChange = (side: 'home' | 'away', val: string) => {
    const clean = val.replace(/\D/g, '');
    setFinalScore((prev) => {
      const current = { ...prev, [side]: clean };
      const isTie = current.home !== '' && current.away !== '' && parseInt(current.home, 10) === parseInt(current.away, 10);
      if (!isTie) {
        current.penaltyWinner = null;
      }
      return current;
    });
  };

  const handleSaveFinal = () => {
    const hG = parseInt(finalScore.home, 10);
    const aG = parseInt(finalScore.away, 10);

    if (isNaN(hG) || isNaN(aG)) {
      alert('Ingresa goles válidos para la final.');
      return;
    }

    if (hG === aG && !finalScore.penaltyWinner) {
      alert('La final no puede terminar en empate. Define el ganador en penales.');
      return;
    }

    onUpdateFinalScore(hG, aG, hG === aG ? finalScore.penaltyWinner : null);
  };

  // Semifinals played count
  const allSemisPlayed = semis[0]?.played && semis[1]?.played;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8" id="playoff-bracket">
      
      {/* Knockout visual timeline headers */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-200 uppercase tracking-wider flex justify-center items-center gap-2">
          <Swords className="w-6 h-6 text-yellow-500 animate-pulse" /> Playoffs Finales
        </h2>
        <p className="text-slate-400 text-xs font-mono mt-1">
          REGLA: Eliminación directa. Empate obliga definición en tanda de penales en su PlayStation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
        
        {/* SECTION 1: SEMIFINALS */}
        <div className="space-y-6">
          <h3 className="text-xs font-mono font-black text-green-400 uppercase tracking-widest border-b border-green-950 pb-2 flex items-center justify-between">
            <span>🏟️ Semifinales de Copa</span>
            <span className="text-[10px] text-slate-500 normal-case">Definidas por clasificación de liga</span>
          </h3>

          <div className="space-y-4">
            {semis.map((match, idx) => {
              const score = semiScores[idx];
              const isTie = score.home !== '' && score.away !== '' && parseInt(score.home, 10) === parseInt(score.away, 10);
              const isPlayed = match.played;

              return (
                <div
                  key={match.id}
                  className={`glow-card rounded-xl p-4 border-t-2 transition-all relative overflow-hidden ${
                    isPlayed ? 'border-t-emerald-500 bg-slate-950/45' : 'border-t-brand-green hover:border-b-2 hover:border-b-green-500/20'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-2">
                    <span className="font-bold text-yellow-500">SEMIFINAL {idx + 1}</span>
                    <span className={isPlayed ? 'text-emerald-400 font-bold' : 'text-green-400'}>
                      {isPlayed ? '✓ Registrado' : '○ En Juego'}
                    </span>
                  </div>

                  {/* Matches Layout */}
                  <div className="space-y-3">
                    {/* Home Side */}
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-display font-extrabold text-white truncate">{match.homePlayer}</p>
                        <p className="text-[10px] text-slate-400 truncate">{match.homeTeam}</p>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={score.home}
                        disabled={isPlayed}
                        onChange={(e) => handleSemiScoreChange(idx, 'home', e.target.value)}
                        className="w-10 h-9 bg-slate-900 border border-slate-800 disabled:opacity-60 text-center text-sm font-bold font-mono text-white rounded-lg focus:border-yellow-500"
                      />
                    </div>

                    {/* Divider Versus */}
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-600 select-none">
                      <span className="h-px bg-slate-800 flex-1" />
                      <span>VS</span>
                      <span className="h-px bg-slate-800 flex-1" />
                    </div>

                    {/* Away Side */}
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-display font-extrabold text-white truncate">{match.awayPlayer}</p>
                        <p className="text-[10px] text-slate-400 truncate">{match.awayTeam}</p>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={score.away}
                        disabled={isPlayed}
                        onChange={(e) => handleSemiScoreChange(idx, 'away', e.target.value)}
                        className="w-10 h-9 bg-slate-900 border border-slate-800 disabled:opacity-60 text-center text-sm font-bold font-mono text-white rounded-lg focus:border-yellow-500"
                      />
                    </div>

                    {/* Penalty Shooters layout (Visible only if score holds tie) */}
                    {isTie && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2.5 mt-2">
                        <p className="text-[10px] font-mono text-yellow-400 font-bold uppercase tracking-wider text-center mb-2">
                          🎯 Definió por penaltis: Elige vencedor
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isPlayed}
                            onClick={() => handleSemiPenaltySelect(idx, match.homePlayer)}
                            className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all truncate cursor-pointer ${
                              score.penaltyWinner === match.homePlayer
                                ? 'bg-yellow-500 border-yellow-400 text-slate-950 font-bold shadow-md shadow-yellow-950/20'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {match.homePlayer}
                          </button>
                          <button
                            type="button"
                            disabled={isPlayed}
                            onClick={() => handleSemiPenaltySelect(idx, match.awayPlayer)}
                            className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all truncate cursor-pointer ${
                              score.penaltyWinner === match.awayPlayer
                                ? 'bg-yellow-500 border-yellow-400 text-slate-950 font-bold shadow-md shadow-yellow-950/20'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {match.awayPlayer}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Save or feedback actions */}
                    {!isPlayed ? (
                      <button
                        type="button"
                        onClick={() => handleSaveSemi(idx)}
                        className="w-full mt-2 py-2 bg-green-600 hover:bg-green-500 text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                      >
                        <Check className="w-3.5 h-3.5" /> Registrar Ganador
                      </button>
                    ) : (
                      <div className="mt-2 text-center text-[10px] font-mono bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-1.5 rounded-lg font-bold">
                        Avanza: {match.homeGoals! > match.awayGoals! ? match.homePlayer : match.homeGoals! < match.awayGoals! ? match.awayPlayer : match.penaltyWinner}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: CHANNELS TO THE GRAND FINALE */}
        <div className="space-y-6">
          <h3 className="text-xs font-mono font-black text-yellow-400 uppercase tracking-widest border-b border-yellow-950 pb-2 flex items-center justify-between">
            <span>🏆 La Gran Final</span>
            <span className="text-[10px] text-slate-500 normal-case">El trofeo espera en casa</span>
          </h3>

          {!allSemisPlayed ? (
            <div className="glow-card rounded-xl p-6 text-center border border-dashed border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
              <Trophy className="w-10 h-10 text-slate-700 mb-2.5" />
              <p className="text-sm font-display font-medium text-slate-400">Gran Final Pendiente</p>
              <p className="text-xs text-slate-600 font-mono mt-1 max-w-xs mx-auto">
                Los dos vencedores de las semifinales avanzarán aquí automáticamente para jugar el último partido por el trofeo.
              </p>
            </div>
          ) : finalMatch ? (
            <div className="glow-card rounded-xl p-5 border border-yellow-500/10 border-t-2 border-t-brand-gold relative shadow-[0_4px_30px_rgba(245,158,11,0.15)] bg-slate-950/80">
              <div className="absolute top-0 right-0 p-3 opacity-10 text-yellow-400">
                <Trophy className="w-16 h-16 gold-glow" />
              </div>
              
              <div className="text-center font-mono text-[10px] font-extrabold text-yellow-400 tracking-widest uppercase mb-4">
                🏆 Gran Partido por el Campeonato 🏆
              </div>

              {/* Match Layout */}
              <div className="space-y-4">
                {/* Home Side */}
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-display font-black text-white text-base truncate">{finalMatch.homePlayer}</p>
                    <p className="text-[10px] text-slate-400 truncate">{finalMatch.homeTeam}</p>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={finalScore.home}
                    disabled={finalMatch.played}
                    onChange={(e) => handleFinalScoreChange('home', e.target.value)}
                    className="w-11 h-10 bg-slate-900 border border-slate-700 text-center text-base font-bold font-mono text-white rounded-lg focus:border-yellow-500"
                  />
                </div>

                {/* VS Indicator */}
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-600 select-none">
                  <span className="h-px bg-slate-800 flex-1" />
                  <span>VS</span>
                  <span className="h-px bg-slate-800 flex-1" />
                </div>

                {/* Away Side */}
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-display font-black text-white text-base truncate">{finalMatch.awayPlayer}</p>
                    <p className="text-[10px] text-slate-400 truncate">{finalMatch.awayTeam}</p>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={finalScore.away}
                    disabled={finalMatch.played}
                    onChange={(e) => handleFinalScoreChange('away', e.target.value)}
                    className="w-11 h-10 bg-slate-900 border border-slate-700 text-center text-base font-bold font-mono text-white rounded-lg focus:border-yellow-500"
                  />
                </div>

                {/* Penalty Shootout Selector */}
                {finalScore.home !== '' && finalScore.away !== '' && parseInt(finalScore.home, 10) === parseInt(finalScore.away, 10) && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2.5 mt-2">
                    <p className="text-[10px] font-mono text-yellow-400 font-bold uppercase tracking-wider text-center mb-2">
                      🎯 Definido por Penaltis: ¿Quién salió Campeón?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={finalMatch.played}
                        onClick={() => setFinalScore(prev => ({ ...prev, penaltyWinner: finalMatch.homePlayer }))}
                        className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all truncate cursor-pointer ${
                          finalScore.penaltyWinner === finalMatch.homePlayer
                            ? 'bg-yellow-500 border-yellow-400 text-slate-950 font-bold shadow-md shadow-yellow-950/20'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {finalMatch.homePlayer}
                      </button>
                      <button
                        type="button"
                        disabled={finalMatch.played}
                        onClick={() => setFinalScore(prev => ({ ...prev, penaltyWinner: finalMatch.awayPlayer }))}
                        className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all truncate cursor-pointer ${
                          finalScore.penaltyWinner === finalMatch.awayPlayer
                            ? 'bg-yellow-500 border-yellow-400 text-slate-950 font-bold shadow-md shadow-yellow-950/20'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {finalMatch.awayPlayer}
                      </button>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                {!finalMatch.played ? (
                  <button
                    type="button"
                    onClick={handleSaveFinal}
                    className="w-full mt-3 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-display font-extrabold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-yellow-900/30 font-black"
                  >
                    <Trophy className="w-4 h-4" /> REGISTRAR CAMPEÓN DE LA COPA
                  </button>
                ) : (
                  <div className="space-y-4 mt-4">
                    <div className="text-center font-display font-extrabold text-lg text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-xl">
                      🎉 ¡FINALIZADO CON ÉXITO! 🎉
                    </div>
                    <button
                      type="button"
                      onClick={onFinishTournament}
                      className="w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-slate-950 font-display font-black text-sm tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-[0_4px_25px_rgba(251,191,36,0.3)] hover:scale-[1.01] active:scale-95 text-center flex items-center justify-center gap-2 border border-yellow-300"
                    >
                      <Trophy className="w-5 h-5 fill-current" /> IR A PANTALLA DE CAMPEÓN ÉPICA
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glow-card rounded-xl p-6 text-center border border-dashed border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
              <Trophy className="w-10 h-10 text-slate-700 mb-2.5" />
              <p className="text-sm font-display font-medium text-slate-400 text-rose-400">Error de Playoffs</p>
              <p className="text-xs text-slate-600 font-mono mt-1">
                Ocurrió un error al cargar la final. Por favor reportar o reiniciar.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
