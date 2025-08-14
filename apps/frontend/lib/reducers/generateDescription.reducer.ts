'use client';

import assert from 'assert';

export enum GenerateDescriptionStatus {
  IDLE,
  WAITING_FOR_STREAM,
  STREAMING,
  STREAMING_DONE,
}

interface GenerateDescriptionState {
  streamingChunks: string[];
  status: GenerateDescriptionStatus;
}

type IdleAction = { type: 'idle' };
type StreamStartAction = { type: 'stream_start' };
type StreamChunkAction = { type: 'stream_chunk'; chunk: string };
type StreamEndAction = { type: 'stream_end' };

type GenerateDescriptionAction =
  | IdleAction
  | StreamStartAction
  | StreamChunkAction
  | StreamEndAction;

export function getGenerateDescriptionInitialState(): GenerateDescriptionState {
  return {
    streamingChunks: [],
    status: GenerateDescriptionStatus.IDLE,
  };
}

/**
 * Should be used with useImmerReducer
 */
export function generateDescriptionReducer(
  state: GenerateDescriptionState,
  action: GenerateDescriptionAction,
): void {
  switch (action.type) {
    case 'idle':
      state.streamingChunks = [];
      state.status = GenerateDescriptionStatus.IDLE;
      break;
    case 'stream_start':
      if (state.status === GenerateDescriptionStatus.WAITING_FOR_STREAM) {
        return;
      }
      assert(state.status === GenerateDescriptionStatus.IDLE);
      state.streamingChunks = [];
      state.status = GenerateDescriptionStatus.WAITING_FOR_STREAM;
      break;
    case 'stream_chunk':
      state.status = GenerateDescriptionStatus.STREAMING;
      state.streamingChunks.push(action.chunk);
      break;
    case 'stream_end':
      state.status = GenerateDescriptionStatus.STREAMING_DONE;
  }
}
