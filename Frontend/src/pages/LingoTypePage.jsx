import React, { useState } from "react";
import { useTypingStore } from "../store/typingStore";
import LanguageSelector from "../components/LanguageSelector";
import TypingArea from "../components/TypingArea";
import OnScreenKeyboard from "../components/OnScreenKeyboard";
import AudioControls from "../components/AudioControls";
import PronunciationPractice from "../components/PronunciationPractice";
import GamificationPanel from "../components/GamificationPanel";
import Dashboard from "../components/Dashboard";
import { Flame, Trophy, Keyboard, Sparkles, ChevronRight } from "lucide-react";

export default function LingoTypePage() {
  const {
    typingStatus,
    xp,
    level,
    streak,
    lessons,
    activeLessonIndex,
    selectLesson,
    customLessonText
  } = useTypingStore();

  const [activeTab, setActiveTab] = useState("arena"); // 'arena' | 'profile'
  const [speechTab, setSpeechTab] = useState("listen"); // 'listen' | 'speak'

  const handleNextLesson = () => {
    const nextIdx = (activeLessonIndex + 1) % lessons.length;
    selectLesson(nextIdx);
  };

  const xpNeeded = level * 500;
  const xpPercent = Math.round((xp / xpNeeded) * 100);

  return (
    <div className="w-full text-slate-100 p-4 md:p-6 flex flex-col items-center select-none relative bg-slate-950/20">
      
      {/* Background Decorative Blur Spheres */}
      <div className="absolute top-[10%] left-[15%] w-72 h-72 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-fuchsia-500/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-6xl z-10 flex flex-col gap-6">
        
        {/* Navigation / Profile Header Bar */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-md shadow-lg">
          
          {/* Tabs Switcher */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1.5 border border-slate-850 rounded-xl">
            <button
              onClick={() => setActiveTab("arena")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === "arena"
                  ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow shadow-indigo-550/30 border-none"
                  : "text-slate-400 hover:text-slate-200 bg-transparent border-none"
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Practice Arena
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === "profile"
                  ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow shadow-indigo-550/30 border-none"
                  : "text-slate-400 hover:text-slate-200 bg-transparent border-none"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Progress Profile
            </button>
          </div>

          {/* Quick HUD stats */}
          <div className="flex items-center gap-4">
            
            {/* Level & XP HUD */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level {level}</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">{xp}/{xpNeeded} XP</span>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center bg-slate-950/40 border border-slate-850 rounded-xl shadow-inner">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    className="stroke-slate-850 fill-none"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    className="stroke-indigo-500 fill-none transition-all duration-300"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - xpPercent / 100)}
                  />
                </svg>
                <div className="absolute font-black text-xs text-white">{level}</div>
              </div>
            </div>

            {/* Flame Streak HUD */}
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 px-3 py-2 rounded-xl text-orange-400">
              <Flame className="w-4 h-4 fill-current" />
              <span className="font-black text-sm">{streak}</span>
              <span className="text-[10px] uppercase font-bold text-orange-500/80">Day Streak</span>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "arena" ? (
          <div className="flex flex-col gap-6">
            
            {/* Top Selector Panel */}
            <LanguageSelector />

            {/* Arena Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start w-full">
              
              {/* Left Typing Practise Area */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                
                {typingStatus === "completed" ? (
                  <Dashboard onNextLesson={customLessonText ? null : handleNextLesson} />
                ) : (
                  <TypingArea />
                )}

                {/* Virtual on-screen Keyboard */}
                <div className="hidden md:block">
                  <OnScreenKeyboard />
                </div>
              </div>

              {/* Right Bilingual Speech Practice Panels */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                
                {/* Visual Lock status overlay when Typing not completed */}
                {typingStatus !== "completed" ? (
                  <div className="relative group overflow-hidden rounded-xl border border-slate-900 bg-slate-950/20">
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-9 h-9 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center mb-2 text-xs">
                        🔒
                      </div>
                      <h4 className="font-bold text-white text-xs">Oral & Audio Tools Locked</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed max-w-[180px] mt-1">
                        Complete typing the English passage first to unlock speech assessment and listening practices!
                      </p>
                    </div>
                    {/* Faded mockup placeholder */}
                    <div className="opacity-15 select-none pointer-events-none p-4 flex flex-col gap-3">
                      <div className="h-10 bg-slate-900/40 rounded-lg"></div>
                      <div className="h-24 bg-slate-900/40 rounded-lg"></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/40 border border-slate-850 rounded-xl backdrop-blur-md shadow-lg overflow-hidden flex flex-col p-3 animate-in fade-in slide-in-from-right-3 duration-300">
                    
                    {/* Speech Center Tab Switches */}
                    <div className="flex items-center gap-1 bg-slate-950/50 p-1 border border-slate-900 rounded-lg mb-3">
                      <button
                        onClick={() => setSpeechTab("listen")}
                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-150 border-none cursor-pointer ${
                          speechTab === "listen"
                            ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
                            : "text-slate-500 hover:text-slate-300 bg-transparent"
                        }`}
                      >
                        1. Listen (TTS)
                      </button>
                      <button
                        onClick={() => setSpeechTab("speak")}
                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-150 border-none cursor-pointer ${
                          speechTab === "speak"
                            ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/20"
                            : "text-slate-500 hover:text-slate-300 bg-transparent"
                        }`}
                      >
                        2. Speak (AI Grader)
                      </button>
                    </div>

                    <div className="animate-in fade-in zoom-in-98 duration-200">
                      {speechTab === "listen" ? <AudioControls /> : <PronunciationPractice />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-3 duration-300">
            <GamificationPanel />
          </div>
        )}
      </div>
    </div>
  );
}
