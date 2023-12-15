"use client";

import { useEffect } from "react";
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
    </div>
  );
}
