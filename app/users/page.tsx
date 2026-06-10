import { prisma } from "@/lib/prisma";
import React from "react";

const page = async () => {
  const users = await prisma.user.findMany();
//   console.log("from user page", users);
  return (
    <div>
      {users.map((user) => (
        <h2 key={user.id}>
          <li>{user.name}</li>
          <li>{user.email}</li>
          <li>{user.createdAt.toLocaleDateString()}</li>
        </h2>
      ))}
    </div>
  );
};

export default page;
