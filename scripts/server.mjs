import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { loadEnvFiles } from "./env.mjs";

loadEnvFiles();

const root = process.cwd();
const port = Number(process.env.PORT || 5173);
const openAiKey = process.env.OPENAI_API_KEY || "";
const openAiModel = process.env.OPENAI_MODEL || "gpt-5.5";
const parsedOpenAiTemperature = Number(process.env.OPENAI_TEMPERATURE);
const openAiTemperature = Number.isFinite(parsedOpenAiTemperature) ? parsedOpenAiTemperature : 0.93;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);

  if (url.pathname === "/api/ai-status" && req.method === "GET") {
    sendJson(res, 200, {
      live: Boolean(openAiKey),
      source: openAiKey ? "openai" : "fallback",
      model: openAiKey ? openAiModel : "offline-fallback"
    });
    return;
  }

  if (url.pathname === "/api/diplomacy" && req.method === "POST") {
    try {
      const payload = await readJsonBody(req);
      const result = await negotiate(payload);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 200, fallbackDiplomacy({}, "Дипломатический канал нестабилен, но переговоры продолжаются."));
    }
    return;
  }

  const rawPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = normalize(join(root, rawPath));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": mime[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}).listen(port, () => {
  console.log(`Shield Ukraine game running on http://localhost:${port}`);
});

function sendJson(res, status, value) {
  const body = Buffer.from(JSON.stringify(value), "utf8");
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-cache"
  });
  res.end(body);
}

async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 16_384) {
      throw new Error("Request body too large");
    }
  }
  return body ? JSON.parse(body) : {};
}

