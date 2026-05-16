import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = req.headers.get("x-ingest-secret");
  if (
    process.env.RAG_INGEST_SECRET &&
    secret !== process.env.RAG_INGEST_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Run `npm run seed:knowledge` locally with service role key to ingest chunks.",
  });
}
