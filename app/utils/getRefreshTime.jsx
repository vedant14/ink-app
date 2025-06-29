export const getRefreshTimeInSeconds = () => {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const dayOfWeek = now.getDay();
  const hour = now.getHours();

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const eightAmToday = new Date(now);
  eightAmToday.setHours(8, 0, 0, 0);

  const nextEightAm = new Date(now);
  nextEightAm.setHours(8, 0, 0, 0);

  if (now.getTime() >= eightAmToday.getTime()) {
    nextEightAm.setDate(now.getDate() + 1);
  }

  const secondsUntilNext8AM = Math.round(
    (nextEightAm.getTime() - now.getTime()) / 1000
  );

  if (isWeekday && hour >= 8 && hour < 19) {
    return 30 * 60;
  }

  if (isWeekend && hour >= 8 && hour < 19) {
    return 3 * 60 * 60;
  }

  return secondsUntilNext8AM;
};
