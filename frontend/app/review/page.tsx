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
                  (r: any) => "'" + r + "'"
                )}`
              )
                .then((res) => res.json())
                .then((resJson) => {
                  let diffRegion: string[] = [];
                  resJson.forEach((r: any) => {
                    diffRegion.push(r["region"]);
                  });
                  setDiffRegion(diffRegion);
                  setLoading(false);
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
            className="btn flex justify-center items-center"
            disabled
          >
            <Loader className="mr-4 animate-spin" />
            Loading data...
          </button>
        </div>
      ) : (
        <div className="mt-16 md:mt-32 mb-12 md:mb-24 container mx-auto max-w-screen-lg px-6 flex justify-center items-start">
          <div className="flex flex-col items-center">
            <div className="mb-4 text-2xl font-bold">Observed genera</div>
            {genus.map((g, _) => {
              return (
                <Link href={"/review/genus/" + g}>
                  <div>{g}</div>
                </Link>
              );
            })}
            <div className="mt-8 mb-4 text-2xl font-bold">
              Yet to be observed genera
            </div>
            {diffGenus.map((g, _) => {
              return <div>{g}</div>;
            })}
            ...
          </div>
          <div className="ml-48 flex flex-col items-center">
            <div className="mb-4 text-2xl font-bold">Observed regions</div>
            {region.map((r, _) => {
              return (
                <Link href={"/review/region/" + r}>
                  <div>{r}</div>
                </Link>
              );
            })}
            <div className="mt-8 mb-4 text-2xl font-bold">
              Yet to be observed regions
            </div>
            {diffRegion.map((r, _) => {
              return <div>{r}</div>;
            })}
            ...
          </div>
        </div>
      )}
    </div>
  );
}
