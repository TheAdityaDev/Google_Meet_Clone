import { create } from "zustand";
import { LESSONS } from "../constants/lessons";

const ACHIEVEMENTS_LIST = [
  { id: "first_lesson", title: "First Flight", desc: "Complete your first typing lesson", icon: "🚀", xp: 100 },
  { id: "laser_focus", title: "Laser Focus", desc: "Complete a lesson with 95% or higher accuracy", icon: "🎯", xp: 150 },
  { id: "sonic_typist", title: "Sonic Typist", desc: "Reach a typing speed of 60 WPM or more", icon: "⚡", xp: 200 },
  { id: "polyglot_rookie", title: "Polyglot Rookie", desc: "Speak and complete a pronunciation test", icon: "🗣️", xp: 150 },
  { id: "streak_starter", title: "Streak Starter", desc: "Practice two days in a row", icon: "🔥", xp: 100 },
  { id: "perfectionist", title: "Perfectionist", desc: "Achieve 100% typing accuracy in a lesson", icon: "🌟", xp: 300 }
];

const INITIAL_STATE = {
  lessons: LESSONS,
  activeLessonIndex: 0,
  targetLang: "es", // Default target language: Spanish
  
  // Typing state
  typingStatus: "idle", // 'idle' | 'typing' | 'completed'
  typedText: "",
  mistakes: 0,
  startTime: null,
  endTime: null,
  wpm: 0,
  cpm: 0,
  accuracy: 100,
  totalKeysTyped: 0,
  wpmTimeline: [], // For rendering speed charts
  
  // Audio settings
  soundEnabled: true,
  
  // Pronunciation state
  pronunciationResult: null, // { spokenWords: [], score: 0, feedback: "" }
  pronunciationScore: 0,
  isRecording: false,
  
  // Custom lessons fetched via API
  customLessonText: null,
  customLessonTranslation: null,
  isTranslating: false
};

