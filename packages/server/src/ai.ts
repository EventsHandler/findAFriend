import OpenAI from "openai";
import { prisma } from "./prisma";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function generate(prompt: string) {
  const res = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  return {
    message: res.choices[0]?.message.content,

    usage: {
      promptTokens: res.usage?.prompt_tokens,
      completionTokens: res.usage?.completion_tokens,
      totalTokens: res.usage?.total_tokens,
    },
  };
}

export async function generateUserProfile(userId: string, description: string) {
  const validTags = ["NATURE", "FOOD", "CULTURE", "ENTERTAINMENT", "SPORTS", "RELAXATION", "ADVENTURE", "SHOPPING", "HISTORY", "ART"];
    const prompt = `You are an assistant that generates structured user profile data.
Based on the following description about a person:
"${description}"
Your task is to output ONLY a valid JSON object with exactly this structure:
{
"description": string,
"tags": string[]
}
Rules:
- "description" must be a short, clear, human-like summary of the person based on the input.
- "tags" must be an array of strings chosen ONLY from the following allowed list:
${validTags.join(", ")}
- Do NOT invent new tags outside the list.
- Use only tags that strongly match the person.
- The response MUST be valid JSON (no markdown, no explanations, no extra text).
- Keep "description" concise (1–2 sentences max).
- Preserve the language of the original input description.
Return ONLY the JSON object.`;

  try {
    const response = await generate(prompt);
    const content = response.message?.trim();

    if (!content) {
      throw new Error("No response from AI");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Fallback: extract if possible or use defaults
      parsed = { description: description.substring(0, 100), tags: [] };
    }

    const profileDescription = parsed.description || "";
    const profileTags = Array.isArray(parsed.tags) ? parsed.tags.filter((tag: any) => typeof tag === 'string' && validTags.includes(tag)) : [];

    await prisma.user.update({
      where: { id: userId },
      data: {
        profileDescription,
        profileTags,
      },
    });

    return { profileDescription, profileTags };
  } catch (error) {
    console.error("Error generating user profile:", error);
    // Fallback: set to defaults
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileDescription: "",
        profileTags: [],
      },
    });
    return { profileDescription: "", profileTags: [] };
  }
}