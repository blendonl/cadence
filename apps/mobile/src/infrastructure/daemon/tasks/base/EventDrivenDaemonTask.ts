import { IDaemonTask, DaemonTaskConfig } from '../../interfaces';

const DEFAULT_CONFIG: DaemonTaskConfig = {
  enabled: true,
  runInBackground: false,
};

export abstract class EventDrivenDaemonTask implements IDaemonTask<void> {
  abstract readonly name: string;

  protected config: DaemonTaskConfig;
  protected isRunning = false;

  constructor(config: Partial<DaemonTaskConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  abstract start(): Promise<void>;
  abstract stop(): void;

  async execute(): Promise<void> {
    return;
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getConfig(): DaemonTaskConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<DaemonTaskConfig>): void {
    const wasRunning = this.isRunning;
    if (wasRunning) {
      this.stop();
    }

    this.config = { ...this.config, ...config };

    if (wasRunning && this.config.enabled) {
      this.start();
    }
  }
}
