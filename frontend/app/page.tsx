"use client";

import Spline from "@splinetool/react-spline";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import Header from "./components/Header";

export default function Home() {
  const { user, error, isLoading } = useUser();

  return (
    <div className="h-full text-text-primary">
      <Header />
      <div className="mt-48 md:mt-72 mb-24 md:mb-40 min-h-[36vh] container mx-auto max-w-screen-lg px-6 flex flex-row justify-between items-center">
        <div className="flex flex-col justify-center items-start">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-center">
            Bird
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-alt">
              Guess
            </span>
          </h1>
          <h2 className="my-12 text-base md:text-lg font-medium">
            Guess the country based on the bird sound!
          </h2>
          <div className="flex flex-row justify-center">
            <Link href="/game">
              <button className="btn">{user ? "Play" : "Login"}</button>
            </Link>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div
            className="w-[36vw] h-[36vh] rounded bg-cover"
            style={{
              backgroundImage:
                "url(https://assets-global.website-files.com/615b76588f53c50835338a18/646374d7aa7aae1186a847ea_CleanShot%202023-05-16%20at%2008.14.14%402x.png)",
            }}
          >
            <Spline
              className="scale-100"
              scene="https://prod.spline.design/6Izjah8jWe-79F53/scene.splinecode"
            />
          </div>
          <div className="mt-2 text-xs">try moving with WASD {":)"}</div>
        </div>
      </div>
    </div>
  );
}
