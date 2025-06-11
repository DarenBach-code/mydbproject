"use client";
import { House } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AdminNav = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between p-8 bg-transparent">
      {/* Left: Home Icon */}
      <Link href="/" className="flex items-center">
        <House color="white" size={48} />
      </Link>
      {/* Right: Logout Button */}
      <div className="flex gap-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNav;