import React, { useState } from "react";
import { Plus, Pencil, Search, X, Edit2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Genres = () => {
  const [genreInput, setGenreInput] = useState("");
  const [genreResults, setGenreResults] = useState<any[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [newGenre, setNewGenre] = useState({ name: "" });
  const [editingGenre, setEditingGenre] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

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
      .select("id, name")
      .ilike("name", `%${value}%`)
      .limit(5);

    setGenreResults(error ? [] : data || []);
    setLoadingGenres(false);
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

  // Delete genre
  const handleDeleteGenre = async (genre: any) => {
    setMessage(null);
    const { error } = await supabase.from("Genre").delete().eq("id", genre.id);
    if (error) {
      setMessage("Failed to delete genre.");
    } else {
      setMessage("Genre deleted!");
      setGenreResults(genreResults.filter(g => g.id !== genre.id));
    }
  };

  // Start editing genre
  const startEditGenre = (genre: any) => {
    setEditingGenre(genre);
    setEditName(genre.name);
  };

  // Save edited genre
  const handleEditGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }
    const { error } = await supabase
      .from("Genre")
      .update({ name: editName.trim() })
      .eq("id", editingGenre.id);
    if (error) {
      setMessage("Failed to update genre.");
    } else {
      setMessage("Genre updated!");
      setGenreResults(genreResults.map(g => g.id === editingGenre.id ? { ...g, name: editName.trim() } : g));
      setEditingGenre(null);
      setEditName("");
    }
  };

  // Clear message after 5 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
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
      {(genreResults.length > 0 || genreInput) && (
        <div className="w-full border-2 border-gray-400 rounded-lg p-6 bg-slate-800 mt-2">
          {genreResults.length > 0 ? (
            <ul className="w-full flex flex-col items-center">
              {genreResults.map((genre, idx) => (
                <li
                  key={idx}
                  className="mb-4 py-3 px-2 w-full relative flex items-center justify-between"
                >
                  {editingGenre && editingGenre.id === genre.id ? (
                    <form onSubmit={handleEditGenre} className="flex w-full items-center gap-2">
                      <input
                        className="flex-1 px-2 py-1 rounded bg-slate-900 text-white border border-gray-400"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
                        title="Save"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
                        title="Cancel"
                        onClick={() => setEditingGenre(null)}
                      >
                        <X size={18} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="font-bold text-white mx-auto w-full text-center">{genre.name}</span>
                      <div className="flex gap-2">
                        <button
                          className="bg-red-600 hover:bg-red-700 rounded-full p-2"
                          title="Delete Genre"
                          onClick={() => handleDeleteGenre(genre)}
                        >
                          <X size={20} />
                        </button>
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-2"
                          title="Edit Genre"
                          onClick={() => startEditGenre(genre)}
                        >
                          <Edit2 size={20} />
                        </button>
                      </div>
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
      {/* Show the message here, just for genres */}
      {message && (
        <div
          className={
            message === "Genre added!" || message === "Genre updated!" || message === "Genre deleted!"
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

export default Genres;