import React from "react";

export const getRankDetails = (rating = 1200) => {
  const r = Number(rating) || 1200;
  if (r >= 2000) {
    return {
      tier: "Grandmaster",
      color: "from-rose-500 to-amber-500",
      textColor: "text-rose-400",
      bgColor: "bg-rose-500/10 border-rose-500/30",
      icon: "👑",
    };
  }
  if (r >= 1800) {
    return {
      tier: "Diamond",
      color: "from-blue-400 to-indigo-500",
      textColor: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/30",
      icon: "💎",
    };
  }
  if (r >= 1600) {
    return {
      tier: "Platinum",
      color: "from-cyan-400 to-teal-400",
      textColor: "text-cyan-400",
      bgColor: "bg-cyan-500/10 border-cyan-500/30",
      icon: "⚡",
    };
  }
  if (r >= 1400) {
    return {
      tier: "Gold",
      color: "from-amber-400 to-yellow-500",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/30",
      icon: "🏆",
    };
  }
  if (r >= 1200) {
    return {
      tier: "Silver",
      color: "from-slate-300 to-slate-400",
      textColor: "text-slate-300",
      bgColor: "bg-slate-400/10 border-slate-400/30",
      icon: "⚔️",
    };
  }
  return {
    tier: "Bronze",
    color: "from-orange-700 to-amber-800",
    textColor: "text-amber-600",
    bgColor: "bg-amber-900/15 border-amber-700/30",
    icon: "🛡️",
  };
};

const RankBadge = ({ rating, size = "md", showTier = true, showRating = true }) => {
  const rank = getRankDetails(rating);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 space-x-1",
    md: "text-sm px-2.5 py-1 space-x-1.5",
    lg: "text-base px-3.5 py-1.5 space-x-2",
  }[size] || "text-sm px-2.5 py-1 space-x-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md font-medium tracking-wide ${rank.bgColor} ${sizeClasses} shadow-sm`}
    >
      <span className="select-none">{rank.icon}</span>
      {showTier && (
        <span className={`font-semibold ${rank.textColor}`}>
          {rank.tier}
        </span>
      )}
      {showRating && (
        <span className="font-mono text-slate-300">
          {rating ?? 1200}
        </span>
      )}
    </span>
  );
};

export default RankBadge;
