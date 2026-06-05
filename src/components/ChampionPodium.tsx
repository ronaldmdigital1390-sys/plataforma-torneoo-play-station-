/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Trophy, Share2, Globe, RefreshCcw, Landmark, Sparkles, Star } from 'lucide-react';
import { ChampionRecord } from '../types';

interface ChampionPodiumProps {
  tournamentName: string;
  champion: string;
  championTeam: string;
  subchampion: string;
  onNewSeason: () => void;
  onResetAll: () => void;
  onShareWhatsApp: () => void;
  records: ChampionRecord[];
}

export default function ChampionPodium({
  tournamentName,
  champion,
  championTeam,
  subchampion,
  onNewSeason,
  onResetAll,
  onShareWhatsApp,
  records,
}: ChampionPodiumProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 relative" id="champion-podium-root">
      {/* Absolute particle/neon aura backdrops */}
      <div className="absolute inset-0 bg-radial from-yellow-500/10 via-transparent to-transparent blur-3xl -z-10" />
      
      {/* Animated visual elements */}
      <div className="text-center space-y-4 mb-8">
        <motion.div
          initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
          animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 80, delay: 0.1 }}
          className="relative inline-block"
        >
          {/* Neon lights backdrop */}
          <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full scale-125 animate-pulse" />
          
          <div className="bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 p-6 rounded-full border-2 border-yellow-300 shadow-[0_0_50px_rgba(250,204,21,0.5)] gold-glow relative z-10">
            <Trophy className="w-20 h-20 text-white fill-current animate-bounce" />
          </div>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-3 -right-3 text-yellow-300 z-25"
          >
            <Star className="w-6 h-6 fill-current" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-2 -left-3 text-yellow-300 z-25"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-1.5"
        >
          <p className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-black flex items-center justify-center gap-1">
            ✨ ¡La Copa tiene nuevo Dueño! ✨
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 uppercase tracking-tight drop-shadow-lg leading-tight">
            {champion}
          </h2>
          <p className="text-lg text-slate-200 font-display font-bold">
            Campeón con <span className="text-yellow-400">{championTeam}</span>
          </p>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-1.5">
            {tournamentName}
          </p>
        </motion.div>
      </div>

      {/* Runner-up box */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glow-card rounded-2xl p-5 border border-slate-700/60 max-w-md mx-auto relative overflow-hidden text-center mb-8"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rotate-45 transform translate-x-12 -translate-y-12" />
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
          Subcampeón de Honor 🥈
        </span>
        <h3 className="font-display font-black text-slate-200 text-xl">{subchampion}</h3>
        <p className="text-[10px] text-slate-400 font-mono uppercase">
          Una final batallada hasta el último minuto
        </p>
      </motion.div>

      {/* Sharing and configuration actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-10">
        <button
          onClick={onShareWhatsApp}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-display font-extrabold text-sm py-3.5 px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(34,197,94,0.3)] hover:scale-[1.01] active:scale-95 text-center"
        >
          <Share2 className="w-4.5 h-4.5" /> Compartir en WhatsApp
        </button>

        <button
          onClick={onNewSeason}
          className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-display font-extrabold text-sm py-3.5 px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(220,38,38,0.25)] hover:scale-[1.01] active:scale-95 text-center"
        >
          <RefreshCcw className="w-4.5 h-4.5" /> Nueva Temporada (Copia)
        </button>

        <button
          onClick={onResetAll}
          className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-display font-medium text-xs py-3.5 px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 sm:col-span-2 hover:scale-[1.01] active:scale-95 text-center"
        >
          <Trophy className="w-4.5 h-4.5 text-slate-500" /> Reiniciar Todo (Nuevos Jugadores)
        </button>
      </div>

      {/* History log segment */}
      {records.length > 0 && (
        <div className="border-t border-slate-800/80 pt-6">
          <h4 className="font-display font-bold text-sm text-slate-400 mb-3.5 flex items-center gap-2 justify-center">
            <Landmark className="w-4 h-4 text-yellow-500" /> Historial de Campeones locales ({records.length})
          </h4>
          
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {records.map((r, i) => (
              <div
                key={r.id || i}
                className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl hover:border-slate-800 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-yellow-500/10 p-1.5 rounded-lg text-yellow-400">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-display font-black text-slate-200 block text-sm">
                      {r.champion}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {r.championTeam}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-[10px] text-slate-500">
                  <span className="block italic text-slate-400">{r.tournamentName}</span>
                  <span>{new Date(r.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
