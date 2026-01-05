"use client";

import { LoginForm } from "@/components/fintrack/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <Image
        src="https://picsum.photos/seed/budget/1200/800"
        alt="Financial documents and a laptop"
        data-ai-hint="finance budget"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-sm rounded-xl bg-background/80 p-6 backdrop-blur-sm">
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
