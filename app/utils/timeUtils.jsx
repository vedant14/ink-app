export const isWorkingHours = (now) => {
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const currentTimeInMinutes = hour * 60 + minutes;
  const startTimeInMinutes = 10 * 60 + 30; // 10:30 AM
  const endTimeInMinutes = 17 * 60; // 5:00 PM

  return (
    currentTimeInMinutes >= startTimeInMinutes &&
    currentTimeInMinutes < endTimeInMinutes
  );
};


export const getSecondsUntilNextWorkdayStart = (now) => {
  const nextWorkdayStart = new Date(now);
  nextWorkdayStart.setHours(10, 30, 0, 0); // Set to 10:30:00.000 today

  // If it's already past 10:30 AM today, set the target for tomorrow
  if (now.getTime() >= nextWorkdayStart.getTime()) {
    nextWorkdayStart.setDate(now.getDate() + 1);
  }

  // Calculate the difference in milliseconds and convert to seconds
  const secondsUntilNextStart = Math.round(
    (nextWorkdayStart.getTime() - now.getTime()) / 1000
  );

  return secondsUntilNextStart;
};
