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

      let responseText: string;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-05-20",
          contents: update.message!.text!,
        });
        responseText = response.text!;
      } catch (apiError) {
        console.error("AI API Error:", apiError);
        responseText =
          "❌ Sorry, I'm having trouble processing your request right now. Please try again later.";
      }

      try {
        await bot.sendMessage(
          update.message!.chat.id,
          responseText,
        );
      } catch (sendError) {
        console.error("Failed to send message to user:", sendError);
        // Try to send a simpler error message
        try {
          await bot.sendMessage(
            update.message!.chat.id,
            "❌ An error occurred while processing your message.",
          );
        } catch (finalError) {
          console.error("Failed to send error message:", finalError);
        }
      }
      console.info("Webhook", "Success sent message");
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook", "Failed to process update", error);
      return new Response("Error processing update", { status: 500 });
    }
  }
  return new Response("Not found", { status: 404 });
});
