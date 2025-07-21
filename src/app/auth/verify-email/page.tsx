"use client";

import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();

  // Du kannst hier z.B. einen useEffect verwenden, wenn du möchtest
  // useEffect(() => {
  //   // Beispiel-Redirect nach 2 Sekunden:
  //   const timer = setTimeout(() => {
  //     router.push("/");
  //   }, 2000);
  //   return () => clearTimeout(timer);
  // }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Please wait while we verify your email...</p>
    </div>
  );
}
