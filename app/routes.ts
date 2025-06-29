// routes.js

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("get-image", "routes/get-image.jsx"),
  route("get-tasks/:projectId?", "routes/get-tasks.jsx"),
  route("*", "routes/404.jsx"),
] satisfies RouteConfig;