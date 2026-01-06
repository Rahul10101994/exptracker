
"use client";

import { ForgotPasswordForm } from "@/components/fintrack/forgot-password-form";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <Image
        src="https://picsum.photos/seed/reset/1200/800"
        alt="Person thinking"
        data-ai-hint="thinking forgot"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />
      
      <Link href="/" className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white bg-black/20 backdrop-blur-sm p-2 rounded-lg">
        <ChevronLeft size={20} />
        Back to Login
      </Link>

      <div className="relative z-10 w-full max-w-sm rounded-xl bg-background/15 p-6 backdrop-blur-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground">
            Enter your email to reset your password
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
