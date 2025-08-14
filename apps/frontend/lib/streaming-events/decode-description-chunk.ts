import { z } from 'zod';

const DescriptionSSEDataSchema = z.object({
  type: z.enum(['ai_token', 'ai_end', 'ai_start']),
  payload: z.any(),
});

export type DescriptionSSEData = z.infer<typeof DescriptionSSEDataSchema>;

export const TokenSSEEventPayloadSchema = z.object({
  token: z.string(),
  run_id: z.string(),
});
export type TokenSSEEventPayload = z.infer<typeof TokenSSEEventPayloadSchema>;

export function decodeDescriptionChunk(
  chunk: Uint8Array<ArrayBufferLike> | string,
): DescriptionSSEData[] {
  let text: string;
  if (typeof chunk === 'string') {
    text = chunk;
  } else {
    text = new TextDecoder().decode(chunk);
  }
  try {
    // we can receive multiple events in the same chunk
    const lines = text.split(/^\n+$/);
    const data: DescriptionSSEData[] = [];
    for (const line of lines) {
      const cleanedLine = line.replace(/data:/, '').replace(/\n+/g, '');
      if (line.trim().length === 0) {
        continue;
      }
      const parsed = DescriptionSSEDataSchema.parse(JSON.parse(cleanedLine));
      data.push(parsed);
    }
    return data;
  } catch (exception) {
    console.error({
      message: 'Error decoding description chunk',
      chunk,
      exception,
      text,
    });
    throw new Error('Error decoding description chunk');
  }
}
