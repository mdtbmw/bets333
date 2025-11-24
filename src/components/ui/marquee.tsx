
'use client';

import { cn } from "@/lib/utils";
import React, { useRef, useEffect, useState, type HTMLAttributes } from "react";

interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  speed?: number;
  pauseOnHover?: boolean;
  fade?: boolean;
}

export function Marquee({
  className,
  speed = 1,
  pauseOnHover = false,
  fade = false,
  children,
  ...props
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (container && content) {
      const checkOverflow = () => {
        setIsOverflowing(content.scrollWidth > container.clientWidth);
      };
      checkOverflow();
      window.addEventListener("resize", checkOverflow);
      return () => window.removeEventListener("resize", checkOverflow);
    }
  }, [children]);

  const animationDuration = isOverflowing
    ? `${(contentRef.current?.scrollWidth || 0) / (speed * 20)}s`
    : "none";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden whitespace-nowrap",
        { "group": pauseOnHover },
        className
      )}
      {...props}
    >
      <div
        ref={contentRef}
        className={cn("inline-block", {
          "animate-marquee group-hover:pause": isOverflowing,
        })}
        style={{ animationDuration }}
      >
        {children}&nbsp;&nbsp;&nbsp;
      </div>
      {isOverflowing && (
        <div
          className="inline-block animate-marquee group-hover:pause"
          style={{ animationDuration }}
          aria-hidden="true"
        >
          {children}&nbsp;&nbsp;&nbsp;
        </div>
      )}

      {fade && isOverflowing && (
        <>
          <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent" />
        </>
      )}
    </div>
  );
}
