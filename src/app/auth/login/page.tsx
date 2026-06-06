"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SignInPage } from "@/components/ui/sign-in";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <SignInPage
      title={
        <>
          Welcome back to{" "}
          <span className="text-indigo-600">CompensIQ</span>
        </>
      }
      description="Real, anonymous compensation data for engineering roles across India."
      onSignIn={handleSubmit}
      onGoogleSignIn={() => signIn("google")}
      onCreateAccount={() => router.push("/auth/register")}
      onResetPassword={() => {}}
      error={error}
    />
  );
}
