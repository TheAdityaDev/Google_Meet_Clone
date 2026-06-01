import React, { useEffect, useState } from "react";
import { useTypingStore } from "../store/typingStore";

const KEYBOARD_ROWS = [
  // Row 1
  [
    { code: "Backquote", key: "`", shift: "~" },
    { code: "Digit1", key: "1", shift: "!" },
    { code: "Digit2", key: "2", shift: "@" },
    { code: "Digit3", key: "3", shift: "#" },
    { code: "Digit4", key: "4", shift: "$" },
    { code: "Digit5", key: "5", shift: "%" },
    { code: "Digit6", key: "6", shift: "^" },
    { code: "Digit7", key: "7", shift: "&" },
    { code: "Digit8", key: "8", shift: "*" },
    { code: "Digit9", key: "9", shift: "(" },
    { code: "Digit0", key: "0", shift: ")" },
    { code: "Minus", key: "-", shift: "_" },
    { code: "Equal", key: "=", shift: "+" },
    { code: "Backspace", key: "Backspace", width: "w-20 md:w-24 bg-slate-800/80 text-xs" }
  ],
  // Row 2
  [
    { code: "Tab", key: "Tab", width: "w-14 md:w-16 bg-slate-800/80 text-xs" },
    { code: "KeyQ", key: "q", shift: "Q" },
    { code: "KeyW", key: "w", shift: "W" },
    { code: "KeyE", key: "e", shift: "E" },
    { code: "KeyR", key: "r", shift: "R" },
    { code: "KeyT", key: "t", shift: "T" },
    { code: "KeyY", key: "y", shift: "Y" },
    { code: "KeyU", key: "u", shift: "U" },
    { code: "KeyI", key: "i", shift: "I" },
    { code: "KeyO", key: "o", shift: "O" },
    { code: "KeyP", key: "p", shift: "P" },
    { code: "BracketLeft", key: "[", shift: "{" },
    { code: "BracketRight", key: "]", shift: "}" },
    { code: "Backslash", key: "\\", shift: "|" }
  ],
  // Row 3
  [
    { code: "CapsLock", key: "Caps", width: "w-16 md:w-20 bg-slate-800/80 text-xs text-left pl-3" },
    { code: "KeyA", key: "a", shift: "A" },
    { code: "KeyS", key: "s", shift: "S" },
    { code: "KeyD", key: "d", shift: "D" },
    { code: "KeyF", key: "f", shift: "F" },
    { code: "KeyG", key: "g", shift: "G" },
    { code: "KeyH", key: "h", shift: "H" },
    { code: "KeyJ", key: "j", shift: "J" },
    { code: "KeyK", key: "k", shift: "K" },
    { code: "KeyL", key: "l", shift: "L" },
    { code: "Semicolon", key: ";", shift: ":" },
    { code: "Quote", key: "'", shift: '"' },
    { code: "Enter", key: "Enter", width: "w-20 md:w-24 bg-indigo-600/30 border border-indigo-500/20 text-xs" }
  ],
  // Row 4
  [
    { code: "ShiftLeft", key: "Shift", width: "w-20 md:w-28 bg-slate-800/80 text-xs text-left pl-4" },
    { code: "KeyZ", key: "z", shift: "Z" },
    { code: "KeyX", key: "x", shift: "X" },
    { code: "KeyC", key: "c", shift: "C" },
    { code: "KeyV", key: "v", shift: "V" },
    { code: "KeyB", key: "b", shift: "B" },
    { code: "KeyN", key: "n", shift: "N" },
    { code: "KeyM", key: "m", shift: "M" },
    { code: "Comma", key: ",", shift: "<" },
    { code: "Period", key: ".", shift: ">" },
    { code: "Slash", key: "/", shift: "?" },
    { code: "ShiftRight", key: "Shift", width: "w-20 md:w-28 bg-slate-800/80 text-xs text-right pr-4" }
  ],
  // Row 5
  [
    { code: "ControlLeft", key: "Ctrl", width: "w-12 md:w-16 bg-slate-800/80 text-xs" },
    { code: "AltLeft", key: "Alt", width: "w-12 md:w-16 bg-slate-800/80 text-xs" },
    { code: "Space", key: " ", width: "flex-grow bg-slate-700/40" },
    { code: "AltRight", key: "Alt", width: "w-12 md:w-16 bg-slate-800/80 text-xs" },
    { code: "ControlRight", key: "Ctrl", width: "w-12 md:w-16 bg-slate-800/80 text-xs" }
  ]
];

