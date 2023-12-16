"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Loader } from "react-feather";
import Header from "../components/Header";
const config = require("../../../backend/config.json");

export default function Review() {
  const { user, error, isLoading } = useUser();
  const [genus, setGenus] = useState([]);
  const [region, setRegion] = useState([]);
  const [diffGenus, setDiffGenus] = useState([""]);
  const [diffRegion, setDiffRegion] = useState([""]);
  const [country, setCountry] = useState("");
  const [year, setYear] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user != null) {
      fetch(
        `http://${config.server_host}:${config.server_port}/mongoget?user=${user.email}`
      )
        .then((res) => res.json())
        .then((resJson) => {
          let genus = resJson["genus"];
          let region = resJson["region"];

          setGenus(genus);
          setRegion(region);
          fetch(
            `http://${config.server_host}:${
              config.server_port
            }/diffgenus/?prev_genus=${genus.map((g: any) => "'" + g + "'")}`
          )
            .then((res) => res.json())
            .then((resJson) => {
              let diffGenus: string[] = [];
              resJson.forEach((g: any) => {
                diffGenus.push(g["genus"]);
              });
              setDiffGenus(diffGenus);
              fetch(
                `http://${config.server_host}:${
                  config.server_port
                }/diffregion/?prev_regions=${region.map(
                  (r: any) => "'" + r.replaceAll("&", "%26") + "'"
                )}`
              )
                .then((res) => res.json())
                .then((resJson) => {
                  let diffRegion: string[] = [];
                  resJson.forEach((r: any) => {
                    diffRegion.push(r["region"]);
                  });
                  setDiffRegion(diffRegion);
                  fetch(
                    `http://${config.server_host}:${
                      config.server_port
                    }/genustocountry/?prev_genus=${genus.map(
                      (g: any) => "'" + g + "'"
                    )}`
                  )
                    .then((res) => res.json())
                    .then((resJson) => {
                      setCountry(resJson["country"]);
                      fetch(
                        `http://${config.server_host}:${
                          config.server_port
                        }/genustoyear/?prev_genus=${genus.map(
                          (g: any) => "'" + g + "'"
                        )}`
                      )
                        .then((res) => res.json())
                        .then((resJson) => {
                          setYear(resJson["year"]);
                          setLoading(false);
                        });
                    });
                });
            });
        });
    }
  }, [user]);

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
        <div className="mt-16 md:mt-32 mb-12 md:mb-24 container mx-auto max-w-screen-xl px-6 flex justify-center items-start">
          <div className="flex flex-col items-center w-[48rem]">
            <div className="mb-4 text-2xl font-bold text-center">
              Observed genera
            </div>
            {genus.map((g, _) => {
              return <div className="text-center mb-2">{g}</div>;
            })}
            <div className="border border-primary rounded p-8 mt-8 w-full">
              For all the observed genera, the most environmentally-friendly
              country is {country} and year was {year}
            </div>
          </div>
          <div className="ml-16 flex flex-col items-center w-[48rem]">
            <div className="mb-4 text-2xl font-bold text-center">
              Unobserved genera
            </div>
            {diffGenus.map((g, _) => {
              return <div className="text-center mb-2">{g}</div>;
            })}
            ...
          </div>
          <div className="ml-16 flex flex-col items-center w-[48rem]">
            <div className="mb-4 text-2xl font-bold text-center">
              Observed regions
            </div>
            {region.map((r, _) => {
              return (
                <Link href={"/review/region/" + r}>
                  <div className="text-center mb-2">{r}</div>
                </Link>
              );
            })}
          </div>
          <div className="ml-16 flex flex-col items-center w-[48rem]">
            <div className="mb-4 text-2xl font-bold text-center">
              Unobserved regions
            </div>
            {diffRegion.map((r, _) => {
              return (
                <Link href={"/review/region/" + r}>
                  <div className="text-center mb-2">{r}</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
