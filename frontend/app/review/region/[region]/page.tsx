"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Loader } from "react-feather";
import Header from "../../../components/Header";
const config = require("../../../../../backend/config.json");

export default function Region({ params }: { params: { region: string } }) {
  const { user, error, isLoading } = useUser();
  const [birds, setBirds] = useState([""]);
  const [countries, setCountries] = useState([""]);
  const [values, setValues] = useState([0]);
  const [indicators, setIndicators] = useState([""]);
  const [freq, setFreq] = useState([0]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `http://${config.server_host}:${config.server_port}/regionbirdsandfacts?region=${params.region}&facts='GDP (current US$)','GDP per capita (current US$)','Land area (sq. km)','CO2 emissions (metric tons per capita)','Cereal production (metric tons)'`
    )
      .then((res) => res.json())
      .then((resJson) => {
        let birds: any[] = [];
        let countries: any[] = [];
        let values: any[] = [];
        let indicators: any[] = [];
        let freq: any[] = [];
        resJson.forEach((country: any) => {
          birds.push(country["bird_name"]);
          countries.push(country["countryName"]);
          values.push(country["avg_value_across_years"]);
          indicators.push(country["indicator_name"]);
          freq.push(country["bird_freq"]);
        });
        setBirds(birds);
        setCountries(countries);
        setValues(values);
        setIndicators(indicators);
        setFreq(freq);
        setLoading(false);
      });
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
            className="btn flex justify-center items-center animate-pulse"
            disabled
          >
            <Loader className="mr-4 animate-spin" />
            Loading data...
          </button>
        </div>
      ) : (
        <div className="mt-16 md:mt-32 mb-12 md:mb-24 container mx-auto max-w-screen-lg px-6 flex flex-col items-start">
          <div className="mb-8 text-2xl font-bold text-center">
            {params.region.replaceAll("%20", " ").replaceAll("%26", "&")}
          </div>
          {countries.map((c, i) => {
            if (i % 5 == 0) {
              return (
                <div className="mb-8 flex flex-col">
                  <div className="font-bold">{c}</div>
                  <div>Most commonly recorded bird: {birds[i]}</div>
                  <div>Recorded {freq[i]} times</div>
                  <div>
                    {indicators[i]}: {values[i]}
                  </div>
                  <div>
                    {indicators[i + 1]}: {values[i + 1]}
                  </div>
                  <div>
                    {indicators[i + 2]}: {values[i + 2]}
                  </div>
                  <div>
                    {indicators[i + 3]}: {values[i + 3]}
                  </div>
                  <div>
                    {indicators[i + 4]}: {values[i + 4]}
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
