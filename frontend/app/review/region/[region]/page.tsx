"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Loader } from "react-feather";
import Header from "../../../components/Header";
const config = require("../../../../../backend/config.json");

export default function Region({ params }: { params: { region: string } }) {
  const { user, error, isLoading } = useUser();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

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
      {loading ? (
        <div className="mt-48 md:mt-72 mb-24 md:mb-40 container mx-auto max-w-screen-lg px-6 flex flex-col items-center">
          <button
            type="button"
            className="btn flex justify-center items-center"
            disabled
          >
            <Loader className="mr-4 animate-spin" />
            Loading data...
          </button>
        </div>
      ) : (
        <div className="mt-16 md:mt-32 mb-12 md:mb-24 container mx-auto max-w-screen-lg px-6 flex flex-col items-center">
          {params.region}
        </div>
      )}
    </div>
  );
}
