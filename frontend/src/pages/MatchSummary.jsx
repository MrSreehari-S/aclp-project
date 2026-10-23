import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import CodeEditor from "../components/CodeEditor";

const MatchSummary = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("myCode"); // "myCode" | "opponentCode" | "problem"
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/match/${matchId}`);
        setMatch(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load match summary");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">LOADING MATCH POST-MORTEM...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !match) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#090D18]/90 border border-rose-500/30 text-center space-y-4">
            <span className="text-4xl">⚠️</span>
            <h2 className="text-xl font-bold text-white">Summary Unavailable</h2>
            <p className="text-xs text-slate-400">{error || "No match record found."}</p>
            <button
              onClick={() => navigate("/history")}
              className="px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold transition-all"
            >
              Back to Battle Log
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const myIdStr = currentUserId ? currentUserId.toString() : "";

  const me = match.players?.find(
    (p) =>
      p.userId?.toString() === myIdStr || p.userId?._id?.toString() === myIdStr
  );

  const opponent = match.players?.find(
    (p) =>
      p.userId?.toString() !== myIdStr && p.userId?._id?.toString() !== myIdStr
  );

  const mySubmission = match.submissions?.find(
    (s) =>
      s.userId?.toString() === myIdStr || s.userId?._id?.toString() === myIdStr
  );

  const opponentSubmission = match.submissions?.find(
    (s) =>
      s.userId?.toString() !== myIdStr && s.userId?._id?.toString() !== myIdStr
  );

  const isWin = me?.result === "WIN";
  const isLoss = me?.result === "LOSS";
  const isDraw = me?.result === "DRAW" || !me?.result;

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full animate-fade-in">
        
        {/* Top Back Nav & Identifiers */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Return to Battle Log</span>
          </button>

          <span className="text-xs font-mono text-slate-500">
            Duel ID: <code className="text-slate-400 font-bold">{matchId?.slice(-8)}</code>
          </span>
        </div>

        {/* Hero Result Banner */}
        <div
          className={`rounded-3xl p-6 md:p-8 border shadow-2xl mb-8 relative overflow-hidden backdrop-blur-xl ${
            isWin
              ? "bg-gradient-to-r from-emerald-950/40 via-[#090D18] to-emerald-950/20 border-emerald-500/30 shadow-emerald-500/5"
              : isLoss
              ? "bg-gradient-to-r from-rose-950/40 via-[#090D18] to-rose-950/20 border-rose-500/30 shadow-rose-500/5"
              : "bg-gradient-to-r from-amber-950/40 via-[#090D18] to-amber-950/20 border-amber-500/30 shadow-amber-500/5"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            
            {/* Outcome Title & Problem */}
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-2 bg-white/[0.05] border border-white/[0.08]">
                <span>{isWin ? "🏆" : isLoss ? "💔" : "🤝"}</span>
                <span>{isWin ? "Duel Victory" : isLoss ? "Duel Defeat" : "Duel Draw"}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {match.problem?.title || "Algorithmic Challenge"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Completed on {match.completedAt ? new Date(match.completedAt).toLocaleString() : "Recently"}
              </p>
            </div>

            {/* Rating Shift */}
            <div className="flex items-center space-x-6">
              <div className="text-center p-4 rounded-2xl bg-black/40 border border-white/[0.08] min-w-[130px]">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Rating Shift</p>
                <p
                  className={`text-2xl sm:text-3xl font-extrabold font-mono mt-1 ${
                    (me?.ratingChange || 0) > 0
                      ? "text-emerald-400"
                      : (me?.ratingChange || 0) < 0
                      ? "text-rose-400"
                      : "text-slate-300"
                  }`}
                >
                  {(me?.ratingChange || 0) > 0 ? `+${me.ratingChange}` : me?.ratingChange || 0} ELO
                </p>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="hidden sm:inline-flex px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all"
              >
                Fight Again →
              </button>
            </div>

          </div>
        </div>

        {/* Head-to-Head Duel Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* You */}
          <div className="p-6 rounded-3xl bg-[#090D18]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-px">
                  <div className="w-full h-full bg-[#080C16] rounded-[11px] flex items-center justify-center font-bold text-sm text-white">
                    {user?.username?.charAt(0).toUpperCase() || "Y"}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-base text-white">{user?.username}</p>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      YOU
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400">Rating: {me?.rating || 1200} ELO</p>
                </div>
              </div>

              {/* Verdict badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  mySubmission?.verdict === "AC" || mySubmission?.verdict?.includes("Accepted")
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {mySubmission?.verdict || "No Submission"}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] font-mono uppercase text-slate-500">Test Cases Passed</p>
                <p className="text-lg font-mono font-bold text-white mt-0.5">
                  {mySubmission?.passed !== undefined
                    ? `${mySubmission.passed} / ${mySubmission.total || mySubmission.passed}`
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] font-mono uppercase text-slate-500">Outcome</p>
                <p className="text-lg font-bold text-indigo-300 mt-0.5">
                  {me?.result || "DRAW"}
                </p>
              </div>
            </div>
          </div>

          {/* Opponent */}
          <div className="p-6 rounded-3xl bg-[#090D18]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 p-px">
                  <div className="w-full h-full bg-[#080C16] rounded-[11px] flex items-center justify-center font-bold text-sm text-white">
                    {opponent?.username?.charAt(0).toUpperCase() || "O"}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-base text-white">{opponent?.username || "Opponent"}</p>
                  <p className="text-xs font-mono text-slate-400">Rating: {opponent?.rating || 1200} ELO</p>
                </div>
              </div>

              {/* Verdict badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  opponentSubmission?.verdict === "AC" || opponentSubmission?.verdict?.includes("Accepted")
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {opponentSubmission?.verdict || "No Submission"}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] font-mono uppercase text-slate-500">Test Cases Passed</p>
                <p className="text-lg font-mono font-bold text-white mt-0.5">
                  {opponentSubmission?.passed !== undefined
                    ? `${opponentSubmission.passed} / ${opponentSubmission.total || opponentSubmission.passed}`
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] font-mono uppercase text-slate-500">Outcome</p>
                <p className="text-lg font-bold text-purple-300 mt-0.5">
                  {opponent?.result || "DRAW"}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Code & Problem Deep-Dive Workspace */}
        <div className="rounded-3xl bg-[#090D18]/90 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Workspace Tabs */}
          <div className="px-6 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab("myCode")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                  activeTab === "myCode"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Your Code ({mySubmission ? "Submitted" : "Empty"})
              </button>

              <button
                onClick={() => setActiveTab("opponentCode")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                  activeTab === "opponentCode"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Opponent's Code ({opponentSubmission ? "Revealed" : "Empty"})
              </button>

              <button
                onClick={() => setActiveTab("problem")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                  activeTab === "problem"
                    ? "bg-white/[0.1] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Problem Specs
              </button>
            </div>

            {/* Copy Button */}
            {(activeTab === "myCode" || activeTab === "opponentCode") && (
              <button
                onClick={() =>
                  handleCopy(
                    activeTab === "myCode"
                      ? mySubmission?.code
                      : opponentSubmission?.code
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
              >
                <span>{copiedCode ? "✓ Copied" : "Copy Code"}</span>
              </button>
            )}
          </div>

          {/* Active Tab Panel */}
          <div className="p-6">
            
            {/* My Code View */}
            {activeTab === "myCode" && (
              <div>
                {mySubmission?.code ? (
                  <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-white/[0.06]">
                    <CodeEditor value={mySubmission.code} disabled={true} />
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-2">
                    <span className="text-3xl">📝</span>
                    <p className="text-sm font-bold text-white">No submission recorded</p>
                    <p className="text-xs text-slate-500">You did not submit any code before the match concluded.</p>
                  </div>
                )}
              </div>
            )}

            {/* Opponent Code View */}
            {activeTab === "opponentCode" && (
              <div>
                {opponentSubmission?.code ? (
                  <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-white/[0.06]">
                    <CodeEditor value={opponentSubmission.code} disabled={true} />
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-2">
                    <span className="text-3xl">🔒</span>
                    <p className="text-sm font-bold text-white">No opponent code available</p>
                    <p className="text-xs text-slate-500">The opponent did not submit code during this match.</p>
                  </div>
                )}
              </div>
            )}

            {/* Problem Specs View */}
            {activeTab === "problem" && (
              <div className="space-y-6 text-slate-300 max-w-4xl">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Description</h3>
                  <div className="text-sm bg-white/[0.02] p-4 rounded-xl border border-white/[0.04] whitespace-pre-wrap leading-relaxed">
                    {match.problem?.description}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">Input Format</h4>
                    <pre className="text-xs font-mono text-emerald-300 bg-[#04060B] p-3 rounded-xl border border-white/[0.06] overflow-x-auto">
                      {match.problem?.inputFormat || "N/A"}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">Output Format</h4>
                    <pre className="text-xs font-mono text-cyan-300 bg-[#04060B] p-3 rounded-xl border border-white/[0.06] overflow-x-auto">
                      {match.problem?.outputFormat || "N/A"}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">Sample Test Case</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-[#04060B] border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Input</span>
                      <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap">
                        {match.problem?.sampleInput || "N/A"}
                      </pre>
                    </div>
                    <div className="p-3 rounded-xl bg-[#04060B] border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Output</span>
                      <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                        {match.problem?.sampleOutput || "N/A"}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </AuthenticatedLayout>
  );
};

export default MatchSummary;