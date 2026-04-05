export const getTimeLimit = (difficulty) => {
  switch (difficulty) {
    case "EASY":
      return 300;
    case "MEDIUM":
      return 600;
    case "HARD":
      return 900;
    case "EXPERT":
      return 1200;
    default:
      return 600;
  }
};