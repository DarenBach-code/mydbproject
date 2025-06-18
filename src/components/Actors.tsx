import React, { useState } from "react";
import { Plus, Pencil, Search, X, Edit2 } from "lucide-react";
import supabase from "../lib/supabaseClient";

const Actors = () => {
  const [actorInput, setActorInput] = useState("");
  const [actorResults, setActorResults] = useState<any[]>([]);
  const [loadingActors, setLoadingActors] = useState(false);
  const [showAddActor, setShowAddActor] = useState(false);
  const [newActor, setNewActor] = useState({ name: "" });
  const [editingActor, setEditingActor] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

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
      .select("id, name")
      .ilike("name", `%${value}%`)
      .limit(5);

    setActorResults(error ? [] : data || []);
    setLoadingActors(false);
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

  // Delete actor
  const handleDeleteActor = async (actor: any) => {
    setMessage(null);
    const { error } = await supabase.from("Actors").delete().eq("id", actor.id);
    if (error) {
      setMessage("Failed to delete actor.");
    } else {
      setMessage("Actor deleted!");
      setActorResults(actorResults.filter(a => a.id !== actor.id));
    }
  };

  // Start editing actor
  const startEditActor = (actor: any) => {
    setEditingActor(actor);
    setEditName(actor.name);
  };

  // Save edited actor
  const handleEditActor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }
    const { error } = await supabase
      .from("Actors")
      .update({ name: editName.trim() })
      .eq("id", editingActor.id);
    if (error) {
      setMessage("Failed to update actor.");
    } else {
      setMessage("Actor updated!");
      setActorResults(actorResults.map(a => a.id === editingActor.id ? { ...a, name: editName.trim() } : a));
      setEditingActor(null);
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
      {(actorResults.length > 0 || actorInput) && (
        <div className="w-full border-2 border-gray-400 rounded-lg p-6 bg-slate-800 mt-2">
          {actorResults.length > 0 ? (
            <ul className="w-full flex flex-col items-center">
              {actorResults.map((actor, idx) => (
                <li
                  key={idx}
                  className="mb-4 py-3 px-2 w-full relative flex items-center justify-between"
                >
                  {editingActor && editingActor.id === actor.id ? (
                    <form onSubmit={handleEditActor} className="flex w-full items-center gap-2">
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
                        onClick={() => setEditingActor(null)}
                      >
                        <X size={18} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="font-bold text-white mx-auto w-full text-center">{actor.name}</span>
                      <div className="flex gap-2">
                        <button
                          className="bg-red-600 hover:bg-red-700 rounded-full p-2"
                          title="Delete Actor"
                          onClick={() => handleDeleteActor(actor)}
                        >
                          <X size={20} />
                        </button>
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-2"
                          title="Edit Actor"
                          onClick={() => startEditActor(actor)}
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
      {/* Show the message here, just for actors */}
      {message && (
        <div
          className={
            message === "Actor added!" || message === "Actor updated!" || message === "Actor deleted!"
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

export default Actors;