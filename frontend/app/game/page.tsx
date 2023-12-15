"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import ReactAudioPlayer from "react-audio-player";
import { Loader } from "react-feather";
import Header from "../components/Header";
const config = require("../../../backend/config.json");

export default function Home() {
  const { user, error, isLoading } = useUser();
  const [vernacular, setVernacular] = useState("");
  const [scientific, setScientific] = useState("");
  const [audio, setAudio] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [year, setYear] = useState(0);
  const [indicator, setIndicator] = useState("");
  const [value, setValue] = useState(0);
  const [newVernacular, setNewVernacular] = useState("");
  const [newIndicator, setNewIndicator] = useState("");
  const [newValue, setNewValue] = useState(0);

  const [loading, setLoading] = useState(true);
  const [play, setPlay] = useState(false);
  const [chosen, setChosen] = useState([false, false, false, false]);
  const [shake, setShake] = useState([false, false, false, false]);
  const [incorrect, setIncorrect] = useState(false);
  const [guesses, setGuesses] = useState(0);
  const [endRound, setEndRound] = useState(false);

  useEffect(() => {
    reset();
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
      fetch(
        `http://${config.server_host}:${config.server_port}/countryfact/${choices[correct]}`
      )
        .then((res) => res.json())
        .then((resJson) => {
          console.log(resJson);
          setYear(resJson["year"]);
          setIndicator(resJson["indicatorName"]);
          setValue(resJson["value"]);
        });
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
    setLoading(true);
    setPlay(false);
    fetch(`http://${config.server_host}:${config.server_port}/newbird`)
      .then((res) => res.json())
      .then((resJson) => {
        setVernacular(resJson["vernacularName"]);
        setScientific(resJson["scientificName"]);
        setAudio(resJson["accessURI"]);
        let correctCountry = resJson["country"];
        let choices = [correctCountry];
        fetch(
          `http://${config.server_host}:${config.server_port}/othercountries/${correctCountry}`
        )
          .then((res) => res.json())
          .then((resJson) => {
            resJson.forEach((country: any) => {
              choices.push(country["country"]);
            });
            choices = shuffle(choices);
            setChoices(choices);
            setCorrect(
              choices.findIndex((el) => {
                return el == correctCountry;
              })
            );
            fetch(
              `http://${config.server_host}:${config.server_port}/countryfact/${correctCountry}`
            )
              .then((res) => res.json())
              .then((resJson) => {
                setYear(resJson["year"]);
                setIndicator(resJson["indicatorName"]);
                setValue(resJson["value"]);

                setChosen([false, false, false, false]);
                setShake([false, false, false, false]);
                setIncorrect(false);
                setGuesses(0);
                setEndRound(false);
                setPlay(true);
                setLoading(false);
                fetch(
                  `http://${config.server_host}:${config.server_port}/randomcountrybirdandfact/${correctCountry}`
                )
                  .then((res) => res.json())
                  .then((resJson) => {
                    setNewVernacular(resJson["vernacularName"]);
                    setNewIndicator(resJson["indicatorName"]);
                    setNewValue(resJson["averageValue"]);
                  });
              });
          });
      });
  }

  function shuffle(array: string[]) {
    let currentIndex = array.length,
      randomIndex;

    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

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
            Loading game...
          </button>
        </div>
      ) : (
        <div className="mt-16 md:mt-32 mb-24 md:mb-40 container mx-auto max-w-screen-lg px-6 flex flex-col items-center">
          <ReactAudioPlayer src={audio} autoPlay={play} controls />
          {endRound ? (
            <div className="flex flex-col items-center">
              <div className="mt-12 text-lg">
                You got it! You used <b>{guesses} / 4</b> guesses
              </div>
              <div className="mt-6 text-4xl font-bold">
                {vernacular} was recorded in {choices[correct]}
              </div>
              <div className="mt-6 text-lg">Country facts</div>
              <div className="mt-6 text-lg">
                {newVernacular} has also been recorded in {choices[correct]}
              </div>
              <div className="mt-6 text-lg">
                In {choices[correct]}, the average {newIndicator} is {newValue}
              </div>
              <button className="mt-12 btn" onClick={() => reset()}>
                Next round
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mt-12 text-4xl font-bold">
                Where was the bird recorded?
              </div>
              <div className="mt-8 text-lg text-center">
                Hint: in <b>{year}</b>, this country's <b>{indicator}</b> is{" "}
                <b>{value}</b>
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
                      key={choice}
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
      )}
    </div>
  );
}
