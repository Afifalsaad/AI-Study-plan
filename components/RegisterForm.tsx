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
import { signIn, useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { registerUser } from "@/actions/server/auth";
import Image from "next/image";
import { registerSchema } from "@/schema/registerSchema";
import toast from "react-hot-toast";

interface RegisterFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

type RegisterErrors = Partial<Record<"name" | "email" | "password", string>>;

const RegisterForm = ({
  isOpen,
  onOpenChange,
  onSwitchToLogin,
}: RegisterFormProps) => {
  const session = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<RegisterErrors>({});

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});

    const form = new FormData(e.currentTarget);

    const data = {
      name: form.get("name")?.toString() ?? undefined,
      email: form.get("email")?.toString() ?? undefined,
      password: form.get("password")?.toString() ?? undefined,
    };

    const validatedData = registerSchema.safeParse(data);
    if (!validatedData.success) {
      const fieldErrors = validatedData.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    const { name, email, password } = validatedData.data;
    try {
      setLoading(true);

      const result = await registerUser({
        name,
        email,
        password,
      });

      if (!result?.success) {
        setErrors({
          email:
            result?.message ??
            "This email is already registered. Please log in.",
        });
        return;
      }

      const res = await signIn("credentials", {
        email: form.get("email")?.toString() ?? "",
        password: form.get("password")?.toString() ?? "",
        redirect: false,
      });
      if (!res?.ok) {
        toast.error("Login Failed");
        return;
      }
      onOpenChange(false);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google");
    const user = session?.data?.user;
    if (!user) return;
    try {
      await registerUser({
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        image: user.image ?? undefined,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    await signIn("github");
    const user = session?.data?.user;
    if (!user) return;
    try {
      await registerUser({
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        image: user.image ?? undefined,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleRegister}>
            <DialogHeader className="text-center">
              <DialogTitle>Sign Up!</DialogTitle>
              <DialogDescription>
                Create a new account to get started.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4">
              <Field>
                <Label htmlFor="name-1">Name</Label>
                <Input
                  className="h-5"
                  id="name-1"
                  name="name"
                  placeholder="Your name"
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="email-1">Email</Label>
                <Input
                  className="h-5"
                  id="email-1"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  required
                />
              </Field>
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500">
                  {errors.email}
                </p>
              )}
              <Field>
                <Label htmlFor="username-1">Password</Label>
                <Input
                  className="h-5  mb-2"
                  id="username-1"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                />
                {errors.password && (
                  <p id="email-error" className=" mb-2 text-sm text-red-500">
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
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </DialogFooter>
            <div className="flex justify-center gap-1 text-sm">
              <p>Already have an account?</p>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 font-medium hover:underline cursor-pointer ">
                Login
              </button>
            </div>
          </form>
          <div className="text-gray-500">
            <p className="text-center text-sm mb-3">or, login with</p>
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

export default RegisterForm;
