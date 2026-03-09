import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("idle");
  const [attempts, setAttempts] = useState(0);
  const pollingRef = useRef(null);

  useEffect(() => {
    const checkActiveMatch = async () => {
      try {
        const res = await api.get(`/match/active/${user.id}`);

        if (res.data.match?.matchId) {
          navigate(`/match/${res.data.match.matchId}`);
        }
      } catch (err) {
        console.error("Active match check failed");
      }
    };

    checkActiveMatch();
  }, [user.id, navigate]);

  const startMatch = async () => {
    if (status === "queued") return;

    setStatus("idle");
    setAttempts(0);

    try {
      const res = await api.post("/match/start", {
        userId: user.id,
      });

      if (res.data.status === "queued") {
        setStatus("queued");
        startPolling();
      }

      if (res.data.status === "matched") {
        navigate(`/match/${res.data.matchId}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const startPolling = () => {
    if (pollingRef.current) return;

    pollingRef.current = setInterval(async () => {
      try {
        setAttempts((a) => a + 1);

        const res = await api.get(`/match/active/${user.id}`);

        if (res.data.match?.matchId) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          navigate(`/match/${res.data.match.matchId}`);
        }
      } catch (err) {
        console.error("Polling failed");
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  if (status === "queued") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/20 w-96 text-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-purple-300/30 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-t-purple-400 border-r-pink-400 border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-4 border-4 border-t-transparent border-r-transparent border-b-pink-400 border-l-purple-400 rounded-full animate-spin-reverse"></div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white">Finding Your Match</h2>
          
          <div className="space-y-4">
            <p className="text-purple-200 font-medium text-lg animate-pulse">
              Searching for opponent...
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/20">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm text-purple-200">Connection Attempts</p>
              <p className="text-4xl font-bold text-white mt-2">{attempts}</p>
            </div>
            <p className="text-xs text-purple-300 mt-4">Please keep this window open</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-purple-500/50">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-purple-200 text-sm uppercase tracking-wide">Player</p>
                <h3 className="text-2xl font-bold text-white mt-1">{user.username}</h3>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
                <p className="text-purple-200 text-xs uppercase tracking-wide">Current Rating</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mt-2">
                  {user.rating}
                </p>
              </div>
            </div>
          </div>

          {status === "error" && (
            <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/50 text-red-200 p-4 rounded-2xl animate-shake shadow-lg">
              <p className="font-semibold">⚠️ Matchmaking Error</p>
              <p className="text-sm mt-1">Failed to start matchmaking</p>
            </div>
          )}
        </div>

        {/* Middle Column - Main Action */}
        <div className="lg:col-span-1 flex items-center justify-center">
          <div className="w-full">
            <button
              onClick={startMatch}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-3xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center">
                <div className="mb-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Find Match</h2>
                <p className="text-purple-300 text-sm">Start your next battle</p>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column - Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <button
            onClick={() => navigate("/history")}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-slate-700 to-slate-600 p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-slate-500/50 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Match History</h3>
                <p className="text-slate-300 text-sm">View past games</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-green-500/50 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Leaderboard</h3>
                <p className="text-green-100 text-sm">Top players</p>
              </div>
            </div>
          </button>

          <button
            onClick={logout}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-red-600 to-rose-600 p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Logout</h3>
                <p className="text-red-100 text-sm">Exit session</p>
              </div>
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
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

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;