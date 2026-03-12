import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, redirect, useNavigation, useSubmit } from "react-router";
import { createAuthSession, getOptionalAuth, login } from "../lib/auth.server";
import { loginSchema, type LoginSchema } from "../lib/schemas";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login | The Biergarten App" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await getOptionalAuth(request);
  if (auth) throw redirect("/dashboard");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const result = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const payload = await login(result.data.username, result.data.password);
    return createAuthSession(payload, "/dashboard");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Login failed." };
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((data) => {
    submit(data, { method: "post" });
  });

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div className="text-center">
            <h1 className="card-title text-3xl justify-center">Login</h1>
            <p className="text-base-content/70">
              Sign in to your Biergarten account
            </p>
          </div>

          {actionData?.error && (
            <div role="alert" className="alert alert-error alert-soft">
              <span>{actionData.error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Username</legend>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="your_username"
                className={`input w-full ${errors.username ? "input-error" : ""}`}
                {...register("username")}
              />
              {errors.username && (
                <p className="label text-error">{errors.username.message}</p>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`input w-full ${errors.password ? "input-error" : ""}`}
                {...register("password")}
              />
              {errors.password && (
                <p className="label text-error">{errors.password.message}</p>
              )}
            </fieldset>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />{" "}
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="divider text-xs">New here?</div>

          <div className="text-center space-y-2">
            <Link to="/register" className="btn btn-outline btn-sm w-full">
              Create an account
            </Link>
            <Link
              to="/"
              className="link link-hover text-sm text-base-content/60"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
