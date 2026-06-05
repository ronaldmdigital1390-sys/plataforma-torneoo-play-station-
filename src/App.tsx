/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Gamepad2, 
  Users, 
  Share2, 
  Smartphone, 
  History, 
  RefreshCcw, 
  Sparkles, 
  Zap,
  Info,
  AlertTriangle,
  CheckCircle2,
  Trash2
} from 'lucide-react';

import { Tournament, Match, ChampionRecord, PlayerStats } from './types';
import { 
  generateFixture, 
  calculateStandings, 
  calculateTournamentStats,
  generateKnockoutRounds,
  generateNextKnockoutRound
} from './utils';

import TournamentSetup from './components/TournamentSetup';
import StandingsTable from './components/StandingsTable';
import MatchList from './components/MatchList';
import StatsPanel from './components/StatsPanel';
import FinalPhaseBracket from './components/FinalPhaseBracket';
import ChampionPodium from './components/ChampionPodium';
import KnockoutBracket from './components/KnockoutBracket';

export default function App() {
  // Load initial states from LocalStorage
  const [tournament, setTournament] = useState<Tournament | null>(() => {
    const saved = localStorage.getItem('copa_family_tournament');
    return saved ? JSON.parse(saved) : null;
  });

  const [records, setRecords] = useState<ChampionRecord[]>(() => {
    const saved = localStorage.getItem('copa_family_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'positions' | 'matches' | 'playoffs' | 'stats'>('positions');

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [setupKey, setSetupKey] = useState(0);
  const [isClearingGlobal, setIsClearingGlobal] = useState(false);

  // PWA banner support
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  // Monitor PWA triggers
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect if iOS to show helper
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIos && !isStandalone) {
      setShowIosPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('El usuario aceptó la instalación.');
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    });
  };

  // Sync to LocalStorage
  useEffect(() => {
    if (isClearingGlobal || (window as any).__isClearingApp) return;
    if (tournament) {
      localStorage.setItem('copa_family_tournament', JSON.stringify(tournament));
    } else {
      localStorage.removeItem('copa_family_tournament');
    }
  }, [tournament, isClearingGlobal]);

  useEffect(() => {
    if (isClearingGlobal || (window as any).__isClearingApp) return;
    localStorage.setItem('copa_family_records', JSON.stringify(records));
  }, [records, isClearingGlobal]);

  // Start tournament setup
  const handleStartTournament = (
    name: string,
    players: string[],
    teams: Record<string, string>,
    type: 'ida' | 'ida_vuelta',
    mode: 'liga' | 'eliminatoria' = 'liga'
  ) => {
    if (mode === 'eliminatoria') {
      const koRounds = generateKnockoutRounds(players, teams);
      const freshTournament: Tournament = {
        id: `tournament-${Date.now()}`,
        name,
        type,
        mode,
        status: 'active',
        players,
        teams,
        matches: [],
        finalPhase: null,
        knockoutRounds: koRounds,
        createdAt: new Date().toISOString(),
      };
      setTournament(freshTournament);
      setActiveTab('playoffs');
    } else {
      const freshMatches = generateFixture(players, teams, type);
      const freshTournament: Tournament = {
        id: `tournament-${Date.now()}`,
        name,
        type,
        mode,
        status: 'active',
        players,
        teams,
        matches: freshMatches,
        finalPhase: null,
        knockoutRounds: null,
        createdAt: new Date().toISOString(),
      };
      setTournament(freshTournament);
      setActiveTab('positions');
    }
  };

  // Update standing scores of regular round robin matches
  const handleUpdateScore = (matchId: string, homeGoals: number, awayGoals: number) => {
    if (!tournament) return;

    const updatedMatches = tournament.matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          homeGoals,
          awayGoals,
          played: true,
        };
      }
      return m;
    });

    setTournament({
      ...tournament,
      matches: updatedMatches,
    });
  };

  // Check if all regular league matches are finished to trigger playoffs button
  const isLeagueCompleted = tournament 
    ? tournament.matches.every((m) => m.played) 
    : false;

  // Initialize and create Semifinals based on Standings
  const handleActivatePlayoffs = () => {
    if (!tournament) return;

    const standings = calculateStandings(tournament.players, tournament.teams, tournament.matches);
    if (standings.length < 4) {
      alert('Error: Se necesitan mínimo 4 jugadores de liga para iniciar la ronda final.');
      return;
    }

    // Semis matchups: 1st vs 4th, 2nd vs 3rd
    const firstSeed = standings[0];
    const secondSeed = standings[1];
    const thirdSeed = standings[2];
    const fourthSeed = standings[3];

    const semi1: Match = {
      id: 'semi-1',
      round: 99, // Spec marker
      homePlayer: firstSeed.player,
      awayPlayer: fourthSeed.player,
      homeTeam: firstSeed.team,
      awayTeam: fourthSeed.team,
      homeGoals: null,
      awayGoals: null,
      played: false,
      isSemifinal: true,
      semifinalIndex: 0,
    };

    const semi2: Match = {
      id: 'semi-2',
      round: 99,
      homePlayer: secondSeed.player,
      awayPlayer: thirdSeed.player,
      homeTeam: secondSeed.team,
      awayTeam: thirdSeed.team,
      homeGoals: null,
      awayGoals: null,
      played: false,
      isSemifinal: true,
      semifinalIndex: 1,
    };

    setTournament({
      ...tournament,
      status: 'final_phase',
      finalPhase: {
        semis: [semi1, semi2],
        finalMatch: null,
        champion: null,
        subchampion: null,
      },
    });
    setActiveTab('playoffs');
  };

  // Update playoff Semifinal result
  const handleUpdateSemiScore = (
    index: number,
    homeGoals: number,
    awayGoals: number,
    penaltyWinner: string | null
  ) => {
    if (!tournament || !tournament.finalPhase) return;

    const updatedSemis = [...tournament.finalPhase.semis];
    updatedSemis[index] = {
      ...updatedSemis[index],
      homeGoals,
      awayGoals,
      played: true,
      penaltyWinner,
    };

    // Calculate advancing players to generate final, if both semis are logged
    let updatedFinalMatch: Match | null = tournament.finalPhase.finalMatch;

    const allPlayed = updatedSemis[0].played && updatedSemis[1].played;
    if (allPlayed) {
      const getSemiWinner = (m: Match) => {
        const hg = m.homeGoals ?? 0;
        const ag = m.awayGoals ?? 0;
        if (hg > ag) return m.homePlayer;
        if (hg < ag) return m.awayPlayer;
        return m.penaltyWinner || m.homePlayer;
      };

      const winner1 = getSemiWinner(updatedSemis[0]);
      const winner2 = getSemiWinner(updatedSemis[1]);

      updatedFinalMatch = {
        id: 'grand-final',
        round: 100,
        homePlayer: winner1,
        awayPlayer: winner2,
        homeTeam: tournament.teams[winner1] || 'Club',
        awayTeam: tournament.teams[winner2] || 'Club',
        homeGoals: null,
        awayGoals: null,
        played: false,
        isFinal: true,
      };
    }

    setTournament({
      ...tournament,
      finalPhase: {
        ...tournament.finalPhase,
        semis: updatedSemis,
        finalMatch: updatedFinalMatch,
      },
    });
  };

  // Update Grand Final result
  const handleUpdateFinalScore = (homeGoals: number, awayGoals: number, penaltyWinner: string | null) => {
    if (!tournament || !tournament.finalPhase || !tournament.finalPhase.finalMatch) return;

    const fm = tournament.finalPhase.finalMatch;
    const hg = homeGoals;
    const ag = awayGoals;

    let championPlayer = '';
    let subchampionPlayer = '';

    if (hg > ag) {
      championPlayer = fm.homePlayer;
      subchampionPlayer = fm.awayPlayer;
    } else if (hg < ag) {
      championPlayer = fm.awayPlayer;
      subchampionPlayer = fm.homePlayer;
    } else {
      championPlayer = penaltyWinner || fm.homePlayer;
      subchampionPlayer = championPlayer === fm.homePlayer ? fm.awayPlayer : fm.homePlayer;
    }

    const updatedFinal = {
      ...fm,
      homeGoals,
      awayGoals,
      played: true,
      penaltyWinner,
    };

    setTournament({
      ...tournament,
      finalPhase: {
        ...tournament.finalPhase,
        finalMatch: updatedFinal,
        champion: championPlayer,
        subchampion: subchampionPlayer,
      },
    });
  };

  // Finalize tournament, save records locally
  const handleFinishTournament = () => {
    if (!tournament || !tournament.finalPhase || !tournament.finalPhase.champion) return;

    const { champion, subchampion } = tournament.finalPhase;
    const championTeam = tournament.teams[champion] || 'Club';

    const newRecord: ChampionRecord = {
      id: `record-${Date.now()}`,
      tournamentName: tournament.name,
      champion,
      championTeam,
      subchampion: subchampion || '',
      date: new Date().toISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);
    setTournament({
      ...tournament,
      status: 'finished',
    });
  };

  const handleUpdateKnockoutScore = (
    roundIndex: number,
    matchId: string,
    homeGoals: number,
    awayGoals: number,
    penaltyWinner: string | null
  ) => {
    if (!tournament || !tournament.knockoutRounds) return;

    const nextRounds = [...tournament.knockoutRounds];
    const matchRound = { ...nextRounds[roundIndex] };
    matchRound.matches = matchRound.matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          homeGoals,
          awayGoals,
          played: true,
          penaltyWinner,
        };
      }
      return m;
    });
    nextRounds[roundIndex] = matchRound;

    setTournament({
      ...tournament,
      knockoutRounds: nextRounds,
    });
  };

  const handleAdvanceKnockoutRound = () => {
    if (!tournament || !tournament.knockoutRounds) return;

    const currentR = tournament.knockoutRounds[tournament.knockoutRounds.length - 1];
    const nextR = generateNextKnockoutRound(currentR, tournament.teams);

    setTournament({
      ...tournament,
      knockoutRounds: [...tournament.knockoutRounds, nextR],
    });
  };

  const handleFinishKnockout = (champion: string, subchampion: string) => {
    if (!tournament) return;

    const championTeam = tournament.teams[champion] || 'Club';

    const newRecord: ChampionRecord = {
      id: `record-${Date.now()}`,
      tournamentName: tournament.name,
      champion,
      championTeam,
      subchampion: subchampion || '',
      date: new Date().toISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);
    setTournament({
      ...tournament,
      status: 'finished',
      finalPhase: {
        semis: [],
        finalMatch: null,
        champion,
        subchampion,
      },
    });
  };

  // Nueva Temporada: Restart keeping same players & teams selected
  const handleNewSeason = () => {
    if (!tournament) return;

    const { players, teams, name, type, mode } = tournament;
    if (mode === 'eliminatoria') {
      const koRounds = generateKnockoutRounds(players, teams);
      const nextTournament: Tournament = {
        id: `tournament-${Date.now()}`,
        name,
        type,
        mode,
        status: 'active',
        players,
        teams,
        matches: [],
        finalPhase: null,
        knockoutRounds: koRounds,
        createdAt: new Date().toISOString(),
      };
      setTournament(nextTournament);
      setActiveTab('playoffs');
    } else {
      const freshMatches = generateFixture(players, teams, type);
      const nextTournament: Tournament = {
        id: `tournament-${Date.now()}`,
        name,
        type,
        mode: 'liga',
        status: 'active',
        players,
        teams,
        matches: freshMatches,
        finalPhase: null,
        knockoutRounds: null,
        createdAt: new Date().toISOString(),
      };
      setTournament(nextTournament);
      setActiveTab('positions');
    }
  };

  // Completely reset and return to base setup panel maintaining core config
  const handleResetAll = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    if (tournament) {
      const resetTournament: Tournament = {
        ...tournament,
        status: 'setup',
        matches: [],
        finalPhase: null,
      };
      setTournament(resetTournament);
    } else {
      setTournament(null);
    }
    setShowResetSuccess(true);
  };

  const handleClearAll = (bypassConfirm = false) => {
    if (bypassConfirm || window.confirm('🚨 ¿Estás seguro de que deseas BORRAR ABSOLUTAMENTE TODO el contenido? Se eliminarán permanentemente participantes, equipos, torneos, fixture, resultados, estadísticas, récords y el historial completo. La aplicación quedará como recién instalada.')) {
      (window as any).__isClearingApp = true;
      setIsClearingGlobal(true);
      
      // Limpiar todo almacenamiento local
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpiar caché si existe para evitar que el navegador guarde datos viejos
      try {
        if (typeof caches !== 'undefined' && caches.keys) {
          caches.keys().then((names) => {
            Promise.all(names.map(name => caches.delete(name))).finally(() => {
              window.location.replace(window.location.origin + window.location.pathname);
            });
          }).catch(() => {
            window.location.replace(window.location.origin + window.location.pathname);
          });
        } else {
          window.location.replace(window.location.origin + window.location.pathname);
        }
      } catch (e) {
        console.warn('Cache API blocked or unavailable in iframe:', e);
        window.location.replace(window.location.origin + window.location.pathname);
      }
    }
  };

  // --- WHATSAPP TEXT GENERATION AND SHARING ---
  const handleShareWhatsAppPositions = () => {
    if (!tournament) return;
    const standings = calculateStandings(tournament.players, tournament.teams, tournament.matches);
    let text = `🏆 *${tournament.name.toUpperCase()} - TABLA DE POSICIONES* 🏆\n\n`;
    standings.forEach((st, idx) => {
      let medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🔹';
      text += `${medal} *${idx + 1}° ${st.player}* | ${st.team}\n     *${st.pts} PTS* (PJ: ${st.pj} | DG: ${st.dg} | GF: ${st.gf})\n`;
    });
    text += `\n🎮 _¡La gloria se juega en casa!_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareWhatsAppGeneral = () => {
    if (!tournament) return;
    const pending = tournament.matches.filter(m => !m.played);
    let text = `📅 *${tournament.name.toUpperCase()} - PRÓXIMAS FECHAS* 📅\n\n`;
    
    if (pending.length === 0) {
      text += `¡Liga completada! Se avecinan los Playoffs. 🔥🏆`;
    } else {
      pending.slice(0, 6).forEach((m) => {
        text += `• Ronda ${m.round}: *${m.homePlayer}* vs *${m.awayPlayer}*\n`;
      });
    }
    text += `\n⚽ _La gloria se juega en casa_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareWhatsAppWinner = () => {
    if (!tournament || !tournament.finalPhase || !tournament.finalPhase.champion) return;
    const champion = tournament.finalPhase.champion;
    const team = tournament.teams[champion] || '';
    const subchampion = tournament.finalPhase.subchampion || '';

    let text = `🌟🏆 *TENEMOS CAMPEÓN DE LA COPA FAMILY 2026* 🏆🌟\n\n`;
    text += `👑 *${champion.toUpperCase()}* se corona Campeón de la copa con el club *${team}* 🥇⚡\n\n`;
    text += `🥈 *${subchampion}* queda como Subcampeón de honor con un digno papel.\n\n`;
    text += `¡Felicitaciones al gran ganador del joystick de la PlayStation! 🎮⚽💥\n\n⏱️ _La gloria se juega en casa_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Standings data
  const standings = tournament 
    ? calculateStandings(tournament.players, tournament.teams, tournament.matches) 
    : [];

  const hasPlayedMatches = tournament 
    ? tournament.matches.some((m) => m.played) 
    : false;

  const currentStats = tournament 
    ? calculateTournamentStats(tournament.matches, tournament.teams) 
    : { topScorer: null, bestDefense: null, bestDg: null, biggestWin: null, mostGoalsMatch: null };

  return (
    <div className="min-h-screen stadium-bg flex flex-col justify-between relative overflow-hidden">
      <div className="gaming-grid" />
      <div className="stadium-light-left" />
      <div className="stadium-light-right" />
      <div className="laser-beam-left" />
      <div className="laser-beam-right" />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* PWA IOS instructions popup drawer */}
        {showIosPrompt && (
          <div className="bg-slate-900 border-b border-yellow-500/25 text-yellow-100 text-[11px] p-2.5 text-center font-sans tracking-wide relative z-50 flex items-center justify-center gap-2">
            <Info className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>Para jugar en pantalla completa e instalar en iPhone: pulsa <strong className="text-white">Compartir</strong> de Safari y selecciona <strong className="text-white">“Añadir a pantalla de inicio”</strong>.</span>
            <button onClick={() => setShowIosPrompt(false)} className="underline text-slate-400 hover:text-white font-mono shrink-0 ml-1">Entendido</button>
          </div>
        )}

        {/* PWA Standard install button floating banner */}
        {showInstallBanner && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="m-3 p-3 bg-gradient-to-r from-blue-700 to-cyan-700 text-white rounded-xl shadow-xl flex items-center justify-between gap-3 relative z-50 max-w-lg mx-auto"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-yellow-300 animate-bounce" />
              <div className="text-left">
                <p className="text-xs font-display font-black leading-tight">Instala Copa Family 2026</p>
                <p className="text-[10px] text-blue-100">Ábrelo rápido e independiente en tu celular</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={triggerInstall}
                className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono text-[10px] uppercase font-black px-3 py-1.5 rounded-lg transition-all"
              >
                Instalar
              </button>
              <button onClick={() => setShowInstallBanner(false)} className="text-slate-200 text-xs px-1.5 py-1">✕</button>
            </div>
          </motion.div>
        )}

        {/* Dynamic Screens Router */}
        {!tournament || tournament.status === 'setup' ? (
          <TournamentSetup 
            key={tournament ? `${tournament.id}-setup-${setupKey}` : `new-setup-${setupKey}`}
            onStartTournament={handleStartTournament} 
            initialName={tournament?.name}
            initialPlayers={tournament?.players}
            initialTeams={tournament?.teams}
            initialType={tournament?.type}
            initialMode={tournament?.mode}
            onClearAll={handleClearAll}
          />
        ) : tournament.status === 'finished' ? (
          <ChampionPodium
            tournamentName={tournament.name}
            champion={tournament.finalPhase?.champion || ''}
            championTeam={tournament.teams[tournament.finalPhase?.champion || ''] || ''}
            subchampion={tournament.finalPhase?.subchampion || ''}
            onNewSeason={handleNewSeason}
            onResetAll={handleResetAll}
            onShareWhatsApp={handleShareWhatsAppWinner}
            records={records}
          />
        ) : (
          <div className="w-full max-w-4xl mx-auto px-4 py-4" id="main-panel">
            {/* Header Dashboard Branding (Vertically Reduced ~35%) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/60 border border-white/5 border-b-2 border-b-green-500 backdrop-blur-md rounded-2xl px-4 py-3 sm:py-3.5 mb-4 gap-3 shadow-[0_4px_25px_rgba(0,0,0,0.55)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-green-550/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-2.5 relative z-10 w-full md:w-auto">
                <div className="p-2.5 bg-gradient-to-br from-green-600 to-emerald-400 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.25)] shrink-0 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5 flex-wrap">
                    {tournament.name} <span className="text-[9px] bg-green-500/15 border border-green-500/30 text-green-400 font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">{tournament.mode === 'eliminatoria' ? 'ELIMINATORIA' : 'LIGA'}</span>
                  </h1>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono uppercase tracking-widest leading-none mt-0.5">
                    Modo: {tournament.mode === 'eliminatoria' ? 'Eliminatoria Directa' : tournament.type === 'ida' ? 'Ida Única' : 'Ida y Vuelta'}
                  </p>
                </div>
              </div>

              {/* Share & reset utilities */}
              <div className="flex items-center flex-wrap md:flex-nowrap gap-2 shrink-0 w-full md:w-auto justify-end relative z-10">
                {tournament.mode !== 'eliminatoria' && (
                  <button
                    onClick={handleShareWhatsAppPositions}
                    className="flex-1 md:flex-none justify-center bg-green-600 hover:bg-green-500 text-white font-mono text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-[0_4px_10px_rgba(34,197,94,0.15)]"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Compartir Tabla
                  </button>
                )}
                <button
                  onClick={handleResetAll}
                  className="flex-1 md:flex-none justify-center bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:text-red-400 text-slate-400 font-mono text-[10px] px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Reiniciar campeonato"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Reiniciar
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 md:flex-none justify-center bg-red-950/45 hover:bg-red-900/30 border border-red-900/20 text-red-400 hover:text-red-300 font-mono text-[10px] px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Borrar absolutamente todo de local"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Limpiar datos locales
                </button>
              </div>
            </div>

            {/* Quick micro statistic bento ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 relative z-10">
              {/* Stat 1: Champions Played / Ediciones */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex items-center gap-3 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-full blur-lg pointer-events-none" />
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Torneos</p>
                  <p className="text-sm font-display font-black text-white leading-tight">
                    {records.length + 1} <span className="text-[8px] text-blue-400 font-normal font-mono">Edic.</span>
                  </p>
                </div>
              </div>

              {/* Stat 2: Registered Goals */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex items-center gap-3 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-sky-500/5 rounded-full blur-lg pointer-events-none" />
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                  <Zap className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Goles Oficiales</p>
                  <p className="text-sm font-display font-black text-white leading-tight">
                    {tournament.matches.reduce((acc, m) => acc + (m.played ? (m.homeGoals ?? 0) + (m.awayGoals ?? 0) : 0), 0)}{' '}
                    <span className="text-[8px] text-sky-400 font-normal font-mono">goles</span>
                  </p>
                </div>
              </div>

              {/* Stat 3: Current Champion */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex items-center gap-3 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-lg pointer-events-none" />
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Trophy className="w-4 h-4 text-yellow-500 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Campeón Vigente</p>
                  <p className="text-xs font-display font-black text-amber-450 leading-tight truncate">
                    {records.length > 0 ? records[0].champion : 'Ninguno 👑'}
                  </p>
                </div>
              </div>

              {/* Stat 4: Contestants / Players */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex items-center gap-3 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/5 rounded-full blur-lg pointer-events-none" />
                <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Rivalidades</p>
                  <p className="text-sm font-display font-black text-white leading-tight">
                    {tournament.players.length} <span className="text-[8px] text-red-500 font-normal font-mono">Inscr.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Main view content routing tabs */}
            <div className="flex items-center gap-1 bg-slate-950/80 border border-green-500/10 rounded-2xl p-1.5 mb-6 overflow-x-auto no-scrollbar shadow-inner">
              {tournament.mode !== 'eliminatoria' && (
                <>
                  <button
                    onClick={() => setActiveTab('positions')}
                    className={`flex-1 shrink-0 text-center font-display font-black py-3 px-4 rounded-xl text-xs tracking-wider transition-all duration-200 cursor-pointer ${
                      activeTab === 'positions'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-900/40 border border-green-400/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                    }`}
                  >
                    TABLA
                  </button>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className={`flex-1 shrink-0 text-center font-display font-black py-3 px-4 rounded-xl text-xs tracking-wider transition-all duration-200 cursor-pointer ${
                      activeTab === 'matches'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-900/40 border border-green-400/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                    }`}
                  >
                    PARTIDOS
                  </button>
                </>
              )}
              <button
                onClick={() => setActiveTab('playoffs')}
                className={`flex-1 shrink-0 text-center font-display font-black py-3 px-4 rounded-xl text-xs tracking-wider transition-all duration-200 cursor-pointer relative ${
                  activeTab === 'playoffs'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-900/40 border border-green-400/30'
                    : tournament.status === 'final_phase' || (tournament.mode !== 'eliminatoria' && isLeagueCompleted)
                    ? 'text-yellow-400 font-extrabold bg-amber-500/10 border border-amber-500/20 animate-pulse'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                {tournament.mode === 'eliminatoria' ? 'ELIMINATORIA' : 'PLAYOFFS'}
                {tournament.mode !== 'eliminatoria' && (tournament.status === 'final_phase' || isLeagueCompleted) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 shrink-0 text-center font-display font-black py-3 px-4 rounded-xl text-xs tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'stats'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-900/40 border border-green-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                RÉCORDS
              </button>
            </div>

            {/* TAB CONTENTS CONTAINER */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tournament.mode !== 'eliminatoria' && activeTab === 'positions' && (
                  <div className="space-y-6">
                    <StandingsTable standings={standings} playersCount={tournament.players.length} />
                    
                    {/* Playoffs trigger action */}
                    {isLeagueCompleted && tournament.status !== 'final_phase' && (
                      <div className="glow-card rounded-2xl p-5 border border-yellow-500/25 bg-yellow-500/5 relative text-center">
                        <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-2 animate-bounce" />
                        <h4 className="font-display font-black text-white text-base">¡Fase de Grupo Finalizada!</h4>
                        <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                          Todos los partidos de la liga ordinaria han sido jugados. Es hora de encender las luces de la fase final y clasificar a los playoffs.
                        </p>
                        <button
                          type="button"
                          onClick={handleActivatePlayoffs}
                          className="mt-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-slate-950 font-display font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl cursor-pointer transition-all active:scale-95 shadow-[0_4px_15px_rgba(251,191,36,0.3)] hover:scale-101 border border-yellow-300"
                        >
                          🔥 INICIAR FASET PLAYOFFS SEMIFINALES
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {tournament.mode !== 'eliminatoria' && activeTab === 'matches' && (
                  <MatchList matches={tournament.matches} onUpdateScore={handleUpdateScore} />
                )}

                {activeTab === 'playoffs' && (
                  <div>
                    {tournament.mode === 'eliminatoria' ? (
                      <KnockoutBracket
                        tournament={tournament}
                        onUpdateKnockoutScore={handleUpdateKnockoutScore}
                        onAdvanceRound={handleAdvanceKnockoutRound}
                        onFinishKnockout={handleFinishKnockout}
                      />
                    ) : tournament.status !== 'final_phase' && !isLeagueCompleted ? (
                      <div className="glow-card rounded-2xl p-10 text-center border border-dashed border-slate-800">
                        <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <h3 className="font-display font-black text-white text-base">Playoffs bloqueados</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          La fase final de playoffs se desbloqueará una vez que se hayan completado todos los partidos de la liga ({tournament.matches.filter(m => m.played).length} de {tournament.matches.length} partidos jugados).
                        </p>
                      </div>
                    ) : tournament.status === 'active' && isLeagueCompleted ? (
                      <div className="glow-card rounded-2xl p-10 text-center border-2 border-yellow-500/20 bg-yellow-500/5">
                        <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-3 animate-spin" />
                        <h3 className="font-display font-black text-white text-base">Playoffs Listos</h3>
                        <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                          ¡Increíble regularidad! Todos los partidos ya se jugaron. Pulsa el botón para generar las semifinales según la tabla definitiva de posiciones.
                        </p>
                        <button
                          type="button"
                          onClick={handleActivatePlayoffs}
                          className="mt-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-slate-950 font-display font-black text-xs tracking-widest uppercase py-3 px-6 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md border border-yellow-300"
                        >
                          Generar Semifinales (1° vs 4° y 2° vs 3°)
                        </button>
                      </div>
                    ) : tournament.finalPhase ? (
                      <FinalPhaseBracket
                        finalPhase={tournament.finalPhase}
                        onUpdateSemiScore={handleUpdateSemiScore}
                        onUpdateFinalScore={handleUpdateFinalScore}
                        onFinishTournament={handleFinishTournament}
                      />
                    ) : (
                      <p className="text-center text-slate-400 text-xs">Error cargando playoffs.</p>
                    )}
                  </div>
                )}

                {activeTab === 'stats' && (
                  <StatsPanel stats={currentStats} hasPlayedMatches={hasPlayedMatches} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Visual Confirmation Modal for reset */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              id="confirm-modal-overlay"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glow-card max-w-sm w-full rounded-2xl p-6 relative overflow-hidden text-center z-10 border border-red-500/20"
              id="confirm-modal-box"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-full">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="font-display font-black text-white text-lg mb-2">¿Reiniciar Torneo?</h3>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed text-center">
                ¿Seguro que deseas reiniciar el torneo? Esta acción no se puede deshacer.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-all font-bold"
                  id="confirm-btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmReset}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-mono text-xs py-2.5 rounded-xl cursor-pointer shadow-[0_4px_12px_rgba(239,68,68,0.2)] transition-all font-bold"
                  id="confirm-btn-action"
                >
                  Sí, reiniciar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification Modal */}
      <AnimatePresence>
        {showResetSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetSuccess(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              id="success-modal-overlay"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glow-card max-w-sm w-full rounded-2xl p-6 relative overflow-hidden text-center z-10 border border-emerald-500/20"
              id="success-modal-box"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
              <h3 className="font-display font-black text-white text-lg mb-2">¡Todo Listo!</h3>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed text-center">
                Torneo reiniciado correctamente.
              </p>
              <button
                type="button"
                onClick={() => setShowResetSuccess(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs py-2.5 rounded-xl cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition-all font-bold"
                id="success-btn-dismiss"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant minimalist sports footer */}
      <footer className="py-5 bg-slate-950 border-t border-slate-900/80 text-center text-[10px] text-slate-500 font-mono relative z-10 shrink-0">
        <p>© 2026 Copa Family • Diseñado para la PlayStation Cup entre amigos.</p>
        <p className="text-[9px] text-slate-600 mt-0.5">La gloria de los trofeos virtuales se gana con un joystick en mano.</p>
      </footer>
    </div>
  );
}
