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

  const resultColor =
    me.result === "WIN"
      ? "text-green-600"
      : me.result === "LOSS"
      ? "text-red-600"
      : "text-yellow-600";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96 text-center space-y-4">
        <h2 className="text-2xl font-bold">Match Result</h2>

        <p className={`text-xl font-semibold ${resultColor}`}>
          {me.result}
        </p>

        <p className="text-sm text-gray-600">
          vs {opponent.username}
        </p>

        <p className="text-sm">
          Rating change:{" "}
          <span className="font-semibold">
            {me.ratingChange > 0 ? "+" : ""}
            {me.ratingChange}
          </span>
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default MatchResult;