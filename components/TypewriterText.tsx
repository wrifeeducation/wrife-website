"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  flashDuration?: number;
  pauseBeforeRestart?: number;
}

export default function TypewriterText({
  text,
  className = "",
  typingSpeed = 100,
  flashDuration = 1200,
  pauseBeforeRestart = 1500,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [isFlashing, setIsFlashing] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "flashing" | "pausing">("typing");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (phase === "typing") {
      if (charIndex < text.length) {
        timerRef.current = setTimeout(() => {
          setDisplayText(text.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, typingSpeed);
      } else {
        timerRef.current = setTimeout(() => {
          setIsFlashing(true);
          setPhase("flashing");
        }, 300);
      }
    } else if (phase === "flashing") {
      timerRef.current = setTimeout(() => {
        setIsFlashing(false);
        setPhase("pausing");
      }, flashDuration);
    } else if (phase === "pausing") {
      timerRef.current = setTimeout(() => {
        setDisplayText("");
        setCharIndex(0);
        setPhase("typing");
      }, pauseBeforeRestart);
    }

    return clearTimer;
  }, [charIndex, phase, text, typingSpeed, flashDuration, pauseBeforeRestart]);

  return (
    <span
      className={`${className} ${isFlashing ? "animate-flash" : ""}`}
      style={{ fontFamily: "'Baloo 2', cursive" }}
    >
      ✨ {displayText}
      {phase === "typing" && <span className="animate-blink">|</span>}
      {phase !== "typing" && displayText.length === text.length && " ✨"}
    </span>
  );
}
