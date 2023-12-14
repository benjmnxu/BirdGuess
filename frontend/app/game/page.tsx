"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import ReactAudioPlayer from "react-audio-player";
import Header from "../components/Header";

export default function Home() {
  const { user, error, isLoading } = useUser();
  const [audio, setAudio] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [chosen, setChosen] = useState([false, false, false, false]);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    setAudio(
      "https://xeno-canto.org/sounds/uploaded/OH38YHKJBS/black_capped_sparrow.mp3"
    );
    setChoices(["China", "USA", "Russia", "Canada"]);
    setCorrect(0);
  }, []);

  useEffect(() => {
    if (isLoading == false) {
      if (user == null) {
        redirect("/api/auth/login");
      }
    }
  }, [isLoading]);

  function choose(index: number) {
    console.log(index);
    let newChosen = [...chosen];
    newChosen[index] = true;
    setChosen(newChosen);
    if (index == correct) {
    }
  }

  return (
    <div className="h-full text-text-primary">
      <Header />
      <div className="mt-16 md:mt-32 mb-24 md:mb-40 container mx-auto max-w-screen-lg px-6 flex flex-col items-center">
        <ReactAudioPlayer src={audio} autoPlay controls />
        <div className="mt-16 text-4xl font-bold">
          Where was the bird recorded?
        </div>
        <div className="mt-8 text-lg">
          Hint: this country's <b>{"indicator"}</b> is <b>{"value"}</b>
        </div>
        <div className="w-[36rem] mt-16 flex flex-col space-y-8">
          {choices.map((choice, index) => {
            return (
              <button
                className={
                  chosen[index]
                    ? index == correct
                      ? "btn-wide-orange"
                      : "btn-wide-red"
                    : "btn-wide-white"
                }
                onClick={() => choose(index)}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
