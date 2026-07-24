"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Google from "../public/google.png";
import Github from "../public/github.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { loginSchema } from "@/schema/loginSchema";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

interface LoginFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
}

type RegisterErrors = Partial<Record<"email" | "password", string>>;

const LoginForm = ({
  isOpen,
  onOpenChange,
  onSwitchToRegister,
}: LoginFormProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // setLoading(true);

    const requestedUrl = searchParams.get("callbackUrl") || "/";
    const callbackUrl =
      requestedUrl.startsWith("/") && !requestedUrl.startsWith("//")
        ? requestedUrl
        : "/";

    setErrors({});

    const form = new FormData(e.currentTarget);

    const userInfo = {
      email: form.get("email"),
      password: form.get("password"),
    };

    const validatedData = loginSchema.safeParse(userInfo);
    if (!validatedData.success) {
      const fieldErrors = validatedData.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    const { email, password } = validatedData.data;
    try {
      setLoading(true);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Logged In Successfully!");
        onOpenChange(false);
        window.location.assign(callbackUrl);
      } else {
        toast.error("Email and Password didn't match.");
        onOpenChange(true);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const requestedUrl = searchParams.get("callbackUrl") || "/";
    const callbackUrl =
      requestedUrl.startsWith("/") && !requestedUrl.startsWith("//")
        ? requestedUrl
        : "/";
    await signIn("google", { callbackUrl });
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    const requestedUrl = searchParams.get("callbackUrl") || "/";
    const callbackUrl =
      requestedUrl.startsWith("/") && !requestedUrl.startsWith("//")
        ? requestedUrl
        : "/";
    await signIn("github", { callbackUrl });
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm gap-10 bg-accent">
          <form onSubmit={handleLogin}>
            <DialogHeader className="text-center">
              <DialogTitle>Log In</DialogTitle>
              <DialogDescription>
                Login to your account for get started.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4">
              <Field className="gap-2">
                <Label htmlFor="name-1">Email</Label>
                <Input
                  className="h-5"
                  id="name-1"
                  name="email"
                  placeholder="example@email.com"
                  required
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-500">
                    {errors.email}
                  </p>
                )}
              </Field>
              <Field className="gap-2">
                <Label htmlFor="username-1">Password</Label>
                <Input
                  className="h-5 mb-2"
                  id="username-1"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                />
                {errors.password && (
                  <p id="email-error" className="text-sm text-red-500 mb-2">
                    {errors.password}
                  </p>
                )}
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
                className="bg-indigo-800 hover:bg-indigo-900 hover:cursor-pointer w-full dark:text-white">
                {loading ? "Logging In..." : "Login"}
              </Button>
            </DialogFooter>
            <div className="flex justify-center gap-1 text-sm">
              <p>Don&apos;t have an account?</p>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 font-medium hover:underline cursor-pointer ">
                Sign up
              </button>
            </div>
          </form>
          <div className="text-gray-500">
            <p className="text-center text-sm mb-3">Or, login with</p>
            <div className="flex justify-center gap-6">
              <Button
                onClick={handleGoogleLogin}
                variant="ghost"
                className="text-[12px] tracking-tight hover:cursor-pointer hover:bg-white p-0 items-center h-0">
                <Image width={12} height={12} alt="google" src={Google}></Image>{" "}
                Google
              </Button>
              <Button
                onClick={handleGithubLogin}
                variant="ghost"
                className="text-[12px] tracking-tight hover:cursor-pointer hover:bg-white p-0 h-0">
                <Image width={12} height={12} alt="github" src={Github}></Image>{" "}
                Github
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginForm;
