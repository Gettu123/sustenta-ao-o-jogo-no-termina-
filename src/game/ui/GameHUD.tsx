import React from 'react';
import { PlayerStats, Ticket } from '../types.ts';
import { InteractiveTarget } from '../three/OfficeScene.ts';
import {
  Briefcase,
  Coffee,
  Mail,
  Trello,
  Volume2,
  VolumeX,
  Zap,
  Activity,
  Award,
  BookOpen,
  MapPin,
  Clock,
  Sparkles,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import { sound } from '../audio.ts';

interface GameHUDProps {
  stats: PlayerStats;
  tickets: Ticket[];
  unreadEmailCount: number;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
  nearTarget: InteractiveTarget | null;
  currentRoom: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenTerminal: () => void;
  onOpenEmails: () => void;
  onOpenKanban: () => void;
  onOpenAchievements: () => void;
  onOpenHelp: () => void;
  onInteract: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  tickets,
  unreadEmailCount,
  unlockedAchievementsCount,
  totalAchievementsCount,
  nearTarget,
  currentRoom,
  isMuted,
  onToggleMute,
  onOpenTerminal,
  onOpenEmails,
  onOpenKanban,
  onOpenAchievements,
  onOpenHelp,
  onInteract,
}) => {
  // Format time (e.g. 480 mins -> 08:00)
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const getDayName = (day: number) => {
    const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
    return days[(day - 1) % days.length];
  };

  const openTickets = tickets.filter((t) => t.status !== 'closed');
  const criticalTickets = openTickets.filter((t) => t.assignedPriority === 'P1' || t.suggestedPriority === 'P1');

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top Persistent HUD Bar */}
      <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 shadow-2xl backdrop-blur-md">
        {/* Left: Time & Day & Room */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600/30 p-1.5 rounded-lg border border-blue-500/40 text-blue-400">
              <Clock className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Expediente · {getDayName(stats.day)}
              </div>
              <div className="text-xl font-bold font-mono-code text-white flex items-center gap-2">
                {formatTime(stats.timeMinutes)}
                {stats.timeMinutes >= 1020 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-tech">
                    HORA EXTRA
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentRoom}</span>
          </div>
        </div>

        {/* Center: Core Player Stats (Energia, Estresse, Reputação, Conhecimento) */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Energia com Feedback Visual de Bateria Baixa */}
          <div
            className={`flex items-center gap-2 min-w-[120px] transition-all duration-300 ${
              stats.energy < 25
                ? 'border border-amber-500/70 bg-amber-950/40 px-2 py-1 rounded-xl shadow-lg shadow-amber-500/20'
                : 'px-1'
            }`}
          >
            <Zap
              className={`w-4 h-4 transition-transform ${
                stats.energy < 25
                  ? 'text-red-400 animate-energy-critical drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]'
                  : 'text-amber-400'
              }`}
            />
            <div className="w-full">
              <div className="flex justify-between text-[11px] font-mono-code">
                <span className={stats.energy < 25 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {stats.energy < 25 ? 'BATERIA!' : 'ENERGIA'}
                </span>
                <span className={stats.energy < 25 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {Math.round(stats.energy)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    stats.energy > 50
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                      : stats.energy > 25
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, stats.energy))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Estresse com Pulso Vermelho Intenso e Brilho Crítico */}
          <div
            className={`flex items-center gap-2 min-w-[120px] transition-all duration-300 ${
              stats.stress > 65
                ? 'animate-stress-card border-2 border-red-500 bg-red-950/60 px-2.5 py-1 rounded-xl shadow-lg shadow-red-500/30'
                : 'px-1'
            }`}
          >
            <Activity
              className={`w-4 h-4 transition-transform ${
                stats.stress > 65
                  ? 'text-red-500 animate-stress-pulse drop-shadow-[0_0_12px_rgba(239,68,68,1)]'
                  : stats.stress > 45
                  ? 'text-amber-400'
                  : 'text-purple-400'
              }`}
            />
            <div className="w-full">
              <div className="flex justify-between text-[11px] font-mono-code">
                <span className={stats.stress > 65 ? 'text-red-300 font-bold animate-pulse' : 'text-slate-300'}>
                  {stats.stress > 65 ? 'ESTRESSE ALTO!' : 'ESTRESSE'}
                </span>
                <span className={stats.stress > 65 ? 'text-red-300 font-bold' : 'text-slate-300'}>
                  {Math.round(stats.stress)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    stats.stress > 65
                      ? 'bg-red-500'
                      : stats.stress > 45
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-400'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, stats.stress))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Reputação */}
          <div className="hidden md:flex items-center gap-2 min-w-[100px]">
            <Award className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Reputação</div>
              <div className="text-sm font-bold text-sky-300 font-mono-code">{stats.reputation}/100</div>
            </div>
          </div>

          {/* Conhecimento SAP */}
          <div className="hidden lg:flex items-center gap-2 min-w-[100px]">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">SAP Exp</div>
              <div className="text-sm font-bold text-emerald-300 font-mono-code">{stats.sapKnowledge}/100</div>
            </div>
          </div>
        </div>

        {/* Right: Quick actions, Achievements & Sound */}
        <div className="flex items-center gap-2">
          {/* Conquistas Corporativas Badge */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAchievements();
            }}
            title="Ver Selos e Conquistas Corporativas"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Selos C2C</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-900/80 text-[10px] font-mono-code font-bold">
              {unlockedAchievementsCount}/{totalAchievementsCount}
            </span>
          </button>

          {criticalTickets.length > 0 && (
            <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/50 px-2.5 py-1 rounded-lg text-red-300 text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {criticalTickets.length} P1 Crítico
            </div>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onOpenHelp();
            }}
            title="Como Jogar / Ajuda"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Ativar som' : 'Silenciar'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Center Interactive Prompt when near an NPC / Spot */}
      <div className="flex justify-center items-center my-auto pointer-events-none">
        {nearTarget && (
          <div className="pointer-events-auto animate-bounce-subtle bg-slate-900/95 border-2 border-blue-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg text-sm font-tech">
              E
            </div>
            <div>
              <div className="text-xs text-blue-300 font-medium uppercase tracking-wider">{nearTarget.name}</div>
              <div className="text-base font-bold text-white">{nearTarget.label}</div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onInteract();
              }}
              className="ml-2 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-md cursor-pointer"
            >
              Interagir
            </button>
          </div>
        )}
      </div>

      {/* Bottom Collapsible Dock: Clean 0-occlusion controls */}
      <footer className="pointer-events-auto mx-auto max-w-2xl w-full flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* Terminal SAP / Chamados */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTerminal();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span>Fila de Chamados</span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-800 text-[10px] font-mono-code font-bold">
              {openTickets.length}
            </span>
          </button>

          {/* E-mails Corporativos */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenEmails();
            }}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 active:scale-95 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-sky-400" />
            <span>E-mails</span>
            {unreadEmailCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadEmailCount}
              </span>
            )}
          </button>

          {/* Projetos / Kanban */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenKanban();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 active:scale-95 cursor-pointer"
          >
            <Trello className="w-4 h-4 text-emerald-400" />
            <span>Kanban</span>
          </button>

          {/* Conquistas Corporativas C2C */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAchievements();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 font-semibold text-xs transition-all border border-amber-600/50 active:scale-95 cursor-pointer shadow-md"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Conquistas</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-900 text-[10px] font-mono-code font-bold border border-amber-500/40">
              {unlockedAchievementsCount}
            </span>
          </button>
        </div>

        {/* Quick controls hint */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 font-mono-code">
          <span>WASD / Setas: Andar</span>
          <span>·</span>
          <span>E / Espaço: Ação</span>
        </div>
      </footer>
    </div>
  );
};
