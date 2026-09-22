// A tiny async concurrency limiter. Wrap an async task with the returned
// function and at most `max` tasks run at once; the rest queue and resume as
// slots free up. Used to stop feed scrolling from firing hundreds of Gemini
// calls in parallel.

export function createLimiter(max: number) {
  let active = 0;
  const waiting: Array<() => void> = [];

  async function acquire(): Promise<void> {
    if (active < max) {
      active++;
      return;
    }
    // No free slot — wait until release() hands one directly to us.
    await new Promise<void>((resolve) => waiting.push(resolve));
  }

  function release(): void {
    const next = waiting.shift();
    if (next) {
      next(); // hand our slot straight to the next waiter (active unchanged)
    } else {
      active--;
    }
  }

  return async function run<T>(task: () => Promise<T>): Promise<T> {
    await acquire();
    try {
      return await task();
    } finally {
      release();
    }
  };
}
