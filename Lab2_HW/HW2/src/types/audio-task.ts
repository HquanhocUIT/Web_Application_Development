export type AudioTaskStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'failed'

export interface AudioTask {
  readonly id: string
  readonly url: string
  readonly controller: AbortController
  status: AudioTaskStatus
  error: unknown | null
}

export interface AudioTaskHandle<TResult> {
  readonly taskId: string
  readonly promise: Promise<TResult>
}

export type AudioTaskProcessor<TResult> = (
  url: string,
  signal: AbortSignal,
) => Promise<TResult>

export interface AudioTaskQueueSnapshot {
  /** Tasks in the order they were added. */
  readonly tasks: readonly Readonly<AudioTask>[]
  /** IDs in FIFO order. */
  readonly pendingTaskIds: readonly string[]
  readonly processingTaskId: string | null
}
