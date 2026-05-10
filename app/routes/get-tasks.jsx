import { generateQuoteBMP, generateTaskBMP } from "../utils/bmpImage";
import {
  isWorkingHours,
  getSecondsUntilNextWorkdayStart,
} from "../utils/timeUtils";
import { todoist } from "../utils/todoist";
import quotes from "../data/quotes.json";

export async function loader({ params }) {
  try {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    if (isWorkingHours(now)) {
      const projects = await todoist.getProjects();
      const tasks = await todoist.getTasksByFilter({
        query: "today | overdue",
      });
      const tomorrowTasks = await todoist.getTasksByFilter({
        query: "tomorrow",
      });

      let dailyTasks = [];
      let weeklyTasks = [];
      tasks.results.forEach((task) => {
        if (task.projectId === "6cvq3vGXcWHfxvc5") {
          weeklyTasks.push(task);
        } else {
          dailyTasks.push(task);
        }
      });

      console.log(weeklyTasks, dailyTasks);

      const getRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
      };
      const quote = getRandomQuote();
      const bmpBuffer = generateTaskBMP(
        weeklyTasks.slice(0, 3),
        dailyTasks.slice(0, 6),
        dailyTasks.length,
        tomorrowTasks.results.length,
        projects.results,
        quote,
      );
      const base64Image = bmpBuffer.toString("base64");
      return {
        imageData: base64Image,
        nextRefreshAfter: 30 * 60, // 30 minutes in seconds
      };
    } else {
      const getRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
      };
      const quote = getRandomQuote();

      const rawBuffer = generateQuoteBuffer(quote);
      const base64Image = rawBuffer.toString("base64");
      const refreshTime = getSecondsUntilNextWorkdayStart(now);
      return {
        imageData: base64Image,
        nextRefreshAfter: refreshTime,
      };
    }
  } catch (error) {
    console.error("Failed to generate image:", error);
    return { error: "An error occurred." };
  }
}

// export function HydrateFallback() {
//   return <div>Loading...</div>;
// }
// export default function Tasks({ loaderData }) {
//   if (loaderData.error) {
//     return <div>Error: {loaderData.error}</div>;
//   }
//   const { imageData, nextRefreshAfter } = loaderData;
//   const imageSrc = `data:image/bmp;base64,${imageData}`;

//   return (
//     <div>
//       <img
//         src={imageSrc}
//         alt="A BMP image showing a list of tasks"
//         style={{ border: "1px solid black", maxWidth: "100%" }}
//       />
//       <p style={{ fontFamily: "monospace", marginTop: "10px" }}>
//         Next refresh after: {nextRefreshAfter}
//       </p>
//     </div>
//   );
// }
