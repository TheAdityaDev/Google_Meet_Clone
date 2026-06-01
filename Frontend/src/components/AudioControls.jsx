import React, { useEffect, useState, useRef } from "react";
import { useTypingStore } from "../store/typingStore";
import { Play, Pause, Square, Volume2, Settings } from "lucide-react";

export default function AudioControls() {
  const { targetLang, getCurrentLesson } = useTypingStore();
  const lesson = getCurrentLesson();
  const textToSpeak = lesson.translated || "";

  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [speechRate, setSpeechRate] = useState(1);
  const [playbackStatus, setPlaybackStatus] = useState("stopped"); // 'playing' | 'paused' | 'stopped'
  
  const utteranceRef = useRef(null);

  // Load and filter speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const allVoices = window.speechSynthesis.getVoices();
      
      // Filter voices by target language
      // Translate store lang code to voice locale prefixes (e.g. es -> es, zh -> zh/cn, ja -> ja, etc.)
      const langPrefix = targetLang === "en" ? "en" : targetLang;
      const filtered = allVoices.filter((v) =>
        v.lang.toLowerCase().startsWith(langPrefix) || 
        v.lang.toLowerCase().includes("-" + langPrefix)
      );

      setVoices(filtered);

      // Default to the first available language voice or a Google/system voice if present
      if (filtered.length > 0) {
        const preferred = filtered.find(v => v.name.includes("Google") || v.name.includes("Natural")) || filtered[0];
        setSelectedVoiceName(preferred.name);
      } else {
        setSelectedVoiceName("");
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cancel speech on unmount
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [targetLang]);

  const handlePlay = () => {
    if (!window.speechSynthesis) return;

    // If currently paused, resume instead of starting new
    if (playbackStatus === "paused") {
      window.speechSynthesis.resume();
      setPlaybackStatus("playing");
      return;
    }

    // Cancel current speaking if any
    window.speechSynthesis.cancel();

    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Assign selected voice
    const activeVoice = voices.find((v) => v.name === selectedVoiceName);
    if (activeVoice) {
      utterance.voice = activeVoice;
    }
    
    utterance.rate = speechRate;
    
    utterance.onend = () => {
      setPlaybackStatus("stopped");
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis error:", e);
      setPlaybackStatus("stopped");
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaybackStatus("playing");
  };

  const handlePause = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setPlaybackStatus("paused");
  };

  const handleStop = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setPlaybackStatus("stopped");
  };

  if (!window.speechSynthesis) {
    return (
      <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
        Speech Synthesis is not supported in this browser.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-sm tracking-wide">Text-To-Speech (TTS) Pronunciation</h3>
        </div>
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
          playbackStatus === "playing" 
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
            : playbackStatus === "paused"
            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
            : "bg-slate-800 text-slate-400"
        }`}>
          {playbackStatus}
        </span>
      </div>

      {/* Main TTS controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Buttons Group */}
        <div className="flex items-center gap-2">
          {playbackStatus === "playing" ? (
            <button
              onClick={handlePause}
              className="btn btn-sm bg-amber-600 hover:bg-amber-700 border-none text-white rounded-xl flex items-center gap-1.5 px-4 h-9 shadow"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 border-none text-white rounded-xl flex items-center gap-1.5 px-4 h-9 shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Listen
            </button>
          )}

          <button
            onClick={handleStop}
            className="btn btn-sm bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 rounded-xl flex items-center justify-center p-0 w-9 h-9"
            disabled={playbackStatus === "stopped"}
            title="Stop Playback"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Configurations */}
        <div className="flex flex-wrap items-center gap-3 flex-grow justify-end">
          {/* Voice select */}
          <div className="flex flex-col gap-1 min-w-[160px] max-w-[200px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Settings className="w-3 h-3 text-slate-500" /> Voice Accent
            </label>
            {voices.length > 0 ? (
              <select
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value)}
                className="select select-bordered select-xs w-full bg-slate-950 border-slate-800 text-slate-350 focus:outline-none rounded-lg text-xs"
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name.replace("Microsoft", "").replace("Google", "").trim()} ({v.lang})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-500 italic">No native voices found</span>
            )}
          </div>

          {/* Speed Rate Slider */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Speed</span>
              <span className="text-indigo-400 font-mono">{speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="range range-xs range-indigo accent-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
