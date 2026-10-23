import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

const MatchHistory = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
  const [filter, setFilter] = useState("ALL"); // "ALL" | "WIN" | "LOSS" | "DRAW"

  const limit = 10;

  const fetchHistory = async (p = 1) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/match/history/${userId}?page=${p}&limit=${limit}`);
      setMatches(res.data.matches || []);
      setTotalMatches(res.data.total || 0);
      setPage(p);
    } catch (err) {
      console.error("Match history fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHistory(1);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const totalPages = Math.max(1, Math.ceil(totalMatches / limit));

  // Current page combat stats
  const totalWins = matches.filter((m) => m.result === "WIN").length;
  const totalLosses = matches.filter((m) => m.result === "LOSS").length;
  const totalDraws = matches.filter((m) => m.result === "DRAW").length;
  const winRate =
    matches.length > 0 ? Math.round((totalWins / matches.length) * 100) : 0;

  // Filtered matches
  const filteredMatches = matches.filter((m) => {
    if (filter === "ALL") return true;
    return m.result === filter;
  });

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono tracking-wider mb-3">
            <span>📜</span>
            <span>COMBAT ARCHIVE</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Battle Records
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto">
            Review your past 1v1 algorithmic duels, rating shifts, and performance breakdowns.
          </p>
        </div>

        {/* Combat Stats Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="p-5 rounded-2xl bg-[#090D18]/90 border border-white/[0.06] backdrop-blur-md">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Battles</p>
            <p className="text-3xl font-extrabold font-mono text-white mt-1">{totalMatches}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090D18]/90 border border-emerald-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Victories</p>
              <span className="text-xs">🏆</span>
            </div>
            <p className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">{totalWins}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090D18]/90 border border-rose-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-rose-400">Defeats</p>
              <span className="text-xs">💔</span>
            </div>
            <p className="text-3xl font-extrabold font-mono text-rose-400 mt-1">{totalLosses}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090D18]/90 border border-indigo-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-indigo-300">Page Win Rate</p>
              <span className="text-xs font-mono text-slate-400">📊</span>
            </div>
            <p className="text-3xl font-extrabold font-mono text-indigo-300 mt-1">{winRate}%</p>
          </div>

        </div>

        {/* Main Records Container */}
        <div className="rounded-3xl bg-[#090D18]/90 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Header Bar with Quick Filters */}
          <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Recent Matches ({totalMatches})
            </span>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
              {["ALL", "WIN", "LOSS", "DRAW"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    filter === f
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {f === "ALL" ? "All" : f === "WIN" ? "Wins" : f === "LOSS" ? "Losses" : "Draws"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">RETRIEVING COMBAT LOGS...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <span className="text-4xl">⚔️</span>
              <h3 className="text-lg font-bold text-white">No Match Records Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {filter === "ALL"
                  ? "You haven't fought any 1v1 duels yet. Enter the queue from the dashboard to start!"
                  : `No records match the filter '${filter}'.`}
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all"
              >
                Find a Match →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-white/[0.01]">
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Opponent</th>
                    <th className="py-3.5 px-6">Challenge</th>
                    <th className="py-3.5 px-6 text-center">Outcome</th>
                    <th className="py-3.5 px-6 text-right">ELO Shift</th>
                    <th className="py-3.5 px-6 text-center">Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredMatches.map((m) => {
                    const isWin = m.result === "WIN";
                    const isLoss = m.result === "LOSS";
                    const isDraw = m.result === "DRAW" || !m.result;
                    const dateFormatted = m.date
                      ? new Date(m.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recent";

                    return (
                      <tr
                        key={m.matchId}
                        onClick={() => navigate(`/match/${m.matchId}/summary`)}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        {/* Date */}
                        <td className="py-4 px-6 font-mono text-xs text-slate-400 whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        {/* Opponent */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 p-px flex-shrink-0">
                              <div className="w-full h-full bg-[#080C16] rounded-[11px] flex items-center justify-center font-bold text-xs text-white">
                                {m.opponent?.charAt(0).toUpperCase() || "O"}
                              </div>
                            </div>
                            <span className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors">
                              {m.opponent || "Unknown Opponent"}
                            </span>
                          </div>
                        </td>

                        {/* Challenge Title */}
                        <td className="py-4 px-6">
                          <span className="font-medium text-sm text-slate-200">
                            {m.problemTitle || m.problem?.title || "Algorithmic Duel"}
                          </span>
                        </td>

                        {/* Outcome Badge */}
                        <td className="py-4 px-6 text-center">
                          {isWin && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              <span>🏆</span>
                              <span>VICTORY</span>
                            </span>
                          )}
                          {isLoss && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                              <span>💔</span>
                              <span>DEFEAT</span>
                            </span>
                          )}
                          {isDraw && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                              <span>🤝</span>
                              <span>DRAW</span>
                            </span>
                          )}
                        </td>

                        {/* Rating Change */}
                        <td className="py-4 px-6 text-right font-mono font-extrabold text-sm sm:text-base">
                          {(m.ratingChange || 0) > 0 ? (
                            <span className="text-emerald-400">+{m.ratingChange}</span>
                          ) : (m.ratingChange || 0) < 0 ? (
                            <span className="text-rose-400">{m.ratingChange}</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>

                        {/* Action link */}
                        <td className="py-4 px-6 text-center">
                          <span className="text-xs text-indigo-400 font-semibold group-hover:text-indigo-300 group-hover:underline">
                            Review →
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => fetchHistory(page - 1)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>

              <span className="text-xs font-mono text-slate-400">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => fetchHistory(page + 1)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          )}

        </div>

      </div>
    </AuthenticatedLayout>
  );
};

export default MatchHistory;