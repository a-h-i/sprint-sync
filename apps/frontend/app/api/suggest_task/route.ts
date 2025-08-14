import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import assert from 'assert';
import { cookies } from 'next/headers';
import { checkHasToken } from '@/lib/auth/auth.service';

export const dynamic = 'force-dynamic';

const GetQuerySchema = z.object({
  task_title: z.string().min(5),
});

export async function GET(req: NextRequest) {
  const baseAiUrl = process.env.AI_API_URL;
  assert(baseAiUrl != null, 'AI_API_URL is not set');
  const cookieStore = await cookies();
  if (!checkHasToken(cookieStore)) {
    // in a non-demo app we would use the same JWT token or the auth service itself to verify the token
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const url = [baseAiUrl, 'ai', 'suggest'].join('/');
  const requestQuery = GetQuerySchema.parse({
    task_title: req.nextUrl.searchParams.get('task_title') ?? undefined,
  });
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_title: requestQuery.task_title,
    }),
  });
  return new NextResponse(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Transfer-Encoding': 'chunked',
      Connection: 'keep-alive',
    },
  });
}
