export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
}

Deno.serve((_req) => {
  const url = new URL(_req.url);

  console.log("Request received:", url.searchParams.toString());

  const input = url.searchParams.get("input");

  if (!input) {
    return new Response(
      JSON.stringify({
        message: "Invalid input!",
        status: "error",
        statusCode: 400,
      }),
    );
  }

  const data = {
    message: "Hello from Deno!",
    timestamp: new Date().toISOString(),
    status: "success",
    input: input,
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 200,
    statusText: "OK",
  });
});
