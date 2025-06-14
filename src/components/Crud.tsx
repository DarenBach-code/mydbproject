"use client";
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Pencil, Plus, Search } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Crud = () => {
  const [movieInput, setMovieInput] = useState("");
  const [actorInput, setActorInput] = useState("");
  const [genreInput, setGenreInput] = useState("");
  const [movieResults, setMovieResults] = useState<any[]>([]);
  const [actorResults, setActorResults] = useState<any[]>([]);
  const [genreResults, setGenreResults] = useState<any[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingActors, setLoadingActors] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showAddActor, setShowAddActor] = useState(false);
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [newMovie, setNewMovie] = useState({ title: "", overview: "", release_date: "" });
  const [newActor, setNewActor] = useState({ name: "" });
  const [newGenre, setNewGenre] = useState({ name: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [editingMovie, setEditingMovie] = useState<any | null>(null);
  const [editingActor, setEditingActor] = useState<any | null>(null);
  const [editingGenre, setEditingGenre] = useState<any | null>(null);

  // Search Movies
  const handleSearchMovies = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMovieInput(value);

    if (value.trim() === "") {
      setMovieResults([]);
      return;
    }

    setLoadingMovies(true);
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

    setMovieResults(error ? [] : data || []);
    setLoadingMovies(false);
  };

  // Search Actors
  const handleSearchActors = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setActorInput(value);

    if (value.trim() === "") {
      setActorResults([]);
      return;
    }

    setLoadingActors(true);
    const { data, error } = await supabase
      .from("Actors")
      .select("name")
      .ilike("name", `%${value}%`)
      .limit(5);

    setActorResults(error ? [] : data || []);
    setLoadingActors(false);
  };

  // Search Genres
  const handleSearchGenres = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGenreInput(value);

    if (value.trim() === "") {
      setGenreResults([]);
      return;
    }

    setLoadingGenres(true);
    const { data, error } = await supabase
      .from("Genre")
      .select("name")
      .ilike("name", `%${value}%`)
      .limit(5);

    setGenreResults(error ? [] : data || []);
    setLoadingGenres(false);
  };

  // Helper to check if a string is a valid date (YYYY-MM-DD)
  const isValidDate = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === date.toISOString().slice(0, 10);
  };

  // Add movie logic
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isValidDate(newMovie.release_date)) {
      setMessage("Release Date must be a valid date in YYYY-MM-DD format.");
      return;
    }

    const { error } = await supabase.from("Movies").insert([{
      title: newMovie.title,
      overview: newMovie.overview,
      release_date: newMovie.release_date,
    }]);

    if (error) {
      setMessage("Failed to add movie.");
    } else {
      setMessage("Movie added!");
      setShowAddMovie(false);
      setNewMovie({ title: "", overview: "", release_date: "" });
      setMovieInput("");
      setMovieResults([]);
    }
  };

  // Add actor logic
  const handleAddActor = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!newActor.name.trim()) {
      setMessage("Actor name cannot be empty.");
      return;
    }
    const { error } = await supabase.from("Actors").insert([{ name: newActor.name.trim() }]);
    if (error) {
      setMessage("Failed to add actor.");
    } else {
      setMessage("Actor added!");
      setShowAddActor(false);
      setNewActor({ name: "" });
      setActorInput("");
      setActorResults([]);
    }
  };

  // Add genre logic
  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!newGenre.name.trim()) {
      setMessage("Genre name cannot be empty.");
      return;
    }
    const { error } = await supabase.from("Genre").insert([{ name: newGenre.name.trim() }]);
    if (error) {
      setMessage("Failed to add genre.");
    } else {
      setMessage("Genre added!");
      setShowAddGenre(false);
      setNewGenre({ name: "" });
      setGenreInput("");
      setGenreResults([]);
    }
  };

  // Add this effect to clear the message after 5 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="flex flex-col items-center mt-12">
      <h1 className="text-3xl font-bold text-white mb-2">Movie Database Admin</h1>
      <div className="text-red-500 font-semibold mb-6">
        Note: admins are responsible for keeping the database clean and secure.
      </div>

      {/* Movie Search & Add */}
      <div className="w-full max-w-xl mb-8">
        <h2 className="text-xl font-semibold text-white mb-2 text-center">Movies</h2>
        <div className="flex items-center gap-2 mb-2">
          <Search color="white" />
          <input
            type="text"
            placeholder="Search movies..."
            className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300 ml-2"
            value={movieInput}
            onChange={handleSearchMovies}
          />
          <button
            type="button"
            onClick={() => setShowAddMovie(true)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 flex items-center justify-center"
            title="Add Movie"
          >
            <Plus size={24} />
          </button>
        </div>
        {showAddMovie && (
          <form
            onSubmit={handleAddMovie}
            className="bg-slate-700 mt-2 p-4 rounded-lg flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Movie Title"
              className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300"
              value={newMovie.title}
              onChange={e => setNewMovie({ ...newMovie, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Overview"
              className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300"
              value={newMovie.overview}
              onChange={e => setNewMovie({ ...newMovie, overview: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="YYYY-MM-DD"
              className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300"
              value={newMovie.release_date}
              onChange={e => setNewMovie({ ...newMovie, release_date: e.target.value })}
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add Movie
              </button>
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowAddMovie(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {loadingMovies && <p className="text-gray-400 text-center">Searching...</p>}
        {(movieResults.length > 0 || (!loadingMovies && movieInput)) && (
          <div className="w-full border-2 border-gray-400 rounded-lg p-6 bg-slate-800 mt-2">
            {movieResults.length > 0 ? (
              <ul className="w-full flex flex-col items-center">
                {movieResults.map((movie, idx) => (
                  <li key={idx} className="mb-8 text-center w-full relative">
                    {/* Edit button for movie */}
                    <button
                      className="absolute right-2 top-2 bg-slate-600 hover:bg-blue-600 rounded-full p-2"
                      title="Edit Movie"
                      onClick={() => setEditingMovie(movie)}
                    >
                      <Pencil size={20} color="white" />
                    </button>
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

      {/* Actor Search & Add */}
      <div className="w-full max-w-xl mb-8">
        <h2 className="text-xl font-semibold text-white mb-2 text-center">Actors</h2>
        <div className="flex items-center gap-2 mb-2">
          <Search color="white" />
          <input
            type="text"
            placeholder="Search actors..."
            className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300 ml-2"
            value={actorInput}
            onChange={handleSearchActors}
          />
          <button
            type="button"
            onClick={() => setShowAddActor(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white rounded-full p-2 flex items-center justify-center"
            title="Add Actor"
          >
            <Plus size={24} />
          </button>
        </div>
        {showAddActor && (
          <form
            onSubmit={handleAddActor}
            className="bg-slate-700 mt-2 p-4 rounded-lg flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Actor Name"
              className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300"
              value={newActor.name}
              onChange={e => setNewActor({ name: e.target.value })}
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add Actor
              </button>
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowAddActor(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {loadingActors && <p className="text-gray-400 text-center">Searching...</p>}
        {(actorResults.length > 0 || (!loadingActors && actorInput)) && (
          <div className="w-full border-2 border-gray-400 rounded-lg p-6 bg-slate-800 mt-2">
            {actorResults.length > 0 ? (
              <ul className="w-full flex flex-col items-center">
                {actorResults.map((actor, idx) => (
                  <li
                    key={idx}
                    className="mb-4 py-3 px-2 text-center w-full relative flex items-center"
                  >
                    {/* Edit button for actor */}
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-600 hover:bg-blue-600 rounded-full p-2"
                      title="Edit Actor"
                      onClick={() => setEditingActor(actor)}
                    >
                      <Pencil size={20} color="white" />
                    </button>
                    <span className="font-bold text-white">{actor.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center">No results found.</p>
            )}
          </div>
        )}
      </div>

      {/* Genre Search & Add */}
      <div className="w-full max-w-xl mb-8">
        <h2 className="text-xl font-semibold text-white mb-2 text-center">Genres</h2>
        <div className="flex items-center gap-2 mb-2">
          <Search color="white" />
          <input
            type="text"
            placeholder="Search genres..."
            className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300 ml-2"
            value={genreInput}
            onChange={handleSearchGenres}
          />
          <button
            type="button"
            onClick={() => setShowAddGenre(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-2 flex items-center justify-center"
            title="Add Genre"
          >
            <Plus size={24} />
          </button>
        </div>
        {showAddGenre && (
          <form
            onSubmit={handleAddGenre}
            className="bg-slate-700 mt-2 p-4 rounded-lg flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Genre Name"
              className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300"
              value={newGenre.name}
              onChange={e => setNewGenre({ name: e.target.value })}
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add Genre
              </button>
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowAddGenre(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {loadingGenres && <p className="text-gray-400 text-center">Searching...</p>}
        {(genreResults.length > 0 || (!loadingGenres && genreInput)) && (
          <div className="w-full border-2 border-gray-400 rounded-lg p-6 bg-slate-800 mt-2">
            {genreResults.length > 0 ? (
              <ul className="w-full flex flex-col items-center">
                {genreResults.map((genre, idx) => (
                  <li
                    key={idx}
                    className="mb-4 py-3 px-2 text-center w-full relative flex items-center"
                  >
                    {/* Edit button for genre */}
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-600 hover:bg-blue-600 rounded-full p-2"
                      title="Edit Genre"
                      onClick={() => setEditingGenre(genre)}
                    >
                      <Pencil size={20} color="white" />
                    </button>
                    <span className="font-bold text-white">{genre.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center">No results found.</p>
            )}
          </div>
        )}
      </div>

      {message && (
        <div className="text-center text-white mt-2">{message}</div>
      )}
    </div>
  );
};

export default Crud;