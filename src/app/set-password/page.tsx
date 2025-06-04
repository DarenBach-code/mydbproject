"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SetPasswordPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("You must be signed in to set your password.");
      setLoading(false);
      return;
    }

    // 1. Update password and metadata (original combined call)
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // 2. All good — redirect
    setLoading(false);
    router.push("/");
  };

  return (
    <div>
      <Nav />
      <div className="grid place-items-center pt-24 pb-8">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-700 p-8 rounded-lg shadow-md flex flex-col gap-4 w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-white mb-4 text-center">Set Your Password</h1>

          <input
            type="text"
            placeholder="First Name"
            className="px-4 py-2 rounded-lg border border-gray-300 text-white bg-slate-800"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Last Name"
            className="px-4 py-2 rounded-lg border border-gray-300 text-white bg-slate-800"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
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
            {loading ? "Setting Password..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
