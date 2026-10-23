import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import RankBadge, { getRankDetails } from "../components/RankBadge";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id || user?._id;
  const [status, setStatus] = useState("idle"); // 'idle' | 'queued' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const pollingRef = useRef(null);
  const timerRef = useRef(null);

  // Check if user already has an active ongoing match on mount
  useEffect(() => {
    if (!userId) return;

    const checkActiveMatch = async () => {
      try {
        const res = await api.get(`/match/active/${userId}`);
        if (res.data.match?.matchId) {
          navigate(`/match/${res.data.match.matchId}`);
        }
      } catch (err) {
        console.error("Active match check failed:", err.message);
      }
    };

    checkActiveMatch();
  }, [userId, navigate]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      stopTimer();
    };
  }, []);

  const startTimer = () => {
    setElapsedSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startPolling = () => {
    if (pollingRef.current) return;

    pollingRef.current = setInterval(async () => {
      try {
        setAttempts((a) => a + 1);
        const res = await api.get(`/match/active/${userId}`);

        if (res.data.match?.matchId) {
          stopPolling();
          stopTimer();
          navigate(`/match/${res.data.match.matchId}`);
        }
      } catch (err) {
        console.error("Polling error:", err.message);
      }
    }, 2500);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleStartMatch = async () => {
    if (status === "queued" || !userId) return;

    setErrorMessage("");
    setStatus("idle");
    setAttempts(0);

    try {
      const res = await api.post("/match/start", { userId });

      if (res.data.status === "already_in_match" && res.data.matchId) {
        navigate(`/match/${res.data.matchId}`);
        return;
      }

      if (res.data.status === "matched") {
        navigate(`/match/${res.data.matchId}`);
        return;
      }

      if (res.data.status === "queued" || res.data.status === "already_queued") {
        setStatus("queued");
        startTimer();
        startPolling();
      }
    } catch (err) {
      console.error("Matchmaking error:", err);
      setStatus("error");
      setErrorMessage(
        err.response?.data?.message || "Failed to enter matchmaking queue. Please try again."
      );
    }
  };

  const handleCancelQueue = () => {
    stopPolling();
    stopTimer();
    setStatus("idle");
    setAttempts(0);
    setElapsedSeconds(0);
  };

  // Format elapsed seconds as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const rankInfo = getRankDetails(user?.rating || 1200);

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full animate-fade-in">
        
        {/* Top Header / Greeting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/[0.06] gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ARENA SERVER ONLINE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Battle Headquarters
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1 max-w-xl">
              Welcome back, <span className="text-slate-200 font-semibold">{user?.username}</span>. Challenge programmers worldwide to 1v1 algorithmic duels.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/leaderboard")}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>🏆</span>
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => navigate("/history")}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>📜</span>
              <span>Battle Log</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {status === "error" && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-sm">Matchmaking Issue</p>
                <p className="text-xs text-rose-300">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="text-xs text-rose-300 hover:text-white px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Primary Matchmaking / Radar Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {status === "queued" ? (
              /* ================= MATCHMAKING RADAR ================= */
              <div className="relative rounded-3xl bg-[#080C17]/90 border border-indigo-500/30 p-8 md:p-12 shadow-2xl shadow-indigo-500/10 overflow-hidden text-center flex flex-col items-center justify-center min-h-[460px]">
                
                {/* Background Radar Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-[320px] h-[320px] rounded-full border border-indigo-500/20 animate-ping [animation-duration:3s]" />
                  <div className="absolute w-[240px] h-[240px] rounded-full border border-indigo-400/30" />
                  <div className="absolute w-[160px] h-[160px] rounded-full border border-cyan-400/40" />
                  <div className="absolute w-[80px] h-[80px] rounded-full border border-indigo-300/50" />
                  
                  {/* Rotating Radar Scanner Sweep */}
                  <div className="absolute w-[260px] h-[260px] rounded-full animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(99,102,241,0.25)_360deg)]" />
                </div>

                {/* Radar Center Status */}
                <div className="relative z-10 flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>

                  <div>
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Scanning For Contender</span>
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                      Finding Your Match
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Searching for opponent with similar skill rating ({user?.rating || 1200} ELO)...
                    </p>
                  </div>

                  {/* Timer & Poll Counter */}
                  <div className="flex items-center space-x-4 bg-white/[0.04] border border-white/[0.08] px-6 py-3 rounded-2xl backdrop-blur-md">
                    <div className="text-left">
                      <p className="text-[10px] font-mono uppercase text-slate-400">Search Time</p>
                      <p className="text-2xl font-mono font-bold text-white tracking-wider">
                        {formatTime(elapsedSeconds)}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-left">
                      <p className="text-[10px] font-mono uppercase text-slate-400">Pings</p>
                      <p className="text-2xl font-mono font-bold text-indigo-400">
                        {attempts}
                      </p>
                    </div>
                  </div>

                  {/* Cancel Queue CTA */}
                  <div className="pt-2">
                    <button
                      onClick={handleCancelQueue}
                      className="px-6 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-white text-sm font-semibold transition-all duration-200 flex items-center space-x-2 group"
                    >
                      <svg className="w-4 h-4 transform group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel Search</span>
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              /* ================= HERO MATCH CTA CARD ================= */
              <div className="relative rounded-3xl bg-gradient-to-br from-[#0B101E] via-[#0D1426] to-[#0A0E1A] border border-white/[0.08] p-8 md:p-10 shadow-2xl overflow-hidden group hover:border-indigo-500/40 transition-all duration-500">
                
                {/* Subtle Ambient Radial Lighting */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wider uppercase font-mono">
                      ⚡ Quick Duel
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Standard Arena Rules • Python 3
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    1v1 Competitive Arena
                  </h2>
                  <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl leading-relaxed">
                    Enter the queue to be matched against an opponent of equal rating. Both players receive the exact same algorithmic problem. Fastest correct solution wins rating.
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-3 md:gap-4 my-8">
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <p className="text-xl md:text-2xl font-bold text-white font-mono">1v1</p>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">Head-to-Head</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <p className="text-xl md:text-2xl font-bold text-indigo-400 font-mono">10-15m</p>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">Round Time</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <p className="text-xl md:text-2xl font-bold text-emerald-400 font-mono">±32</p>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">ELO Stake</p>
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <button
                    onClick={handleStartMatch}
                    className="w-full relative group/btn overflow-hidden rounded-2xl p-px bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transform transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <div className="px-8 py-5 rounded-[15px] bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 flex items-center justify-center space-x-3 text-white font-bold text-lg md:text-xl transition-all group-hover/btn:bg-opacity-90">
                      <svg
                        className="w-6 h-6 transform group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Find Match Now</span>
                      <svg
                        className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </button>

                </div>
              </div>
            )}

            {/* Battle Rules & Guidelines */}
            <div className="rounded-3xl bg-[#090D17]/80 border border-white/[0.06] p-6 md:p-8 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2 mb-4">
                <span className="text-indigo-400">🛡️</span>
                <span>Arena Combat Rules</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-200">1. Blind Duel</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Opponent code remains hidden until both submissions are finalized or the timer expires.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-200">2. Real-Time Judge</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Code is evaluated in isolated containers with strict time & memory limits via Judge0.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-200">3. ELO Stakes</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Outcomes update your rank live. Ties grant zero rating change; victory rewards positive ELO.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Player Combat Dossier */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Player Card */}
            <div className="rounded-3xl bg-gradient-to-b from-[#0D1322] to-[#080C16] border border-white/[0.08] p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 text-center">
                
                {/* Avatar with Ring */}
                <div className="w-24 h-24 mx-auto rounded-3xl p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 shadow-xl shadow-indigo-500/20 mb-4 transform hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-[#080C16] rounded-[22px] flex items-center justify-center text-white text-3xl font-extrabold font-mono">
                    {user?.username?.charAt(0).toUpperCase() || "C"}
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-white">{user?.username}</h3>
                <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mt-0.5">
                  Competitive Duelist
                </p>

                {/* Rating Display */}
                <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                  <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Current Rating</p>
                  <p className="text-4xl md:text-5xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent mt-1">
                    {user?.rating || 1200}
                  </p>
                  <div className="mt-3 flex justify-center">
                    <RankBadge rating={user?.rating || 1200} size="md" />
                  </div>
                </div>

                {/* Tier Overview Pill */}
                <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-400 text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Rank Tier</span>
                    <span className="font-semibold text-slate-200">{rankInfo.tier}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    <span className="text-emerald-400 font-medium">Ready For Combat</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Links Card */}
            <div className="rounded-3xl bg-[#090D17]/80 border border-white/[0.06] p-6 space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 px-1">
                Navigation
              </p>

              <button
                onClick={() => navigate("/leaderboard")}
                className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-left flex items-center justify-between group transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🏆</span>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      Global Leaderboard
                    </p>
                    <p className="text-xs text-slate-400">View top rated coders</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-500 group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => navigate("/history")}
                className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-left flex items-center justify-between group transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📜</span>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      Match History
                    </p>
                    <p className="text-xs text-slate-400">Past battles & rating changes</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-500 group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>

        </div>

      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;