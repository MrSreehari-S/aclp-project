import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MatchHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);

  const limit = 10;

  const fetchHistory = async (p = 1) => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const res = await api.get(
        `/match/history/${user.id}?page=${p}&limit=${limit}`
      );

      setMatches(res.data.matches);
      setTotalMatches(res.data.total);
      setPage(p);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchHistory(1);
    }
  }, [user]);

  const totalPages = Math.ceil(totalMatches / limit);

  const getResultIcon = (result) => {
    if (result === "WIN") return "🏆";
    if (result === "LOSS") return "💔";
    return "🤝";
  };

  const getResultGradient = (result) => {
    if (result === "WIN")
      return "from-green-500/20 to-emerald-500/20 border-l-4 border-green-500";
    if (result === "LOSS")
      return "from-red-500/20 to-rose-500/20 border-l-4 border-red-500";
    return "from-yellow-500/20 to-orange-500/20 border-l-4 border-yellow-500";
  };

  const getResultBadge = (result) => {
    if (result === "WIN")
      return "bg-gradient-to-r from-green-500 to-emerald-500";
    if (result === "LOSS")
      return "bg-gradient-to-r from-red-500 to-rose-500";
    return "bg-gradient-to-r from-yellow-500 to-orange-500";
  };

  const getRatingChangeColor = (change) => {
    if (change > 0) return "text-green-400";
    if (change < 0) return "text-red-400";
    return "text-gray-400";
  };

  // Stats (current page only)
  const totalWins = matches.filter((m) => m.result === "WIN").length;
  const totalLosses = matches.filter((m) => m.result === "LOSS").length;
  const totalDraws = matches.filter((m) => m.result === "DRAW").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-purple-200 text-lg">Loading match history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Match History
          </h1>

          <p className="text-purple-300 mt-2">
            {user.username}'s Battle Records
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

          <div className="bg-white/10 rounded-xl p-5 text-center">
            <p className="text-purple-300 text-sm">Total Matches</p>
            <p className="text-3xl font-bold text-white">{totalMatches}</p>
          </div>

          <div className="bg-green-500/20 rounded-xl p-5 text-center">
            <p className="text-green-300 text-sm">Wins</p>
            <p className="text-3xl font-bold text-green-400">{totalWins}</p>
          </div>

          <div className="bg-red-500/20 rounded-xl p-5 text-center">
            <p className="text-red-300 text-sm">Losses</p>
            <p className="text-3xl font-bold text-red-400">{totalLosses}</p>
          </div>

          <div className="bg-yellow-500/20 rounded-xl p-5 text-center">
            <p className="text-yellow-300 text-sm">Draws</p>
            <p className="text-3xl font-bold text-yellow-400">{totalDraws}</p>
          </div>

          <div className="bg-white/10 rounded-xl p-5 text-center">
            <p className="text-purple-300 text-sm">Page</p>
            <p className="text-3xl font-bold text-white">
              {page}/{totalPages}
            </p>
          </div>

        </div>

        {/* Matches Table */}
        <div className="bg-white/10 rounded-2xl overflow-hidden border border-white/20">

          <table className="w-full">

            <thead className="bg-purple-600/40">
              <tr>
                <th className="p-4 text-left text-white">Date</th>
                <th className="p-4 text-left text-white">Opponent</th>
                <th className="p-4 text-left text-white">Problem</th>
                <th className="p-4 text-center text-white">Result</th>
                <th className="p-4 text-right text-white">Rating Δ</th>
              </tr>
            </thead>

            <tbody>
              {matches.map((match) => (
                <tr
                  key={match.matchId}
                  className={`${getResultGradient(match.result)} border-t border-white/10`}
                >

                  {/* Date */}
                  <td className="p-4 text-white">
                    {new Date(match.date).toLocaleDateString()}
                  </td>

                  {/* Opponent */}
                  <td className="p-4 text-white font-semibold">
                    {match.opponent}
                  </td>

                  {/* Problem */}
                  <td className="p-4 text-purple-200">
                    {match.problemTitle}
                  </td>

                  {/* Result */}
                  <td className="p-4 text-center">
                    <div
                      className={`${getResultBadge(
                        match.result
                      )} px-4 py-1 rounded-full inline-flex items-center gap-2`}
                    >
                      <span>{getResultIcon(match.result)}</span>
                      <span className="text-white font-bold">
                        {match.result}
                      </span>
                    </div>
                  </td>

                  {/* Rating Change */}
                  <td className="p-4 text-right">
                    <span
                      className={`text-xl font-bold ${getRatingChangeColor(
                        match.ratingChange
                      )}`}
                    >
                      {match.ratingChange > 0 ? "+" : ""}
                      {match.ratingChange}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-8">

            <button
              disabled={page === 1}
              onClick={() => fetchHistory(page - 1)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-white font-bold text-lg">
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => fetchHistory(page + 1)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-40"
            >
              Next
            </button>

          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default MatchHistory;