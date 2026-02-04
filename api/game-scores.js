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
  return {
    entered_1111: e1 === true || e1 === 1 || e1 === "1",
    entered_0000: e2 === true || e2 === 1 || e2 === "1",
    reaction_1111: r1 != null ? Number(r1) : null,
    reaction_0000: r2 != null ? Number(r2) : null,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  const redis = getRedis();
  if (!redis) {
    res.status(503).json({
      error:
        "점수 저장소가 설정되지 않았어요. Vercel 대시보드에서 Upstash Redis를 연결해 주세요.",
    });
    return;
  }

  if (req.method === "GET") {
    try {
      const state = await getGameState(redis);
      res.status(200).json(state);
    } catch (err) {
      console.error(err);
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
      
      // 입장 상태 저장
      await redis.set(KEY_ENTERED_PREFIX + code, true);
      const updatedState = await getGameState(redis);
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
