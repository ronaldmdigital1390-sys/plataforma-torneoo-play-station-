/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Match } from '../types';
import { Gamepad2, Play, Check, CircleAlert, Flame, Filter, Calendar } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  onUpdateScore: (matchId: string, homeGoals: number, awayGoals: number) => void;
}

export default function MatchList({ matches, onUpdateScore }: MatchListProps) {
  const [selectedRound, setSelectedRound] = useState<number | 'all'>(1);
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'played'>('all');

  // Find the distinct rounds available
  const rounds = useMemo(() => {
    const rSet = new Set<number>();
    matches.forEach(m => {
      if (!m.isSemifinal && !m.isFinal) {
        rSet.add(m.round);
      }
    });
    return Array.from(rSet).sort((a, b) => a - b);
  }, [matches]);

  // Handle active starting round initialization if selectedRound is default empty
  React.useEffect(() => {
    // Set default selectedRound to the first round containing pending matches, if any
    const firstPendingMatch = matches.find(m => !m.played && !m.isSemifinal && !m.isFinal);
    if (firstPendingMatch) {
      setSelectedRound(firstPendingMatch.round);
    } else if (rounds.length > 0 && selectedRound === 1 && !rounds.includes(1)) {
      setSelectedRound(rounds[0]);
    }
  }, [matches, rounds]);

  // Spotlight Next Match ("Próximo partido destacado")
  const spotlightMatch = useMemo(() => {
    // It's the first available non-played regular match
    return matches.find(m => !m.played && !m.isSemifinal && !m.isFinal) || null;
  }, [matches]);

  // Filtered regular matches to show in listings
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Exclude semifinal and final matches which are managed in the playoffs tab
      if (m.isSemifinal || m.isFinal) return false;

      const roundMatch = selectedRound === 'all' || m.round === selectedRound;
      const statusMatch = 
        filterType === 'all' || 
        (filterType === 'pending' && !m.played) || 
        (filterType === 'played' && m.played);

      return roundMatch && statusMatch;
    });
  }, [matches, selectedRound, filterType]);

  // Temp local input values to hold values before saving
  const [tempScores, setTempScores] = useState<Record<string, { home: string; away: string }>>({});

  const handleLocalScoreChange = (matchId: string, side: 'home' | 'away', val: string) => {
    // Allow digits and empty string
    const sanitized = val.replace(/\D/g, '');
    setTempScores(prev => ({
      ...prev,
      [matchId]: {
        home: side === 'home' ? sanitized : (prev[matchId]?.home ?? ''),
        away: side === 'away' ? sanitized : (prev[matchId]?.away ?? '')
      }
    }));
  };

  const handleSaveScore = (match: Match) => {
    const scores = tempScores[match.id];
    const hStr = scores?.home ?? String(match.homeGoals ?? '0');
    const aStr = scores?.away ?? String(match.awayGoals ?? '0');

    const homeVal = parseInt(hStr, 10);
    const awayVal = parseInt(aStr, 10);

    if (isNaN(homeVal) || isNaN(awayVal)) {
      alert('Ingresa goles válidos para ambos equipos.');
      return;
    }

    onUpdateScore(match.id, homeVal, awayVal);
  };

  return (
    <div className="space-y-6" id="fixtures-panel">
      
      {/* 🚀 STUNNING SPOTLIGHT MATCH CARD (Próximo Partido Destacado) */}
      {spotlightMatch && (
        <div className="relative rounded-2xl overflow-hidden border border-green-500/20 shadow-[0_4px_25px_rgba(34,197,94,0.15)] bg-slate-950/80 backdrop-blur-md p-5 mt-2 border-t-2 border-t-green-550">
          {/* Subtle animated light background effects */}
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5 text-green-500 animate-pulse" /> Siguiente Partido Destacado
            </span>
            <span className="font-mono text-xs text-slate-400">
              Ronda {spotlightMatch.round}
            </span>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center justify-between py-3">
            {/* Home Player */}
            <div className="col-span-4 text-center">
              <div className="inline-block p-2 bg-green-600/10 rounded-xl mb-1.5 border border-green-500/15">
                <Gamepad2 className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-display font-black text-sm text-white truncate max-w-full">
                {spotlightMatch.homePlayer}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {spotlightMatch.homeTeam}
              </p>
            </div>

            {/* Score Intermediary */}
            <div className="col-span-4 px-2">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="-"
                    value={tempScores[spotlightMatch.id]?.home ?? (spotlightMatch.homeGoals !== null ? String(spotlightMatch.homeGoals) : '')}
                    onChange={(e) => handleLocalScoreChange(spotlightMatch.id, 'home', e.target.value)}
                    className="w-12 h-14 bg-slate-900 border-2 border-slate-800 rounded-xl text-center text-xl font-bold font-mono text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all select-all shadow-inner"
                  />
                  <span className="text-slate-600 font-mono text-sm px-0.5 select-none">VS</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="-"
                    value={tempScores[spotlightMatch.id]?.away ?? (spotlightMatch.awayGoals !== null ? String(spotlightMatch.awayGoals) : '')}
                    onChange={(e) => handleLocalScoreChange(spotlightMatch.id, 'away', e.target.value)}
                    className="w-12 h-14 bg-slate-900 border-2 border-slate-800 rounded-xl text-center text-xl font-bold font-mono text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all select-all shadow-inner"
                  />
                </div>
                
                <button
                  onClick={() => handleSaveScore(spotlightMatch)}
                  className="mt-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-400 text-white font-mono font-bold text-[11px] uppercase tracking-wider py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-green-950/20"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Registrar resultado
                </button>
              </div>
            </div>

            {/* Away Player */}
            <div className="col-span-4 text-center">
              <div className="inline-block p-2 bg-red-600/10 rounded-xl mb-1.5 border border-red-500/15">
                <Gamepad2 className="w-6 h-6 text-red-400" />
              </div>
              <h4 className="font-display font-black text-sm text-white truncate max-w-full">
                {spotlightMatch.awayPlayer}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {spotlightMatch.awayTeam}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 📅 FIXTURE MATCH LISTINGS & FILTERS */}
      <div className="glow-card rounded-2xl p-4 sm:p-5 relative border-t-2 border-t-red-500 shadow-[0_4px_25px_rgba(220,38,38,0.06)]" id="fixture-listings-card">
        
        {/* Header and Round Selectors */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-550" /> Calendario de Partidos
            </h3>

            {/* Simple Status Filter */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0 self-start">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-slate-850 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                  filterType === 'pending' ? 'bg-slate-850 text-yellow-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilterType('played')}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                  filterType === 'played' ? 'bg-slate-850 text-green-450' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Jugados
              </button>
            </div>
          </div>

          {/* Horizontally Scrollable Round Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <button
              onClick={() => setSelectedRound('all')}
              className={`shrink-0 px-3.5 py-1.5 text-xs font-display font-bold rounded-lg transition-all cursor-pointer border ${
                selectedRound === 'all'
                  ? 'bg-red-600/20 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              Todas las Rondas
            </button>
            
            {rounds.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRound(r)}
                className={`shrink-0 px-3.5 py-1.5 text-xs font-display font-bold rounded-lg transition-all cursor-pointer border ${
                  selectedRound === r
                    ? 'bg-red-600/20 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                Ronda {r}
              </button>
            ))}
          </div>
        </div>

        {/* Matches list */}
        <div className="mt-4 space-y-3.5">
          {filteredMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
              <CircleAlert className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm font-display font-semibold">No se encontraron partidos</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">Intenta cambiando el filtro o seleccionando otra ronda.</p>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const isMatchPlayed = m.played;
              const hasUnsavedChanges = 
                tempScores[m.id]?.home !== undefined || 
                tempScores[m.id]?.away !== undefined;

              return (
                <div
                  key={m.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isMatchPlayed
                      ? 'bg-slate-950/40 border-slate-850 opacity-80'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-755'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2 font-mono text-[10px] text-slate-500">
                    <span>RONDA {m.round}</span>
                    <span className={isMatchPlayed ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                      {isMatchPlayed ? '● Jugado' : '○ Pendiente'}
                    </span>
                  </div>

                  {/* Scoreboard line */}
                  <div className="flex items-center justify-between gap-2">
                    
                    {/* Home Team */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-display font-bold text-sm text-slate-100 truncate">
                        {m.homePlayer}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {m.homeTeam}
                      </p>
                    </div>

                    {/* Compact score inputs */}
                    <div className="flex items-center gap-1 shrink-0 px-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="-"
                        value={tempScores[m.id]?.home ?? (m.homeGoals !== null ? String(m.homeGoals) : '')}
                        onChange={(e) => handleLocalScoreChange(m.id, 'home', e.target.value)}
                        className={`w-9 h-10 bg-slate-900 border text-center font-mono font-bold rounded-lg text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all ${
                          isMatchPlayed ? 'border-slate-800' : 'border-slate-700'
                        }`}
                      />
                      <span className="text-slate-600 font-mono text-xs font-semibold px-0.5">vs</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="-"
                        value={tempScores[m.id]?.away ?? (m.awayGoals !== null ? String(m.awayGoals) : '')}
                        onChange={(e) => handleLocalScoreChange(m.id, 'away', e.target.value)}
                        className={`w-9 h-10 bg-slate-900 border text-center font-mono font-bold rounded-lg text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all ${
                          isMatchPlayed ? 'border-slate-800' : 'border-slate-700'
                        }`}
                      />
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-display font-bold text-sm text-slate-100 truncate">
                        {m.awayPlayer}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {m.awayTeam}
                      </p>
                    </div>

                    {/* Action update button */}
                    <div className="w-10 flex justify-end">
                      <button
                        onClick={() => handleSaveScore(m)}
                        id={`save-btn-${m.id}`}
                        className={`p-2 rounded-lg cursor-pointer transition-all active:scale-95 ${
                          hasUnsavedChanges
                            ? 'bg-red-600 text-white shadow-md shadow-red-900/40 border border-red-400/20'
                            : isMatchPlayed
                            ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-amber-500'
                        }`}
                        title="Guardar marcador"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
