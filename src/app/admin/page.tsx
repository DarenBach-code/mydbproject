"use client";
import Crud from "@/components/Crud"
import supabase from "../../lib/supabaseClient";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";

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
      <Crud/>
    </>
  );
}

export default page