export default function OnScreenKeyboard() {
  const { typedText, handleKeystroke, typingStatus, getCurrentLesson } = useTypingStore();
  const [activeCodes, setActiveCodes] = useState(new Set());
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCapsLocked, setIsCapsLocked] = useState(false);
  const [lastKeyState, setLastKeyState] = useState({}); // Track correct/incorrect flashes { code: 'correct' | 'incorrect' }

  const currentLesson = getCurrentLesson();
  const targetText = currentLesson?.english || "";
  const nextChar = targetText[typedText.length] || null;

  // Map standard characters to keyboard codes for highlighting next character
  const charToCodeMap = {
    " ": "Space",
    "`": "Backquote", "~": "Backquote",
    "1": "Digit1", "!": "Digit1",
    "2": "Digit2", "@": "Digit2",
    "3": "Digit3", "#": "Digit3",
    "4": "Digit4", "$": "Digit4",
    "5": "Digit5", "%": "Digit5",
    "6": "Digit6", "^": "Digit6",
    "7": "Digit7", "&": "Digit7",
    "8": "Digit8", "*": "Digit8",
    "9": "Digit9", "(": "Digit9",
    "0": "Digit0", ")": "Digit0",
    "-": "Minus", "_": "Minus",
    "=": "Equal", "+": "Equal",
    "[": "BracketLeft", "{": "BracketLeft",
    "]": "BracketRight", "}": "BracketRight",
    "\\": "Backslash", "|": "Backslash",
    ";": "Semicolon", ":": "Semicolon",
    "'": "Quote", '"': "Quote",
    ",": "Comma", "<": "Comma",
    ".": "Period", ">": "Period",
    "/": "Slash", "?": "Slash",
    "\n": "Enter"
  };

  // Populate basic letter mappings
  for (let i = 97; i <= 122; i++) {
    const char = String.fromCharCode(i);
    const code = "Key" + char.toUpperCase();
    charToCodeMap[char] = code;
    charToCodeMap[char.toUpperCase()] = code;
  }

  const nextExpectedCode = nextChar ? charToCodeMap[nextChar] : null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent browser default bindings like scroll on spacebar, browser back on backspace when focused in body
      if (
        (e.code === "Space" || e.code === "Backspace") &&
        e.target === document.body
      ) {
        e.preventDefault();
      }

      setActiveCodes((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });

      if (e.key === "Shift") {
        setIsShiftPressed(true);
      }
      if (e.code === "CapsLock") {
        setIsCapsLocked((prev) => !prev);
      }

      // Record typing feedback colors
      if (typingStatus !== "completed" && nextChar) {
        const code = e.code;
        if (e.key === nextChar) {
          setLastKeyState((prev) => ({ ...prev, [code]: "correct" }));
          setTimeout(() => {
            setLastKeyState((prev) => {
              const copy = { ...prev };
              delete copy[code];
              return copy;
            });
          }, 150);
        } else if (e.key !== "Shift" && e.key !== "CapsLock" && e.key !== "Control" && e.key !== "Alt") {
          setLastKeyState((prev) => ({ ...prev, [code]: "incorrect" }));
          setTimeout(() => {
            setLastKeyState((prev) => {
              const copy = { ...prev };
              delete copy[code];
              return copy;
            });
          }, 150);
        }
      }
    };

    const handleKeyUp = (e) => {
      setActiveCodes((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });

      if (e.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [nextChar, typingStatus]);

  const handleVirtualKeyClick = (keyObj) => {
    if (typingStatus === "completed") return;

    let char = keyObj.key;
    if (isShiftPressed || isCapsLocked) {
      if (keyObj.shift) char = keyObj.shift;
      else char = keyObj.key.toUpperCase();
    }

    if (keyObj.code === "Backspace") {
      handleKeystroke("", true);
    } else if (keyObj.code === "Space") {
      handleKeystroke(" ");
    } else if (keyObj.code === "Enter") {
      handleKeystroke("\n");
    } else if (keyObj.code === "ShiftLeft" || keyObj.code === "ShiftRight") {
      setIsShiftPressed((prev) => !prev);
    } else if (keyObj.code === "CapsLock") {
      setIsCapsLocked((prev) => !prev);
    } else if (keyObj.code !== "Tab" && keyObj.code !== "ControlLeft" && keyObj.code !== "ControlRight" && keyObj.code !== "AltLeft" && keyObj.code !== "AltRight") {
      handleKeystroke(char);
    }

    // Trigger visual feedback
    const code = keyObj.code;
    setActiveCodes((prev) => {
      const next = new Set(prev);
      next.add(code);
      return next;
    });

    const isCorrect = keyObj.code === "Space" ? nextChar === " " : char === nextChar;

    if (isCorrect) {
      setLastKeyState((prev) => ({ ...prev, [code]: "correct" }));
    } else if (keyObj.code !== "ShiftLeft" && keyObj.code !== "ShiftRight" && keyObj.code !== "CapsLock") {
      setLastKeyState((prev) => ({ ...prev, [code]: "incorrect" }));
    }

    setTimeout(() => {
      setActiveCodes((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
      setLastKeyState((prev) => {
        const copy = { ...prev };
        delete copy[code];
        return copy;
      });
    }, 150);
  };

  return (
    <div className="w-full bg-slate-950/40 p-2 border border-slate-900 rounded-xl backdrop-blur-md flex flex-col gap-1 max-w-4xl mx-auto shadow-inner select-none">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 w-full">
          {row.map((k) => {
            const isPressed = activeCodes.has(k.code);
            const isNextExpected = k.code === nextExpectedCode;
            const statusState = lastKeyState[k.code];

            // Decide styling classes
            let btnClass = k.width || "w-10 md:w-12 h-10 md:h-12 text-sm";
            let activeStyle = "bg-slate-800 text-slate-100 scale-95 border-slate-650";
            let normalStyle = "bg-slate-900/60 hover:bg-slate-800/40 text-slate-350 border-slate-800/60";
            let highlightStyle = "";

            if (isNextExpected && typingStatus !== "completed") {
              highlightStyle = "ring-2 ring-indigo-500/70 shadow-lg shadow-indigo-500/10 border-indigo-400/50 animate-pulse";
            }

            if (statusState === "correct") {
              highlightStyle = "bg-emerald-500/80 text-white border-emerald-400 scale-95 shadow-md shadow-emerald-500/20";
            } else if (statusState === "incorrect") {
              highlightStyle = "bg-rose-500/80 text-white border-rose-450 scale-95 shadow-md shadow-rose-500/20";
            } else if (isPressed) {
              highlightStyle = activeStyle;
            } else {
              highlightStyle = normalStyle;
            }

            // Decide labels
            let label = k.key;
            if (k.code.startsWith("Key")) {
              label = isShiftPressed || isCapsLocked ? k.shift || k.key.toUpperCase() : k.key;
            } else if (k.shift) {
              label = isShiftPressed ? k.shift : k.key;
            }

            return (
              <button
                key={k.code}
                onClick={() => handleVirtualKeyClick(k)}
                className={`h-8 md:h-9 border rounded-lg flex items-center justify-center font-medium transition-all duration-100 ${btnClass} ${highlightStyle}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
