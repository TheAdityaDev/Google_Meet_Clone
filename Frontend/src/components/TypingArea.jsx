import React, { useEffect, useRef } from "react";
import { useTypingStore } from "../store/typingStore";
import { Play, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";

// Web Audio API Procedural Sound Synthesizer
let audioCtx = null;
function playSound(type) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume context if suspended (browser security)
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === "click") {
      // Standard key click
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "space") {
      // Spacebar lower click
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "error") {
      // Error buzzer sound
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.12);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (err) {
    console.warn("AudioContext block/fail:", err);
  }
}

export default function TypingArea() {
  const {
    typedText,
    typingStatus,
    mistakes,
    accuracy,
    wpm,
    handleKeystroke,
    resetSession,
    soundEnabled,
    getCurrentLesson
  } = useTypingStore();

  const containerRef = useRef(null);

  const lesson = getCurrentLesson();
  const targetText = lesson.english;
  const sentences = lesson.sentences || [];

  // Determine current active sentence and word indices
  let activeSentenceIndex = 0;
  let characterAccumulator = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sLen = sentences[i].english.length + 1; // plus space
    if (typedText.length >= characterAccumulator && typedText.length < characterAccumulator + sLen) {
      activeSentenceIndex = i;
      break;
    }
    characterAccumulator += sLen;
  }

  // Calculate current word index inside current sentence
  const currentSentenceTypedText = typedText.substring(
    sentences.slice(0, activeSentenceIndex).reduce((acc, s) => acc + s.english.length + 1, 0)
  );
  
  const currentSentenceWords = sentences[activeSentenceIndex]?.english.split(" ") || [];
  const currentWordIndex = currentSentenceTypedText.split(" ").length - 1;

  // Track keypresses globally
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore key events if the user is typing in a modal inputs
      const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
      if (isInput || typingStatus === "completed") return;

      if (e.key === "Backspace") {
        if (soundEnabled) playSound("click");
        handleKeystroke("", true);
      } else if (e.key === "Enter") {
        // Suppress Enter unless it's the next key or we treat it as space
        if (targetText[typedText.length] === "\n" || targetText[typedText.length] === " ") {
          if (soundEnabled) playSound("space");
          handleKeystroke(targetText[typedText.length]);
        }
      } else if (e.key.length === 1) {
        // Visual/Audio Feedback for correctness
        const expectedChar = targetText[typedText.length];
        const isCorrect = e.key === expectedChar;

        if (soundEnabled) {
          if (!isCorrect) {
            playSound("error");
          } else if (e.key === " ") {
            playSound("space");
          } else {
            playSound("click");
          }
        }
        
        handleKeystroke(e.key);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [typedText, targetText, typingStatus, soundEnabled]);

  // Scroll to current cursor position inside text container
  useEffect(() => {
    const caret = containerRef.current?.querySelector(".typing-caret");
    if (caret) {
      caret.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [typedText]);

  // Calculate progress percentage
  const progressPercent = targetText.length > 0 
    ? Math.round((typedText.length / targetText.length) * 100) 
    : 0;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Typing Stats HUD */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-900/40 border border-slate-800/85 backdrop-blur-md rounded-xl p-2 text-center">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Speed</p>
          <p className="text-lg font-bold text-indigo-400 mt-0.5">{wpm} <span className="text-[10px] font-medium text-slate-405">WPM</span></p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/85 backdrop-blur-md rounded-xl p-2 text-center">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Accuracy</p>
          <p className="text-lg font-bold text-fuchsia-400 mt-0.5">{accuracy}%</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/85 backdrop-blur-md rounded-xl p-2 text-center">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Errors</p>
          <p className="text-lg font-bold text-rose-450 mt-0.5">{mistakes}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/85 backdrop-blur-md rounded-xl p-2 text-center">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Progress</p>
          <p className="text-lg font-bold text-cyan-400 mt-0.5">{progressPercent}%</p>
        </div>
      </div>

      {/* Typing Main Box */}
      <div className="relative bg-slate-900/35 border border-slate-800/80 rounded-xl backdrop-blur-md shadow-xl overflow-hidden p-4">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-850">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-150" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* English Text typing practice container */}
        <div 
          ref={containerRef}
          className="text-base md:text-lg font-mono leading-relaxed text-slate-400 select-none overflow-y-auto max-h-24 pr-2 mb-4 scroll-smooth no-scrollbar"
        >
          {targetText.split("").map((char, index) => {
            let charClass = "transition-all duration-100 ";
            let isCurrent = index === typedText.length;
            let isTyped = index < typedText.length;
            let isCorrect = isTyped && typedText[index] === char;

            if (isCurrent) {
              charClass += "text-white bg-indigo-500/20 rounded font-semibold ring-1 ring-indigo-500/40";
            } else if (isCorrect) {
              charClass += "text-emerald-450";
            } else if (isTyped) {
              charClass += "text-rose-400 bg-rose-500/10 border-b border-rose-500/50";
            } else {
              charClass += "text-slate-500";
            }

            return (
              <span key={index} className="relative">
                {isCurrent && (
                  <span className="absolute bottom-0 top-0 left-0 w-0.5 bg-indigo-400 animate-pulse typing-caret" />
                )}
                <span className={charClass}>{char}</span>
              </span>
            );
          })}
        </div>

        {/* Translation Assistant View */}
        <div className="border-t border-slate-800/60 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-3 bg-indigo-500 rounded-full" />
            <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Active Sentence Translation</h4>
          </div>

          <div className="text-sm leading-relaxed text-slate-350">
            {sentences.length > 0 && sentences[activeSentenceIndex] ? (() => {
              const sent = sentences[activeSentenceIndex];
              const transText = sent.translations[useTypingStore.getState().targetLang] || sent.english;
              const transWords = transText.split(" ");
              
              // Relative highlighting index calculation
              let alignedTargetWordIdx = -1;
              alignedTargetWordIdx = Math.min(
                transWords.length - 1,
                Math.round((currentWordIndex / Math.max(1, currentSentenceWords.length)) * (transWords.length - 1))
              );

              return (
                <div className="p-3 rounded-lg border bg-slate-950/80 border-indigo-500/30 shadow-md glow-indigo text-slate-100">
                  {/* English sentence reference */}
                  <p className="text-[10px] font-mono text-indigo-400/80 mb-1.5 leading-normal font-medium">{sent.english}</p>
                  
                  {/* Target translation words display */}
                  <p className="text-xs font-sans flex flex-wrap gap-1 mt-2">
                    {transWords.map((w, wIdx) => {
                      const isWordActive = wIdx === alignedTargetWordIdx;
                      return (
                        <span 
                          key={wIdx}
                          className={`rounded-md px-2 py-0.5 transition-all duration-150 border ${
                            isWordActive
                              ? "bg-gradient-to-r from-fuchsia-500/30 to-indigo-500/30 text-white border-fuchsia-400/50 scale-105 shadow font-bold"
                              : "text-slate-300 bg-slate-900/40 border border-slate-800/40"
                          }`}
                        >
                          {w}
                        </span>
                      );
                    })}
                  </p>
                </div>
              );
            })() : (
              <div className="bg-slate-900/30 border border-slate-800/80 p-2.5 rounded-lg">
                <p className="text-xs text-slate-350 leading-relaxed">{lesson.translated}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reset Action */}
        <div className="flex justify-between items-center mt-3">
          <div className="text-[10px] text-slate-500 italic">
            {typingStatus === "idle" ? "Start typing to begin..." : "Practicing..."}
          </div>
          <button 
            onClick={resetSession}
            className="btn btn-xs btn-ghost gap-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg h-7 px-3 border border-slate-800"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>
      
      {/* Keyboard Guidance Alert */}
      {typingStatus === "idle" && (
        <div className="flex items-center gap-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 max-w-md mx-auto text-[11px]">
          <Play className="w-4 h-4 flex-shrink-0 animate-pulse text-indigo-400" />
          <p className="leading-tight">
            <strong>Ready?</strong> Begin typing to start the test.
          </p>
        </div>
      )}
    </div>
  );
}
