import React from "react";
import { useTypingStore } from "../store/typingStore";
import { Award, Zap, Flame, Trophy, Lock, CheckCircle, ChevronRight } from "lucide-react";

export default function GamificationPanel() {
  const {
    xp,
    level,
    streak,
    unlockedAchievements,
    achievementsList,
    showLevelUpNotification,
    newlyUnlockedAchievement,
    dismissLevelUp,
    dismissAchievement
  } = useTypingStore();

  const xpNeeded = level * 500;
  const xpPercent = Math.round((xp / xpNeeded) * 100);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Level and Streaks Card */}
      <div className="md:col-span-1 flex flex-col gap-4">
        
        {/* Level Ring Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-lg flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-fuchsia-500/5 -z-10" />
          
          <div className="relative w-28 h-28 flex items-center justify-center mb-3">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-slate-800 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-indigo-500 fill-none transition-all duration-500"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - xpPercent / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level</span>
              <span className="text-3xl font-black text-white">{level}</span>
            </div>
          </div>

          <h3 className="font-extrabold text-white text-base tracking-wide">Rank: Fluent Typist</h3>
          <p className="text-xs text-slate-400 mt-1">{xp} / {xpNeeded} XP to Next Level</p>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Streak Counter Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-lg flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform duration-200">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Practice Streak</h4>
              <p className="text-xs text-slate-400">Keep the flame alive!</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-orange-400">{streak}</span>
            <span className="text-xs font-bold text-slate-500 ml-1">Days</span>
          </div>
        </div>
      </div>

      {/* Achievements List Card */}
      <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-lg flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
          <Trophy className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-sm tracking-wide">Milestones & Achievements</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[300px] pr-1">
          {achievementsList.map((ach) => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            return (
              <div 
                key={ach.id}
                className={`p-3 border rounded-xl flex gap-3 transition-all duration-200 ${
                  isUnlocked 
                    ? "bg-slate-950/20 border-indigo-500/20 hover:border-indigo-500/40" 
                    : "bg-slate-950/40 border-slate-900 opacity-60"
                }`}
              >
                <div className="text-2xl flex-shrink-0 flex items-center justify-center">
                  {isUnlocked ? ach.icon : "🔒"}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className={`text-xs font-bold truncate ${isUnlocked ? "text-slate-150" : "text-slate-500"}`}>
                    {ach.title}
                  </h4>
                  <p className="text-[10px] text-slate-450 leading-relaxed truncate mt-0.5">{ach.desc}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mt-2 ${
                    isUnlocked 
                      ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400" 
                      : "border-slate-800 bg-slate-850 text-slate-500"
                  }`}>
                    +{ach.xp} XP
                  </span>
                </div>
                {isUnlocked && (
                  <div className="flex-shrink-0 self-start text-emerald-450 mt-1">
                    <CheckCircle className="w-3.5 h-3.5 fill-current text-slate-950" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Celebrations alerts portals */}
      {/* 1. Level Up Modal */}
      {showLevelUpNotification && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Background glowing gradient */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
            
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-xl font-black text-white bg-gradient-to-r from-indigo-200 to-fuchsia-200 bg-clip-text text-transparent">
              LEVEL UP!
            </h3>
            <p className="text-xs text-slate-400 mt-1">Your language typing skills are expanding!</p>
            
            <div className="my-6 inline-flex items-center gap-3 bg-slate-950/60 px-4 py-2 border border-slate-800 rounded-xl font-extrabold text-slate-100">
              <span className="text-sm font-semibold text-slate-450">Level</span>
              <span className="text-xl text-indigo-400">{level - 1}</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <span className="text-xl text-fuchsia-400">{level}</span>
            </div>

            <button
              onClick={dismissLevelUp}
              className="btn btn-sm btn-primary bg-gradient-to-r from-indigo-500 to-fuchsia-500 border-none text-white font-semibold rounded-xl w-full"
            >
              Awesome
            </button>
          </div>
        </div>
      )}

      {/* 2. Achievement Unlocked toast */}
      {newlyUnlockedAchievement && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-slate-900 border border-fuchsia-500/40 rounded-2xl shadow-2xl p-4 w-80 flex gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="text-3xl self-center">{newlyUnlockedAchievement.icon}</div>
          <div className="flex-grow min-w-0">
            <p className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest">Achievement Unlocked!</p>
            <h4 className="font-extrabold text-white text-sm truncate mt-0.5">{newlyUnlockedAchievement.title}</h4>
            <p className="text-[10px] text-slate-400 leading-tight truncate">{newlyUnlockedAchievement.desc}</p>
            <span className="text-[9px] font-bold text-indigo-400 mt-2 inline-block">+{newlyUnlockedAchievement.xp} XP Reward</span>
          </div>
          <button 
            onClick={dismissAchievement}
            className="text-slate-550 hover:text-slate-350 self-start text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
