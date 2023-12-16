import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Header() {
  const { user, error, isLoading } = useUser();
  return (
    <div className="absolute top-0 left-0 right-0 z-10 container mx-auto max-w-screen-xl px-6 flex justify-between items-center my-4 md:my-6 bg-background-primary text-text-primary">
      <Link href="/" className="text-xl font-bold text-left">
        Bird
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-alt">
          Guess
        </span>
      </Link>
      {user ? (
        <div className="flex items-center">
          <Link
            href="/review"
            className="mr-24 font-medium text-sm md:text-base"
          >
            Review
          </Link>
          <Link href="/profile">
            <div className="ml-4 w-8 aspect-square relative">
              <Image
                src={user.picture!}
                fill={true}
                alt="Capybara.AI"
                style={{
                  objectFit: "cover",
                  overflow: "hidden",
                  borderRadius: "100%",
                }}
              />
            </div>
          </Link>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
