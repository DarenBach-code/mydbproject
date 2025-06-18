import React, { useState } from "react";
import supabase from "../lib/supabaseClient";
import { Pencil, Plus, Search, X, Edit2 } from "lucide-react";

const MovieSearch: React.FC = () => {
  const [movieInput, setMovieInput] = useState("");
  const [movieResults, setMovieResults] = useState<any[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [newMovie, setNewMovie] = useState({ title: "", overview: "", release_date: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [editingMovie, setEditingMovie] = useState<any | null>(null);
  const [editMovie, setEditMovie] = useState({ title: "", overview: "", release_date: "" });

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
      .select(`id, title, overview, release_date, Movie_Genres (Genre (name)), movie_cast (Actors (name))`)
      .ilike("title", `%${value}%`)
      .limit(5);
    setMovieResults(error ? [] : data || []);
    setLoadingMovies(false);
  };

  const isValidDate = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === date.toISOString().slice(0, 10);
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!isValidDate(newMovie.release_date)) {
      setMessage("Release Date must be a valid date in YYYY-MM-DD format.");
      return;
    }
    const { error } = await supabase.from("Movies").insert([
      {
        title: newMovie.title,
        overview: newMovie.overview,
        release_date: newMovie.release_date,
      },
    ]);
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

  const handleEditMovie = (movie: any) => {
    setEditingMovie(movie);
    setEditMovie({
      title: movie.title,
      overview: movie.overview,
      release_date: movie.release_date,
    });
  };

  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;
    if (!isValidDate(editMovie.release_date)) {
      setMessage("Release Date must be a valid date in YYYY-MM-DD format.");
      return;
    }
    const { error } = await supabase
      .from("Movies")
      .update({
        title: editMovie.title,
        overview: editMovie.overview,
        release_date: editMovie.release_date,
      })
      .eq("id", editingMovie.id);
    if (error) {
      setMessage("Failed to update movie.");
    } else {
      setMessage("Movie updated!");
      setEditingMovie(null);
      setMovieInput("");
      setMovieResults([]);
    }
  };

  const handleDeleteMovie = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    const { error } = await supabase.from("Movies").delete().eq("id", id);
    if (error) {
      setMessage("Failed to delete movie.");
    } else {
      setMessage("Movie deleted!");
      setMovieInput("");
      setMovieResults([]);
    }
  };

  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
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
                  <div className="flex justify-end gap-2 mb-2">
                    <button
                      className="bg-red-600 hover:bg-red-700 rounded-full p-2 flex items-center justify-center"
                      title="Delete Movie"
                      onClick={() => handleDeleteMovie(movie.id)}
                    >
                      <X size={20} />
                    </button>
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-2 flex items-center justify-center"
                      title="Edit Movie"
                      onClick={() => handleEditMovie(movie)}
                    >
                      <Edit2 size={20} />
                    </button>
                  </div>
                  {editingMovie && editingMovie.title === movie.title ? (
                    <form
                      onSubmit={handleUpdateMovie}
                      className="bg-slate-700 mt-2 p-4 rounded-lg flex flex-col gap-3"
                    >
                      <input
                        type="text"
                        placeholder="Movie Title"
                        className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300"
                        value={editMovie.title}
                        onChange={e => setEditMovie({ ...editMovie, title: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Overview"
                        className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300"
                        value={editMovie.overview}
                        onChange={e => setEditMovie({ ...editMovie, overview: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="YYYY-MM-DD"
                        className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-gray-300"
                        value={editMovie.release_date}
                        onChange={e => setEditMovie({ ...editMovie, release_date: e.target.value })}
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                          onClick={() => setEditingMovie(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span className="font-bold text-white">{movie.title}</span>
                      <div className="text-sm text-gray-400">{movie.release_date}</div>
                      <div className="text-gray-300 mb-2">{movie.overview}</div>
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
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No results found.</p>
          )}
        </div>
      )}
      {message && (
        <div
          className={
            message === "Movie added!"
              ? "text-center text-green-400 mt-2"
              : "text-center text-red-400 mt-2"
          }
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default MovieSearch;
