/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TournamentStats } from '../types';
import { Shield, Flame, Activity, TrendingUp, Zap, HelpCircle } from 'lucide-react';

interface StatsPanelProps {
  stats: TournamentStats;
  hasPlayedMatches: boolean;
}

export default function StatsPanel({ stats, hasPlayedMatches }: StatsPanelProps) {
  if (!hasPlayedMatches) {
    return (
      <div className="glow-card rounded-2xl p-8 text-center" id="empty-stats-card">
        <div className="absolute top-0 left-0 w-2 h-full bg-slate-600" />
        <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="font-display font-black text-white text-lg">No hay estadísticas aún</h3>
        <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
          Los récords y estadísticas especiales se calcularán automáticamente en el momento en que se registre el primer resultado de la copa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="stats-panel-root">
      {/* Grid for dynamic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        
        {/* Card 1: Top Scorer Team */}
        {stats.topScorer && (
          <div className="glow-card rounded-xl p-4 relative overflow-hidden flex flex-col justify-between border-t-2 border-t-brand-green">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-green-400">
              <Flame className="w-16 h-16" />
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-xs text-green-400 font-mono uppercase tracking-widest font-semibold mb-2">
                <Flame className="w-4 h-4 text-emerald-400" /> Killer del Torneo
              </span>
              <h4 className="text-xl font-display font-black text-white truncate">
                {stats.topScorer.player}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                {stats.topScorer.team}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-black text-yellow-400 leading-none">
                {stats.topScorer.goals}
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase">goles a favor</span>
            </div>
          </div>
        )}

        {/* Card 2: Steel Defense */}
        {stats.bestDefense && (
          <div className="glow-card rounded-xl p-4 relative overflow-hidden flex flex-col justify-between border-t-2 border-t-red-500">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-red-400">
              <Shield className="w-16 h-16" />
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-xs text-red-400 font-mono uppercase tracking-widest font-semibold mb-2">
                <Shield className="w-4 h-4 text-red-400" /> Defensa de Acero
              </span>
              <h4 className="text-xl font-display font-black text-white truncate">
                {stats.bestDefense.player}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                {stats.bestDefense.team}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-black text-red-400 leading-none">
                {stats.bestDefense.goalsAgainst}
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase">goles en contra</span>
            </div>
          </div>
        )}

        {/* Card 3: Best Goal Difference */}
        {stats.bestDg && (
          <div className="glow-card rounded-xl p-4 relative overflow-hidden flex flex-col justify-between border-t-2 border-t-brand-gold sm:col-span-2 md:col-span-1">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-yellow-400">
              <Activity className="w-16 h-16" />
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-xs text-yellow-400 font-mono uppercase tracking-widest font-semibold mb-2">
                <Activity className="w-4 h-4 text-yellow-400" /> Balance Goleador
              </span>
              <h4 className="text-xl font-display font-black text-white truncate">
                {stats.bestDg.player}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                {stats.bestDg.team}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-black text-yellow-400 leading-none">
                {stats.bestDg.dg > 0 ? `+${stats.bestDg.dg}` : stats.bestDg.dg}
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase">Dif. de Goles</span>
            </div>
          </div>
        )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 4: Blowout Victory */}
        {stats.biggestWin && (
          <div className="glow-card rounded-xl p-5 relative border-t-2 border-t-brand-red">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-rose-500">
              <TrendingUp className="w-16 h-16" />
            </div>
            <span className="flex items-center gap-1.5 text-xs text-rose-400 font-mono uppercase tracking-widest font-semibold mb-3">
              <TrendingUp className="w-4 h-4 text-rose-400" /> Mayor Goleada Registrada
            </span>

            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/60 flex items-center justify-between gap-3 text-center">
              <div className="flex-1 min-w-0">
                <p className="font-display font-black text-sm text-slate-200 truncate">{stats.biggestWin.match.homePlayer}</p>
                <p className="text-[10px] text-slate-500 truncate">{stats.biggestWin.match.homeTeam}</p>
              </div>

              <div className="shrink-0 bg-slate-900 border border-slate-805 px-3 py-1.5 rounded-lg">
                <span className="font-mono text-base font-black text-white tracking-widest">
                  {stats.biggestWin.match.homeGoals} - {stats.biggestWin.match.awayGoals}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-display font-black text-sm text-slate-200 truncate">{stats.biggestWin.match.awayPlayer}</p>
                <p className="text-[10px] text-slate-500 truncate">{stats.biggestWin.match.awayTeam}</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-mono text-right mt-2 uppercase tracking-wide">
              Diferencia de {stats.biggestWin.diff} goles • Ronda {stats.biggestWin.match.round}
            </p>
          </div>
        )}

        {/* Card 5: Highest-scoring Match */}
        {stats.mostGoalsMatch && (
          <div className="glow-card rounded-xl p-5 relative border-t-2 border-t-emerald-500">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-500">
              <Zap className="w-16 h-16" />
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono uppercase tracking-widest font-semibold mb-3">
              <Zap className="w-4 h-4 text-emerald-400" /> Partido con Más Goles
            </span>

            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/60 flex items-center justify-between gap-3 text-center">
              <div className="flex-1 min-w-0">
                <p className="font-display font-black text-sm text-slate-200 truncate">{stats.mostGoalsMatch.match.homePlayer}</p>
                <p className="text-[10px] text-slate-500 truncate">{stats.mostGoalsMatch.match.homeTeam}</p>
              </div>

              <div className="shrink-0 bg-slate-900 border border-slate-805 px-3 py-1.5 rounded-lg">
                <span className="font-mono text-base font-black text-white tracking-widest">
                  {stats.mostGoalsMatch.match.homeGoals} - {stats.mostGoalsMatch.match.awayGoals}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-display font-black text-sm text-slate-200 truncate">{stats.mostGoalsMatch.match.awayPlayer}</p>
                <p className="text-[10px] text-slate-500 truncate">{stats.mostGoalsMatch.match.awayTeam}</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-mono text-right mt-2 uppercase tracking-wide">
              Total de {stats.mostGoalsMatch.goals} goles marcados • Ronda {stats.mostGoalsMatch.match.round}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
