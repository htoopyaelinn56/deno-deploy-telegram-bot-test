import TelegramBot from "node-telegram-bot-api";
import { GoogleGenAI } from "@google/genai";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

Deno.serve(async (_req: Request) => {
  console.log("Received request:", _req.method, _req.url);
  if (_req.method === "POST") {
    try {
      const update = await _req.json() as TelegramBot.Update;
      await bot.sendChatAction(update.message!.chat.id, "typing");

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: update.message!.text!,
      });

      await bot.sendMessage(
        update.message!.chat.id,
        response.text!,
      );
      console.info("Webhook", "Success sent message");
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook", "Failed to process update", error);
      return new Response("Error processing update", { status: 500 });
    }
  }
  return new Response("Not found", { status: 404 });
});
