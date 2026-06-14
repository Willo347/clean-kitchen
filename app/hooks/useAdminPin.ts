import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Hook partagé — charge le PIN admin depuis Supabase une seule fois
// Fallback sur "2405" si aucun PIN n'est configuré
export function useAdminPin(): string {
  const [adminPin, setAdminPin] = useState("2405");

  useEffect(() => {
    async function fetchPin() {
      const { data } = await supabase
        .from("settings")
        .select("admin_pin")
        .single();
      if (data?.admin_pin) setAdminPin(data.admin_pin);
    }
    fetchPin();
  }, []);

  return adminPin;
}
