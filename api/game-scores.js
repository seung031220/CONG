// 반응속도 게임: 입장 상태 및 반응 시간 저장
const { Redis } = require("@upstash/redis");

const VALID_CODES = ["1111", "0000"];
const KEY_ENTERED_PREFIX = "game_entered_";
const KEY_REACTION_PREFIX = "game_reaction_";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

async function getGameState(redis) {
  if (!redis) {
    return {
      entered_1111: false,
      entered_0000: false,
      reaction_1111: null,
      reaction_0000: null,
    };
  }
  const [e1, e2, r1, r2] = await Promise.all([
    redis.get(KEY_ENTERED_PREFIX + "1111"),
    redis.get(KEY_ENTERED_PREFIX + "0000"),
    redis.get(KEY_REACTION_PREFIX + "1111"),
    redis.get(KEY_REACTION_PREFIX + "0000"),
  ]);
  
  // Redis에서 가져온 값 확인 (디버깅용)
  console.log("Redis 값:", { e1, e2, r1, r2 });
  
  // 더 포괄적으로 확인
  const entered1111 = e1 != null && e1 !== false && e1 !== "false" && e1 !== 0 && e1 !== "0";
  const entered0000 = e2 != null && e2 !== false && e2 !== "false" && e2 !== 0 && e2 !== "0";
  
  return {
    entered_1111: entered1111,
    entered_0000: entered0000,
    reaction_1111: r1 != null ? Number(r1) : null,
    reaction_0000: r2 != null ? Number(r2) : null,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  const redis = getRedis();
  if (!redis) {
    console.error("Redis 연결 실패 - 환경 변수 확인 필요");
    console.error("UPSTASH_REDIS_REST_URL:", process.env.UPSTASH_REDIS_REST_URL ? "설정됨" : "없음");
    console.error("UPSTASH_REDIS_REST_TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN ? "설정됨" : "없음");
    res.status(503).json({
      error:
        "점수 저장소가 설정되지 않았어요. Vercel 대시보드에서 Upstash Redis를 연결해 주세요.",
    });
    return;
  }
  
  console.log("API 요청:", req.method, req.url);

  if (req.method === "GET") {
    try {
      const state = await getGameState(redis);
      console.log("GET 요청 - 현재 상태:", state);
      res.status(200).json(state);
    } catch (err) {
      console.error("GET 요청 실패:", err);
      res.status(500).json({ error: "상태 조회 실패" });
    }
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { code, entered, reactionTime } = body;

    if (!VALID_CODES.includes(code)) {
      res.status(400).json({ error: "code(1111 또는 0000)가 필요해요." });
      return;
    }

    if (entered === true) {
      // 게임이 이미 진행 중이면 입장 불가 (두 명 모두 반응 시간이 있으면 게임 진행 중)
      const state = await getGameState(redis);
      if (state.reaction_1111 != null && state.reaction_0000 != null) {
        res.status(400).json({ error: "게임이 진행 중이에요. 잠시 후 다시 시도해 주세요." });
        return;
      }
      
      // 입장 상태 저장 (명시적으로 "1"로 저장, TTL 없음)
      await redis.set(KEY_ENTERED_PREFIX + code, "1");
      const updatedState = await getGameState(redis);
      console.log("입장 상태 저장 완료:", code, "저장된 상태:", updatedState);
      res.status(200).json({ success: true, state: updatedState });
      return;
    }

    if (typeof reactionTime === "number" && reactionTime >= 0) {
      await redis.set(KEY_REACTION_PREFIX + code, reactionTime);
      const state = await getGameState(redis);
      
      // 두 명 모두 반응 시간을 제출했으면 게임 종료 → 입장 상태와 반응 시간 리셋
      if (state.reaction_1111 != null && state.reaction_0000 != null) {
        // 게임 종료 후 5초 뒤에 자동으로 리셋 (결과 확인 시간 제공)
        setTimeout(async () => {
          await Promise.all([
            redis.del(KEY_ENTERED_PREFIX + "1111"),
            redis.del(KEY_ENTERED_PREFIX + "0000"),
            redis.del(KEY_REACTION_PREFIX + "1111"),
            redis.del(KEY_REACTION_PREFIX + "0000"),
          ]);
        }, 5000);
      }
      
      res.status(200).json({
        success: true,
        times: {
          "1111": state.reaction_1111,
          "0000": state.reaction_0000,
        },
      });
      return;
    }

    res.status(400).json({
      error: "entered(true) 또는 reactionTime(0 이상 숫자)가 필요해요.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "저장 실패" });
  }
};
