"use client";
import React, { useState } from "react";
import supabase from "../lib/supabaseClient";

const Form = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    // Fetch movies with their genres and actors using Supabase's nested select
    const { data, error } = await supabase
      .from("Movies")
      .select(`
        title,
        overview,
        release_date,
        Movie_Genres (
          Genre (
            name
          )
        ),
        movie_cast (
          Actors (
            name
          )
        )
      `)
      .ilike("title", `%${value}%`)
      .limit(5);

    if (error) {
      setResults([]);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center mt-12">
      <input
        type="text"
        placeholder="Search movies..."
        className="px-24 py-2 rounded-lg bg-stone-300 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        value={input}
        onChange={handleSearch}
      />
      <div className="mt-4 w-full flex flex-col items-center">
        {loading && <p className="text-gray-400 text-center">Searching...</p>}
        {(results.length > 0 || (!loading && input)) && (
          <div className="w-full max-w-2xl border-2 border-gray-400 rounded-lg p-6 bg-slate-800">
            {results.length > 0 ? (
              <ul className="w-full flex flex-col items-center">
                {results.map((movie, idx) => (
                  <li key={idx} className="mb-8 text-center w-full">
                    <span className="font-bold text-white">{movie.title}</span>
                    <div className="text-sm text-gray-400">{movie.release_date}</div>
                    <div className="text-gray-300 mb-2">{movie.overview}</div>
                    {/* Display genres */}
                    {movie.Movie_Genres && movie.Movie_Genres.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {movie.Movie_Genres.map((mg: any, gidx: number) =>
                          mg.Genre ? (
                            <span
                              key={gidx}
                              className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full"
                            >
                              {mg.Genre.name}
                            </span>
                          ) : null
                        )}
                      </div>
                    )}
                    {/* Display actors */}
                    {movie.movie_cast && movie.movie_cast.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {movie.movie_cast.map((cast: any, aidx: number) =>
                          cast.Actors ? (
                            <span
                              key={aidx}
                              className="bg-sky-300 text-white text-xs px-3 py-1 rounded-full"
                            >
                              {cast.Actors.name}
                            </span>
                          ) : null
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center">No results found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;
