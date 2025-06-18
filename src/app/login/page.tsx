"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import Nav from "@/components/Nav";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // 2. Get the user's id from auth.users
    const userId = data.user?.id;
    if (!userId) {
      setError("User not found.");
      setLoading(false);
      return;
    }

    // 3. Get the user's role id from your users table
    const { data: userRow, error: userRowError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userRowError || !userRow?.role) {
      setError("User role not found.");
      setLoading(false);
      return;
    }

    // 4. Get the role name from the roles table
    const { data: roleRow, error: roleRowError } = await supabase
      .from("roles")
      .select("name")
      .eq("id", userRow.role)
      .single();

    if (roleRowError || !roleRow?.name) {
      setError("Role not found.");
      setLoading(false);
      return;
    }

    // 5. Check if admin
    if (roleRow.name !== "Admin") {
      setError("You are not authorized to access the admin page.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/admin");
  };

  return (
    <div>
      <Nav />
      <div className="grid place-items-center pt-24 pb-8">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-700 p-8 rounded-lg shadow-md flex flex-col gap-4 w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-white mb-4 text-center">Admin Sign In</h1>
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 rounded-lg border border-gray-300 text-white bg-slate-800"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 rounded-lg border border-gray-300 text-white bg-slate-800"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-center">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}