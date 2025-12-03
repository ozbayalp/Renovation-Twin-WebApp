"use client";

/**
 * BuildingAnimation - A Vercel globe-style animated building visualization
 * Used as a hero element on the upload page to convey the facade analysis concept
 */
export default function BuildingAnimation() {
  return (
    <div className="relative mx-auto h-64 w-64 select-none">
      {/* Background grid pattern */}
      <div className="absolute inset-0 animate-grid-pulse">
        <svg className="h-full w-full" viewBox="0 0 200 200">
          {/* Vertical lines */}
          {[...Array(9)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={25 * (i + 1)}
              y1="0"
              x2={25 * (i + 1)}
              y2="200"
              stroke="#262626"
              strokeWidth="0.5"
            />
          ))}
          {/* Horizontal lines */}
          {[...Array(9)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={25 * (i + 1)}
              x2="200"
              y2={25 * (i + 1)}
              stroke="#262626"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>

      {/* Animated building icon */}
      <div className="absolute inset-0 flex items-center justify-center animate-float">
        <div className="relative">
          {/* Glow effect behind building */}
          <div className="absolute -inset-6 rounded-full bg-emerald-500/20 blur-xl animate-pulse-glow" />
          
          {/* Building container with border */}
          <div className="relative flex h-24 w-20 flex-col items-center justify-end rounded-lg border border-neutral-700 bg-neutral-900/80 p-2 backdrop-blur-sm">
            {/* Roof accent */}
            <div className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-emerald-500" />
            
            {/* Windows grid */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="h-2.5 w-2.5 rounded-[2px] bg-emerald-500/60"
                  style={{
                    animationDelay: `${i * 200}ms`,
                    animation: 'pulse-glow 2s ease-in-out infinite',
                  }}
                />
              ))}
            </div>
            
            {/* Door */}
            <div className="h-4 w-3 rounded-t-sm bg-neutral-700" />
          </div>

          {/* Scan line effect */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line" />
          </div>
        </div>
      </div>

      {/* Orbiting indicators - like Vercel's globe nodes */}
      <div className="absolute inset-0">
        {/* Top-right node */}
        <div 
          className="absolute top-8 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/50 bg-neutral-900"
          style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '0.5s' }}
        >
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        
        {/* Bottom-left node */}
        <div 
          className="absolute bottom-12 left-4 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/50 bg-neutral-900"
          style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1s' }}
        >
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        
        {/* Right-middle node */}
        <div 
          className="absolute top-1/2 right-2 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/50 bg-neutral-900"
          style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1.5s' }}
        >
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>

        {/* Connecting lines (subtle) */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 256 256">
          <line x1="200" y1="48" x2="140" y2="110" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" />
          <line x1="40" y1="190" x2="110" y2="150" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" />
          <line x1="240" y1="128" x2="150" y2="128" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Label beneath */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
          AI-Powered Analysis
        </span>
      </div>
    </div>
  );
}
