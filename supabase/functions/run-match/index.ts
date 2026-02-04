// 매칭 실행: 같은 모델에서 [왼쪽 1명, 오른쪽 1명, 본체 1명]이 있으면 룸 생성
// Cron으로 주기 호출하거나, 수동 POST로 호출
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase.rpc("try_match_rooms");

    if (error) {
      console.error("try_match_rooms error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const roomsCreated = typeof data === "number" ? data : 0;
    return new Response(
      JSON.stringify({ rooms_created: roomsCreated }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
