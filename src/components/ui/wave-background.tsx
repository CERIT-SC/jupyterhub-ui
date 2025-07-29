"use client";

import React from "react";

import { cn } from "@/lib/cn";

interface WaveBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Gradient colors for the wave pattern
   * @default ["rgba(99, 102, 241, 0.2)", "rgba(168, 85, 247, 0.4)", "rgba(236, 72, 153, 0.3)"]
   */
  gradientColors?: string[];

  /**
   * Opacity of the wave pattern
   * @default 0.15
   */
  opacity?: number;

  /**
   * Number of waves to display
   * @default 3
   */
  waveCount?: number;

  /**
   * Whether to animate the waves
   * @default true
   */
  animate?: boolean;

  /**
   * How intense the wave pattern should be
   * @default "medium"
   */
  intensity?: "light" | "medium" | "strong";
}

export function WaveBackground({
  className,
  children,
  gradientColors = [
    "rgba(99, 102, 241, 0.2)",
    "rgba(168, 85, 247, 0.4)",
    "rgba(236, 72, 153, 0.3)",
  ],
  opacity = 0.15,
  waveCount = 3,
  animate = true,
  intensity = "medium",
  ...props
}: WaveBackgroundProps) {
  // Calculate wave amplitude based on intensity
  const getAmplitude = () => {
    switch (intensity) {
      case "light":
        return 5;
      case "medium":
        return 15;
      case "strong":
        return 30;
      default:
        return 15;
    }
  };

  const amplitude = getAmplitude();

  // Generate SVG paths for each wave
  const generateWavePaths = () => {
    const paths = [];

    for (let i = 0; i < waveCount; i++) {
      // Adjust phase and amplitude for variety
      const phaseShift = i * 0.5;
      const heightOffset = i * (100 / waveCount);
      const waveAmplitude = amplitude * (1 - i * 0.2);

      // Create wave path
      paths.push(
        <path
          key={i}
          d={`M0,${50 + heightOffset} C${waveAmplitude},${50 + heightOffset - waveAmplitude} ${30 - waveAmplitude},${50 + heightOffset + waveAmplitude} 50,${50 + heightOffset} S${70 + waveAmplitude},${50 + heightOffset - waveAmplitude} 100,${50 + heightOffset} S${150 - waveAmplitude},${50 + heightOffset + waveAmplitude} 200,${50 + heightOffset} S${250 + waveAmplitude},${50 + heightOffset - waveAmplitude} 300,${50 + heightOffset} S${350 - waveAmplitude},${50 + heightOffset + waveAmplitude} 400,${50 + heightOffset}`}
          fill="none"
          stroke={`url(#waveGradient-${i})`}
          strokeLinecap="round"
          strokeWidth="4"
          style={{
            opacity: opacity - i * 0.03,
            animation: animate
              ? `waveFade ${3 + i * 0.5}s ease-in-out infinite alternate, waveMove ${8 + i * 2}s ease-in-out infinite`
              : "none",
            animationDelay: `${i * 0.2}s`,
          }}
        />,
      );
    }

    return paths;
  };

  // Create gradient definitions
  const generateGradients = () => {
    const gradients = [];

    for (let i = 0; i < waveCount; i++) {
      // Create different gradient for each wave
      const startColor = gradientColors[i % gradientColors.length];
      const endColor = gradientColors[(i + 1) % gradientColors.length];

      gradients.push(
        <linearGradient
          key={i}
          id={`waveGradient-${i}`}
          x1="0%"
          x2="100%"
          y1="0%"
          y2="0%"
        >
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>,
      );
    }

    return gradients;
  };

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      {/* Wave pattern SVG */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <svg
          height="100%"
          preserveAspectRatio="none"
          viewBox="0 0 400 200"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>{generateGradients()}</defs>
          {generateWavePaths()}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes waveFade {
          0% {
            opacity: ${opacity * 0.7};
          }
          100% {
            opacity: ${opacity};
          }
        }
        
        @keyframes waveMove {
          0% {
            transform: translateX(-10px);
          }
          50% {
            transform: translateX(10px);
          }
          100% {
            transform: translateX(-10px);
          }
        }
      `}</style>
    </div>
  );
}
