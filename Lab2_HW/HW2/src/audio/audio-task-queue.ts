import type {
  AudioTask,
  AudioTaskHandle,
  AudioTaskProcessor,
  AudioTaskQueueSnapshot,
} from '../types/audio-task'

export interface AudioTaskQueueOptions<TResult> {
  processTask: AudioTaskProcessor<TResult>
  onChange?: (snapshot: AudioTaskQueueSnapshot) => void
}

interface InternalAudioTask<TResult> extends AudioTask {
  resolve: (result: TResult | PromiseLike<TResult>) => void
  reject: (reason: unknown) => void
  settled: boolean
  cancelRequested: boolean
}

/** Runs at most one task at a time, always in first-in-first-out order. */
export class AudioTaskQueue<TResult> {
  private readonly options: AudioTaskQueueOptions<TResult>
  private readonly tasks: InternalAudioTask<TResult>[] = []
  private readonly pendingTasks: InternalAudioTask<TResult>[] = []
  private processingTask: InternalAudioTask<TResult> | null = null
  private processingPromise: Promise<void> | null = null
  private cleanupPromise: Promise<void> | null = null
  private nextTaskNumber = 1
  private isClosed = false

  constructor(options: AudioTaskQueueOptions<TResult>) {
    this.options = options
  }

  /** Adds a task to the end of the queue and returns its result promise. */
  enqueue(url: string): AudioTaskHandle<TResult> {
    if (this.isClosed) {
      throw new Error('Cannot add a task after the queue has been cleaned up.')
    }

    const id = `audio-task-${this.nextTaskNumber}`
    this.nextTaskNumber += 1

    let resolveTask!: InternalAudioTask<TResult>['resolve']
    let rejectTask!: InternalAudioTask<TResult>['reject']
    const promise = new Promise<TResult>((resolve, reject) => {
      resolveTask = resolve
      rejectTask = reject
    })

    const task: InternalAudioTask<TResult> = {
      id,
      url,
      controller: new AbortController(),
      status: 'pending',
      error: null,
      resolve: resolveTask,
      reject: rejectTask,
      settled: false,
      cancelRequested: false,
    }

    this.tasks.push(task)
    this.pendingTasks.push(task)

    // Let enqueue return its promise before processing can settle it.
    queueMicrotask(() => {
      this.emitChange()
      void this.processNext()
    })

    return { taskId: id, promise }
  }

  /** Starts the oldest pending task unless another task is still running. */
  processNext(): Promise<void> {
    if (this.processingPromise) {
      return this.processingPromise
    }

    if (this.isClosed) {
      return Promise.resolve()
    }

    const task = this.pendingTasks.shift()

    if (!task) {
      return Promise.resolve()
    }

    this.processingTask = task
    task.status = 'processing'

    const runPromise = this.runTask(task)
    this.processingPromise = runPromise.finally(() => {
      this.processingTask = null
      this.processingPromise = null
      this.emitChange()

      if (!this.isClosed) {
        void this.processNext()
      }
    })

    this.emitChange()
    return this.processingPromise
  }

  /**
   * Cancels a pending task immediately or requests cancellation of the active
   * task. An active decode may finish before its result is discarded.
   */
  cancel(taskId: string): boolean {
    const task = this.tasks.find((candidate) => candidate.id === taskId)

    if (!task || task.settled) {
      return false
    }

    if (task === this.processingTask) {
      if (task.cancelRequested) {
        return false
      }

      task.cancelRequested = true
      task.controller.abort()
      this.emitChange()
      return true
    }

    const pendingIndex = this.pendingTasks.indexOf(task)

    if (pendingIndex === -1) {
      return false
    }

    this.pendingTasks.splice(pendingIndex, 1)
    task.cancelRequested = true
    task.controller.abort()
    this.finishCancelled(task, createAbortError())
    this.emitChange()

    if (!this.processingTask && !this.isClosed) {
      void this.processNext()
    }

    return true
  }

  /** Returns a detached view of queue and task state. */
  getSnapshot(): AudioTaskQueueSnapshot {
    return {
      tasks: this.tasks.map((task) => ({
        id: task.id,
        url: task.url,
        controller: task.controller,
        status: task.status,
        error: task.error,
      })),
      pendingTaskIds: this.pendingTasks.map((task) => task.id),
      processingTaskId: this.processingTask?.id ?? null,
    }
  }

  /** Cancels all remaining tasks, waits for active work, then releases state. */
  cleanup(): Promise<void> {
    if (this.cleanupPromise) {
      return this.cleanupPromise
    }

    this.isClosed = true

    for (const task of [...this.pendingTasks]) {
      this.cancel(task.id)
    }

    if (this.processingTask) {
      this.cancel(this.processingTask.id)
    }

    const activeTaskPromise = this.processingPromise

    this.cleanupPromise = (async () => {
      if (activeTaskPromise) {
        await activeTaskPromise
      }

      this.tasks.length = 0
      this.pendingTasks.length = 0
      this.emitChange()
    })()

    return this.cleanupPromise
  }

  private async runTask(task: InternalAudioTask<TResult>): Promise<void> {
    try {
      const result = await this.options.processTask(
        task.url,
        task.controller.signal,
      )

      if (task.cancelRequested || task.controller.signal.aborted) {
        this.finishCancelled(task, createAbortError())
        return
      }

      if (this.finishTask(task)) {
        task.status = 'completed'
        task.error = null
        task.resolve(result)
      }
    } catch (error) {
      if (
        task.cancelRequested ||
        task.controller.signal.aborted ||
        isAbortError(error)
      ) {
        this.finishCancelled(task, isAbortError(error) ? error : createAbortError())
        return
      }

      if (this.finishTask(task)) {
        task.status = 'failed'
        task.error = error
        task.reject(error)
      }
    }
  }

  private finishCancelled(
    task: InternalAudioTask<TResult>,
    reason: unknown,
  ) {
    if (!this.finishTask(task)) {
      return
    }

    task.status = 'cancelled'
    task.error = reason
    task.reject(reason)
  }

  private finishTask(task: InternalAudioTask<TResult>): boolean {
    if (task.settled) {
      return false
    }

    task.settled = true
    return true
  }

  private emitChange() {
    try {
      this.options.onChange?.(this.getSnapshot())
    } catch (error) {
      console.error('AudioTaskQueue onChange callback failed.', error)
    }
  }
}

function createAbortError() {
  return new DOMException('The audio task was cancelled.', 'AbortError')
}

function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'name' in error
    && error.name === 'AbortError'
}