export const useTypingStore = create((set, get) => {
  // Load gamification data from local storage
  const savedXp = localStorage.getItem("typing_learn_xp") ? parseInt(localStorage.getItem("typing_learn_xp")) : 0;
  const savedLevel = localStorage.getItem("typing_learn_level") ? parseInt(localStorage.getItem("typing_learn_level")) : 1;
  const savedAchievements = localStorage.getItem("typing_learn_achievements") ? JSON.parse(localStorage.getItem("typing_learn_achievements")) : [];
  const savedStreak = localStorage.getItem("typing_learn_streak") ? parseInt(localStorage.getItem("typing_learn_streak")) : 0;
  const savedLastDate = localStorage.getItem("typing_learn_last_date") || null;

  return {
    ...INITIAL_STATE,
    
    // Gamification state
    xp: savedXp,
    level: savedLevel,
    unlockedAchievements: savedAchievements,
    streak: savedStreak,
    lastCompletedDate: savedLastDate,
    achievementsList: ACHIEVEMENTS_LIST,
    showLevelUpNotification: false,
    newlyUnlockedAchievement: null,

    // Select standard lesson
    selectLesson: (index) => {
      set({
        activeLessonIndex: index,
        customLessonText: null,
        customLessonTranslation: null,
        ...get().getResetFields()
      });
    },

    // Set custom lesson
    setCustomLesson: (text, translation) => {
      set({
        customLessonText: text,
        customLessonTranslation: translation,
        ...get().getResetFields()
      });
    },

    setTargetLang: (lang) => {
      set({ targetLang: lang });
      // If we are showing custom generated text, we might want to re-translate it.
      // Reset the current progress when language changes to avoid confusing translations.
      get().resetSession();
    },

    setSoundEnabled: (enabled) => {
      set({ soundEnabled: enabled });
    },

    getResetFields: () => ({
      typingStatus: "idle",
      typedText: "",
      mistakes: 0,
      startTime: null,
      endTime: null,
      wpm: 0,
      cpm: 0,
      accuracy: 100,
      totalKeysTyped: 0,
      wpmTimeline: [],
      pronunciationResult: null,
      pronunciationScore: 0,
      isRecording: false
    }),

    resetSession: () => {
      set(get().getResetFields());
    },

    // Triggered on key press
    handleKeystroke: (char, isBackspace = false) => {
      const { typingStatus, typedText, mistakes, totalKeysTyped, startTime } = get();
      const currentLesson = get().getCurrentLesson();
      const targetText = currentLesson.english;

      let newStatus = typingStatus;
      let newTypedText = typedText;
      let newMistakes = mistakes;
      let newTotalKeysTyped = totalKeysTyped;
      let newStartTime = startTime;
      let newEndTime = null;

      // Start timer on first keypress
      if (typingStatus === "idle") {
        newStatus = "typing";
        newStartTime = Date.now();
      }

      if (isBackspace) {
        if (typedText.length > 0) {
          newTypedText = typedText.slice(0, -1);
        }
      } else {
        newTotalKeysTyped += 1;
        const expectedChar = targetText[typedText.length];

        if (char !== expectedChar) {
          newMistakes += 1;
        }
        
        newTypedText = typedText + char;
      }

      // Check if finished
      if (newTypedText.length >= targetText.length) {
        newStatus = "completed";
        newEndTime = Date.now();
        
        // Final calculations
        const timeElapsed = (newEndTime - newStartTime) / 1000 / 60; // in minutes
        const finalCpm = timeElapsed > 0 ? Math.round(newTypedText.length / timeElapsed) : 0;
        const finalWpm = timeElapsed > 0 ? Math.round((newTypedText.length / 5) / timeElapsed) : 0;
        const finalAccuracy = newTotalKeysTyped > 0 ? Math.round(((newTotalKeysTyped - newMistakes) / newTotalKeysTyped) * 100) : 100;

        set({
          typingStatus: newStatus,
          typedText: newTypedText,
          mistakes: newMistakes,
          totalKeysTyped: newTotalKeysTyped,
          endTime: newEndTime,
          wpm: finalWpm,
          cpm: finalCpm,
          accuracy: Math.max(0, finalAccuracy)
        });

        // Award XP and achievements
        get().handleLessonCompletion(finalWpm, finalAccuracy);
        return;
      }

      // Calculate live stats
      const timeElapsed = startTime ? (Date.now() - startTime) / 1000 / 60 : 0;
      const liveCpm = timeElapsed > 0 ? Math.round(newTypedText.length / timeElapsed) : 0;
      const liveWpm = timeElapsed > 0 ? Math.round((newTypedText.length / 5) / timeElapsed) : 0;
      const liveAccuracy = newTotalKeysTyped > 0 ? Math.round(((newTotalKeysTyped - newMistakes) / newTotalKeysTyped) * 100) : 100;

      // Track speed timeline every 10 characters typed
      let updatedTimeline = [...get().wpmTimeline];
      if (newTypedText.length % 10 === 0 && newTypedText.length > 0) {
        updatedTimeline.push({
          chars: newTypedText.length,
          wpm: liveWpm,
          accuracy: Math.max(0, liveAccuracy)
        });
      }

      set({
        typingStatus: newStatus,
        typedText: newTypedText,
        mistakes: newMistakes,
        totalKeysTyped: newTotalKeysTyped,
        startTime: newStartTime,
        endTime: newEndTime,
        wpm: liveWpm,
        cpm: liveCpm,
        accuracy: Math.max(0, liveAccuracy),
        wpmTimeline: updatedTimeline
      });
    },

    getCurrentLesson: () => {
      const { lessons, activeLessonIndex, customLessonText, customLessonTranslation, targetLang } = get();
      if (customLessonText) {
        return {
          title: "Custom Dynamic Lesson",
          category: "Custom",
          difficulty: "Variable",
          english: customLessonText,
          translated: customLessonTranslation
        };
      }
      const lesson = lessons[activeLessonIndex];
      // Gather translation sentence by sentence
      const englishText = lesson.sentences.map(s => s.english).join(" ");
      const translatedText = lesson.sentences.map(s => s.translations[targetLang] || s.english).join(" ");
      return {
        ...lesson,
        english: englishText,
        translated: translatedText,
        sentences: lesson.sentences
      };
    },

    setIsRecording: (recording) => set({ isRecording: recording }),

    setPronunciationResults: (spokenWords, score, feedback) => {
      set({
        pronunciationResult: { spokenWords, score, feedback },
        pronunciationScore: score
      });

      // Award XP for speaking practice
      if (score >= 50) {
        const bonusXp = Math.round(score / 2);
        get().addXp(bonusXp);

        // Check polyglot achievement
        get().unlockAchievement("polyglot_rookie");
      }
    },

    handleLessonCompletion: (finalWpm, finalAccuracy) => {
      // Calculate XP
      // Standard XP = 100 points
      // Accuracy multiplier: 100% -> 2x XP, 90% -> 1.5x XP
      // WPM speed bonus: speed / 10 (e.g. 50 WPM -> 5 XP)
      const baseXP = 100;
      const accuracyMultiplier = finalAccuracy >= 100 ? 2 : finalAccuracy >= 90 ? 1.5 : 1.0;
      const speedBonus = Math.round(finalWpm / 5);
      const xpEarned = Math.round(baseXP * accuracyMultiplier) + speedBonus;

      get().addXp(xpEarned);

      // Check Achievements
      get().unlockAchievement("first_lesson");
      
      if (finalAccuracy >= 95) {
        get().unlockAchievement("laser_focus");
      }
      if (finalAccuracy === 100) {
        get().unlockAchievement("perfectionist");
      }
      if (finalWpm >= 60) {
        get().unlockAchievement("sonic_typist");
      }

      // Check and update streak
      const today = new Date().toDateString();
      const lastDate = get().lastCompletedDate;
      let newStreak = get().streak;

      if (lastDate) {
        const diffTime = Math.abs(new Date(today) - new Date(lastDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive day
          newStreak += 1;
          if (newStreak >= 2) {
            get().unlockAchievement("streak_starter");
          }
        } else if (diffDays > 1) {
          // Streak broken
          newStreak = 1;
        }
      } else {
        // First lesson ever
        newStreak = 1;
      }

      set({
        streak: newStreak,
        lastCompletedDate: today
      });
      localStorage.setItem("typing_learn_streak", newStreak.toString());
      localStorage.setItem("typing_learn_last_date", today);
    },

    addXp: (amount) => {
      const { xp, level } = get();
      const newXp = xp + amount;
      const xpNeededForNextLevel = level * 500; // e.g. Level 1 needs 500XP, Level 2 needs 1000XP

      if (newXp >= xpNeededForNextLevel) {
        const newLevel = level + 1;
        set({
          xp: newXp - xpNeededForNextLevel,
          level: newLevel,
          showLevelUpNotification: true
        });
        localStorage.setItem("typing_learn_level", newLevel.toString());
        localStorage.setItem("typing_learn_xp", (newXp - xpNeededForNextLevel).toString());
      } else {
        set({ xp: newXp });
        localStorage.setItem("typing_learn_xp", newXp.toString());
      }
    },

    dismissLevelUp: () => set({ showLevelUpNotification: false }),
    dismissAchievement: () => set({ newlyUnlockedAchievement: null }),

    unlockAchievement: (id) => {
      const { unlockedAchievements, achievementsList } = get();
      if (unlockedAchievements.includes(id)) return;

      const achievement = achievementsList.find(a => a.id === id);
      if (achievement) {
        const updated = [...unlockedAchievements, id];
        set({
          unlockedAchievements: updated,
          newlyUnlockedAchievement: achievement
        });
        localStorage.setItem("typing_learn_achievements", JSON.stringify(updated));
        
        // Award achievement XP
        get().addXp(achievement.xp);
      }
    },

    // Fetch dynamic translations from MyMemory Translation API
    translateCustomText: async (text) => {
      const { targetLang } = get();
      if (!text || text.trim() === "") return;

      set({ isTranslating: true });
      try {
        // Break paragraph into sentences for better MyMemory accuracy
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const translatedSentences = await Promise.all(
          sentences.map(async (sentence) => {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
              sentence.trim()
            )}&langpair=en|${targetLang}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error("Translation API error");
            const data = await response.json();
            return data.responseData?.translatedText || sentence;
          })
        );

        const fullTranslation = translatedSentences.join(" ");
        get().setCustomLesson(text, fullTranslation);
      } catch (error) {
        console.error("Failed to translate custom text:", error);
        // Fallback to Spanish or current selected language with preloaded index 0
        get().selectLesson(0);
      } finally {
        set({ isTranslating: false });
      }
    }
  };
});
