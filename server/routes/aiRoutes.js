const express = require("express");

const router = express.Router();

const ACTIONS = {
  debug: {
    title: "Debug",
    instruction:
      "Find bugs, runtime errors, edge cases, and likely fixes in this code. Be concise and practical.",
  },
  explain: {
    title: "Explain",
    instruction:
      "Explain what this code does in clear language. Mention important functions, data flow, and any assumptions.",
  },
  optimize: {
    title: "Optimize",
    instruction:
      "Suggest performance, readability, and maintainability improvements for this code. Include improved code only when helpful.",
  },
};

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function buildMessages(action, code, language) {
  const languageHint = language ? `Language: ${language}` : "Language: unknown";

  return [
    {
      role: "system",
      content:
        "You are IntelliCode, a careful AI coding assistant. Return direct, useful answers for developers.",
    },
    {
      role: "user",
      content: `${ACTIONS[action].instruction}\n\n${languageHint}\n\nCode:\n${code}`,
    },
  ];
}

function validateRequest(req, res) {
  const { code, language = "javascript" } = req.body || {};

  if (typeof code !== "string" || code.trim().length === 0) {
    res.status(400).json({ error: "Request body must include a non-empty code string." });
    return null;
  }

  if (code.length > 30000) {
    res.status(413).json({ error: "Code is too large. Please send 30,000 characters or fewer." });
    return null;
  }

  return { code, language };
}

async function callOpenAI(action, code, language) {
  if (!process.env.OPENAI_API_KEY) {
    const missingKeyError = new Error("OPENAI_API_KEY is not configured on the server.");
    missingKeyError.status = 500;
    throw missingKeyError;
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: buildMessages(action, code, language),
      temperature: 0.2,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiError = new Error(data.error?.message || "OpenAI request failed.");
    apiError.status = response.status;
    throw apiError;
  }

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    const emptyResponseError = new Error("OpenAI returned an empty response.");
    emptyResponseError.status = 502;
    throw emptyResponseError;
  }

  return content;
}

function createActionHandler(action) {
  return async (req, res, next) => {
    const validated = validateRequest(req, res);

    if (!validated) {
      return;
    }

    try {
      const result = await callOpenAI(action, validated.code, validated.language);
      res.json({ action, result });
    } catch (error) {
      next(error);
    }
  };
}

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    routes: ["/api/ai", "/api/debug", "/api/explain", "/api/optimize"],
    model: DEFAULT_MODEL,
  });
});

router.post("/ai", async (req, res, next) => {
  const { action } = req.body || {};

  if (!ACTIONS[action]) {
    res.status(400).json({
      error: "Request body must include action as one of: debug, explain, optimize.",
    });
    return;
  }

  return createActionHandler(action)(req, res, next);
});

router.post("/debug", createActionHandler("debug"));
router.post("/explain", createActionHandler("explain"));
router.post("/optimize", createActionHandler("optimize"));

module.exports = router;
