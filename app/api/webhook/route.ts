import { NextResponse } from "next/server"

type SSEClient = {
  controller: ReadableStreamDefaultController<Uint8Array>;
  keepAlive: NodeJS.Timeout;
};

// Store connected SSE clients
let clients: SSEClient[] = [];

export async function POST(req: Request) {
  const body = await req.json();
  // Broadcast to all SSE clients
  clients.forEach(({ controller }) => {
    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(body)}\n\n`)
    );
  });
  return NextResponse.json({ received: true });
}

export async function GET() {
  let controllerRef: ReadableStreamDefaultController<Uint8Array>;
  let keepAliveRef: NodeJS.Timeout;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller;
      // Keep the connection open
      keepAliveRef = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(":keep-alive\n\n"));
      }, 25000);
      // Add this controller to clients
      clients.push({ controller, keepAlive: keepAliveRef });
    },
    cancel() {
      clearInterval(keepAliveRef);
      clients = clients.filter((c) => c.controller !== controllerRef);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}