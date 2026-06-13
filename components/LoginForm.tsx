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
import Swal from "sweetalert2";
import Image from "next/image";

interface LoginFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
}

const LoginForm = ({
  isOpen,
  onOpenChange,
  onSwitchToRegister,
}: LoginFormProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const userInfo = {
      email: form.get("email"),
      password: form.get("password"),
    };

    const result = await signIn("credentials", {
      email: userInfo.email,
      password: userInfo.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.ok) {
      Swal.fire({
        icon: "success",
        title: "Logged In",
        timer: 1000,
        showConfirmButton: false,
      });
      onOpenChange(false);
    } else {
      onOpenChange(false);
      Swal.fire({
        icon: "error",
        title: "User Not Found",
        text: "Email and Password didn't match.",
        confirmButtonText: "Try Again",
      }).then((result) => {
        if (result.isConfirmed) {
          onOpenChange(true);
        }
      });
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google");
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    await signIn("github");
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm gap-10">
          <form onSubmit={handleLogin}>
            <DialogHeader className="text-center">
              <DialogTitle>Log In</DialogTitle>
              <DialogDescription>
                Login to your account for get started.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label htmlFor="name-1">Email</Label>
                <Input
                  className="h-5"
                  id="name-1"
                  name="email"
                  placeholder="example@email.com"
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="username-1">Password</Label>
                <Input
                  className="h-5 mb-2"
                  id="username-1"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                />
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
