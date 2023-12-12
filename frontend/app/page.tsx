"use client";

import Header from "./components/Header";
import Spline from "@splinetool/react-spline";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Home() {
  const { user, error, isLoading } = useUser();

  return (
    <div className="h-full text-text-primary">
      <Header />
      <div className="mt-48 md:mt-72 mb-24 md:mb-40 min-h-[36vh] container mx-auto max-w-screen-lg px-6 flex flex-row justify-between items-center">
        <div className="flex flex-col justify-center items-start">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-center">
            Bird
            <span className="bg-primary text-text-secondary bg-gradient-to-r from-primary to-primary-alt rounded px-2 ml-2">
              hub
            </span>
          </h1>
          <h2 className="my-12 text-base md:text-lg font-medium">
            Guess the country based on the bird sound!
          </h2>
          <div className="flex flex-row justify-center">
            <Link href="/game">
              <button className="btn-small md:btn">
                {user ? "Play" : "Login"}
              </button>
            </Link>
          </div>
        </div>
        <div className="w-[36vw]">
          <Spline
            className="scale-100"
            scene="https://prod.spline.design/2D-l5Q34osSms3Pp/scene.splinecode"
          />
        </div>
      </div>
    </div>
  );
}
