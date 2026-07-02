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
            <AvatarImage
              src={image || "/user.png"}
              alt="User avatar"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-2 dark:bg-[#141135]">
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer dark:hover:bg-[#7c86ff]">
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer dark:hover:bg-[#7c86ff]">
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer dark:hover:bg-[#7c86ff]">
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut()}
            className="hover:cursor-pointer">
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
