"use client";

import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Please wait while we verify your email...</p>
    </div>
  );
}
