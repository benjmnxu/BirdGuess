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
  return <>bruh</>;
}
