import { prisma } from "@/lib/prisma";
import React from "react";

const page = async () => {
  const users = await prisma.user.findMany();
  console.log("from user page", users);
  return (
    <div>
      {users.map((user) => (
        <h2 key={user.id}>{user.name}</h2>
      ))}
    </div>
  );
};

export default page;
