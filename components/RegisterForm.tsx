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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { registerUser } from "@/actions/server/auth";
import Image from "next/image";

const RegisterForm = () => {
  const session = useSession();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      setLoading(true);

      const result = await registerUser({
        name: form.get("name")?.toString() ?? undefined,
        email: form.get("email")?.toString() ?? undefined,
        password: form.get("password")?.toString() ?? undefined,
      });

      if (!result?.success) {
        Swal.fire({
          icon: "error",
          title: "Already Registered. Please login.",
          timer: 1000,
          showConfirmButton: false,
        });
        return;
      }

      const res = await signIn("credentials", {
        email: form.get("email")?.toString() ?? "",
        password: form.get("password")?.toString() ?? "",
        redirect: false,
      });
      if (!res?.ok) {
        Swal.fire({
          icon: "error",
          title: "Login failed",
          timer: 1000,
          showConfirmButton: false,
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Account created & logged in.",
        timer: 1000,
        showConfirmButton: false,
      });

      setIsOpen(false);
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
    }
  };

  // console.log(session);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {session?.status === "authenticated" ? (
          ""
        ) : (
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 hover:cursor-pointer">
              Get Started
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleRegister}>
            <DialogHeader className="text-center">
              <DialogTitle>Sign Up!</DialogTitle>
              <DialogDescription>
                Create a new account to get started.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-5">
              <Field>
                <Label htmlFor="name-1">Name</Label>
                <Input
                  className="h-5"
                  id="name-1"
                  name="name"
                  placeholder="Your name"
                />
              </Field>
              <Field>
                <Label htmlFor="email-1">Email</Label>
                <Input
                  className="h-5"
                  id="email-1"
                  name="email"
                  placeholder="example@email.com"
                />
              </Field>
              <Field>
                <Label htmlFor="username-1">Password</Label>
                <Input
                  className="h-5 mb-2"
                  id="username-1"
                  name="password"
                  placeholder="Password"
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-indigo-800 hover:bg-indigo-900 hover:cursor-pointer w-full">
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </DialogFooter>
          </form>
          <div className="text-gray-500">
            <p className="text-center">Or, login with</p>
            <div className="flex justify-center gap-6">
              <Button
                onClick={handleGoogleLogin}
                variant="ghost"
                className="text-[12px] tracking-tight hover:cursor-pointer hover:bg-white p-0 items-center border-2 border-black">
                <Image width={12} height={12} alt="google" src={Google}></Image>{" "}
                Google
              </Button>
              <Button
                onClick={handleGithubLogin}
                variant="ghost"
                className="text-[12px] tracking-tight hover:cursor-pointer hover:bg-white p-0">
                <Image width={12} height={12} alt="google" src={Github}></Image>{" "}
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
