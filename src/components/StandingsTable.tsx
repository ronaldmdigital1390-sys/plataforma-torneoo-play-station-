/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerStats } from '../types';
import { Trophy, ChevronRight, CircleDot } from 'lucide-react';

interface StandingsTableProps {
  standings: PlayerStats[];
  playersCount: number;
}

export default function StandingsTable({ standings, playersCount }: StandingsTableProps) {
  return (
    <div className="glow-card rounded-2xl p-4 sm:p-5 relative overflow-hidden border-t-2 border-t-brand-green shadow-[0_4px_25px_rgba(34,197,94,0.06)]" id="standings-table-card">
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" /> Tabla de Posiciones
          </h2>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Ordenado por: PTS &gt; DG &gt; GF
          </p>
        </div>
        
        {/* Legendary indicator */}
        <div className="flex items-center gap-1.5 bg-green-950/50 border border-green-900/40 rounded-lg px-2.5 py-1 text-[10px] font-mono font-medium text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Clasifica Semifinales
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
              <th className="py-2.5 w-10 text-center">Pos</th>
              <th className="py-2.5">Jugador</th>
              <th className="py-2.5">Club</th>
              <th className="py-2.5 text-center w-8">PJ</th>
              <th className="py-2.5 text-center w-8">G</th>
              <th className="py-2.5 text-center w-8">E</th>
              <th className="py-2.5 text-center w-8">P</th>
              <th className="py-2.5 text-center w-12">GF:GC</th>
              <th className="py-2.5 text-center w-10">DG</th>
              <th className="py-2.5 text-right pr-2 w-12">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {standings.map((stat, idx) => {
              const position = idx + 1;
              const isPlayoffZone = position <= 4;
              
              return (
                <tr 
                  key={stat.player} 
                  className={`group transition-all ${
                    isPlayoffZone 
                      ? 'bg-green-600/[0.02] hover:bg-green-600/[0.07]' 
                      : 'hover:bg-slate-900/30'
                  }`}
                >
                  {/* Position Column */}
                  <td className="py-3 text-center">
                    <div className="flex justify-center items-center">
                      {position === 1 ? (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 text-xs font-mono font-black shadow-[0_0_10px_rgba(250,204,21,0.4)] gold-glow">
                          1
                        </div>
                      ) : position === 2 ? (
                        <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-slate-950 text-xs font-mono font-black shadow-[0_0_10px_rgba(203,213,225,0.2)]">
                          2
                        </div>
                      ) : position === 3 ? (
                        <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-mono font-black">
                          3
                        </div>
                      ) : (
                        <span className={`text-xs font-mono font-bold ${isPlayoffZone ? 'text-green-400' : 'text-slate-500'}`}>
                          {position}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Player Name */}
                  <td className="py-3 font-display">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-sm ${isPlayoffZone ? 'text-green-100' : 'text-slate-300'}`}>
                        {stat.player}
                      </span>
                      {isPlayoffZone && (
                        <span className="text-[9px] font-mono text-green-400 tracking-tighter uppercase px-1 py-0.2 bg-green-950/40 border border-green-900/40 rounded">
                          Playoff
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Team/Club Badge descriptor */}
                  <td className="py-3 project-club font-display text-xs text-slate-450 font-medium">
                    {stat.team}
                  </td>

                  {/* Matches Played */}
                  <td className="py-3 text-center font-mono text-xs font-medium text-slate-300">
                    {stat.pj}
                  </td>

                  {/* Games Won */}
                  <td className="py-3 text-center font-mono text-xs font-bold text-green-400">
                    {stat.pg}
                  </td>

                  {/* Games Drawn */}
                  <td className="py-3 text-center font-mono text-xs text-slate-400">
                    {stat.pe}
                  </td>

                  {/* Games Lost */}
                  <td className="py-3 text-center font-mono text-xs text-rose-400">
                    {stat.pp}
                  </td>

                  {/* Goals For : Goals Against */}
                  <td className="py-3 text-center font-mono text-xs text-slate-400">
                    {stat.gf}:{stat.gc}
                  </td>

                  {/* Goal Difference */}
                  <td className={`py-3 text-center font-mono text-xs font-bold ${
                    stat.dg > 0 ? 'text-emerald-400' : stat.dg < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {stat.dg > 0 ? `+${stat.dg}` : stat.dg}
                  </td>

                  {/* Total Points */}
                  <td className="py-3 text-right pr-2 font-mono">
                    <span className={`text-sm font-black tracking-tight ${
                      isPlayoffZone ? 'text-yellow-400 font-extrabold group-hover:text-yellow-300' : 'text-slate-200'
                    }`}>
                      {stat.pts}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Playoff Qualifying Notice */}
      <div className="mt-4 p-3 bg-green-950/20 border border-green-900/30 rounded-xl flex items-start gap-2.5">
        <div className="p-1 bg-green-600/15 rounded-lg text-green-400 mt-0.5 shrink-0">
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs text-slate-350 font-sans leading-relaxed text-slate-300">
          Los <strong className="text-green-400 font-extrabold">4 mejores clasificados</strong> disputarán de manera automática los playoffs de semifinales: <strong className="text-yellow-400">1° vs 4°</strong> y <strong className="text-yellow-400">2° vs 3°</strong> para coronar al Campeón Absoluto.
        </div>
      </div>
    </div>
  );
}
