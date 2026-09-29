export type SignalEvent = { on: boolean; duration: number };

export class SignalClock {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private generation = 0;

  stop() {
    this.generation++;
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  start(
    events: SignalEvent[],
    onEvent: (event: SignalEvent, progress: number) => void,
    onComplete: () => void,
  ) {
    this.stop();
    const generation = this.generation;
    const total = events.reduce((sum, event) => sum + event.duration, 0);
    const started = Date.now();
    let index = 0;
    let elapsed = 0;
    const advance = () => {
      if (generation !== this.generation) return;
      if (index === events.length) {
        this.timer = undefined;
        onComplete();
        return;
      }
      const event = events[index++];
      onEvent(event, total ? elapsed / total : 0);
      elapsed += event.duration;
      this.timer = setTimeout(
        advance,
        Math.max(0, started + elapsed - Date.now()),
      );
    };
    advance();
  }
}
