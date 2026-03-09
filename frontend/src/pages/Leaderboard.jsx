import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const limit = 20;

  const fetchLeaderboard = async (p = 1) => {
    try {
      const res = await api.get(`/leaderboard?page=${p}&limit=${limit}`);

      setPlayers(res.data.users);
      setTotalUsers(res.data.totalUsers);
      setPage(res.data.page);
    } catch (err) {
      console.error("Leaderboard error:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard(1);
  }, []);

  const totalPages = Math.ceil(totalUsers / limit);

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getRatingColor = (rating) => {
    if (rating >= 2000) return "text-red-500 font-bold";
    if (rating >= 1700) return "text-purple-500 font-bold";
    if (rating >= 1400) return "text-blue-500 font-semibold";
    if (rating >= 1200) return "text-green-500";
    return "text-gray-300";
  };

  const getRatingBadge = (rating) => {
    if (rating >= 2000) return { label: "LEGEND", color: "from-red-500 to-orange-500" };
    if (rating >= 1700) return { label: "MASTER", color: "from-purple-500 to-pink-500" };
    if (rating >= 1400) return { label: "EXPERT", color: "from-blue-500 to-cyan-500" };
    if (rating >= 1200) return { label: "SKILLED", color: "from-green-500 to-emerald-500" };
    return { label: "RISING", color: "from-gray-400 to-gray-500" };
  };

  const getRowBackground = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-l-4 border-yellow-500";
    if (rank === 2) return "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-l-4 border-gray-400";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-l-4 border-amber-600";
    return "border-l-4 border-transparent";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto animate-fade-in">
        
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
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50 transform hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Leaderboard
          </h1>
          <p className="text-purple-300 text-lg">Top Players Worldwide</p>
          <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-white/15">
            <p className="text-purple-300 text-sm uppercase tracking-wide">Total Players</p>
            <p className="text-4xl font-bold text-white mt-2">{totalUsers}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-white/15">
            <p className="text-purple-300 text-sm uppercase tracking-wide">Current Page</p>
            <p className="text-4xl font-bold text-white mt-2">{page} / {totalPages}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-white/15">
            <p className="text-purple-300 text-sm uppercase tracking-wide">Showing</p>
            <p className="text-4xl font-bold text-white mt-2">{players.length}</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/20">
          
          <div className="overflow-x-auto">
            <table className="w-full">
              
              <thead className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 backdrop-blur-xl">
                <tr>
                  <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base uppercase tracking-wider">
                    Player
                  </th>
                  <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="p-4 md:p-6 text-right text-white font-bold text-sm md:text-base uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>

              <tbody>
                {players.map((player, index) => {
                  const badge = getRatingBadge(player.rating);
                  return (
                    <tr
                      key={player.rank}
                      className={`
                        ${getRowBackground(player.rank)}
                        border-t border-white/10
                        transform transition-all duration-300
                        hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg
                        animate-slide-in
                      `}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4 md:p-6">
                        <div className="flex items-center">
                          <span className="text-2xl md:text-3xl transform transition-transform duration-300 hover:scale-125">
                            {getRankIcon(player.rank)}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 md:p-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg`}>
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                          <span className={`text-base md:text-lg font-semibold ${getRatingColor(player.rating)}`}>
                            {player.username}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 md:p-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${badge.color} shadow-lg`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="p-4 md:p-6 text-right">
                        <div className="inline-block">
                          <div className="text-xl md:text-2xl font-bold text-white">
                            {player.rating}
                          </div>
                          <div className="text-xs text-purple-300">ELO</div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-8">
          
          <button
            disabled={page === 1}
            onClick={() => fetchLeaderboard(page - 1)}
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
            onClick={() => fetchLeaderboard(page + 1)}
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

export default Leaderboard;