import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ejuichxozjjoanywjazn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdWljaHhvempqb2FueXdqYXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjA5MjUsImV4cCI6MjA5NDc5NjkyNX0.AQNQvpMMilfVUcpaMa9abONOansO1vJVOwPJnRBKj7s"
);