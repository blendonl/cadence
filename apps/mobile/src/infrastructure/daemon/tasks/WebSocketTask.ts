import { EventDrivenDaemonTask } from './base/EventDrivenDaemonTask';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import { getEventBus, FileChangeEventPayload } from '../../../core/EventBus';
import { DaemonTaskConfig } from '../interfaces';

export interface WebSocketTaskConfig extends DaemonTaskConfig {
  entityTypes: string[];
}

interface BackendChangeMessage {
  entityType: string;
  changeType: 'added' | 'modified' | 'deleted';
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class WebSocketTask extends EventDrivenDaemonTask {
  readonly name = 'WebSocketTask';

  private wsClient: WebSocketClient;
  private taskConfig: WebSocketTaskConfig;
  private unsubscribeWs: (() => void) | null = null;

  constructor(wsClient: WebSocketClient, config: WebSocketTaskConfig) {
    super(config);
    this.wsClient = wsClient;
    this.taskConfig = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    if (!this.config.enabled) {
      console.log(`[${this.name}] Task is disabled`);
      return;
    }

    this.isRunning = true;

    this.unsubscribeWs = this.wsClient.on<BackendChangeMessage>('change', (message) => {
      this.handleChangeMessage(message);
    });

    this.wsClient.connect();

    await this.waitForConnection(5000);

    if (this.taskConfig.entityTypes.length > 0) {
      this.subscribeToEntityTypes(this.taskConfig.entityTypes);
    }

    console.log(`[${this.name}] Started`);
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.unsubscribeWs) {
      this.unsubscribeWs();
      this.unsubscribeWs = null;
    }

    this.wsClient.disconnect();

    this.isRunning = false;
    console.log(`[${this.name}] Stopped`);
  }

  private subscribeToEntityTypes(entityTypes: string[]): void {
    if (!this.wsClient.isConnected()) {
      console.warn(`[${this.name}] Cannot subscribe, not connected`);
      return;
    }

    this.wsClient.send('subscribe', { entityTypes });
    console.log(`[${this.name}] Subscribed to entity types: ${entityTypes.join(', ')}`);
  }

  private handleChangeMessage(message: BackendChangeMessage): void {
    if (this.taskConfig.entityTypes.length > 0 && !this.taskConfig.entityTypes.includes(message.entityType)) {
      return;
    }

    console.log(`[${this.name}] Change detected:`, message);

    const eventBus = getEventBus();
    const timestamp = new Date(message.timestamp);

    const fileChangePayload: FileChangeEventPayload = {
      entityType: message.entityType as any,
      changeType: message.changeType as any,
      filePath: message.entityId,
      timestamp,
    };

    eventBus.publishSync('file_changed', fileChangePayload);

    eventBus.publishSync('entity_changed', {
      id: message.entityId,
      entityType: message.entityType as any,
      changeType: message.changeType,
      timestamp,
      metadata: message.metadata,
    });
  }

  private async waitForConnection(timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.wsClient.isConnected()) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error('Connection timeout'));
      }, timeoutMs);

      const unsubscribe = this.wsClient.onEvent('connected', () => {
        clearTimeout(timeout);
        unsubscribe();
        resolve();
      });
    });
  }
}
