import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

Deno.serve(async (_req: Request) => {
  console.log("Received request:", _req.method, _req.url);
  if (_req.method === "POST") {
    try {
      const update = await _req.json() as TelegramBot.Update;

      await bot.sendMessage(
        update.message!.chat.id,
        "hello @" + update.message!.from!.username + "!\nHow are you?",
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
