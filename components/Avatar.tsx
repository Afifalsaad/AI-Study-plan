"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function AvatarDropdown() {
  const { data: session, status } = useSession();
  const image = session?.user?.image ?? undefined;

  if (status === "loading") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:cursor-pointer">
        <Avatar>
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:cursor-pointer">
          <Avatar>
            <AvatarImage src={image || "/user.png"} alt="User avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-2 dark:bg-[#141135]">
        <DropdownMenuGroup>
          <Link href="/Summary">
            <DropdownMenuItem className="capitalize font-semibold block lg:hidden hover:cursor-pointer dark:hover:bg-[#7c86ff]">
              Summary
            </DropdownMenuItem>
          </Link>

          <Link href="/overview">
            <DropdownMenuItem className="capitalize font-semibold block sm:hidden hover:cursor-pointer dark:hover:bg-[#7c86ff]">
              Overview
            </DropdownMenuItem>
          </Link>

          <Link href="/">
            <DropdownMenuItem className="capitalize font-semibold hover:cursor-pointer dark:hover:bg-[#7c86ff]">
              Profile
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem className="capitalize font-semibold hover:cursor-pointer dark:hover:bg-[#7c86ff]">
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut()}
            className="capitalize font-semibold hover:cursor-pointer">
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
