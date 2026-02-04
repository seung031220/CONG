const { Resend } = require("resend");

const TO_EMAIL = "seung031220@naver.com";
const FROM_EMAIL = "콩한쪽 <onboarding@resend.dev>";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "RESEND_API_KEY가 설정되지 않았어요. Vercel 환경 변수를 확인해 주세요.",
    });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { part, model, partLabel, modelLabel, name, phone, address } = body;

    if (!name || !phone || !address) {
      res.status(400).json({ error: "이름, 전화번호, 주소를 모두 입력해 주세요." });
      return;
    }

    const resend = new Resend(apiKey);

    const subject = "[콩한쪽] 부품 등록 – " + (modelLabel || model) + " / " + (partLabel || part);
    const html = `
      <h2>콩한쪽 부품 등록</h2>
      <p><strong>배송 주소 안내</strong></p>
      <p>경기도 수원시 장안구 서부로 2066 (16419) 제 2공학관 26310</p>
      <hr />
      <p><strong>선택한 부품·모델</strong></p>
      <ul>
        <li>모델: ${modelLabel || model || "-"}</li>
        <li>부품: ${partLabel || part || "-"}</li>
      </ul>
      <p><strong>신청자 정보</strong></p>
      <ul>
        <li>이름: ${name}</li>
        <li>전화번호: ${phone}</li>
        <li>주소: ${address}</li>
      </ul>
      <p>위 주소로 부품을 보내주시면 됩니다.</p>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend error:", error);
      res.status(500).json({ error: error.message || "이메일 전송에 실패했어요." });
      return;
    }

    res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message || "전송 중 오류가 발생했어요.",
    });
  }
};
