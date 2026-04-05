import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MatchSummary = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await api.get(`/match/${matchId}`);
        setMatch(res.data);
      } catch {
        console.error("Failed to load match summary");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto relative">
            <div className="absolute inset-0 border-4 border-purple-300/30 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-purple-400 border-r-pink-400 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-purple-200 text-lg font-medium">Loading match summary...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/50 text-red-200 p-8 rounded-3xl max-w-md text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-xl font-bold">No match data found</p>
        </div>
      </div>
    );
  }

  const myId = user.id.toString();

  const mySubmission = match.submissions?.find(
    (s) => s.userId?.toString() === myId || s.userId?._id?.toString() === myId
  );

  const opponentSubmission = match.submissions?.find(
    (s) => s.userId?.toString() !== myId && s.userId?._id?.toString() !== myId
  );

  const me = match.players?.find(
    (p) => p.userId?.toString() === myId || p.userId?._id?.toString() === myId
  );

  const opponent = match.players?.find(
    (p) => p.userId?.toString() !== myId && p.userId?._id?.toString() !== myId
  );

  const getResultConfig = (result) => {
    if (result === "WIN") {
      return {
        gradient: "from-green-500 to-emerald-600",
        textColor: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500",
      };
    } else if (result === "LOSS") {
      return {
        gradient: "from-red-500 to-rose-600",
        textColor: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500",
      };
    } else {
      return {
        gradient: "from-yellow-500 to-orange-600",
        textColor: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500",
      };
    }
  };

  const config = getResultConfig(me?.result);

  const getVerdictColor = (verdict) => {
    if (verdict?.includes("Accepted") || verdict?.includes("PASS")) {
      return "text-green-400 bg-green-500/20 border-green-500/50";
    }
    return "text-red-400 bg-red-500/20 border-red-500/50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/history")}
            className="group flex items-center space-x-2 text-purple-300 hover:text-white transition-colors duration-300 mb-6"
          >
            <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to History</span>
          </button>

          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
              Match Summary
            </h1>
            <p className="text-purple-300 text-lg">Detailed Code Comparison & Results</p>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full mt-4"></div>
          </div>
        </div>

        {/* Result Overview */}
        <div className={`bg-gradient-to-r ${config.bgColor} backdrop-blur-xl rounded-3xl p-6 md:p-8 border-2 ${config.borderColor} border-opacity-50 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Your Result */}
            <div className="text-center">
              <p className="text-purple-300 text-sm uppercase tracking-wide mb-2">Your Result</p>
              <p className={`text-4xl md:text-6xl font-bold ${config.textColor}`}>
                {me?.result}
              </p>
            </div>

            {/* VS Divider */}
            <div className="text-center">
              <div className="text-3xl font-bold text-white opacity-50">VS</div>
            </div>

            {/* Rating Change */}
            <div className="text-center">
              <p className="text-purple-300 text-sm uppercase tracking-wide mb-2">Rating Change</p>
              <div className="flex items-center justify-center space-x-2">
                {me?.ratingChange > 0 && (
                  <svg className={`w-6 h-6 ${config.textColor}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {me?.ratingChange < 0 && (
                  <svg className={`w-6 h-6 ${config.textColor}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`text-4xl md:text-5xl font-bold ${config.textColor}`}>
                  {me?.ratingChange > 0 ? "+" : ""}
                  {me?.ratingChange}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Problem Info */}
        {match.problem && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Problem: {match.problem.title}
            </h2>
            <p className="text-purple-200">{match.problem.description}</p>
          </div>
        )}

        {/* Player Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Your Stats */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{user.username}</h3>
                <p className="text-purple-300">You</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`${getVerdictColor(mySubmission?.verdict)} backdrop-blur-xl border-2 p-4 rounded-2xl`}>
                <p className="text-sm text-purple-200 mb-1">Verdict</p>
                <p className="text-xl font-bold">{mySubmission?.verdict || "No submission"}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                <p className="text-sm text-purple-200 mb-1">Test Cases</p>
                <p className="text-2xl font-bold text-white">
                  {mySubmission?.passed || 0} / {mySubmission?.total || 0}
                </p>
                <div className="mt-2 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${config.gradient}`}
                    style={{ width: `${((mySubmission?.passed || 0) / (mySubmission?.total || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Opponent Stats */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {opponent?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{opponent?.username}</h3>
                <p className="text-purple-300">Opponent</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`${getVerdictColor(opponentSubmission?.verdict)} backdrop-blur-xl border-2 p-4 rounded-2xl`}>
                <p className="text-sm text-purple-200 mb-1">Verdict</p>
                <p className="text-xl font-bold">{opponentSubmission?.verdict || "No submission"}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                <p className="text-sm text-purple-200 mb-1">Test Cases</p>
                <p className="text-2xl font-bold text-white">
                  {opponentSubmission?.passed || 0} / {opponentSubmission?.total || 0}
                </p>
                <div className="mt-2 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{ width: `${((opponentSubmission?.passed || 0) / (opponentSubmission?.total || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Code Comparison */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Code Comparison
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Your Code */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.gradient} mr-2`}></span>
                  Your Code
                </h3>
                <span className="text-purple-300 text-sm">Python</span>
              </div>
              <div className="bg-black/60 rounded-2xl p-4 border border-white/10 overflow-x-auto">
                <pre className="text-green-300 font-mono text-sm leading-relaxed">
                  {mySubmission?.code || "// No code submitted"}
                </pre>
              </div>
            </div>

            {/* Opponent Code */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-2"></span>
                  {opponent?.username}'s Code
                </h3>
                <span className="text-purple-300 text-sm">Python</span>
              </div>
              <div className="bg-black/60 rounded-2xl p-4 border border-white/10 overflow-x-auto">
                <pre className="text-blue-300 font-mono text-sm leading-relaxed">
                  {opponentSubmission?.code || "// No code submitted"}
                </pre>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/history")}
            className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-gray-500/50 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>View History</span>
            </div>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-2">
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

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
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

export default MatchSummary;