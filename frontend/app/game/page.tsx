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
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState([false, false, false, false]);
  const [shake, setShake] = useState([false, false, false, false]);
  const [incorrect, setIncorrect] = useState(false);
  const [guesses, setGuesses] = useState(0);
  const [endRound, setEndRound] = useState(false);

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
    if (!chosen[index]) {
      setGuesses(guesses + 1);
    }
    let newChosen = [...chosen];
    newChosen[index] = true;
    setChosen(newChosen);
    if (index == correct) {
      setEndRound(true);
    } else {
      setIncorrect(true);
      let newShake = [...shake];
      newShake[index] = true;
      setShake(newShake);
      setTimeout(() => {
        setShake([false, false, false, false]);
      }, 200);
    }
  }

  function reset() {
    setAudio(
      "https://xeno-canto.org/sounds/uploaded/OH38YHKJBS/black_capped_sparrow.mp3"
    );
    setChoices(["China", "USA", "Russia", "Canada"]);
    setCorrect(0);
    setChosen([false, false, false, false]);
    setShake([false, false, false, false]);
    setIncorrect(false);
    setGuesses(0);
    setEndRound(false);
  }

  return (
    <div className="h-full text-text-primary">
      <Header />
      <div className="mt-16 md:mt-32 mb-24 md:mb-40 container mx-auto max-w-screen-lg px-6 flex flex-col items-center">
        <ReactAudioPlayer src={audio} autoPlay controls />
        {endRound ? (
          <div className="flex flex-col items-center">
            <div className="mt-12 text-lg">You got it!</div>
            <div className="mt-6 text-4xl font-bold">
              The bird was recorded in {choices[correct]}
            </div>
            <div className="mt-6 text-lg">
              You used <b>{guesses} / 4</b> guesses
            </div>
            <button className="mt-12 btn-small md:btn" onClick={() => reset()}>
              Next round
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mt-12 text-4xl font-bold">
              Where was the bird recorded?
            </div>
            <div className="mt-8 text-lg">
              Hint: this country's <b>{"indicator"}</b> is <b>{"value"}</b>
            </div>
            <div className="w-[36rem] mt-12 flex flex-col space-y-8">
              {choices.map((choice, index) => {
                return (
                  <button
                    className={
                      (chosen[index]
                        ? index == correct
                          ? "btn-wide-orange"
                          : "btn-wide-red"
                        : "btn-wide-white") +
                      (shake[index] ? " animate-wiggle" : "")
                    }
                    onClick={() => choose(index)}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            <div className="mt-12 text-lg">
              You have used <b>{guesses} / 4</b> guesses
              {incorrect ? ", guess again!" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
