import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, redirect, useNavigation, useSubmit } from "react-router";
import FormField from "../components/forms/FormField";
import SubmitButton from "../components/forms/SubmitButton";
import { showErrorToast } from "../components/toast/toast";
import { createAuthSession, getOptionalAuth, register } from "../lib/auth.server";
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
    const body = {
      username: result.data.username,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email,
      dateOfBirth: result.data.dateOfBirth,
      password: result.data.password,
    };
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

  useEffect(() => {
    if (actionData?.error) {
      showErrorToast(actionData.error);
    }
  }, [actionData?.error]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div className="text-center">
            <h1 className="card-title text-3xl justify-center">Register</h1>
            <p className="text-base-content/70">Create your Biergarten account</p>
          </div>

          {actionData?.error && (
            <div role="alert" className="alert alert-error alert-soft">
              <span>{actionData.error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <FormField
              id="username"
              type="text"
              autoComplete="username"
              placeholder="your_username"
              label="Username"
              hint="3-64 characters, alphanumeric and . _ -"
              error={errors.username?.message}
              {...field("username")}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Jane"
                label="First Name"
                error={errors.firstName?.message}
                {...field("firstName")}
              />

              <FormField
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Doe"
                label="Last Name"
                error={errors.lastName?.message}
                {...field("lastName")}
              />
            </div>

            <FormField
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              label="Email"
              error={errors.email?.message}
              {...field("email")}
            />

            <FormField
              id="dateOfBirth"
              type="date"
              label="Date of Birth"
              hint="Must be 19 years or older"
              error={errors.dateOfBirth?.message}
              {...field("dateOfBirth")}
            />

            <FormField
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              label="Password"
              hint="8+ chars: uppercase, lowercase, digit, special character"
              error={errors.password?.message}
              {...field("password")}
            />

            <FormField
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              label="Confirm Password"
              error={errors.confirmPassword?.message}
              {...field("confirmPassword")}
            />

            <SubmitButton
              isSubmitting={isSubmitting}
              idleText="Create Account"
              submittingText="Creating account..."
            />
          </form>

          <div className="divider text-xs">Already have an account?</div>

          <div className="text-center space-y-2">
            <Link to="/login" className="btn btn-outline btn-sm w-full">
              Sign in
            </Link>
            <Link to="/" className="link link-hover text-sm text-base-content/60">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
