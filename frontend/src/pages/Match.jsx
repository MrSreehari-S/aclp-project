import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import CodeEditor from "../components/CodeEditor";
import { useAuth } from "../context/AuthContext";

const Match = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [match, setMatch] = useState(null);
  const [sourceCode, setSourceCode] = useState("");
  const [runningSample, setRunningSample] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);

  /* FETCH MATCH */

  const fetchMatch = async () => {
    try {
      const res = await api.get(`/match/${matchId}`);
      setMatch(res.data);
    } catch {
      setError("Failed to load match");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when page loads
  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  /* POLLING */

  useEffect(() => {
    if (!match || match.status === "COMPLETED") return;

    const interval = setInterval(fetchMatch, 2000);

    return () => clearInterval(interval);
  }, [match?.status, matchId]);

  /* SYNC RATING */

  useEffect(() => {
    if (!match || match.status !== "COMPLETED") return;

    const myId = user.id.toString();

    const me = match.players.find(
      (p) =>
        p.userId?.toString?.() === myId || p.userId?._id?.toString() === myId,
    );

    if (!me) return;

    setUser((prev) => {
      const updatedUser = {
        ...prev,
        rating: prev.rating + (me.ratingChange || 0),
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, [match?.status]);

  // ✅ STEP 2 — Calculate time left
  useEffect(() => {
    if (!match || match.status !== "ONGOING") return;

    const calculateTime = () => {
      const start = new Date(match.startTime).getTime();
      const end = start + match.timeLimit * 1000;
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setTimerExpired(true);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [match]);

  //Auto-submit on timeout
  useEffect(() => {
    if (timerExpired && !hasSubmitted && match?.status === "ONGOING") {
      submitCode();
    }
  }, [timerExpired]);

  /* RUN SAMPLE */

  const runSample = async () => {
    if (!sourceCode.trim()) return;

    try {
      setRunningSample(true);

      await api.post("/judge/run-sample", {
        sourceCode,
        input: match.problem.sampleInput,
      });
    } finally {
      setRunningSample(false);
    }
  };

  /* SUBMIT CODE */

  const submitCode = async () => {
    if (!sourceCode.trim()) return;

    try {
      setSubmitting(true);

      const res = await api.post("/judge/evaluate", {
        matchId,
        problemId: match.problem.id,
        languageId: 71, // Python
        sourceCode,
      });

      setVerdict(res.data.verdict);
      setHasSubmitted(true);
    } catch (err) {
      setVerdict(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* RESULT SCREEN */

  if (match && match.status === "COMPLETED") {
    const myId = user.id.toString();

    const me = match.players.find(
      (p) =>
        p.userId?.toString?.() === myId || p.userId?._id?.toString() === myId,
    );

    const opponent = match.players.find(
      (p) =>
        p.userId?.toString?.() !== myId && p.userId?._id?.toString() !== myId,
    );

    const getResultConfig = (result) => {
      if (result === "WIN") {
        return {
          title: "Victory!",
          emoji: "🏆",
          gradient: "from-green-500 to-emerald-600",
          bgGradient: "from-green-500/20 to-emerald-500/20",
          blobColor: "bg-green-500",
          shadowColor: "shadow-green-500/50",
          textColor: "text-green-400",
          borderColor: "border-green-500",
        };
      } else if (result === "LOSS") {
        return {
          title: "Defeat",
          emoji: "💔",
          gradient: "from-red-500 to-rose-600",
          bgGradient: "from-red-500/20 to-rose-500/20",
          blobColor: "bg-red-500",
          shadowColor: "shadow-red-500/50",
          textColor: "text-red-400",
          borderColor: "border-red-500",
        };
      } else {
        return {
          title: "Draw",
          emoji: "🤝",
          gradient: "from-yellow-500 to-orange-600",
          bgGradient: "from-yellow-500/20 to-orange-500/20",
          blobColor: "bg-yellow-500",
          shadowColor: "shadow-yellow-500/50",
          textColor: "text-yellow-400",
          borderColor: "border-yellow-500",
        };
      }
    };

    const config = getResultConfig(me.result);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${config.blobColor} rounded-full filter blur-3xl opacity-20 animate-blob`}></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className={`absolute bottom-1/4 left-1/2 w-96 h-96 ${config.blobColor} rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000`}></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl animate-fade-in">
          
          {/* Result Card */}
          <div className={`bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border-4 ${config.borderColor} border-opacity-50`}>
            
            {/* Result Icon and Title */}
            <div className="text-center mb-8">
              <div className="inline-block mb-6 animate-bounce-slow">
                <div className={`w-32 h-32 mx-auto bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center shadow-2xl ${config.shadowColor} transform hover:scale-110 transition-transform duration-300`}>
                  <span className="text-7xl">{config.emoji}</span>
                </div>
              </div>
              <h1 className={`text-5xl md:text-7xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-4`}>
                {config.title}
              </h1>
              <div className={`h-2 w-48 bg-gradient-to-r ${config.gradient} mx-auto rounded-full`}></div>
            </div>

            {/* Match Details */}
            <div className="space-y-6">
              
              {/* Players */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  {/* You */}
                  <div className="text-center flex-1">
                    <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-white font-bold text-lg">{user.username}</p>
                    <p className="text-purple-300 text-sm">You</p>
                  </div>

                  {/* VS Divider */}
                  <div className="flex-shrink-0 px-6">
                    <div className="text-4xl font-bold text-white opacity-50">VS</div>
                  </div>

                  {/* Opponent */}
                  <div className="text-center flex-1">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3">
                      {opponent.username.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-white font-bold text-lg">{opponent.username}</p>
                    <p className="text-purple-300 text-sm">Opponent</p>
                  </div>
                </div>
              </div>

              {/* Rating Change */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                  <p className="text-purple-300 text-sm uppercase tracking-wide mb-2">Rating Change</p>
                  <div className="flex items-center justify-center space-x-3">
                    {me.ratingChange > 0 && (
                      <svg className={`w-8 h-8 ${config.textColor}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {me.ratingChange < 0 && (
                      <svg className={`w-8 h-8 ${config.textColor}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={`text-6xl font-bold ${config.textColor}`}>
                      {me.ratingChange > 0 ? "+" : ""}
                      {me.ratingChange}
                    </span>
                  </div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <p className="text-center text-purple-200 text-lg italic">
                  {me.result === "WIN" 
                    ? "Outstanding performance! Keep climbing the ranks!" 
                    : me.result === "LOSS"
                    ? "Every defeat is a lesson. Come back stronger!"
                    : "Well fought! Both players showed great skill!"}
                </p>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl font-bold text-lg shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Back to Dashboard</span>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/history")}
                  className="group relative overflow-hidden bg-white/10 backdrop-blur-xl text-white p-3 rounded-xl font-semibold border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95"
                >
                  <div className="relative flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>History</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/leaderboard")}
                  className="group relative overflow-hidden bg-white/10 backdrop-blur-xl text-white p-3 rounded-xl font-semibold border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95"
                >
                  <div className="relative flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Leaderboard</span>
                  </div>
                </button>
              </div>
            </div>

          </div>

        </div>

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .animate-fade-in { animation: fade-in 0.6s ease-out; }
          .animate-blob { animation: blob 7s infinite; }
          .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
      </div>
    );
  }

  /* LOADING / ERROR */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto relative">
            <div className="absolute inset-0 border-4 border-purple-300/30 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-purple-400 border-r-pink-400 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-purple-200 text-lg font-medium">Loading match...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/50 text-red-200 p-8 rounded-3xl max-w-md text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-xl font-bold">{error}</p>
        </div>
      </div>
    );
  }

  /* MATCH UI */

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
      <div className="h-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* PROBLEM PANEL */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{match.problem.title}</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
          </div>

          <div className="bg-yellow-500/20 border-2 border-yellow-500/50 backdrop-blur-xl p-4 rounded-2xl mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-bold text-yellow-200 mb-2">⚠️ Important Instructions</p>
                <ul className="list-disc ml-4 space-y-1 text-yellow-100 text-sm">
                  <li>Do <strong>NOT</strong> print prompts like <code className="bg-black/30 px-1 rounded">"Enter a number"</code></li>
                  <li>Use <code className="bg-black/30 px-1 rounded">input()</code> directly to read input</li>
                  <li>Print <strong>ONLY</strong> the final output</li>
                </ul>
                <div className="mt-3 bg-black/40 p-3 rounded-xl font-mono text-xs text-green-300">
                  <p className="text-green-400 font-bold mb-1">✅ Correct pattern:</p>
                  <code>a = input()</code><br/>
                  <code>b = input()</code><br/>
                  <code>print(final_answer)</code>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-purple-100">
            <div>
              <h4 className="font-bold text-white text-lg mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Problem Description
              </h4>
              <p className="whitespace-pre-wrap bg-white/5 p-4 rounded-xl">{match.problem.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-white text-lg mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Input Format
              </h4>
              <pre className="bg-black/40 p-4 rounded-xl text-green-300 font-mono text-sm overflow-x-auto">
                {match.problem.inputFormat}
              </pre>
            </div>

            <div>
              <h4 className="font-bold text-white text-lg mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Output Format
              </h4>
              <pre className="bg-black/40 p-4 rounded-xl text-pink-300 font-mono text-sm overflow-x-auto">
                {match.problem.outputFormat}
              </pre>
            </div>

            <div>
              <h4 className="font-bold text-white text-lg mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Sample Test Case
              </h4>
              <div className="bg-black/40 p-4 rounded-xl font-mono text-sm">
                <div className="mb-3">
                  <p className="text-green-400 font-bold mb-1">Input:</p>
                  <pre className="text-green-300 whitespace-pre-wrap">{match.problem.sampleInput}</pre>
                </div>
                <div>
                  <p className="text-blue-400 font-bold mb-1">Output:</p>
                  <pre className="text-blue-300 whitespace-pre-wrap">{match.problem.sampleOutput}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EDITOR PANEL */}
        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/20 flex flex-col h-full">

          {/* ✅ STEP 6 — Timer + Editor Header */}
          <div className="mb-4 flex-shrink-0 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Code Editor
              </h3>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-2"></div>
            </div>

            {/* Timer display */}
            <div className="flex flex-col items-end">
              <p className="text-purple-300 text-xs uppercase tracking-wide mb-1">Time Left</p>
              <span
                className={`text-xl font-mono font-bold px-4 py-2 rounded-xl transition-all duration-300 ${
                  timerExpired
                    ? "bg-red-600 text-white"
                    : timeLeft <= 10
                    ? "bg-red-500/80 text-white animate-pulse shadow-lg shadow-red-500/50"
                    : timeLeft <= 30
                    ? "bg-orange-500/60 text-orange-100"
                    : "bg-black/40 text-green-400"
                }`}
              >
                {timerExpired
                  ? "00:00"
                  : `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
              </span>
            </div>
          </div>

          {/* ✅ STEP 4 — Disabled editor when time ends or after submit */}
          <div className="flex-1 mb-4 rounded-lg overflow-hidden h-full">
            <CodeEditor
              value={sourceCode}
              onChange={setSourceCode}
              disabled={hasSubmitted || timerExpired}
            />
          </div>

          <div className="flex-shrink-0 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={runSample}
                disabled={runningSample || hasSubmitted || timerExpired}
                className="flex-1 group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-bold shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-gray-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  {runningSample ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Run Sample</span>
                    </>
                  )}
                </div>
              </button>

              {/* ✅ STEP 5 — Disable submit button on timerExpired too */}
              <button
                onClick={submitCode}
                disabled={submitting || hasSubmitted || timerExpired}
                className="flex-1 group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-bold shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Submit Solution</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {verdict && (
              <div className={`${
                verdict.includes("Accepted") || verdict.includes("PASS") 
                  ? "bg-green-500/20 border-green-500/50 text-green-200" 
                  : "bg-red-500/20 border-red-500/50 text-red-200"
              } backdrop-blur-xl border-2 p-3 rounded-2xl text-center font-bold`}>
                <div className="flex items-center justify-center space-x-2">
                  {verdict.includes("Accepted") || verdict.includes("PASS") ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>Verdict: {verdict}</span>
                </div>
              </div>
            )}

            {/* Waiting message after submission */}
            {hasSubmitted && match.status === "ONGOING" && (
              <div className="bg-blue-500/20 border-2 border-blue-500/50 backdrop-blur-xl text-blue-200 p-3 rounded-2xl text-center animate-pulse">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                  <span className="font-semibold text-sm">Submission received. Waiting for opponent...</span>
                </div>
              </div>
            )}

            {/* Timer expired banner */}
            {timerExpired && !hasSubmitted && (
              <div className="bg-red-500/20 border-2 border-red-500/50 backdrop-blur-xl text-red-200 p-3 rounded-2xl text-center">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-sm">Time's up! Auto-submitting...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-blob { animation: blob 7s infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Match;