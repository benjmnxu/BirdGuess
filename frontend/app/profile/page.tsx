"use client";

import Header from "../components/Header";
import Spline from "@splinetool/react-spline";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Home() {
  const { user, error, isLoading } = useUser();
  if (user == null) {
    redirect("/api/auth/login");
  }
  return (
    <div className="h-full text-text-primary">
      <Header />
      <div className="mt-24 md:mt-40 mb-24 md:mb-40 container mx-auto max-w-screen-lg px-6 flex flex-col items-center">
        <a href="/api/auth/logout">
          <button className="btn-small md:btn">Logout</button>
        </a>
      </div>
    </div>
  );
}
