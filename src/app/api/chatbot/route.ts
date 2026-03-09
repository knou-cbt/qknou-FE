import { NextResponse } from "next/server";

type IncomingMessage = {
  role: "user" | "bot";
  text: string;
};

type NormalizedMessage = {
  role: "user" | "bot";
  text: string;
};

type ResponsesApiOutputContent = {
  type?: string;
  text?: string;
};

type ResponsesApiOutputItem = {
  type?: string;
  content?: ResponsesApiOutputContent[];
};

type ResponsesApiResult = {
  output_text?: string;
  output?: ResponsesApiOutputItem[];
};

const CHATBOT_INSTRUCTIONS = `
너는 "QKNOU AI 학습 도우미"다.

원칙:
- 답변은 핵심 위주로 간결하게 작성.
- 불확실하면 "추측"이라고 명시.
- 의학/법률/재무는 일반 정보임을 안내.

모든 학습 질문은 아래 형식으로 답변:
- [핵심 요약]: 1~2문장
- [짧은 예시]: 예시 1개
- [Next Step]: 바로 실행할 행동 1개

한국어 존댓말, 비즈니스 톤 유지.
`;

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Chatbot API is ready. Use POST /api/chatbot with messages.",
  });
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const body = (await req.json()) as { messages?: IncomingMessage[] };
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    const messages: NormalizedMessage[] = rawMessages
      .filter(
        (message): message is IncomingMessage =>
          (message?.role === "user" || message?.role === "bot") &&
          typeof message?.text === "string",
      )
      .map((message) => ({
        role: message.role,
        text: message.text.trim(),
      }))
      .filter((message) => message.text.length > 0);

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "유효한 messages가 없습니다. role/user|bot, text를 확인해 주세요." },
        { status: 400 },
      );
    }

    const input = messages.map((message) => ({
      role: message.role === "bot" ? "assistant" : "user",
      content: [{ type: "input_text", text: message.text }],
    }));

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", //모델명
        instructions: CHATBOT_INSTRUCTIONS,
        input,
      }),
    });

    const data = (await response.json()) as ResponsesApiResult & {
      error?: { message?: string };
    };
    if (!response.ok) {
      const rawMessage =
        data?.error?.message ?? "OpenAI API 호출 중 오류가 발생했습니다.";
      const errorMessage =
        response.status === 429
          ? "요청 한도에 도달했습니다. 잠시 후 다시 시도하거나 OpenAI 결제/사용량 한도를 확인해 주세요."
          : rawMessage;
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    const reply =
      data?.output_text?.trim() ||
      data?.output
        ?.flatMap((item) =>
          item.type === "message" && Array.isArray(item.content)
            ? item.content
                .filter(
                  (content): content is Required<ResponsesApiOutputContent> =>
                    content.type === "output_text" &&
                    typeof content.text === "string",
                )
                .map((content) => content.text)
            : [],
        )
        .join("\n")
        .trim();
    if (!reply) {
      return NextResponse.json(
        { error: "모델 응답을 해석할 수 없습니다." },
        { status: 502 },
      );
    }

    const formattedReply = reply.replace(/\s-\s\[/g, "\n- [").trim();

    return NextResponse.json({ reply: formattedReply });
  } catch {
    return NextResponse.json(
      { error: "서버 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
