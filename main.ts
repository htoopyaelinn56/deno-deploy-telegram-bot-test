export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
}

Deno.serve((_req) => {
  const url = new URL(_req.url);

  console.log("Request received:", url.pathname, url.search);

  const data = {
    message: "Hello from Deno!",
    timestamp: new Date().toISOString(),
    status: "success",
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 200,
    statusText: "OK",
  });
});
