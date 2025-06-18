"use client";
import React from "react";
import supabase from "../lib/supabaseClient";
import Actors from "./Actors";
import Genres from "./Genres";
import MovieSearch from "./MovieSearch";

const Crud = () => {
  return (
    <div className="flex flex-col items-center mt-12">
      <h1 className="text-3xl font-bold text-white mb-2 text-center w-full">Movie Database Admin</h1>
      <div className="text-red-500 font-semibold mb-6 text-center w-full">
        Note: admins are responsible for keeping the database clean and secure.
      </div>

      {/* Movie Management */}
      <MovieSearch />

      {/* Actor Search & Add */}
      <Actors />

      {/* Genre Search & Add */}
      <Genres />
    </div>
  );
};

export default Crud;