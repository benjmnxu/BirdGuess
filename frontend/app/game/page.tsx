"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import ReactAudioPlayer from "react-audio-player";
import { Loader } from "react-feather";
import OpenAI from "openai";
import Header from "../components/Header";
const config = require("../../../backend/config.json");

export default function Game() {
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
  const [newCountry, setNewCountry] = useState("");
  const [newYear, setNewYear] = useState(0);
  const [newMetric, setNewMetric] = useState(0);
  const [newBirds, setNewBirds] = useState(["", "", "", "", ""]);
  const [newCountries, setNewCountries] = useState(["", "", "", "", ""]);
  const [newValues, setNewValues] = useState([0, 0, 0, 0, 0]);
  const [img, setImg] = useState("");

  const [loading, setLoading] = useState(true);
  const [play, setPlay] = useState(false);
  const [chosen, setChosen] = useState([false, false, false, false]);
  const [shake, setShake] = useState([false, false, false, false]);
  const [incorrect, setIncorrect] = useState(false);
  const [guesses, setGuesses] = useState(0);
  const [endRound, setEndRound] = useState(false);

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

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

  async function reset() {
    setLoading(true);
    setPlay(false);
    setImg("");
    setNewBirds(["", "", "", "", ""]);
    fetch(`http://${config.server_host}:${config.server_port}/newbird`)
      .then((res) => res.json())
      .then((resJson) => {
        setVernacular(resJson["vernacularName"]);
        setScientific(resJson["scientificName"]);
        setAudio(resJson["accessURI"]);
        let vernacular = resJson["vernacularName"];
        let correctCountry = resJson["country"];
        let genus = resJson["genus"];
        let id = resJson["id"];
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
                  `http://${config.server_host}:${config.server_port}/randomcountrybirdandfact/${correctCountry}/${vernacular}`
                )
                  .then((res) => res.json())
                  .then((resJson) => {
                    setNewVernacular(resJson["vernacularName"]);
                    setNewIndicator(resJson["indicatorName"]);
                    setNewValue(resJson["averageValue"]);
                  });
                fetch(
                  `http://${config.server_host}:${config.server_port}/birdtocountry/${vernacular}`
                )
                  .then((res) => res.json())
                  .then((resJson) => {
                    setNewCountry(resJson["country"]);
                  });
                fetch(
                  `http://${config.server_host}:${config.server_port}/birdtoyear/${vernacular}`
                )
                  .then((res) => res.json())
                  .then((resJson) => {
                    setNewYear(resJson["year"]);
                    setNewMetric(resJson["totalMetricByYear"]);
                  });
                fetch(
                  `http://${config.server_host}:${config.server_port}/birdsclosebycoordinate/${id}`
                )
                  .then((res) => res.json())
                  .then((resJson) => {
                    let birds: string[] = [];
                    let countries: string[] = [];
                    let values: number[] = [];
                    resJson.forEach((bird: any) => {
                      birds.push(bird["name"]);
                      countries.push(bird["country"]);
                      values.push(bird["value"]);
                    });
                    setNewBirds(birds);
                    setNewCountries(countries);
                    setNewValues(values);
                  });
                fetch(
                  `http://${config.server_host}:${config.server_port}/mongoput?user=${user?.email}&genus=${genus}&region=bruh`,
                  {
                    method: "POST",
                  }
                );
                openai.images
                  .generate({
                    prompt:
                      "The bird" +
                      vernacular +
                      " (" +
                      scientific +
                      ") " +
                      " in its natural habitat in " +
                      choices[correct],
                  })
                  .then((res: any) => {
                    setImg(res.data[0]["url"]);
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
        <div className="mt-12 md:mt-24 mb-12 md:mb-24 container mx-auto max-w-screen-lg px-6 flex flex-col items-center">
          <ReactAudioPlayer src={audio} autoPlay={play} controls />
          {endRound ? (
            <div className="mt-12 flex flex-col items-center">
              <div className="flex items-center">
                <div className="flex flex-col justify-center items-start">
                  <div className="text-lg">
                    You got it! You used <b>{guesses} / 4</b> guesses
                  </div>
                  <div className="mt-6 text-2xl font-bold">
                    The {vernacular} was recorded in {choices[correct]}
                  </div>
                  <div className="text-base mt-2">
                    Scientific name: {scientific}
                  </div>
                </div>
                {img == "" ? (
                  <div className="ml-12 h-32 w-32 flex justify-center items-center font-bold text-sm text-center rounded-full border">
                    Generating image...
                  </div>
                ) : (
                  <Image
                    className="ml-12 rounded-full"
                    src={img}
                    alt=""
                    width={128}
                    height={128}
                  />
                )}
              </div>
              <div className="flex mt-24">
                <div className="max-w-[30vw] flex flex-col justify-start items-start">
                  <div className="text-lg font-bold">Country facts</div>
                  <div className="mt-4 = text-base">
                    - The {newVernacular} has also been recorded in{" "}
                    {choices[correct]}
                  </div>
                  <div className="mt-4 text-base">
                    - In {choices[correct]}, the average {newIndicator} is{" "}
                    {newValue}
                  </div>
                </div>
                <div className="max-w-[30vw] ml-24 flex flex-col justify-start items-start">
                  <div className="text-lg font-bold">Bird facts</div>
                  <div className="mt-4 text-base">
                    - The best environmentally-friendly country for {vernacular}{" "}
                    is {newCountry}
                  </div>
                  <div className="mt-4 text-base">
                    - The best environmentally-friendly year for {vernacular}{" "}
                    was {newYear} (total biodiversity score: {newMetric})
                  </div>
                </div>
              </div>
              <div className="flex flex-col mt-24">
                <div className="text-lg font-bold">Nearby birds</div>
                {JSON.stringify(newBirds) ==
                JSON.stringify(["", "", "", "", ""]) ? (
                  <div className="mt-4">Loading nearby birds...</div>
                ) : (
                  <div className="mt-4 flex flex-col max-w-[60vw]">
                    {newBirds.map((bird, index) => {
                      return (
                        <div key={bird}>
                          {"- " +
                            bird +
                            " (" +
                            newCountries[index] +
                            ", biodiversity score: " +
                            newValues[index] +
                            ")"}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <button className="mt-24 btn" onClick={() => reset()}>
                Next round
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mt-24 text-4xl font-bold">
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
