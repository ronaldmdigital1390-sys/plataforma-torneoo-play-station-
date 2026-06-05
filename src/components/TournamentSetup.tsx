/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Plus, 
  Trash2, 
  Shuffle, 
  Play, 
  Gamepad2, 
  Edit, 
  Check, 
  X, 
  Sparkles, 
  RefreshCcw,
  HelpCircle,
  ArrowRightLeft
} from 'lucide-react';

interface TournamentSetupProps {
  onStartTournament: (
    name: string,
    players: string[],
    teams: Record<string, string>,
    type: 'ida' | 'ida_vuelta',
    mode: 'liga' | 'eliminatoria'
  ) => void;
  initialName?: string;
  initialPlayers?: string[];
  initialTeams?: Record<string, string>;
  initialType?: 'ida' | 'ida_vuelta';
  initialMode?: 'liga' | 'eliminatoria';
  key?: string | number;
  onClearAll?: (bypassConfirm?: boolean) => void;
}

export default function TournamentSetup({ 
  onStartTournament,
  initialName,
  initialPlayers,
  initialTeams,
  initialType,
  initialMode,
  onClearAll
}: TournamentSetupProps) {
  // --- STATE PERSISTENCE IN LOCAL STORAGE ---
  const [tournamentName, setTournamentName] = useState(() => {
    const saved = localStorage.getItem('copa_family_setup_name');
    if (saved) return saved;
    return initialName ?? 'Copa Family 2026';
  });

  const [tournamentType, setTournamentType] = useState<'ida' | 'ida_vuelta'>(() => {
    const saved = localStorage.getItem('copa_family_setup_type');
    if (saved === 'ida' || saved === 'ida_vuelta') return saved as 'ida' | 'ida_vuelta';
    return initialType ?? 'ida';
  });

  const [tournamentMode, setTournamentMode] = useState<'liga' | 'eliminatoria'>(() => {
    const saved = localStorage.getItem('copa_family_setup_mode');
    if (saved === 'liga' || saved === 'eliminatoria') return saved as 'liga' | 'eliminatoria';
    return initialMode ?? 'liga';
  });

  const [players, setPlayers] = useState<string[]>(() => {
    const saved = localStorage.getItem('copa_family_participants');
    if (saved) return JSON.parse(saved);
    return initialPlayers ?? [];
  });

  const [teamsPool, setTeamsPool] = useState<string[]>(() => {
    const saved = localStorage.getItem('copa_family_teams_pool');
    if (saved) return JSON.parse(saved);
    if (initialTeams) return Object.values(initialTeams);
    return [];
  });

  const [raffleResults, setRaffleResults] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('copa_family_raffle');
    if (saved) return JSON.parse(saved);
    return initialTeams ?? {};
  });

  const [isClearing, setIsClearing] = useState(false);

  // --- SYNC TO LOCAL STORAGE ---
  useEffect(() => {
    if (isClearing || (window as any).__isClearingApp) return;
    localStorage.setItem('copa_family_setup_name', tournamentName);
  }, [tournamentName, isClearing]);

  useEffect(() => {
    if (isClearing || (window as any).__isClearingApp) return;
    localStorage.setItem('copa_family_setup_type', tournamentType);
  }, [tournamentType, isClearing]);

  useEffect(() => {
    if (isClearing || (window as any).__isClearingApp) return;
    localStorage.setItem('copa_family_setup_mode', tournamentMode);
  }, [tournamentMode, isClearing]);

  useEffect(() => {
    if (isClearing || (window as any).__isClearingApp) return;
    localStorage.setItem('copa_family_participants', JSON.stringify(players));
  }, [players, isClearing]);

  useEffect(() => {
    if (isClearing || (window as any).__isClearingApp) return;
    localStorage.setItem('copa_family_teams_pool', JSON.stringify(teamsPool));
  }, [teamsPool, isClearing]);

  useEffect(() => {
    if (isClearing || (window as any).__isClearingApp) return;
    localStorage.setItem('copa_family_raffle', JSON.stringify(raffleResults));
  }, [raffleResults, isClearing]);

  // --- LOCAL FORM STATES ---
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);

  // --- INLINE EDITING STATES ---
  const [editingPlayerIdx, setEditingPlayerIdx] = useState<number | null>(null);
  const [editingPlayerVal, setEditingPlayerVal] = useState('');

  const [editingTeamIdx, setEditingTeamIdx] = useState<number | null>(null);
  const [editingTeamVal, setEditingTeamVal] = useState('');

  // --- PARTICIPANTS MANAGEMENT ---
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newPlayerName.trim();
    if (!cleanName) return;
    if (players.includes(cleanName)) {
      alert('¡El jugador ya está registrado!');
      return;
    }
    setPlayers([...players, cleanName]);
    setNewPlayerName('');
  };

  const handleStartEditPlayer = (idx: number) => {
    setEditingPlayerIdx(idx);
    setEditingPlayerVal(players[idx]);
  };

  const handleSaveEditPlayer = () => {
    const cleanName = editingPlayerVal.trim();
    if (!cleanName) return;
    const oldName = players[editingPlayerIdx!];

    if (oldName !== cleanName && players.includes(cleanName)) {
      alert('¡Ya existe otro participante con ese nombre o apodo!');
      return;
    }

    const nextPlayers = [...players];
    nextPlayers[editingPlayerIdx!] = cleanName;
    setPlayers(nextPlayers);

    // Update raffle key if exists
    if (raffleResults[oldName]) {
      setRaffleResults(prev => {
        const next = { ...prev };
        next[cleanName] = next[oldName];
        delete next[oldName];
        return next;
      });
    }

    setEditingPlayerIdx(null);
  };

  const handleCancelEditPlayer = () => {
    setEditingPlayerIdx(null);
  };

  const handleRemovePlayer = (nameToRemove: string) => {
    setPlayers(players.filter(p => p !== nameToRemove));
    setRaffleResults(prev => {
      const next = { ...prev };
      delete next[nameToRemove];
      return next;
    });
  };

  // --- TEAMS POOL MANAGEMENT ---
  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTeamEnv = newTeamName.trim();
    if (!cleanTeamEnv) return;
    if (teamsPool.includes(cleanTeamEnv)) {
      alert('¡El equipo ya está en la lista de disponibles!');
      return;
    }
    setTeamsPool([...teamsPool, cleanTeamEnv]);
    setNewTeamName('');
  };

  const handleStartEditTeam = (idx: number) => {
    setEditingTeamIdx(idx);
    setEditingTeamVal(teamsPool[idx]);
  };

  const handleSaveEditTeam = () => {
    const cleanTeam = editingTeamVal.trim();
    if (!cleanTeam) return;
    const oldTeam = teamsPool[editingTeamIdx!];

    if (oldTeam !== cleanTeam && teamsPool.includes(cleanTeam)) {
      alert('¡Ya existe otro equipo con ese nombre!');
      return;
    }

    const nextTeamsPool = [...teamsPool];
    nextTeamsPool[editingTeamIdx!] = cleanTeam;
    setTeamsPool(nextTeamsPool);

    // Update raffle values if any player had this team assigned
    setRaffleResults(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(player => {
        if (next[player] === oldTeam) {
          next[player] = cleanTeam;
        }
      });
      return next;
    });

    setEditingTeamIdx(null);
  };

  const handleCancelEditTeam = () => {
    setEditingTeamIdx(null);
  };

  const handleRemoveTeam = (teamToRemove: string) => {
    setTeamsPool(teamsPool.filter(t => t !== teamToRemove));
    
    // Clear registration mappings for this team
    setRaffleResults(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(player => {
        if (next[player] === teamToRemove) {
          delete next[player];
        }
      });
      return next;
    });
  };

  // --- SORTEO (RAFFLE/DRAWING) LOGIC ---
  const handleRandomizeTeams = () => {
    if (players.length === 0) return;
    if (teamsPool.length < players.length) {
      alert(`No hay suficientes equipos disponibles para realizar un sorteo sin repetir. Se requieren mínimo ${players.length} equipos para los ${players.length} participantes registrados.`);
      return;
    }
    if (isShuffling) return;

    setIsShuffling(true);
    let iterations = 0;

    const intervalId = setInterval(() => {
      // Temporary random assignments to cycle through teams for an immersive esports shuffle feel
      const tempTeams: Record<string, string> = {};
      players.forEach((player) => {
        const randomTeam = teamsPool[Math.floor(Math.random() * teamsPool.length)];
        tempTeams[player] = randomTeam;
      });
      setRaffleResults(tempTeams);

      iterations++;
      if (iterations >= 11) {
        clearInterval(intervalId);
        
        // Final unique non-overlapping team assignments
        const shuffledPool = [...teamsPool].sort(() => Math.random() - 0.5);
        const finalTeams: Record<string, string> = {};
        players.forEach((player, idx) => {
          finalTeams[player] = shuffledPool[idx];
        });
        setRaffleResults(finalTeams);
        setIsShuffling(false);
      }
    }, 90);
  };

  // Manual team modification support (safely swaps if team has already been taken, avoiding duplicate teams)
  const handleManualTeamChange = (playerName: string, teamValue: string) => {
    const alreadyAssignedTo = Object.keys(raffleResults).find(
      key => key !== playerName && raffleResults[key] === teamValue
    );

    if (alreadyAssignedTo) {
      // Swap assignments to maintain perfect unique teams "no repetir"
      const currentTeamOfPlayer = raffleResults[playerName];
      setRaffleResults(prev => ({
        ...prev,
        [playerName]: teamValue,
        [alreadyAssignedTo]: currentTeamOfPlayer || ''
      }));
    } else {
      setRaffleResults(prev => ({
        ...prev,
        [playerName]: teamValue
      }));
    }
  };

  const handleResetSetup = () => {
    if (window.confirm('🚨 ¿Estás seguro de que deseas BORRAR ABSOLUTAMENTE TODO de la aplicación? Se eliminarán permanentemente participantes, equipos, fixture, resultados, récords y estadísticas. Volverás a una interfaz vacía como de fábrica.')) {
      (window as any).__isClearingApp = true;
      setIsClearing(true);
      
      // Limpiar almacenamiento
      localStorage.clear();
      sessionStorage.clear();
      
      const proceedReload = () => {
        if (onClearAll) {
          onClearAll(true);
        } else {
          window.location.replace(window.location.origin + window.location.pathname);
        }
      };

      // Limpiar caché si existe
      try {
        if (typeof caches !== 'undefined' && caches.keys) {
          caches.keys().then((names) => {
            Promise.all(names.map(name => caches.delete(name))).finally(() => {
              proceedReload();
            });
          }).catch(() => {
            proceedReload();
          });
        } else {
          proceedReload();
        }
      } catch (e) {
        console.warn('Cache API blocked or unavailable in iframe:', e);
        proceedReload();
      }
    }
  };

  // --- SUBMISSION QUALITY CHECKS ---
  const isSorteoComplete = players.length > 0 && players.every(
    p => !!raffleResults[p] && teamsPool.includes(raffleResults[p])
  );

  const hasDuplicateAssignments = (() => {
    if (!isSorteoComplete) return false;
    const assigned = players.map(p => raffleResults[p]);
    return new Set(assigned).size !== assigned.length;
  })();

  const canStart = players.length >= 4 && isSorteoComplete && !hasDuplicateAssignments && tournamentName.trim().length > 0;

  const handleSubmitSetup = () => {
    if (players.length < 4) {
      alert('Para jugar la Copa Family y clasificar de manera justa a semifinales se requiere de al menos 4 participantes registrados.');
      return;
    }
    if (!tournamentName.trim()) {
      alert('Por favor, ingresa un nombre para el torneo.');
      return;
    }
    if (!isSorteoComplete || hasDuplicateAssignments) {
      alert('Por favor, realiza el sorteo de todos los participantes sin repetir equipos antes de iniciar.');
      return;
    }

    onStartTournament(tournamentName.trim(), players, raffleResults, tournamentType, tournamentMode);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 relative z-10" id="setup-panel">
      {/* Hero Header Area */}
      <div className="text-center mb-10 mt-4 relative">
        <div className="absolute inset-x-0 -top-12 h-40 bg-radial from-green-500/10 via-transparent to-transparent blur-3xl -z-10 animate-pulse" />
        
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          className="flex justify-center items-center gap-3 mb-5"
        >
          {/* Controller Decoration Left */}
          <div className="p-2.5 bg-slate-900/60 border border-green-500/20 text-green-400 rounded-xl hidden sm:flex items-center justify-center shadow-md">
            <Gamepad2 className="w-5 h-5" />
          </div>

          {/* Central Trophies Element */}
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/10 blur-2xl rounded-full scale-110" />
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 opacity-30 blur-sm" />
            <div className="absolute -inset-2 rounded-full border border-dashed border-yellow-400/30 animate-[spin_20s_linear_infinite] pointer-events-none" />
            <div className="p-4 bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 rounded-full border border-yellow-300 shadow-[0_0_35px_rgba(242,158,11,0.4)] gold-glow relative z-10 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white fill-current drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />
            </div>
          </div>

          {/* Controller Decoration Right */}
          <div className="p-2.5 bg-slate-900/60 border border-red-500/20 text-red-500 rounded-xl hidden sm:flex items-center justify-center shadow-md">
            <Gamepad2 className="w-5 h-5" />
          </div>
        </motion.div>
        
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md leading-none">
          COPA FAMILY <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-cyan-400">2026</span>
        </h1>
        <p className="text-green-400 font-display italic tracking-widest text-base sm:text-lg font-bold mt-1.5 uppercase">
          “La Gloria se Juega en Casa”
        </p>
        <div className="inline-flex items-center gap-1.5 bg-slate-950/80 border border-slate-900 rounded-full px-3 py-1 mt-3 font-mono text-[9px] text-slate-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-[ping_1.5s_linear_infinite]" />
          Custom Draft & Setup Edition
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Participantes & Equipos (8/12 weight) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. SECCIÓN PARTICIPANTES */}
            <div className="glow-card rounded-2xl p-5 border-t-2 border-t-green-500 shadow-lg flex flex-col min-h-[460px]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4.5 h-4.5 text-green-400" /> 1. Participantes ({players.length})
                </h2>
              </div>
              
              <p className="text-[10px] text-slate-400 font-mono mb-3 leading-tight uppercase">
                Listado de rivales registrados en la consola.
              </p>

              {/* Add form */}
              <form onSubmit={handleAddPlayer} className="flex gap-1.5 mb-3.5">
                <input
                  type="text"
                  maxLength={20}
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="flex-1 bg-slate-955 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-green-500 transition-all font-display font-semibold"
                  placeholder="Escribe el nombre del participante"
                />
                <button
                  type="submit"
                  title="Agregar jugador"
                  className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </form>

              {/* Scrollable list */}
              <div className="flex-1 max-h-[290px] overflow-y-auto no-scrollbar space-y-2">
                {players.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-900 rounded-xl bg-slate-950/20">
                    <Users className="w-8 h-8 text-slate-700 mb-1" />
                    <p className="text-slate-500 text-[10px] uppercase font-mono">Sin Mandos Inscritos</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {players.map((item, idx) => {
                      const isEditing = editingPlayerIdx === idx;
                      return (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                            isEditing 
                              ? 'bg-slate-900/90 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                              : 'bg-slate-950/80 border-slate-900/60 hover:border-slate-800'
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 w-full min-w-0">
                              <input
                                type="text"
                                maxLength={20}
                                value={editingPlayerVal}
                                onChange={(e) => setEditingPlayerVal(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-white uppercase font-display font-medium focus:outline-none focus:border-green-500"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditPlayer();
                                  if (e.key === 'Escape') handleCancelEditPlayer();
                                }}
                              />
                              <button
                                onClick={handleSaveEditPlayer}
                                className="bg-green-600 hover:bg-green-500 p-1.5 rounded-md text-white cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelEditPlayer}
                                className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-md text-slate-400 hover:text-white cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-[9px] text-slate-500 font-bold bg-slate-900 border border-slate-800 rounded-full w-4.5 h-4.5 flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="font-display font-black text-slate-200 truncate">
                                  {item}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[10px] shrink-0 ml-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditPlayer(idx)}
                                  className="text-slate-500 hover:text-green-400 p-1 hover:bg-slate-900 rounded-md transition-all cursor-pointer"
                                  title="Editar nombre"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePlayer(item)}
                                  className="text-slate-500 hover:text-red-500 p-1 hover:bg-slate-900 rounded-md transition-all cursor-pointer"
                                  title="Eliminar participante"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* 2. SECCIÓN EQUIPOS DISPONIBLES */}
            <div className="glow-card rounded-2xl p-5 border-t-2 border-t-cyan-500 shadow-lg flex flex-col min-h-[460px]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Gamepad2 className="w-4.5 h-4.5 text-cyan-400" /> 2. Equipos ({teamsPool.length})
                </h2>
              </div>
              
              <p className="text-[10px] text-slate-400 font-mono mb-3 leading-tight uppercase">
                Pool de clubes disponibles para el sorteo aleatorio.
              </p>

              {/* Add form */}
              <form onSubmit={handleAddTeam} className="flex gap-1.5 mb-3.5">
                <input
                  type="text"
                  maxLength={40}
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="flex-1 bg-slate-955 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all font-display font-semibold"
                  placeholder="Escribe el nombre del equipo"
                />
                <button
                  type="submit"
                  title="Agregar equipo al pool"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </form>

              {/* Scrollable list */}
              <div className="flex-1 max-h-[290px] overflow-y-auto no-scrollbar space-y-2">
                {teamsPool.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-900 rounded-xl bg-slate-950/20">
                    <Gamepad2 className="w-8 h-8 text-slate-700 mb-1" />
                    <p className="text-slate-500 text-[10px] uppercase font-mono">Sin Equipos en Pool</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {teamsPool.map((team, idx) => {
                      const isEditing = editingTeamIdx === idx;
                      return (
                        <motion.div
                          key={team}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                            isEditing 
                              ? 'bg-slate-900/90 border-cyan-550 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                              : 'bg-slate-950/80 border-slate-900/60 hover:border-slate-800'
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 w-full min-w-0">
                              <input
                                type="text"
                                maxLength={40}
                                value={editingTeamVal}
                                onChange={(e) => setEditingTeamVal(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-white font-display font-medium focus:outline-none focus:border-cyan-500"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditTeam();
                                  if (e.key === 'Escape') handleCancelEditTeam();
                                }}
                              />
                              <button
                                onClick={handleSaveEditTeam}
                                className="bg-cyan-600 hover:bg-cyan-500 p-1.5 rounded-md text-white cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelEditTeam}
                                className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-md text-slate-400 hover:text-white cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="font-display font-medium text-slate-300 truncate max-w-[80%]">
                                {team}
                              </span>
                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditTeam(idx)}
                                  className="text-slate-500 hover:text-cyan-400 p-1 hover:bg-slate-900 rounded-md transition-all cursor-pointer"
                                  title="Editar equipo"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTeam(team)}
                                  className="text-slate-500 hover:text-red-500 p-1 hover:bg-slate-900 rounded-md transition-all cursor-pointer"
                                  title="Eliminar equipo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>

          </div>
          
          {/* Recovery presets & Global Reset / default anchor bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-900/35 border border-slate-900/80 p-3.5 rounded-2xl max-w-full">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-mono leading-none uppercase font-bold">Configuración de Fábrica & Reset</p>
                <p className="text-[9px] text-slate-500 font-mono leading-none uppercase mt-0.5">Control total del almacenamiento local</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResetSetup}
                className="flex-1 sm:flex-none justify-center bg-red-950/40 border border-red-900/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 font-mono text-[9px] font-black px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                title="Borra absolutamente todo de local"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" /> Limpiar datos locales
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sorteo Visual Board & Settings (5/12 weight) */}
        <div className="lg:col-span-12 xl:col-span-5">
          <div className="glow-card rounded-2xl p-6 border-t-2 border-t-red-500 shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-l from-red-550/5 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-center mb-1 gap-2 border-b border-slate-900 pb-3">
              <div>
                <h2 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Shuffle className="w-4.5 h-4.5 text-red-500 spin-once" /> 3. Sorteo de la Copa
                </h2>
                <p className="text-[10px] text-slate-450 font-mono uppercase mt-0.5">
                  Asignaciones garantizadas sin repetir equipos
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleRandomizeTeams}
                disabled={isShuffling || players.length === 0 || teamsPool.length < players.length}
                className={`font-mono text-[10px] uppercase font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shrink-0 ${
                  isShuffling
                    ? 'bg-amber-600/20 border-amber-500/50 text-amber-300 animate-pulse'
                    : teamsPool.length < players.length
                    ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                    : 'bg-red-600 border border-red-500/30 hover:bg-red-500 hover:scale-[1.01] text-white'
                }`}
              >
                <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin text-amber-300' : ''}`} />
                {isShuffling ? 'Sorteando...' : 'Sortear Equipos'}
              </button>
            </div>

            {/* Error alerts and messages for raffle constraints */}
            {teamsPool.length < players.length && players.length > 0 && (
              <div className="my-3 p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start gap-2.5 text-red-450 font-mono text-[10px] uppercase leading-relaxed text-left">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-red-400">Atención: Equipos Insuficientes</p>
                  <p className="text-slate-400 mt-0.5 normal-case font-display text-xs">
                    Tienes <strong>{players.length}</strong> participantes inscritos pero solo <strong>{teamsPool.length}</strong> equipos en tu pool. Por favor elimina jugadores o agrega más clubes disponibles a la sección de Equipos.
                  </p>
                </div>
              </div>
            )}

            {/* Visual raffle display results mapping */}
            <div className="space-y-2 my-4 max-h-[290px] overflow-y-auto no-scrollbar">
              {players.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-900 rounded-xl bg-slate-955/35">
                  <Users className="w-10 h-10 text-slate-800 mx-auto mb-1" />
                  <p className="text-slate-500 text-xs font-display font-medium">Registra participantes en el paso 1</p>
                </div>
              ) : (
                players.map((pName) => {
                  const assignedTeam = raffleResults[pName];
                  return (
                    <div 
                      key={pName} 
                      className="flex items-center justify-between p-3 bg-slate-955/90 border border-slate-900 rounded-xl hover:border-slate-850 transition-all font-display gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-black text-xs text-white truncate">{pName}</p>
                        <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider block leading-none mt-0.5">Participante</span>
                      </div>

                      {/* Team dropdown selector or drawing animation placeholder */}
                      <div className="shrink-0">
                        {isShuffling ? (
                          <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-yellow-400 font-mono font-bold animate-pulse flex items-center gap-1">
                            <RefreshCcw className="w-3 h-3 animate-spin text-yellow-400" /> MEZCLANDO...
                          </div>
                        ) : assignedTeam ? (
                          <select
                            value={assignedTeam}
                            onChange={(e) => handleManualTeamChange(pName, e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 font-display font-bold focus:outline-none focus:border-red-500 max-w-[190px] cursor-pointer"
                          >
                            <option value="">-- Seleccionar Equipo --</option>
                            {teamsPool.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="bg-red-950/20 border border-red-900/30 text-red-400 font-mono font-medium text-[9px] px-2.5 py-1.5 rounded-lg animate-pulse uppercase tracking-wider flex items-center gap-1">
                            🎲 Por sortear
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Tournament setup configurations */}
            <div className="border-t border-slate-900 pt-4 mt-auto space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 leading-none">
                    Nombre del Torneo / Copa
                  </label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-green-500 transition-all font-display"
                    placeholder="Ej. Torneo de Playstation"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 leading-none">
                    Modo del Torneo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTournamentMode('liga')}
                      className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-display text-[10px] font-black uppercase tracking-wider ${
                        tournamentMode === 'liga'
                          ? 'bg-green-600/10 border-green-500 text-white font-black'
                          : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:bg-slate-900 hover:text-slate-300'
                      }`}
                    >
                      🏆 Liga + Fase Final
                    </button>
                    <button
                      type="button"
                      onClick={() => setTournamentMode('eliminatoria')}
                      className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-display text-[10px] font-black uppercase tracking-wider ${
                        tournamentMode === 'eliminatoria'
                          ? 'bg-orange-600/10 border-orange-500 text-white font-black'
                          : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:bg-slate-900 hover:text-slate-300'
                      }`}
                    >
                      🔥 Eliminatoria Directa
                    </button>
                  </div>
                </div>

                {tournamentMode === 'liga' && (
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                      Formato de la Jornada
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTournamentType('ida')}
                        className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-display text-[11px] font-black uppercase tracking-wider ${
                          tournamentType === 'ida'
                            ? 'bg-green-600/10 border-green-500 text-white font-black'
                            : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                        }`}
                      >
                        Ida Única
                      </button>
                      <button
                        type="button"
                        onClick={() => setTournamentType('ida_vuelta')}
                        className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-display text-[11px] font-black uppercase tracking-wider ${
                          tournamentType === 'ida_vuelta'
                            ? 'bg-blue-600/10 border-blue-500 text-white font-black'
                            : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                        }`}
                      >
                        Ida y Vuelta
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tournament submission actions */}
              <div>
                <button
                  type="button"
                  onClick={handleSubmitSetup}
                  disabled={!canStart}
                  className={`w-full font-display font-black text-xs uppercase tracking-wider py-4 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                    canStart
                      ? 'bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 hover:brightness-110 text-white shadow-lg shadow-green-950/20'
                      : 'bg-slate-950 border border-slate-900 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current text-white" /> GENERAR FIXTURE Y CAMPEONATO
                </button>
                
                {players.length < 4 && (
                  <div className="flex items-center justify-center gap-1 mt-2 font-mono text-[9px] uppercase tracking-wide text-red-400">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shrink-0" />
                    <span>Requiere mínimo 4 mandos registrados (Tienes {players.length})</span>
                  </div>
                )}
                {players.length >= 4 && !isSorteoComplete && (
                  <div className="flex items-center justify-center gap-1 mt-2 font-mono text-[9px] uppercase tracking-wide text-amber-500">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shrink-0" />
                    <span>Falta realizar el sorteo de los equipos</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
