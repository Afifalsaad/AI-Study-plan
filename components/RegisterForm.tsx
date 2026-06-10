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
import { signIn, signOut, useSession } from "next-auth/react";
import Swal from "sweetalert2";

const RegisterForm = () => {
  const session = useSession();
  const [isOpen, setIsOpen] = useState<boolean>(false);
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

    if (result?.ok) {
      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "Logged In",
          timer: 1000,
          showConfirmButton: false,
        });
        setIsOpen(false);
        setLoading(false);
      }, 1500);
    } else {
      setIsOpen(false);
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "User Not Found",
        text: "Email and Password didn't match.",
        confirmButtonText: "Try Again",
      }).then((result) => {
        if (result.isConfirmed) {
          setIsOpen(true);
        }
      });
    }
  };
  console.log("from login form", session);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {session?.status === "authenticated" ? (
          ""
        ) : (
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
              Get Started
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="sm:max-w-sm">
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
                {loading ? "Logging In..." : "Login"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterForm;
