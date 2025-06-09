import TelegramBot from "node-telegram-bot-api";
import { GoogleGenAI } from "@google/genai";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface RouteSegment {
  from: string;
  to: string;
}

interface TravelPlan {
  route_plan: RouteSegment[];
  navigation: boolean;
  message: string | null;
}

Deno.serve(async (_req: Request) => {
  console.log("Received request:", _req.method, _req.url);
  if (_req.method === "POST") {
    try {
      const update = await _req.json() as TelegramBot.Update;
      await bot.sendChatAction(update.message!.chat.id, "typing");

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-05-20",
          contents: `message = ${
            update.message!.text
          }. If the user message is asking about navigation, Extract from and to location in json format. I want to use it for navigation. Provide only json response in array, because there is multiple destinations which means you have to take multiple bus routes. example response is {\"route_plan\" : [{\"from\" : \"a\",\"to\" : \"b\"},],\"navigation\" : true or false, \"message\" : \"reply_messsage\"}. navigation field will be true if user ask about navigation else false, message field will be reply user's prompt appropriately in the language they asked. the message filed will be null, if the message is about navigation.`,
          config: {
            maxOutputTokens: 65536,
          },
        });

        console.info("Webhook", "Response from Gemini:", response.text);

        const formattedJsonStringResponse = response.text!.replace(
          /^```json\n/,
          "",
        )
          .replace(
            /\n```$/,
            "",
          );

        const travelPlan: TravelPlan = JSON.parse(formattedJsonStringResponse);
        await bot.sendChatAction(update.message!.chat.id, "typing");
        let responseText = "";
        if (travelPlan.message == null) {
          responseText =
            "Navigation အတွက်က development လုပ်နေတုန်းမလို့ နောက်မှ မေးပါခင်ဗျာ။";
        } else {
          responseText = travelPlan.message;
        }
        await bot.sendMessage(
          update.message!.chat.id,
          responseText,
        );
      } catch (sendError) {
        console.error("Failed to send message to user:", sendError);
        await bot.sendMessage(
          update.message!.chat.id,
          "❌ An error occurred while generating response.",
        );
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
