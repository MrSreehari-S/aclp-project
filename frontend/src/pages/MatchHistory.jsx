import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MatchHistory = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  console.log("USER OBJECT:", user); 
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);

  const limit = 10;

  console.log("FETCH CALLED", user);

 const fetchHistory = async (p = 1) => {
  if (!userId) {
    setLoading(false);
    return;
  }

  setLoading(true);

  try {
    console.log("✅ Fetching for userId:", userId);

    const res = await api.get(
      `/match/history/${userId}?page=${p}&limit=${limit}`
    );

    console.log("✅ API RESPONSE:", res.data);

    setMatches(res.data.matches || []);
    setTotalMatches(res.data.total || 0);
    setPage(p);
  } catch (err) {
    console.error("❌ ERROR:", err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};
 useEffect(() => {
  if (userId) {
    fetchHistory(1);
  } else {
    console.log("User not ready yet");
    setLoading(false);
  }
}, [userId]);
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
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto relative">
            <div className="absolute inset-0 border-4 border-purple-300/30 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-purple-400 border-r-pink-400 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-purple-200 text-lg font-medium">Loading match history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <button
            onClick={() => navigate("/dashboard")}
            className="absolute left-4 top-4 group flex items-center space-x-2 text-purple-300 hover:text-white transition-colors duration-300"
          >
            <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          <div className="inline-block mb-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 transform hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Match History
          </h1>
          <p className="text-purple-300 text-lg">{user.username}'s Battle Records</p>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-white/15">
            <p className="text-purple-300 text-xs md:text-sm uppercase tracking-wide">Total Matches</p>
            <p className="text-2xl md:text-4xl font-bold text-white mt-2">{totalMatches}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-green-500/30 transform transition-all duration-300 hover:scale-105">
            <p className="text-green-300 text-xs md:text-sm uppercase tracking-wide">Wins</p>
            <p className="text-2xl md:text-4xl font-bold text-green-400 mt-2">
              {totalWins}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-red-500/30 transform transition-all duration-300 hover:scale-105">
            <p className="text-red-300 text-xs md:text-sm uppercase tracking-wide">Losses</p>
            <p className="text-2xl md:text-4xl font-bold text-red-400 mt-2">
              {totalLosses}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-yellow-500/30 transform transition-all duration-300 hover:scale-105">
            <p className="text-yellow-300 text-xs md:text-sm uppercase tracking-wide">Draws</p>
            <p className="text-2xl md:text-4xl font-bold text-yellow-400 mt-2">
              {totalDraws}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-white/15">
            <p className="text-purple-300 text-xs md:text-sm uppercase tracking-wide">Page</p>
            <p className="text-2xl md:text-4xl font-bold text-white mt-2">{page}/{totalPages}</p>
          </div>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Matches Yet</h3>
            <p className="text-purple-300">Start playing to build your match history!</p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/20">
            
            <div className="overflow-x-auto">
              <table className="w-full">
                
                <thead className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 backdrop-blur-xl">
                  <tr>
                    <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base uppercase tracking-wider">
                      Date
                    </th>
                    <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base uppercase tracking-wider">
                      Opponent
                    </th>
                    <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base uppercase tracking-wider">
                      Problem
                    </th>
                    <th className="p-4 md:p-6 text-center text-white font-bold text-sm md:text-base uppercase tracking-wider">
                      Result
                    </th>
                    <th className="p-4 md:p-6 text-right text-white font-bold text-sm md:text-base uppercase tracking-wider">
                      Rating Δ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {matches.map((match, index) => (
                    <tr
                      key={match.matchId}
                      onClick={() => navigate(`/match/${match.matchId}/summary`)}
                      className={`
                        ${getResultGradient(match.result)}
                        border-t border-white/10
                        transform transition-all duration-300
                        hover:bg-white/10 hover:scale-[1.01] hover:shadow-lg
                        animate-slide-in cursor-pointer
                      `}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4 md:p-6">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-white text-sm md:text-base">
                            {new Date(match.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 md:p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            {match.opponent.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-semibold text-sm md:text-base">
                            {match.opponent}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 md:p-6">
                        <div className="bg-white/10 rounded-lg px-3 py-2 inline-block">
                          <p className="text-purple-200 text-sm md:text-base font-medium">
                            {match.problemTitle || match.problem?.title || "Problem"}
                          </p>
                          <p className="text-xs text-purple-300 mt-1">
                            Click to view details →
                          </p>
                        </div>
                      </td>

                      <td className="p-4 md:p-6">
                        <div className="flex justify-center">
                          <div className={`${getResultBadge(match.result)} px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transform transition-transform duration-300 hover:scale-110`}>
                            <span className="text-2xl">{getResultIcon(match.result)}</span>
                            <span className="text-white font-bold text-sm md:text-base">
                              {match.result}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 md:p-6">
                        <div className="flex justify-end items-center space-x-2">
                          {match.ratingChange > 0 && (
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {match.ratingChange < 0 && (
                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={`text-xl md:text-2xl font-bold ${getRatingChangeColor(match.ratingChange)}`}>
                            {match.ratingChange > 0 ? "+" : ""}
                            {match.ratingChange}
                          </span>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-8">
            
            <button
              disabled={page === 1}
              onClick={() => fetchHistory(page - 1)}
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-purple-500/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </div>
            </button>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/20">
              <span className="text-lg md:text-xl font-bold text-white">
                Page {page} <span className="text-purple-300">of</span> {totalPages}
              </span>
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => fetchHistory(page + 1)}
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-purple-500/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-purple-500/50 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Back to Dashboard</span>
            </div>
          </button>
        </div>

      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default MatchHistory;