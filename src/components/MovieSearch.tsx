import React, { useState, useEffect } from "react";
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
  const [genreSearch, setGenreSearch] = useState<{ [key: number]: string }>({});
  const [actorSearch, setActorSearch] = useState<{ [key: number]: string }>({});
  const [genreResults, setGenreResults] = useState<{ [key: number]: any[] }>({});
  const [actorResults, setActorResults] = useState<{ [key: number]: any[] }>({});

  const fetchGenres = async (search: string) => {
    const { data } = await supabase
      .from("Genre")
      .select("id, name")
      .ilike("name", `%${search}%`)
      .limit(5);
    return data || [];
  };

  const fetchActors = async (search: string) => {
    const { data } = await supabase
      .from("Actors")
      .select("id, name")
      .ilike("name", `%${search}%`)
      .limit(5);
    return data || [];
  };

  useEffect(() => {
    Object.entries(genreSearch).forEach(async ([movieId, search]) => {
      if (search) {
        const results = await fetchGenres(search);
        setGenreResults(prev => ({ ...prev, [movieId]: results }));
      } else {
        setGenreResults(prev => ({ ...prev, [movieId]: [] }));
      }
    });
  }, [genreSearch]);

  useEffect(() => {
    Object.entries(actorSearch).forEach(async ([movieId, search]) => {
      if (search) {
        const results = await fetchActors(search);
        setActorResults(prev => ({ ...prev, [movieId]: results }));
      } else {
        setActorResults(prev => ({ ...prev, [movieId]: [] }));
      }
    });
  }, [actorSearch]);

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
      .select(`id, title, overview, release_date, Movie_Genres (genre_id, Genre (name, id)), movie_cast (actor_id, Actors (name, id))`)
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
      refreshMovies(); // Do not clear search/results, just refresh
    }
  };

  const handleDeleteMovie = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    const { error } = await supabase.from("Movies").delete().eq("id", id);
    if (error) {
      setMessage("Failed to delete movie.");
    } else {
      setMessage("Movie deleted!");
      refreshMovies(); // Do not clear search/results, just refresh
    }
  };

  const handleRelateGenre = async (movieId: number, genreId: number) => {
    await supabase.from("Movie_Genres").insert([{ movie_id: movieId, genre_id: genreId }]);
    setMessage("Genre related!");
    // Do NOT clear search or results, just refresh movies
    refreshMovies();
  };
  const handleRelateActor = async (movieId: number, actorId: number) => {
    await supabase.from("movie_cast").insert([{ movie_id: movieId, actor_id: actorId }]);
    setMessage("Actor related!");
    refreshMovies();
  };

  // Helper to refresh movies after unrelate
  const refreshMovies = async () => {
    if (movieInput.trim() === "") return;
    setLoadingMovies(true);
    const { data, error } = await supabase
      .from("Movies")
      .select(`id, title, overview, release_date, Movie_Genres (genre_id, Genre (name, id)), movie_cast (actor_id, Actors (name, id))`)
      .ilike("title", `%${movieInput}%`)
      .limit(5);
    setMovieResults(error ? [] : data || []);
    setLoadingMovies(false);
  };

  const handleUnrelateGenre = async (movieId: number, genreId: number) => {
    const { error } = await supabase.from("Movie_Genres").delete().eq("movie_id", movieId).eq("genre_id", genreId);
    if (!error) {
      setMessage("Genre removed!");
      refreshMovies();
    } else {
      setMessage("Failed to remove genre.");
    }
  };
  const handleUnrelateActor = async (movieId: number, actorId: number) => {
    const { error } = await supabase.from("movie_cast").delete().eq("movie_id", movieId).eq("actor_id", actorId);
    if (!error) {
      setMessage("Actor removed!");
      refreshMovies();
    } else {
      setMessage("Failed to remove actor.");
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
                  {(editingMovie && editingMovie.title === movie.title) ? null : (
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="flex justify-center gap-2 mb-2 items-center">
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
                      {/* Relate Genre Search */}
                      <div className="w-full max-w-xs">
                        <input
                          className="w-full bg-slate-800 border-2 border-orange-600 text-white text-xs rounded p-2 focus:outline-none focus:border-orange-400 mb-1"
                          type="text"
                          placeholder="Search genres to relate..."
                          value={genreSearch[movie.id] || ""}
                          onChange={e => setGenreSearch({ ...genreSearch, [movie.id]: e.target.value })}
                        />
                        {genreSearch[movie.id] && genreResults[movie.id] && (
                          <div className="bg-slate-900 rounded shadow p-2">
                            {genreResults[movie.id]
                              .filter(g => !movie.Movie_Genres?.some((mg: any) => mg.Genre && mg.Genre.name === g.name))
                              .map(g => (
                                <div
                                  key={g.id}
                                  className="cursor-pointer hover:bg-orange-600 px-2 py-1 rounded text-white text-xs text-left"
                                  onClick={() => handleRelateGenre(movie.id, g.id)}
                                >
                                  {g.name}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      {/* Relate Actor Search */}
                      <div className="w-full max-w-xs mt-2">
                        <input
                          className="w-full bg-slate-800 border-2 border-sky-600 text-white text-xs rounded p-2 focus:outline-none focus:border-sky-400 mb-1"
                          type="text"
                          placeholder="Search actors to relate..."
                          value={actorSearch[movie.id] || ""}
                          onChange={e => setActorSearch({ ...actorSearch, [movie.id]: e.target.value })}
                        />
                        {actorSearch[movie.id] && actorResults[movie.id] && (
                          <div className="bg-slate-900 rounded shadow p-2">
                            {actorResults[movie.id]
                              .filter(a => !movie.movie_cast?.some((cast: any) => cast.Actors && cast.Actors.name === a.name))
                              .map(a => (
                                <div
                                  key={a.id}
                                  className="cursor-pointer hover:bg-sky-600 px-2 py-1 rounded text-white text-xs text-left"
                                  onClick={() => handleRelateActor(movie.id, a.id)}
                                >
                                  {a.name}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                      {/* Genres */}
                      {movie.Movie_Genres && movie.Movie_Genres.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                          {movie.Movie_Genres.map((mg: any, gidx: number) =>
                            mg.Genre ? (
                              <span key={gidx} className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                {mg.Genre.name}
                                <button
                                  className="ml-1 text-white hover:text-orange-200"
                                  title="Remove Genre"
                                  onClick={() => handleUnrelateGenre(movie.id, mg.Genre.id)}
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ) : null
                          )}
                        </div>
                      )}
                      {/* Actors */}
                      {movie.movie_cast && movie.movie_cast.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                          {movie.movie_cast.map((cast: any, aidx: number) =>
                            cast.Actors ? (
                              <span key={aidx} className="bg-sky-300 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                {cast.Actors.name}
                                <button
                                  className="ml-1 text-white hover:text-sky-200"
                                  title="Remove Actor"
                                  onClick={() => handleUnrelateActor(movie.id, cast.Actors.id)}
                                >
                                  <X size={14} />
                                </button>
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
            message.includes("added") || message.includes("updated") || message.includes("deleted") || message.includes("removed") || message.includes("related")
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
