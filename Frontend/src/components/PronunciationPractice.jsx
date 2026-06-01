import React, { useState, useEffect, useRef } from "react";
import { useTypingStore } from "../store/typingStore";
import { Mic, MicOff, RefreshCw, Award, AlertCircle } from "lucide-react";

// Levenshtein distance helper for word comparison
function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Check if two words are similar (fuzzy matching for pronunciation typos)
function areWordsSimilar(w1, w2) {
  const clean1 = w1.toLowerCase();
  const clean2 = w2.toLowerCase();
  if (clean1 === clean2) return true;
  
  const dist = getLevenshteinDistance(clean1, clean2);
  const maxLen = Math.max(clean1.length, clean2.length);
  // If edit distance is small compared to length, mark as similar
  return dist <= 2 && dist / maxLen < 0.35;
}

export default function PronunciationPractice() {
  const { targetLang, getCurrentLesson, setPronunciationResults, pronunciationResult, isRecording, setIsRecording } = useTypingStore();
  const lesson = getCurrentLesson();
  const targetText = lesson.translated || "";

  const [recognitionError, setRecognitionError] = useState("");
  const [transcriptSegments, setTranscriptSegments] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  
  const recognitionRef = useRef(null);

  // Clean punctuation from texts
  const cleanText = (text) => {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¿¡]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getLanguageCodeForSpeech = (lang) => {
    const codes = {
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      hi: "hi-IN",
      ru: "ru-RU",
      pt: "pt-PT",
      ar: "ar-SA",
      it: "it-IT",
      tr: "tr-TR",
      nl: "nl-NL"
    };
    return codes[lang] || "en-US";
  };

  // Setup Web Speech Recognition
  const startRecording = () => {
    setRecognitionError("");
    setTranscriptSegments([]);
    setInterimTranscript("");
    setPronunciationResults(null, 0, "");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError("Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = getLanguageCodeForSpeech(targetLang);

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event) => {
        let finalTrans = "";
        let interimTrans = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + " ";
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }

        if (finalTrans) {
          setTranscriptSegments((prev) => [...prev, finalTrans]);
        }
        setInterimTranscript(interimTrans);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === "not-allowed") {
          setRecognitionError("Microphone permission denied. Please grant access to your mic.");
        } else {
          setRecognitionError(`Speech recognition error: ${e.error}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
        gradePronunciation();
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      setRecognitionError("Could not start microphone. Try reloading.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const gradePronunciation = () => {
    // Compile final spoken text
    const fullSpoken = [...transcriptSegments, interimTranscript].join(" ").trim();
    if (!fullSpoken || !targetText) return;

    // Tokenize based on character vs word structure
    const isCharacterScript = targetLang === "zh" || targetLang === "ja";
    
    // Original words to render
    const originalTokens = isCharacterScript 
      ? targetText.replace(/\s+/g, "").split("") 
      : targetText.split(/\s+/);

    // Cleaned tokens for matching
    const targetCleaned = isCharacterScript 
      ? originalTokens.map(c => cleanText(c)).filter(Boolean)
      : originalTokens.map(w => cleanText(w)).filter(Boolean);

    const spokenCleaned = isCharacterScript
      ? cleanText(fullSpoken).replace(/\s+/g, "").split("")
      : cleanText(fullSpoken).split(/\s+/).filter(Boolean);

    if (targetCleaned.length === 0) return;

    // Perform DP Alignment
    // dp[i][j] stores the best matching cost
    const n = targetCleaned.length;
    const m = spokenCleaned.length;
    const dp = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

    // DP Initialization
    for (let i = 0; i <= n; i++) dp[i][0] = i * 1.5; // deletion cost
    for (let j = 0; j <= m; j++) dp[0][j] = j * 1.0; // insertion cost

    // Fill DP table
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const wordMatch = targetCleaned[i - 1] === spokenCleaned[j - 1];
        const isFuzzy = areWordsSimilar(targetCleaned[i - 1], spokenCleaned[j - 1]);
        
        let matchCost = 2.0; // mismatch
        if (wordMatch) matchCost = 0;
        else if (isFuzzy) matchCost = 0.4; // minor pronunciation penalty

        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + matchCost, // Substitution / Match
          Math.min(
            dp[i][j - 1] + 1.0, // Insertion
            dp[i - 1][j] + 1.5 // Deletion
          )
        );
      }
    }

    // Backtrack to find aligned operations
    const gradedTokens = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0) {
        const wordMatch = targetCleaned[i - 1] === spokenCleaned[j - 1];
        const isFuzzy = areWordsSimilar(targetCleaned[i - 1], spokenCleaned[j - 1]);
        const costSub = dp[i - 1][j - 1] + (wordMatch ? 0 : isFuzzy ? 0.4 : 2.0);
        const costIns = dp[i][j - 1] + 1.0;
        const costDel = dp[i - 1][j] + 1.5;

        const minCost = Math.min(costSub, Math.min(costIns, costDel));

        if (minCost === costSub) {
          gradedTokens.unshift({
            token: originalTokens[i - 1],
            status: wordMatch ? "correct" : isFuzzy ? "mispronounced" : "incorrect",
            spoken: spokenCleaned[j - 1]
          });
          i--;
          j--;
        } else if (minCost === costDel) {
          gradedTokens.unshift({
            token: originalTokens[i - 1],
            status: "skipped",
            spoken: ""
          });
          i--;
        } else {
          // Extra insertion spoken - ignore or link to previous
          j--;
        }
      } else if (i > 0) {
        gradedTokens.unshift({
          token: originalTokens[i - 1],
          status: "skipped",
          spoken: ""
        });
        i--;
      } else {
        j--;
      }
    }

    // Calculate score
    const correctCount = gradedTokens.filter(t => t.status === "correct").length;
    const fuzzyCount = gradedTokens.filter(t => t.status === "mispronounced").length;
    
    // Weight correct as 1.0, fuzzy as 0.6, wrong/skipped as 0.0
    const finalScore = Math.round(
      ((correctCount + fuzzyCount * 0.6) / originalTokens.length) * 100
    );

    // Form feedback
    let feedback = "";
    if (finalScore >= 85) {
      feedback = "Outstanding! Your pronunciation, rhythm, and clarity are practically native. Keep speaking!";
    } else if (finalScore >= 60) {
      feedback = "Good job! You've got the overall flow. Try to review the yellow/red words and click the speaker icon to hear the native accent again.";
    } else {
      feedback = "Keep practicing! Try breaking the text into smaller clauses, listening closely to the TTS voice, and mimicking the inflections.";
    }

    setPronunciationResults(gradedTokens, finalScore, feedback);
  };

  const currentTranscript = [...transcriptSegments, interimTranscript].join(" ");

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-lg flex flex-col gap-4">
      
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-fuchsia-400" />
          <h3 className="font-bold text-white text-sm tracking-wide">Pronunciation AI Grader</h3>
        </div>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold animate-pulse bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Recording...
          </span>
        )}
      </div>

      {recognitionError && (
        <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
          <p>{recognitionError}</p>
        </div>
      )}

      {/* Speech Button Controller */}
      <div className="flex items-center justify-center py-4 bg-slate-950/20 border border-slate-900 rounded-xl">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="btn rounded-full w-16 h-16 bg-gradient-to-tr from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 border-none text-white shadow-xl shadow-fuchsia-500/20 flex items-center justify-center scale-100 hover:scale-105 active:scale-95 transition-all"
          >
            <Mic className="w-7 h-7" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="btn rounded-full w-16 h-16 bg-rose-600 hover:bg-rose-700 border-none text-white shadow-xl shadow-rose-500/20 flex items-center justify-center scale-100 hover:scale-105 active:scale-95 transition-all animate-pulse"
          >
            <MicOff className="w-7 h-7" />
          </button>
        )}
      </div>

      {isRecording && currentTranscript && (
        <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Live Subtitles</p>
          <p className="text-xs text-slate-400 italic">"{currentTranscript}"</p>
        </div>
      )}

      {/* Pronunciation Assessment Output */}
      {pronunciationResult && (
        <div className="mt-2 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-350">
          
          {/* Score card */}
          <div className="flex items-center gap-4 bg-slate-950/30 border border-slate-900 rounded-xl p-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-fuchsia-500/20 to-indigo-500/20 border border-fuchsia-500/30 flex items-center justify-center">
              <Award className="w-6 h-6 text-fuchsia-400 animate-bounce" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Pronunciation Grade</p>
              <h4 className="text-2xl font-black text-white">{pronunciationResult.score}%</h4>
              <p className="text-[11px] text-slate-450 mt-1">{pronunciationResult.feedback}</p>
            </div>
          </div>

          {/* Graded Text */}
          <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl leading-relaxed">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Graded Script (Read breakdown)</p>
            <div className="flex flex-wrap gap-x-2 gap-y-1.5 text-sm">
              {pronunciationResult.spokenWords.map((item, idx) => {
                let col = "text-slate-350 bg-slate-800/40 border-slate-700/50";
                let tooltip = "";

                if (item.status === "correct") {
                  col = "text-emerald-450 bg-emerald-500/10 border-emerald-500/25 font-semibold";
                  tooltip = "Correctly pronounced";
                } else if (item.status === "mispronounced") {
                  col = "text-amber-400 bg-amber-500/10 border-amber-500/25";
                  tooltip = `Substituted / Sounded like "${item.spoken}"`;
                } else if (item.status === "skipped") {
                  col = "text-slate-500 bg-slate-950/50 border-slate-900/50 line-through";
                  tooltip = "Skipped / Unpronounced";
                } else if (item.status === "incorrect") {
                  col = "text-rose-400 bg-rose-500/10 border-rose-500/25";
                  tooltip = `Incorrectly read as "${item.spoken}"`;
                }

                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 border rounded-lg text-xs cursor-help ${col}`}
                    title={tooltip}
                  >
                    {item.token}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
