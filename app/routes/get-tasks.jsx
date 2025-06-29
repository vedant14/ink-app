import { generateTaskBMP } from "../utils/bmpImage";
import { todoist } from "../utils/todoist";

export async function loader({ params }) {
  try {
    let tasks;
    const projects = await todoist.getProjects();
    if (!params.projectId) {
      tasks = await todoist.getTasksByFilter({
        query: "today | overdue",
      });
    } else {
      tasks = await todoist.getTasks({
        projectId: params.projectId,
      });
    }
    const bmpBuffer = generateTaskBMP(
      tasks.results.slice(0, 6),
      projects.results
    );
    const base64Image = bmpBuffer.toString("base64");
    const refreshTime = 1 * 60;

    // KEY CHANGE 3: Return a structured JSON object
    return {
      imageData: base64Image,
      nextRefreshAfter: refreshTime,
    };
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function Tasks({ loaderData }) {
  if (loaderData.error) {
    return <div>Error: {loaderData.error}</div>;
  }
  const { imageData, nextRefreshAfter } = loaderData;
  const imageSrc = `data:image/bmp;base64,${imageData}`;

  return (
    <div>
      <img
        src={imageSrc}
        alt="A BMP image showing a list of tasks"
        style={{ border: "1px solid black", maxWidth: "100%" }}
      />
      <p style={{ fontFamily: "monospace", marginTop: "10px" }}>
        Next refresh after: {nextRefreshAfter}
      </p>
    </div>
  );
}
