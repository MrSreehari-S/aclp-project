import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MatchResult = ({ match }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const me = match.players.find(
    (p) => p.userId === user.id || p.userId?._id === user.id
  );

  const opponent = match.players.find(
    (p) => p.userId !== me.userId
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

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
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

export default MatchResult;