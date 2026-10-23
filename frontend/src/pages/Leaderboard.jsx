import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import RankBadge, { getRankDetails } from "../components/RankBadge";

const Leaderboard = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const limit = 20;

  const fetchLeaderboard = async (p = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/leaderboard?page=${p}&limit=${limit}`);
      setPlayers(res.data.users || []);
      setTotalUsers(res.data.totalUsers || 0);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error("Leaderboard fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

  // Top 3 Podium Extraction (if page === 1)
  const top1 = players[0];
  const top2 = players[1];
  const top3 = players[2];

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono tracking-wider mb-3">
            <span>👑</span>
            <span>OFFICIAL ELO RANKINGS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Hall of Fame
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto">
            The highest rated algorithmic competitors across CodeClash. Win 1v1 duels to ascend the ladder.
          </p>
        </div>

        {/* Podium of Top 3 (Only shown on Page 1) */}
        {page === 1 && players.length >= 3 && !loading && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto mb-12 items-end">
            
            {/* Rank 2 (Silver) */}
            <div className="order-1 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 p-[1.5px] shadow-lg shadow-slate-500/10 mb-3 transform hover:scale-105 transition-all">
                <div className="w-full h-full bg-[#080C16] rounded-[14px] flex items-center justify-center font-bold text-white text-xl sm:text-2xl">
                  {top2.username?.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="text-xl sm:text-2xl mb-1">🥈</span>
              <p className="font-bold text-white text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[140px] text-center">
                {top2.username}
              </p>
              <p className="font-mono text-xs text-slate-300 font-semibold mt-0.5">
                {top2.rating} ELO
              </p>
              <div className="w-full h-24 sm:h-28 mt-3 rounded-t-2xl bg-gradient-to-t from-slate-800/40 to-slate-500/20 border-t border-x border-slate-400/30 flex items-center justify-center">
                <span className="text-slate-300 font-extrabold font-mono text-lg sm:text-xl">#2</span>
              </div>
            </div>

            {/* Rank 1 (Gold - Center) */}
            <div className="order-2 flex flex-col items-center">
              <span className="text-2xl sm:text-3xl animate-bounce">👑</span>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 p-1 shadow-2xl shadow-amber-500/30 mb-3 transform hover:scale-105 transition-all">
                <div className="w-full h-full bg-[#080C16] rounded-[20px] flex items-center justify-center font-extrabold text-amber-300 text-2xl sm:text-3xl">
                  {top1.username?.charAt(0).toUpperCase()}
                </div>
              </div>
              <p className="font-extrabold text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-[160px] text-center">
                {top1.username}
              </p>
              <p className="font-mono text-sm text-amber-300 font-bold mt-0.5">
                {top1.rating} ELO
              </p>
              <div className="w-full h-32 sm:h-36 mt-3 rounded-t-2xl bg-gradient-to-t from-amber-600/30 via-yellow-500/20 to-amber-400/30 border-t border-x border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <span className="text-amber-300 font-extrabold font-mono text-2xl sm:text-3xl">#1</span>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="order-3 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-700 to-orange-800 p-[1.5px] shadow-lg shadow-amber-700/10 mb-3 transform hover:scale-105 transition-all">
                <div className="w-full h-full bg-[#080C16] rounded-[14px] flex items-center justify-center font-bold text-white text-xl sm:text-2xl">
                  {top3.username?.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="text-xl sm:text-2xl mb-1">🥉</span>
              <p className="font-bold text-white text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[140px] text-center">
                {top3.username}
              </p>
              <p className="font-mono text-xs text-amber-500 font-semibold mt-0.5">
                {top3.rating} ELO
              </p>
              <div className="w-full h-20 sm:h-24 mt-3 rounded-t-2xl bg-gradient-to-t from-orange-950/40 to-amber-800/20 border-t border-x border-amber-700/30 flex items-center justify-center">
                <span className="text-amber-500 font-extrabold font-mono text-lg sm:text-xl">#3</span>
              </div>
            </div>

          </div>
        )}

        {/* Global Rankings Table Card */}
        <div className="rounded-3xl bg-[#090D18]/90 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Table Header Controls */}
          <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Global Duellists ({totalUsers} Registered)
            </span>
            <span className="text-xs font-mono text-indigo-400">
              Page {page} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">LOADING STANDINGS...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <span className="text-3xl">⚔️</span>
              <p className="text-base font-bold text-white">No duellists ranked yet</p>
              <p className="text-xs text-slate-400">Complete matches to claim the leaderboard.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-white/[0.01]">
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-6">Duelist</th>
                    <th className="py-3.5 px-6">Rank Tier</th>
                    <th className="py-3.5 px-6 text-right">ELO Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {players.map((player, idx) => {
                    const globalRank = (page - 1) * limit + (idx + 1);
                    const isSelf =
                      currentUserId &&
                      (player._id?.toString() === currentUserId.toString() ||
                        player.id?.toString() === currentUserId.toString());

                    return (
                      <tr
                        key={player._id || player.id || idx}
                        className={`transition-colors duration-150 ${
                          isSelf
                            ? "bg-indigo-600/10 hover:bg-indigo-600/15 border-l-2 border-indigo-500"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        {/* Rank Position */}
                        <td className="py-4 px-6 font-mono font-bold text-sm">
                          {globalRank === 1 ? (
                            <span className="text-amber-300 font-extrabold flex items-center space-x-1">
                              <span>🥇</span>
                              <span>#1</span>
                            </span>
                          ) : globalRank === 2 ? (
                            <span className="text-slate-300 font-extrabold flex items-center space-x-1">
                              <span>🥈</span>
                              <span>#2</span>
                            </span>
                          ) : globalRank === 3 ? (
                            <span className="text-amber-500 font-extrabold flex items-center space-x-1">
                              <span>🥉</span>
                              <span>#3</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">#{globalRank}</span>
                          )}
                        </td>

                        {/* Duellist Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-px flex-shrink-0">
                              <div className="w-full h-full bg-[#080C16] rounded-[11px] flex items-center justify-center font-bold text-xs text-white">
                                {player.username?.charAt(0).toUpperCase() || "U"}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-sm text-white">
                                  {player.username}
                                </span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {player.email ? player.email.split("@")[0] : "Verified Duelist"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Rank Tier */}
                        <td className="py-4 px-6">
                          <RankBadge rating={player.rating || 1200} size="sm" showRating={false} />
                        </td>

                        {/* ELO Rating */}
                        <td className="py-4 px-6 text-right font-mono font-extrabold text-sm sm:text-base text-white">
                          <span className="bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
                            {player.rating || 1200}
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
                onClick={() => fetchLeaderboard(page - 1)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>

              <span className="text-xs font-mono text-slate-400">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => fetchLeaderboard(page + 1)}
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

export default Leaderboard;