
"use client";

import { LoginForm } from "@/components/fintrack/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to continue to FinTrack
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
