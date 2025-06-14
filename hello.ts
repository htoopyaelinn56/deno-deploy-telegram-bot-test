Deno.serve((_req: Request) => {
  return new Response(JSON.stringify({
    "message": "Hello, world!",
    "status": "success",
  }));
});
