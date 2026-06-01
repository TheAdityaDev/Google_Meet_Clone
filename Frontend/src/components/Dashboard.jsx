import React from "react";
import { useTypingStore } from "../store/typingStore";
import { Play, RotateCcw, Award, CheckCircle, Zap, ShieldAlert, Clock, Sparkles } from "lucide-react";

export default function Dashboard({ onNextLesson }) {
  const {
    wpm,
    cpm,
    accuracy,
    mistakes,
    startTime,
    endTime,
    typedText,
    wpmTimeline,
    resetSession,
    getCurrentLesson
  } = useTypingStore();

  const lesson = getCurrentLesson();
  
  // Calculations
  const timeElapsedSec = endTime && startTime ? Math.round((endTime - startTime) / 1000) : 0;
  const minutes = Math.floor(timeElapsedSec / 60);
  const seconds = timeElapsedSec % 60;
  
  const correctWords = Math.round(typedText.length / 5) - mistakes;
  const wordCount = typedText.split(" ").filter(Boolean).length;

  // Custom SVG Graph generation
  // Timeline contains points: { chars, wpm, accuracy }
  // We need to scale these to fit inside our SVG box (e.g. 500 width x 200 height)
  const drawSvgGraph = () => {
    const data = wpmTimeline.length > 1 
      ? wpmTimeline 
      : [
          { chars: 0, wpm: 0, accuracy: 100 }, 
          { chars: typedText.length, wpm: wpm, accuracy: accuracy }
        ];

    const padding = 20;
    const width = 500;
    const height = 180;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Find max values for scaling
    const maxWpm = Math.max(...data.map(d => d.wpm), 80); // default max Y limit at least 80
    const minWpm = 0;

    // Helper to scale coordinates
    const getX = (index) => padding + (index / (data.length - 1)) * graphWidth;
    const getY = (val) => padding + graphHeight - ((val - minWpm) / (maxWpm - minWpm)) * graphHeight;

    // Build SVG paths
    let wpmPath = `M ${getX(0)} ${getY(data[0].wpm)}`;
    let wpmArea = `M ${getX(0)} ${padding + graphHeight} L ${getX(0)} ${getY(data[0].wpm)}`;
    
    for (let i = 1; i < data.length; i++) {
      wpmPath += ` L ${getX(i)} ${getY(data[i].wpm)}`;
      wpmArea += ` L ${getX(i)} ${getY(data[i].wpm)}`;
    }
    
    wpmArea += ` L ${getX(data.length - 1)} ${padding + graphHeight} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-slate-650 overflow-visible">
        {/* Gradients */}
        <defs>
          <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
          const y = padding + graphHeight * ratio;
          const wpmVal = Math.round(maxWpm - (ratio * (maxWpm - minWpm)));
          return (
            <g key={idx} className="opacity-30">
              <line 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="#475569" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <text 
                x={padding - 5} 
                y={y + 4} 
                fill="#94a3b8" 
                className="text-[9px] text-right font-mono"
                textAnchor="end"
              >
                {wpmVal}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={wpmArea} fill="url(#wpmGradient)" />

        {/* WPM Line */}
        <path 
          d={wpmPath} 
          fill="none" 
          stroke="#6366f1" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(d.wpm)}
            r="4"
            className="fill-slate-950 stroke-indigo-400 stroke-2 cursor-pointer hover:r-6 transition-all"
            title={`WPM: ${d.wpm}`}
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-98 duration-300">
      
      {/* Background glow flares */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl -z-10" />

      {/* Header Trophy Banner */}
      <div className="flex flex-col items-center text-center gap-2 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
          <Award className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-wide">Lesson Completed successfully!</h2>
        <p className="text-xs text-slate-400">Excellent typing practice! Your bilingual proficiency is leveling up.</p>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        
        {/* WPM Card */}
        <div className="p-4 bg-slate-950/30 border border-slate-900 rounded-2xl text-center group hover:border-indigo-500/30 transition duration-200">
          <Zap className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Typing Speed</p>
          <h4 className="text-2xl font-black text-white mt-1">{wpm} <span className="text-xs font-semibold text-indigo-400">WPM</span></h4>
          <p className="text-[10px] text-slate-500 mt-1">{cpm} Characters/Min</p>
        </div>

        {/* Accuracy Card */}
        <div className="p-4 bg-slate-950/30 border border-slate-900 rounded-2xl text-center group hover:border-fuchsia-500/30 transition duration-200">
          <CheckCircle className="w-5 h-5 text-fuchsia-400 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accuracy</p>
          <h4 className="text-2xl font-black text-white mt-1">{accuracy}%</h4>
          <p className="text-[10px] text-slate-500 mt-1">Goal: 95%</p>
        </div>

        {/* Mistakes Card */}
        <div className="p-4 bg-slate-950/30 border border-slate-900 rounded-2xl text-center group hover:border-rose-500/30 transition duration-200">
          <ShieldAlert className="w-5 h-5 text-rose-450 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Errors</p>
          <h4 className="text-2xl font-black text-white mt-1">{mistakes}</h4>
          <p className="text-[10px] text-slate-500 mt-1">{Math.max(0, correctWords)} Correct Words</p>
        </div>

        {/* Time Elapsed Card */}
        <div className="p-4 bg-slate-950/30 border border-slate-900 rounded-2xl text-center group hover:border-cyan-500/30 transition duration-200">
          <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time Elapsed</p>
          <h4 className="text-2xl font-black text-white mt-1">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </h4>
          <p className="text-[10px] text-slate-500 mt-1">Typing completed</p>
        </div>
      </div>

      {/* Grid containing SVG Chart & Summary breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-8">
        
        {/* Speed Chart Graph */}
        <div className="lg:col-span-2 bg-slate-950/35 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <span className="text-xs font-bold text-slate-350 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Speed Timeline Graph
            </span>
            <span className="text-[10px] text-slate-500 font-semibold font-mono">WPM vs Chars typed</span>
          </div>
          <div className="w-full h-44 flex items-center justify-center p-2">
            {drawSvgGraph()}
          </div>
        </div>

        {/* Curated summary review */}
        <div className="lg:col-span-1 bg-slate-950/35 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-350 border-b border-slate-850 pb-2 mb-3">Translation Insight</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-mono line-clamp-3 mb-2">"{lesson.english}"</p>
            <div className="w-full h-[1px] bg-slate-850 my-2" />
            <p className="text-xs text-indigo-300 leading-relaxed font-sans line-clamp-3 font-medium">"{lesson.translated}"</p>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-850 pt-3 mt-4">
            Next steps: Play the Audio synthesis below, then test your accent in the Pronunciation Grader!
          </div>
        </div>
      </div>

      {/* Lesson actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-850 pt-5">
        <button
          onClick={resetSession}
          className="btn btn-sm bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 rounded-xl flex items-center gap-1.5 px-4 h-9 shadow"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retake Lesson
        </button>

        {onNextLesson && (
          <button
            onClick={onNextLesson}
            className="btn btn-sm bg-gradient-to-r from-indigo-500 to-fuchsia-500 border-none text-white font-semibold rounded-xl flex items-center gap-1.5 px-5 h-9 shadow shadow-indigo-500/10"
          >
            Next Lesson
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
}
