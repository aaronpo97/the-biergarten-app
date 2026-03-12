import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, redirect, useNavigation, useSubmit } from "react-router";
import {
  createAuthSession,
  getOptionalAuth,
  register,
} from "../lib/auth.server";
import { registerSchema, type RegisterSchema } from "../lib/schemas";
import type { Route } from "./+types/register";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Register | The Biergarten App" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await getOptionalAuth(request);
  if (auth) throw redirect("/dashboard");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const result = registerSchema.safeParse({
    username: formData.get("username"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    dateOfBirth: formData.get("dateOfBirth"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return { error: null, fieldErrors };
  }

  try {
    const { confirmPassword: _, ...body } = result.data;
    const payload = await register(body);
    return createAuthSession(payload, "/dashboard");
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Registration failed.",
      fieldErrors: null,
    };
  }
}

export default function Register({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit((data) => {
    submit(data, { method: "post" });
  });

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div className="text-center">
            <h1 className="card-title text-3xl justify-center">Register</h1>
            <p className="text-base-content/70">
              Create your Biergarten account
            </p>
          </div>

          {actionData?.error && (
            <div role="alert" className="alert alert-error alert-soft">
              <span>{actionData.error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Username</legend>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="your_username"
                className={`input w-full ${errors.username ? "input-error" : ""}`}
                {...field("username")}
              />
              {errors.username ? (
                <p className="label text-error">{errors.username.message}</p>
              ) : (
                <p className="label">3-64 characters, alphanumeric and . _ -</p>
              )}
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">First Name</legend>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jane"
                  className={`input w-full ${errors.firstName ? "input-error" : ""}`}
                  {...field("firstName")}
                />
                {errors.firstName && (
                  <p className="label text-error">{errors.firstName.message}</p>
                )}
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Last Name</legend>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  className={`input w-full ${errors.lastName ? "input-error" : ""}`}
                  {...field("lastName")}
                />
                {errors.lastName && (
                  <p className="label text-error">{errors.lastName.message}</p>
                )}
              </fieldset>
            </div>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email</legend>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                className={`input w-full ${errors.email ? "input-error" : ""}`}
                {...field("email")}
              />
              {errors.email && (
                <p className="label text-error">{errors.email.message}</p>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Date of Birth</legend>
              <input
                id="dateOfBirth"
                type="date"
                className={`input w-full ${errors.dateOfBirth ? "input-error" : ""}`}
                {...field("dateOfBirth")}
              />
              {errors.dateOfBirth ? (
                <p className="label text-error">{errors.dateOfBirth.message}</p>
              ) : (
                <p className="label">Must be 19 years or older</p>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={`input w-full ${errors.password ? "input-error" : ""}`}
                {...field("password")}
              />
              {errors.password ? (
                <p className="label text-error">{errors.password.message}</p>
              ) : (
                <p className="label">
                  8+ chars: uppercase, lowercase, digit, special character
                </p>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Confirm Password</legend>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={`input w-full ${errors.confirmPassword ? "input-error" : ""}`}
                {...field("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="label text-error">
                  {errors.confirmPassword.message}
                </p>
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="divider text-xs">Already have an account?</div>

          <div className="text-center space-y-2">
            <Link to="/login" className="btn btn-outline btn-sm w-full">
              Sign in
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
