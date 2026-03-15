import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("theme", "routes/theme.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("logout", "routes/logout.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("confirm", "routes/confirm.tsx"),
  route("beers", "routes/beers.tsx"),
  route("breweries", "routes/breweries.tsx"),
  route("beer-styles", "routes/beer-styles.tsx"),
] satisfies RouteConfig;
