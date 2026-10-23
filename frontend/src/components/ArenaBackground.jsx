import React from "react";

const ArenaBackground = ({ children, showGrid = true }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#05070E] text-slate-100 overflow-hidden flex flex-col font-sans">
      {/* Dynamic Ambient Gradient Lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
        {/* Deep Royal Indigo Glow */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/[0.12] rounded-full blur-[140px] animate-blob" />
        
        {/* Subtle Cyber Violet Glow */}
        <div className="absolute top-1/4 -right-40 w-[650px] h-[650px] bg-violet-600/[0.10] rounded-full blur-[150px] animate-blob [animation-delay:3s]" />
        
        {/* Deep Teal Accent Glow */}
        <div className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] bg-teal-500/[0.06] rounded-full blur-[160px] animate-blob [animation-delay:6s]" />

        {/* Ultra-Fine Tech Grid & Specular Gradient */}
        {showGrid && (
          <>
            <div 
              className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" 
            />
            {/* Top Specular Edge Sheen */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          </>
        )}
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default ArenaBackground;
