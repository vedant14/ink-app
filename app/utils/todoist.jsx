import { TodoistApi } from "@doist/todoist-api-typescript";

export const todoist = new TodoistApi(process.env.TODOIST_TOKEN);
