"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { STORAGE_KEYS } from "@/lib/config";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.accessToken);
    if (token) router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white text-black">
      <AuthForm onSuccess={() => router.replace("/")} />
    </div>
  );
}


