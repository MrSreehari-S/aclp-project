import Match from "../models/Match.js";

// In-memory queue
const queue = [];

/**
 * Add user to matchmaking queue
 */
export const joinQueue = async (userId, rating) => {
  // Check if already in queue
  if (queue.find(q => q.userId.toString() === userId.toString())) {
    return { status: "already_queued" };
  }

  // Try to find opponent
  let opponentIndex = -1;
  let smallestDiff = Infinity;

  queue.forEach((entry, index) => {
    const diff = Math.abs(entry.rating - rating);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      opponentIndex = index;
    }
  });

  // If opponent found → create match
  if (opponentIndex !== -1) {
    const opponent = queue.splice(opponentIndex, 1)[0];

    const match = await Match.create({
      player1Id: opponent.userId,
      player2Id: userId,
      status: "RUNNING"
    });

    return {
      status: "matched",
      matchId: match._id
    };
  }

  // Else → push to queue
  queue.push({
    userId,
    rating,
    joinedAt: Date.now()
  });

  return { status: "queued" };
};

/**
 * Debug helper
 */
export const getQueueSize = () => queue.length;
