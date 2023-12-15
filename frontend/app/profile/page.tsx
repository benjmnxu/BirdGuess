"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import Header from "../components/Header";

export default function Home() {
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    if (isLoading == false) {
      if (user == null) {
        redirect("/api/auth/login");
      }
    }
  }, [isLoading]);
  return (
    <div className="h-full text-text-primary">
      <Header />
      <div className="mt-16 md:mt-32 mb-24 md:mb-40 container mx-auto max-w-screen-lg px-6 flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center text-sm md:text-base">
          <div className="mb-4 w-24 aspect-square relative">
            <Image
              src={user?.picture!}
              fill={true}
              alt="Capybara.AI"
              style={{
                objectFit: "cover",
                overflow: "hidden",
                borderRadius: "100%",
              }}
            />
          </div>
          <div className="text-base">{user?.nickname}</div>
        </div>
        <a href="/api/auth/logout">
          <button className="btn">Logout</button>
        </a>
      </div>
    </div>
  );
}
