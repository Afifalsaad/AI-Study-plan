"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
}): Promise<
  | {
      success: true;
      user: {
        id: number;
        name: string | null;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  | { success: false; message: string }
  | null
> => {
  const { name, email, password } = payload;
  console.log("SERVER ACTION RUNNING", payload);

  if (!email || !password) return null;

  const isExist = await prisma.user.findUnique({
    where: { email },
  });
  if (isExist) {
    return { success: false, message: "User already exist" };
  }

  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: await bcrypt.hash(password, 10),
    },
  });

  return { success: true, user };
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<{ id: number; name: string | null; email: string; password: string; createdAt: Date; updatedAt: Date } | null> => {
  const { email, password } = payload;
  console.log("from login server", payload);

  if (!email || !password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const isMatched = await bcrypt.compare(password, user.password);
  if (isMatched) {
    return user;
  } else {
    return null;
  }
};