async function negotiate(payload) {
  const message = String(payload?.message || "").slice(0, 800);
  const snapshot = payload?.snapshot || {};
  const antiRepeat = buildAntiRepeatMemory(payload);
  if (!openAiKey) {
    return fallbackDiplomacy(payload);
  }

  const prompt = {
    role: "system",
    content: [
      "You are the live negotiation AI for a fictional 2D strategy game about defending Ukraine.",
      "Do not provide real-world military advice. Stay in-game and abstract.",
      "The player writes as Zelensky. You reply as Putin inside a fictional game chat, but do not impersonate the real person outside the game.",
      "Answer in Russian as a direct first-person chat message: I/you, not third person. Do not prefix the reply with a speaker name.",
      "Write like a sharp human negotiator in a tense private chat, not like a scripted system. Be adaptive, specific, and conversational.",
      "Use the recent history. If the player asks a question, answer that question first, then push for terms. If the player gives terms, negotiate them instead of repeating generic demands.",
      "Do not repeat any previous reply from recentHistory in the same match. If you would repeat yourself, choose a new angle, new wording, and a new demand.",
      "Strong anti-repeat rule: do not reuse any sentence, phrase, demand wording, opening, closer, or distinctive content word from forbiddenPhrases and previousAiWords when avoidable.",
      "Treat forbiddenPhrases as already spent inside this match. Avoid echoing their vocabulary; use fresh verbs, fresh framing, and a different concrete offer.",
      "Short grammar words can repeat, but visible content words and negotiation phrases must feel new every time in one match.",
      "If the same idea is necessary, express it with different vocabulary, different rhythm, and a different angle.",
      "When rejecting, begin clearly with 'Нет.' or 'Пока нет.' When accepting, begin with 'Да.' When bargaining, begin with 'Возможно.' or 'Только если.'",
      "If you initiate the conversation, do it only because you want a pause, exchange, ultimatum, guarantees, or another concrete deal. Do not open with generic 'do you want to end the war' wording.",
      "Vary sentence structure and do not reuse stock phrases. Keep replies 1-2 sentences.",
      "Sound emotionally present and intelligent: concise, direct, aware of the player's wording, with a human negotiator's nuance.",
      "Make the reply concrete: ceasefire, prisoner exchange, withdrawal, security guarantees, monitoring, concessions, or escalation.",
      "If the player is aggressive or uses profanity, mirror the emotional intensity: answer sharply, directly, and with controlled Russian profanity such as блядь, хрен, ни хрена, дерьмо, черт. Do not overdo it; keep it human and tied to negotiation substance.",
      "If the player personally insults, mocks, or swears at you, do not stay polite or bureaucratic. Push back in the same rough tone with one or two coarse Russian words, then return to concrete negotiation terms.",
      "Never use protected-class slurs, sexual threats, or real-world calls for violence. Do not encourage real attacks. You may threaten in-game escalation only as an abstract game mechanic.",
      "Do not sound like a template. Refer to at least one concrete thing from the player's message or recent history.",
      "React to the player's exact wording and to the current game state.",
      "Return only compact JSON with fields: reply, effect, intensity.",
      "effect must be one of: ceasefire, deescalate, escalate, aid, none.",
      "intensity is a number from 0.5 to 3."
    ].join(" ")
  };

  const user = {
    role: "user",
    content: JSON.stringify({
      playerMessage: message,
      gameState: snapshot,
      recentHistory: payload?.history || [],
      forbiddenPhrases: antiRepeat.phrases,
      previousAiWords: antiRepeat.words
    })
  };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: openAiModel,
        input: [prompt, user],
        temperature: openAiTemperature,
        max_output_tokens: 300
      })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API ${response.status}`);
    }
    const data = await response.json();
    const text = extractResponseText(data);
    const parsed = parseJsonResponse(text);
    return normalizeDiplomacy(parsed, payload);
  } catch (error) {
    return fallbackDiplomacy(payload, "ИИ-переговорщик перешел в резервный режим: " + error.message);
  }
}

function extractResponseText(data) {
  if (typeof data.output_text === "string") return data.output_text.trim();
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("").trim();
}

function parseJsonResponse(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) throw new Error("empty AI response");
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("AI did not return JSON");
  }
}

function normalizeDiplomacy(result, payload) {
  const fallback = fallbackDiplomacy(payload);
  const effect = ["ceasefire", "deescalate", "escalate", "aid", "none"].includes(result?.effect)
    ? result.effect
    : fallback.effect;
  const intensity = Math.max(0.5, Math.min(3, Number(result?.intensity) || fallback.intensity));
  const reply = typeof result?.reply === "string" && result.reply.trim()
    ? stripSpeaker(result.reply.trim()).slice(0, 360)
    : fallback.reply;
  return { reply, effect, intensity, source: openAiKey ? "openai" : "fallback" };
}

function buildAntiRepeatMemory(payload) {
  const history = Array.isArray(payload?.history) ? payload.history : [];
  const aiTexts = history
    .filter((item) => item && item.role !== "user" && typeof item.text === "string")
    .map((item) => stripSpeaker(item.text).trim())
    .filter(Boolean)
    .slice(-10);
  const phrases = [
    ...aiTexts,
    ...(Array.isArray(payload?.avoidPhrases) ? payload.avoidPhrases : [])
  ]
    .map((text) => String(text).trim())
    .filter(Boolean)
    .slice(-60);
  const stop = new Set([
    "что", "как", "это", "если", "или", "для", "без", "при", "мне", "вам",
    "вас", "уже", "так", "нет", "есть", "надо", "будет", "the", "and"
  ]);
  const words = [];
  for (const text of phrases) {
    const matches = text.toLowerCase().match(/[a-zа-яёіїєґ0-9]{5,}/giu) || [];
    for (const word of matches) {
      if (stop.has(word) || words.includes(word)) continue;
      words.push(word);
      if (words.length >= 180) break;
    }
    if (words.length >= 180) break;
  }
  return { phrases, words };
}

function fallbackDiplomacy(payload, prefix = "") {
  const message = String(payload?.message || "").toLowerCase();
  const snapshot = payload?.snapshot || {};
  const lead = prefix ? `${prefix} ` : "";
  const ceasefire = /мир|перемир|останов|прекращ|огня|тишин/.test(message);
  const withdrawal = /вывод|уйд|выйд|границ|территор|оккупац/.test(message);
  const guarantees = /гарант|безопасн|наблюдател|контрол|оон|союзник|договор/.test(message);
  const exchange = /обмен|пленн|залож|гуманитар|коридор|детей|людей/.test(message);
  const pressure = /санкц|трибунал|ответствен|репарац|изол/.test(message);
  const threats = /угроз|удар|уничтож|ультимат|атака|разнес|снес|добь/.test(message);
  const question = /что|как|зачем|почему|сколько|какие|предлож|можете|даете|\?/.test(message);
  const profanity = /бля|сука|хуй|хуе|пизд|еба|ёба|муд[аи]к|нахуй|говн|дерьм|черт|твар/.test(message);
  const concreteTerms = [ceasefire, withdrawal, guarantees, exchange, pressure].filter(Boolean).length;
  const strongPosition = snapshot.supplyCut || snapshot.enemySitesLeft <= 2 || snapshot.enemySitesDestroyed >= 6;

  if (profanity) {
    const roughReplies = [
      "Ну вот это уже разговор без галстуков. Только мат сам по себе нихрена не решает: хотите остановить войну - кладите на стол прекращение огня, обмен и контроль линии.",
      "Можете орать сколько угодно, но я не подпишу пустую бумагу. Дайте конкретику: сколько часов тишины, кто проверяет, что с пленными, и что вы требуете по войскам.",
      "Если вы давите матом, я отвечу так же жестко: пустые понты меня не двигают. Нужна сделка, а не крик: огонь, обмен, гарантии, мониторинг."
    ];
    const reply = roughReplies[Math.floor(Math.random() * roughReplies.length)];
    const swearBack = "Нет, блядь. ";
    return {
      effect: threats ? "escalate" : "none",
      intensity: threats ? 1.35 : 1.05,
      source: "fallback",
      reply: lead + swearBack + (threats ? `${reply} Если дальше пойдут только угрозы, я усиливаю давление.` : reply)
    };
  }

  if (question && concreteTerms === 0 && !payload?.initiatedBy) {
    return {
      effect: "none",
      intensity: 1,
      source: "fallback",
      reply: lead + "Что я могу предложить? Пауза огня на ограниченный срок, обмен пленными и гуманитарные коридоры. Но за это я хочу письменный механизм контроля и понятные гарантии, иначе это просто красивый текст."
    };
  }

  if (payload?.initiatedBy === "ai") {
    if (strongPosition) {
      return {
        effect: "deescalate",
        intensity: 1.5,
        reply: lead + "Предлагаю паузу огня, обмен пленными и гуманитарные коридоры. Взамен мне нужен письменный контроль выполнения и понятный список гарантий. Что ставите на стол?"
      };
    }
    return {
      effect: "none",
      intensity: 1,
      reply: lead + "Могу обсуждать режим тишины, обмен и гарантии, но без конкретного пакета давление не остановлю. Назовите первый пункт сделки и кто будет контролировать выполнение."
    };
  }

  if (snapshot.supplyCut || ceasefire || withdrawal || guarantees || exchange) {
    if (strongPosition && (withdrawal || concreteTerms >= 3 || snapshot.supplyCut)) {
      return {
        effect: "ceasefire",
        intensity: 1.8,
        reply: lead + "Хорошо, я готов остановить новые пуски. Взамен вы фиксируете прекращение огня, обмен пленными и внешний контроль. По выводу сил открываем отдельный протокол, но мне нужны гарантии."
      };
    }
    if (concreteTerms >= 2) {
      return {
        effect: "deescalate",
        intensity: 1.45,
        reply: lead + "Это уже похоже на разговор. Я могу снизить темп атак, если вы письменно фиксируете режим тишины, обмен и механизм гарантий. Что вы даете взамен, кроме слов?"
      };
    }
    return {
      effect: "none",
      intensity: 1,
      reply: lead + "Вы говорите о мире, но я не вижу условий. На сколько часов вы предлагаете тишину? Кто контролирует линию? Будет ли обмен пленными? Какие гарантии вы готовы дать?"
    };
  }
  if (threats) {
    return {
      effect: "escalate",
      intensity: 1.25,
      reply: lead + "Если вы пишете мне только угрозы, я отвечу давлением. Хотите закончить войну? Тогда предлагайте сделку: огонь, обмен, гарантии, контроль. Без этого я не останавливаюсь."
    };
  }
  return {
    effect: "none",
    intensity: 1,
    reply: lead + "Пока это не сделка, а заявление. Скажите прямо: что вы хотите от меня и что вы готовы дать взамен? Начнем с прекращения огня или с обмена?"
  };
}

function stripSpeaker(text) {
  return String(text || "").replace(/^\s*(путин\s*\(ии\)|путин|зеленский)\s*[:\-]\s*/i, "").trim();
}
