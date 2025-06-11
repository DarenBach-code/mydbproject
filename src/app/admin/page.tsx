"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminNav from "@/components/AdminNav";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!userRow?.role) {
        router.replace("/login");
        return;
      }

      const { data: roleRow } = await supabase
        .from("roles")
        .select("name")
        .eq("id", userRow.role)
        .single();

      if (!roleRow?.name || roleRow.name !== "Admin") {
        router.replace("/login");
        return;
      }

      setLoading(false);
    };

    checkAuthAndRole();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center text-white text-2xl p-12">Loading...</div>;
  }

  return (
    <>
      <AdminNav />
      <div className="flex justify-center text-white text-center text-4xl p-12">
        This is the Admin page. You can make changes to the movie database.
      </div>
    </>
  );
}

export default page