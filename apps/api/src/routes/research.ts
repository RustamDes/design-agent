import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt } from "../prompts";

const requestSchema = z.object({
  message: z.string().min(1),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  stage: z.string().default("discovery"),
});

export const researchRoutes = new Hono();

researchRoutes.post(
  "/stream",
  zValidator("json", requestSchema),
  async (c) => {
    const { message, history, stage } = c.req.valid("json");

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const messages: Anthropic.MessageParam[] = [
      ...history.map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    return streamSSE(c, async (stream) => {
      const response = await client.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 8096,
        system: getSystemPrompt(stage),
        messages,
      });

      for await (const event of response) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          await stream.writeSSE({
            data: JSON.stringify({ text: event.delta.text }),
            event: "delta",
          });
        }
      }

      await stream.writeSSE({ data: "", event: "done" });
    });
  }
);
