// 방별 점수 저장 — Upstash Redis 사용 (Vercel Marketplace에서 Upstash Redis 연결 필요)
const { Redis } = require("@upstash/redis");

const VALID_CODES = ["1111", "0000"];
const KEY_PREFIX = "game_score_";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

async function getScores(redis) {
  if (!redis) {
    return { "1111": null, "0000": null };
  }
  const [s1, s2] = await Promise.all([
    redis.get(KEY_PREFIX + "1111"),
    redis.get(KEY_PREFIX + "0000"),
  ]);
  return {
    "1111": s1 != null ? Number(s1) : null,
    "0000": s2 != null ? Number(s2) : null,
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
      const scores = await getScores(redis);
      res.status(200).json(scores);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "점수 조회 실패" });
    }
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { code, score } = body;

    if (!VALID_CODES.includes(code) || typeof score !== "number" || score < 0) {
      res.status(400).json({ error: "code와 score(0 이상 숫자)가 필요해요." });
      return;
    }

    await redis.set(KEY_PREFIX + code, score);
    const scores = await getScores(redis);
    res.status(200).json({ success: true, scores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "저장 실패" });
  }
};
