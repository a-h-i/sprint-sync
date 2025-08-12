import { Logger } from '@nestjs/common';

interface IMessage {
  method: string;
  path: string;
  userId: number;
  statusCode: number;
  startTime: bigint;
  error?: unknown;
}

export function logRequest(logger: Logger, message: IMessage) {
  const end = process.hrtime.bigint(); // End time in ns
  const latencyMs = (end - message.startTime) / 1_000_000n; // Convert to milliseconds
  logger.log({
    method: message.method,
    path: message.path,
    userId: message.userId,
    statusCode: message.statusCode,
    latencyMs: latencyMs.toString(10),
    error: message.error,
  });
}
