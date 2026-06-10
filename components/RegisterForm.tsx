"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
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
        email: String(form.get("email")),
        password: String(form.get("password")),
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterForm;
