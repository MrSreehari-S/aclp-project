import Match from "../models/Match.js";

const queue = [];

export const joinQueue = async (userId, rating) => {
  if (queue.find((q) => q.userId.toString() === userId.toString())) {
    return { status: "already_queued" };
  }

  let opponentIndex = -1;
  let smallestDiff = Infinity;

  queue.forEach((entry, index) => {
    const diff = Math.abs(entry.rating - rating);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      opponentIndex = index;
    }
  });

  if (opponentIndex !== -1) {
    const opponent = queue.splice(opponentIndex, 1)[0];

    const match = await Match.create({
      player1Id: opponent.userId,
      player2Id: userId,
      status: "RUNNING",
    });

    return {
      status: "matched",
      matchId: match._id,
    };
  }

  queue.push({
    userId,
    rating,
    joinedAt: Date.now(),
  });

  return { status: "queued" };
};

export const getQueueSize = () => queue.length;
