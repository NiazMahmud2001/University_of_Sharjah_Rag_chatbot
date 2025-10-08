"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: React.CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
}

// Lightweight SplitText without GSAP SplitText plugin: splits into spans and animates
const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  tag = "p",
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if ((document as any).fonts?.status === "loaded") {
      setFontsLoaded(true);
    } else if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => setFontsLoaded(true));
    } else {
      setFontsLoaded(true);
    }
  }, []);

  const content = useMemo(() => {
    const type = splitType;
    if (type === "words" || type === "words, chars") {
      const words = text.split(/(\s+)/);
      return words.map((w, i) => {
        if (/^\s+$/.test(w)) return <span key={`space-${i}`}>{w}</span>;
        if (type === "words, chars") {
          return (
            <span className="split-word inline-block whitespace-nowrap" key={`word-${i}`}> 
              {w.split("").map((c, j) => (
                <span className="split-char inline-block" key={`char-${i}-${j}`}>{c}</span>
              ))}
            </span>
          );
        }
        return (
          <span className="split-word inline-block whitespace-nowrap" key={`word-${i}`}>{w}</span>
        );
      });
    }
    // default chars
    return text.split("").map((c, i) => (
      <span className="split-char inline-block" key={`char-${i}`}>{c}</span>
    ));
  }, [text, splitType]);

  useEffect(() => {
    const el = containerRef.current as HTMLElement | null;
    if (!el || !fontsLoaded) return;
    const targets = Array.from(el.querySelectorAll(".split-char, .split-word"));
    if (!targets.length) return;
    const tween = gsap.fromTo(
      targets,
      { ...from },
      {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        onComplete: () => onLetterAnimationComplete?.(),
        force3D: true,
      }
    );
    return () => {
      tween?.kill();
    };
  }, [text, delay, duration, ease, JSON.stringify(from), JSON.stringify(to), fontsLoaded, splitType, onLetterAnimationComplete]);

  const style: React.CSSProperties = {
    textAlign,
    wordWrap: "break-word",
    willChange: "transform, opacity",
  };
  const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`;

  switch (tag) {
    case "h1":
      return (
        <h1 ref={containerRef as any} style={style} className={classes}>
          {content}
        </h1>
      );
    case "h2":
      return (
        <h2 ref={containerRef as any} style={style} className={classes}>
          {content}
        </h2>
      );
    case "h3":
      return (
        <h3 ref={containerRef as any} style={style} className={classes}>
          {content}
        </h3>
      );
    case "h4":
      return (
        <h4 ref={containerRef as any} style={style} className={classes}>
          {content}
        </h4>
      );
    case "h5":
      return (
        <h5 ref={containerRef as any} style={style} className={classes}>
          {content}
        </h5>
      );
    case "h6":
      return (
        <h6 ref={containerRef as any} style={style} className={classes}>
          {content}
        </h6>
      );
    case "span":
      return (
        <span ref={containerRef as any} style={style} className={classes}>
          {content}
        </span>
      );
    default:
      return (
        <p ref={containerRef as any} style={style} className={classes}>
          {content}
        </p>
      );
  }
};

export default SplitText;