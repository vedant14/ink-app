import { todoist } from "../utils/todoist";

export async function loader({ params }) {
  try {
    if (params.projectId === "get-tasks") {
      return [];
    }
    const tasks = await todoist.getTasks({
      projectId: params.projectId,
    });
    return tasks;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function Product({ loaderData }) {
  const { results } = loaderData;
  return (
    <div>
      <h1>Work Tasks (Today & Overdue)</h1>
      {results && results.length > 0 ? (
        <ul>
          {results.map((task) => (
            <li key={task.id}>{task.content}</li>
          ))}
        </ul>
      ) : (
        <p>No matching tasks found.</p>
      )}
    </div>
  );
}
