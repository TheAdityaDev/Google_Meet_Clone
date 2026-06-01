import React, { useState } from "react";
import { useTypingStore } from "../store/typingStore";
import { Globe, BookOpen, Sparkles, Volume2, VolumeX } from "lucide-react";

export const LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "Mandarin", native: "中文 (普通话)", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱" }
];

export default function LanguageSelector() {
  const {
    targetLang,
    setTargetLang,
    lessons,
    activeLessonIndex,
    selectLesson,
    translateCustomText,
    isTranslating,
    soundEnabled,
    setSoundEnabled,
    customLessonText
  } = useTypingStore();

  const [customText, setCustomText] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);

  const selectedTarget = LANGUAGES.find((l) => l.code === targetLang) || LANGUAGES[1];

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (customText.trim() === "") return;
    await translateCustomText(customText);
    setShowCustomModal(false);
    setCustomText("");
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 p-2.5 bg-slate-900/40 border border-slate-800/80 rounded-xl backdrop-blur-md mb-3 shadow-lg relative z-30">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
          A
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide bg-gradient-to-r from-indigo-200 via-slate-100 to-fuchsia-200 bg-clip-text text-transparent">
            LingoType
          </h1>
          <p className="text-[10px] text-slate-500">Typing & Language Learning</p>
        </div>
      </div>

      {/* Selectors and Settings */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Source Language (Fixed) */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-850 rounded-lg border border-slate-800 text-xs">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider">Source:</span>
          <span className="font-semibold text-slate-300">🇺🇸 English</span>
        </div>

        {/* Target Language Dropdown */}
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-xs btn-ghost gap-1.5 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-lg normal-case text-slate-200 h-8"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] text-slate-450">Target:</span>
            <span className="text-xs">{selectedTarget.flag} {selectedTarget.name}</span>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-1.5 shadow-2xl bg-slate-900 border border-slate-800 rounded-lg w-56 z-[9999] max-h-80 overflow-y-auto mt-1"
          >
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-500 border-b border-slate-800/80 mb-1 uppercase tracking-wider">
              Select Target Language
            </div>
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => setTargetLang(lang.code)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all duration-150 ${
                    targetLang === lang.code
                      ? "bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 text-white font-medium border border-indigo-500/25"
                      : "text-slate-350 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal italic">{lang.native}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Lesson Select Dropdown */}
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-xs btn-ghost gap-1.5 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-lg normal-case text-slate-200 h-8"
          >
            <BookOpen className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="text-[10px] text-slate-450">Lesson:</span>
            <span className="text-xs">{lessons[activeLessonIndex]?.title || "Custom"}</span>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-1.5 shadow-2xl bg-slate-900 border border-slate-800 rounded-lg w-60 z-[9999] mt-1"
          >
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-500 border-b border-slate-800/80 mb-1 uppercase tracking-wider">
              Curated Lessons
            </div>
            {lessons.map((lesson, idx) => (
              <li key={lesson.id}>
                <button
                  onClick={() => selectLesson(idx)}
                  className={`flex flex-col items-start px-2.5 py-1.5 rounded-md transition-all duration-150 text-left ${
                    activeLessonIndex === idx && !customLessonText
                      ? "bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 text-white font-medium border border-indigo-500/25"
                      : "text-slate-350 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="font-semibold text-xs w-full flex items-center justify-between">
                    <span>{lesson.title}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded border ${
                      lesson.difficulty === "Easy"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : lesson.difficulty === "Medium"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                    }`}>
                      {lesson.difficulty}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-550 mt-0.5 uppercase tracking-widest">{lesson.category}</span>
                </button>
              </li>
            ))}
            <div className="border-t border-slate-800/80 my-1 pt-1">
              <button
                onClick={() => setShowCustomModal(true)}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded-md transition duration-150 font-medium"
              >
                <Sparkles className="w-3 h-3" />
                Generate Custom Lesson
              </button>
            </div>
          </ul>
        </div>

        {/* Sound FX Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`btn btn-xs gap-1 px-2.5 border rounded-lg transition duration-150 text-[10px] font-bold tracking-wide h-8 select-none ${
            soundEnabled 
              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30" 
              : "bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800/60"
          }`}
          title={soundEnabled ? "Mute typing sounds" : "Enable typing sounds"}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio: On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Audio: Mute</span>
            </>
          )}
        </button>
      </div>

      {/* Custom Text Translation Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Custom Translation Lesson
            </h3>
            <p className="text-xs text-slate-450 mb-4 leading-relaxed">
              Paste or type any paragraph in English (approx. 100–300 words). The application will translate it on-the-fly to your selected target language (<span className="text-white font-medium">{selectedTarget.name}</span>) so you can practice typing and learning in parallel!
            </p>
            <form onSubmit={handleCustomSubmit}>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type or paste your English text here..."
                className="w-full h-40 bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm leading-relaxed mb-4 resize-none"
                maxLength={1000}
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="btn btn-sm btn-ghost text-slate-400 hover:bg-slate-800 rounded-xl"
                  disabled={isTranslating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary bg-gradient-to-r from-indigo-500 to-fuchsia-500 border-none text-white font-semibold rounded-xl px-5 hover:from-indigo-600 hover:to-fuchsia-600 shadow-md shadow-indigo-500/10"
                  disabled={isTranslating}
                >
                  {isTranslating ? (
                    <span className="loading loading-spinner loading-xs">Translating...</span>
                  ) : (
                    "Translate & Type"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
