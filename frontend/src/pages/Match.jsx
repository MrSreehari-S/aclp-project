import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import CodeEditor from "../components/CodeEditor";
import { useAuth } from "../context/AuthContext";
import ArenaBackground from "../components/ArenaBackground";
import RankBadge from "../components/RankBadge";

const Match = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const userId = user?.id || user?._id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [match, setMatch] = useState(null);
  const [sourceCode, setSourceCode] = useState("");
  
  // Execution states
  const [runningSample, setRunningSample] = useState(false);
  const [sampleOutput, setSampleOutput] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState("sample"); // "sample" | "verdict"

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);

  // Mobile layout tab
  const [mobileTab, setMobileTab] = useState("problem"); // "problem" | "editor"

  /* ================= FETCH MATCH ================= */
  const fetchMatch = async () => {
    try {
      const res = await api.get(`/match/${matchId}`);
      setMatch(res.data);

      // Check if user has already submitted previously in this match
      if (res.data.submissions && userId) {
        const mySub = res.data.submissions.find(
          (s) => s.userId?.toString() === userId.toString()
        );
        if (mySub) {
          setHasSubmitted(true);
          if (mySub.verdict) setVerdict(mySub.verdict);
          if (mySub.code && !sourceCode) setSourceCode(mySub.code);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load match session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  /* ================= POLLING ================= */
  useEffect(() => {
    if (!match || match.status === "COMPLETED") return;
    const interval = setInterval(fetchMatch, 2500);
    return () => clearInterval(interval);
  }, [match?.status, matchId]);

  /* ================= SYNC USER RATING ON MATCH COMPLETE ================= */
  useEffect(() => {
    if (!match || match.status !== "COMPLETED" || !userId) return;

    const myIdStr = userId.toString();
    const me = match.players.find(
      (p) =>
        p.userId?.toString?.() === myIdStr ||
        p.userId?._id?.toString?.() === myIdStr
    );

    if (me && me.ratingChange !== undefined) {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          rating: (prev.rating || 1200) + me.ratingChange,
        };
        localStorage.setItem("user", JSON.stringify(updated));
        return updated;
      });
    }
  }, [match?.status]);

  /* ================= TIMER CALCULATION ================= */
  useEffect(() => {
    if (!match || match.status !== "ONGOING") return;

    const calculateRemaining = () => {
      const start = new Date(match.startTime).getTime();
      const end = start + (match.timeLimit || 600) * 1000;
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        setTimerExpired(true);
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [match?.startTime, match?.timeLimit, match?.status]);

  /* ================= AUTO-SUBMIT ON TIME EXPIRED ================= */
  useEffect(() => {
    if (timerExpired && !hasSubmitted && match?.status === "ONGOING") {
      submitCode();
    }
  }, [timerExpired]);

  /* ================= RUN SAMPLE TEST ================= */
  const runSample = async () => {
    if (!sourceCode.trim() || !match?.problem) return;

    try {
      setRunningSample(true);
      setActiveConsoleTab("sample");
      setSampleOutput("Executing sample against Judge0 runtime...");

      const res = await api.post("/judge/run-sample", {
        sourceCode,
        input: match.problem.sampleInput || "",
      });

      setSampleOutput(res.data.output || "(Program exited with no output)");
    } catch (err) {
      setSampleOutput(err.response?.data?.output || "Execution failed. Check your syntax.");
    } finally {
      setRunningSample(false);
    }
  };

  /* ================= SUBMIT CODE ================= */
  const submitCode = async () => {
    if (!sourceCode.trim() || !match?.problem) return;

    try {
      setSubmitting(true);
      setActiveConsoleTab("verdict");

      const res = await api.post("/judge/evaluate", {
        matchId,
        problemId: match.problem.id,
        languageId: 71,
        sourceCode,
      });

      setVerdict(res.data.verdict || "EVALUATED");
      setHasSubmitted(true);
      fetchMatch();
    } catch (err) {
      setVerdict(err.response?.data?.message || "Submission rejected");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= MATCH PLAYERS ================= */
  const myIdStr = userId ? userId.toString() : "";
  const me = match?.players?.find(
    (p) =>
      p.userId?.toString?.() === myIdStr ||
      p.userId?._id?.toString?.() === myIdStr
  );
  const opponent = match?.players?.find(
    (p) =>
      p.userId?.toString?.() !== myIdStr &&
      p.userId?._id?.toString?.() !== myIdStr
  );

  const opponentSubmission = match?.submissions?.find(
    (s) => s.userId?.toString() !== myIdStr && s.userId?._id?.toString() !== myIdStr
  );
  const opponentHasSubmitted = !!opponentSubmission;

  /* ================= FORMAT TIMER ================= */
  const formatTimer = () => {
    if (timerExpired) return "00:00";
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerStyles = () => {
    if (timerExpired) {
      return "border-rose-500/50 text-rose-400 bg-rose-500/10";
    }
    if (timeLeft <= 30) {
      return "border-rose-500/50 text-rose-400 bg-rose-500/10 animate-pulse";
    }
    if (timeLeft <= 90) {
      return "border-amber-500/50 text-amber-300 bg-amber-500/10";
    }
    return "border-cyan-500/40 text-cyan-300 bg-cyan-500/10";
  };

  /* ================= LOADING SCREEN ================= */
  if (loading) {
    return (
      <ArenaBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto relative">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping" />
              <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>
            <p className="text-indigo-200 text-sm font-mono tracking-wider">
              CONNECTING TO COMBAT ARENA...
            </p>
          </div>
        </div>
      </ArenaBackground>
    );
  }

  /* ================= ERROR SCREEN ================= */
  if (error || !match) {
    return (
      <ArenaBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#090D17]/90 border border-rose-500/30 text-center space-y-4 shadow-2xl">
            <span className="text-4xl">⚠️</span>
            <h2 className="text-xl font-bold text-white">Arena Access Error</h2>
            <p className="text-sm text-slate-400">{error || "Could not retrieve match session"}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-sm font-semibold transition-all"
            >
              Back to Headquarters
            </button>
          </div>
        </div>
      </ArenaBackground>
    );
  }

  /* ================= MATCH COMPLETED SCREEN ================= */
  if (match.status === "COMPLETED" && me) {
    const isWin = me.result === "WIN";
    const isLoss = me.result === "LOSS";
    const isDraw = me.result === "DRAW" || !me.result;

    return (
      <ArenaBackground>
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <div className="max-w-2xl w-full rounded-3xl bg-[#090D18]/95 border border-white/[0.08] p-8 md:p-12 shadow-2xl text-center relative overflow-hidden backdrop-blur-2xl">
            
            {/* Ambient Ambient Glow */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${
                isWin ? "bg-emerald-500/20" : isLoss ? "bg-rose-500/20" : "bg-amber-500/20"
              }`}
            />

            <div className="relative z-10 space-y-6">
              
              {/* Outcome Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold tracking-widest uppercase">
                {isWin && (
                  <span className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                    🏆 VICTORY ACHIEVED
                  </span>
                )}
                {isLoss && (
                  <span className="bg-rose-500/10 border-rose-500/30 text-rose-400">
                    💔 DEFEAT
                  </span>
                )}
                {isDraw && (
                  <span className="bg-amber-500/10 border-amber-500/30 text-amber-400">
                    🤝 DRAW
                  </span>
                )}
              </div>

              {/* Title Header */}
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                {isWin ? "Winner of the Duel!" : isLoss ? "Better Luck Next Match" : "Evenly Matched Duel"}
              </h1>

              {/* Players Face-Off Box */}
              <div className="grid grid-cols-3 items-center gap-2 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md my-6">
                
                {/* You */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1.5px]">
                    <div className="w-full h-full bg-[#080C16] rounded-[14px] flex items-center justify-center font-bold text-white text-xl">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm truncate">{user?.username}</p>
                    <p className="text-xs text-indigo-400 font-mono">You</p>
                  </div>
                </div>

                {/* VS Badge & Rating Delta */}
                <div className="text-center">
                  <span className="text-xs font-mono font-bold text-slate-500 block mb-2">VS</span>
                  <div
                    className={`inline-block px-4 py-1 rounded-xl text-lg font-mono font-extrabold ${
                      (me.ratingChange || 0) > 0
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : (me.ratingChange || 0) < 0
                        ? "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                        : "text-slate-300 bg-white/[0.05]"
                    }`}
                  >
                    {(me.ratingChange || 0) > 0 ? `+${me.ratingChange}` : me.ratingChange || 0} ELO
                  </div>
                </div>

                {/* Opponent */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-[1.5px]">
                    <div className="w-full h-full bg-[#080C16] rounded-[14px] flex items-center justify-center font-bold text-white text-xl">
                      {opponent?.username?.charAt(0).toUpperCase() || "O"}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm truncate">{opponent?.username || "Opponent"}</p>
                    <p className="text-xs text-purple-400 font-mono">Opponent</p>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => navigate(`/match/${matchId}/summary`)}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  View Code & Analysis →
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 hover:text-white font-semibold text-sm transition-all"
                >
                  Back to Headquarters
                </button>
              </div>

            </div>

          </div>
        </div>
      </ArenaBackground>
    );
  }

  /* ================= ACTIVE 1v1 MATCH ARENA ================= */
  return (
    <div className="h-screen w-screen bg-[#05070E] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      
      {/* ================= ARENA HUD TOPBAR ================= */}
      <header className="h-16 flex-shrink-0 bg-[#080C17]/90 border-b border-white/[0.06] backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between z-20">
        
        {/* Left: Problem & Match Tag */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => {
              if (window.confirm("Leave active battle? The timer will continue running.")) {
                navigate("/dashboard");
              }
            }}
            title="Leave Match (Match continues in background)"
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="flex items-center space-x-2 truncate">
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase font-bold tracking-wider">
              1v1 ARENA
            </span>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {match.problem?.title || "Algorithmic Challenge"}
            </h1>
          </div>
        </div>

        {/* Center: Live Countdown Timer */}
        <div className="flex items-center space-x-2">
          <div className={`px-4 py-1.5 rounded-xl border font-mono font-bold text-base sm:text-lg flex items-center space-x-2 shadow-sm ${getTimerStyles()}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>{formatTimer()}</span>
          </div>
        </div>

        {/* Right: Opponent Live Combat Status */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-right">
            <div>
              <p className="text-xs font-semibold text-slate-200 leading-tight">
                {opponent?.username || "Opponent"}
              </p>
              <p className="text-[10px] font-mono text-purple-300">
                {opponentHasSubmitted ? (
                  <span className="text-emerald-400 font-bold">● Submitted</span>
                ) : (
                  <span className="text-indigo-400 animate-pulse">● Coding...</span>
                )}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs text-white">
              {opponent?.username?.charAt(0).toUpperCase() || "O"}
            </div>
          </div>

          {/* Mobile Tab Toggle */}
          <div className="flex lg:hidden bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setMobileTab("problem")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mobileTab === "problem" ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              Task
            </button>
            <button
              onClick={() => setMobileTab("editor")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mobileTab === "editor" ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              Editor
            </button>
          </div>
        </div>

      </header>

      {/* ================= MAIN SPLIT WORKSPACE ================= */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        
        {/* ================= LEFT PANE: PROBLEM STATEMENT ================= */}
        <div
          className={`lg:w-1/2 w-full flex-col h-full rounded-2xl bg-[#080C17]/85 border border-white/[0.06] overflow-hidden ${
            mobileTab === "problem" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Problem Header Tabs */}
          <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Problem Specification
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Python 3 (Standard IO)
            </span>
          </div>

          {/* Problem Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-300 select-text">
            
            {/* Title & Banner */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {match.problem?.title}
              </h2>
              <div className="h-0.5 w-16 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full mt-2" />
            </div>

            {/* Standard IO Instruction Note */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-xs sm:text-sm space-y-1">
              <p className="font-bold flex items-center space-x-1.5 text-amber-300">
                <span>⚡</span>
                <span>Competitive Coding Guidelines</span>
              </p>
              <ul className="list-disc ml-5 space-y-0.5 text-slate-300 text-xs">
                <li>Read input directly using <code className="text-cyan-300 font-mono">input()</code>. Do not prompt strings.</li>
                <li>Print ONLY the expected output with <code className="text-cyan-300 font-mono">print(...)</code>.</li>
              </ul>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Description
              </h3>
              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                {match.problem?.description}
              </div>
            </div>

            {/* Input Format */}
            {match.problem?.inputFormat && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Input Format
                </h3>
                <pre className="text-xs font-mono text-emerald-300 bg-[#04060B] p-3 rounded-xl border border-white/[0.06] overflow-x-auto">
                  {match.problem.inputFormat}
                </pre>
              </div>
            )}

            {/* Output Format */}
            {match.problem?.outputFormat && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Output Format
                </h3>
                <pre className="text-xs font-mono text-cyan-300 bg-[#04060B] p-3 rounded-xl border border-white/[0.06] overflow-x-auto">
                  {match.problem.outputFormat}
                </pre>
              </div>
            )}

            {/* Sample Case */}
            {(match.problem?.sampleInput || match.problem?.sampleOutput) && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Sample Case
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#04060B] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Sample Input</span>
                    <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap">
                      {match.problem.sampleInput || "N/A"}
                    </pre>
                  </div>
                  <div className="p-3 rounded-xl bg-[#04060B] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Expected Output</span>
                    <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                      {match.problem.sampleOutput || "N/A"}
                    </pre>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ================= RIGHT PANE: CODE EDITOR & CONSOLE ================= */}
        <div
          className={`lg:w-1/2 w-full flex-col h-full rounded-2xl bg-[#080C17]/85 border border-white/[0.06] overflow-hidden ${
            mobileTab === "editor" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Editor Action Header */}
          <div className="px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono font-semibold text-slate-300">solution.py</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Status pill */}
              {hasSubmitted && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono">
                  ✓ Submitted
                </span>
              )}

              {/* Starter Snippet Helper */}
              {!sourceCode && (
                <button
                  onClick={() =>
                    setSourceCode(
                      `# Write your solution below\n# Input: input()\n# Output: print(...)\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()\n`
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white text-xs font-mono transition-colors"
                >
                  Insert Template
                </button>
              )}
            </div>
          </div>

          {/* Monaco Code Editor Container */}
          <div className="flex-1 relative min-h-0">
            <CodeEditor
              value={sourceCode}
              onChange={setSourceCode}
              disabled={hasSubmitted || timerExpired}
            />
          </div>

          {/* Bottom Test Execution & Submission Dock */}
          <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#070A14] flex flex-col">
            
            {/* Console Output (Collapsible/Conditional) */}
            {(sampleOutput || verdict) && (
              <div className="p-3 border-b border-white/[0.06] max-h-36 overflow-y-auto font-mono text-xs select-text">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-3">
                    <span
                      onClick={() => setActiveConsoleTab("sample")}
                      className={`cursor-pointer pb-0.5 text-xs font-semibold transition-colors ${
                        activeConsoleTab === "sample"
                          ? "text-cyan-400 border-b-2 border-cyan-400"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Sample Output
                    </span>
                    {verdict && (
                      <span
                        onClick={() => setActiveConsoleTab("verdict")}
                        className={`cursor-pointer pb-0.5 text-xs font-semibold transition-colors ${
                          activeConsoleTab === "verdict"
                            ? "text-indigo-400 border-b-2 border-indigo-400"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Verdict
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSampleOutput(null);
                      if (!hasSubmitted) setVerdict("");
                    }}
                    className="text-slate-500 hover:text-slate-300 text-[10px]"
                  >
                    Clear ✕
                  </button>
                </div>

                {activeConsoleTab === "sample" && sampleOutput && (
                  <pre className="text-slate-300 whitespace-pre-wrap bg-black/40 p-2.5 rounded-lg border border-white/[0.04] overflow-x-auto">
                    {sampleOutput}
                  </pre>
                )}

                {activeConsoleTab === "verdict" && verdict && (
                  <div
                    className={`p-2.5 rounded-lg border font-bold flex items-center justify-between ${
                      verdict.includes("Accepted") || verdict === "AC"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    <span>Verdict: {verdict}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      Evaluated on Judge0
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Buttons Bar */}
            <div className="p-3 flex items-center justify-between gap-3 bg-[#080C17]">
              
              {/* Run Sample Button */}
              <button
                onClick={runSample}
                disabled={runningSample || hasSubmitted || timerExpired}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {runningSample ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    <span>Run Sample</span>
                  </>
                )}
              </button>

              {/* Submit Button */}
              <button
                onClick={submitCode}
                disabled={submitting || hasSubmitted || timerExpired || !sourceCode.trim()}
                className="flex-1 sm:flex-initial px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating Test Cases...</span>
                  </>
                ) : hasSubmitted ? (
                  <span>✓ Submitted (Waiting for Opponent)</span>
                ) : (
                  <>
                    <span>Submit Solution</span>
                    <span>→</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Match;