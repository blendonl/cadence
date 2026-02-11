/**
 * Storage Configuration Manager
 * Manages persistent configuration for boards directory and other storage settings
 */

import { injectable } from 'tsyringe';
import * as FileSystem from 'expo-file-system/legacy';

interface StorageConfigData {
  boardsDirectory?: string;
  version: string;
}

const CONFIG_VERSION = '1.0';
const DEFAULT_BOARDS_SUBDIR = 'boards/';

function isContentUri(path: string): boolean {
  return path.startsWith('content://');
}

@injectable()
export class StorageConfig {
  private configDir: string;
  private configFile: string;
  private cachedConfig: StorageConfigData | null = null;

  constructor() {
    const defaultDir = FileSystem.documentDirectory || '';
    const docDir = defaultDir.endsWith('/') ? defaultDir.slice(0, -1) : defaultDir;
    this.configDir = `${docDir}/.cadence/`;
    this.configFile = `${this.configDir}config.json`;
  }

  /**
   * Get the configured boards directory path
   * Returns custom path if set, otherwise returns default
   */
  async getBoardsDirectory(): Promise<string> {
    const config = await this.loadConfig();

    if (config.boardsDirectory) {
      return config.boardsDirectory;
    }

    return this.getDefaultBoardsDirectory();
  }

  /**
   * Set a custom boards directory path
   * @param path The custom directory path (must be absolute)
   */
  async setBoardsDirectory(path: string): Promise<void> {
    // Validate path
    if (!path || typeof path !== 'string' || path.trim().length === 0) {
      throw new Error('Boards directory path cannot be empty');
    }

    // Ensure path ends with /
    const normalizedPath = path.endsWith('/') ? path : `${path}/`;

    // Validate that the path is accessible
    await this.validateDirectoryPath(normalizedPath);

    // Update config
    const config = await this.loadConfig();
    config.boardsDirectory = normalizedPath;
    await this.saveConfig(config);

    console.log('Boards directory updated to:', normalizedPath);
  }

  /**
   * Reset boards directory to default
   */
  async resetToDefault(): Promise<void> {
    const config = await this.loadConfig();
    delete config.boardsDirectory;
    await this.saveConfig(config);
    console.log('Boards directory reset to default');
  }

  /**
   * Check if using a custom boards directory
   */
  async isUsingCustomDirectory(): Promise<boolean> {
    const config = await this.loadConfig();
    return !!config.boardsDirectory;
  }

  getDefaultBoardsDirectory(): string {
    const docDir = FileSystem.documentDirectory || '';
    const baseDir = docDir.endsWith('/') ? docDir.slice(0, -1) : docDir;
    return `${baseDir}/${DEFAULT_BOARDS_SUBDIR}`;
  }

  private async validateDirectoryPath(path: string): Promise<void> {
    try {
      if (isContentUri(path)) {
        await this.validateContentUri(path);
      } else {
        await this.validateFileUri(path);
      }
    } catch (error) {
      throw new Error(`Invalid directory path: ${error}`);
    }
  }

  private async validateContentUri(path: string): Promise<void> {
    const testFileName = `.test-write-${Date.now()}`;
    try {
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        path,
        testFileName,
        'text/plain'
      );
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      throw new Error('SAF directory is not writable');
    }
  }

  private async validateFileUri(path: string): Promise<void> {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    }

    const checkInfo = await FileSystem.getInfoAsync(path);
    if (!checkInfo.exists) {
      throw new Error('Directory does not exist and could not be created');
    }

    const normalizedPath = path.endsWith('/') ? path : `${path}/`;
    const testFilePath = `${normalizedPath}.test-write-${Date.now()}`;
    try {
      await FileSystem.writeAsStringAsync(testFilePath, 'test');
      await FileSystem.deleteAsync(testFilePath, { idempotent: true });
    } catch (error) {
      throw new Error('Directory is not writable');
    }
  }

  private async loadConfig(): Promise<StorageConfigData> {
    if (this.cachedConfig !== null) {
      return { ...this.cachedConfig };
    }

    const LOAD_TIMEOUT_MS = 10000;
    let timeoutId: NodeJS.Timeout | null = null;
    let loadCompleted = false;

    const loadConfigInternal = async (): Promise<StorageConfigData> => {
      try {
        console.log('[StorageConfig] Loading config from:', this.configFile);

        const configDirInfo = await FileSystem.getInfoAsync(this.configDir);
        if (!configDirInfo.exists) {
          console.log('[StorageConfig] Config directory does not exist, creating...');
          await FileSystem.makeDirectoryAsync(this.configDir, { intermediates: true });
        }

        const configFileInfo = await FileSystem.getInfoAsync(this.configFile);
        if (!configFileInfo.exists) {
          console.log('[StorageConfig] Config file does not exist, creating default...');
          const defaultConfig: StorageConfigData = {
            version: CONFIG_VERSION,
          };
          loadCompleted = true;
          if (timeoutId) clearTimeout(timeoutId);
          await this.saveConfig(defaultConfig);
          return defaultConfig;
        }

        console.log('[StorageConfig] Reading config file...');
        const content = await FileSystem.readAsStringAsync(this.configFile);
        const config: StorageConfigData = JSON.parse(content);

        this.cachedConfig = config;
        loadCompleted = true;
        if (timeoutId) clearTimeout(timeoutId);
        console.log('[StorageConfig] Config loaded successfully');

        return { ...config };
      } catch (error) {
        console.error('[StorageConfig] Failed to load config:', error);
        const defaultConfig: StorageConfigData = { version: CONFIG_VERSION };
        this.cachedConfig = defaultConfig;
        loadCompleted = true;
        if (timeoutId) clearTimeout(timeoutId);
        return defaultConfig;
      }
    };

    const timeoutPromise = new Promise<StorageConfigData>((resolve) => {
      timeoutId = setTimeout(() => {
        if (loadCompleted) return;
        console.warn('[StorageConfig] Load config timed out, using default');
        const defaultConfig: StorageConfigData = { version: CONFIG_VERSION };
        this.cachedConfig = defaultConfig;
        resolve(defaultConfig);
      }, LOAD_TIMEOUT_MS);
    });

    return Promise.race([loadConfigInternal(), timeoutPromise]);
  }

  private async saveConfig(config: StorageConfigData): Promise<void> {
    try {
      const configDirInfo = await FileSystem.getInfoAsync(this.configDir);
      if (!configDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.configDir, { intermediates: true });
      }

      const content = JSON.stringify(config, null, 2);
      await FileSystem.writeAsStringAsync(this.configFile, content);

      this.cachedConfig = { ...config };

      console.log('Storage config saved:', this.configFile);
    } catch (error) {
      console.error('Failed to save storage config:', error);
      throw new Error(`Failed to save configuration: ${error}`);
    }
  }

  /**
   * Clear cached configuration (useful for testing)
   */
  clearCache(): void {
    this.cachedConfig = null;
  }

  /**
   * Get the full configuration object (for debugging/display)
   */
  async getFullConfig(): Promise<StorageConfigData> {
    return await this.loadConfig();
  }

  /**
   * Check if a directory has any boards
   * @param boardsDirectory Path to check for boards
   */
  async hasExistingBoards(boardsDirectory: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(boardsDirectory);
      if (!info.exists) {
        return false;
      }
      const boards = await this.listBoards(boardsDirectory);
      return boards.length > 0;
    } catch (error) {
      console.error('Error checking for existing boards:', error);
      return false;
    }
  }

  /**
   * Migrate boards from one directory to another
   * @param oldPath Source directory with boards
   * @param newPath Destination directory for boards
   * @param onProgress Optional callback for progress updates
   * @returns Migration result with success status and details
   */
  async migrateBoards(
    oldPath: string,
    newPath: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: boolean; message: string; copiedFiles?: number; errors?: string[] }> {
    try {
      // Validate paths
      if (!oldPath || !newPath) {
        return {
          success: false,
          message: 'Source and destination paths are required',
        };
      }

      if (oldPath === newPath) {
        return {
          success: false,
          message: 'Source and destination paths cannot be the same',
        };
      }

      // Check if source has boards
      const hasBoards = await this.hasExistingBoards(oldPath);
      if (!hasBoards) {
        return {
          success: true,
          message: 'No boards found in source directory, nothing to migrate',
          copiedFiles: 0,
        };
      }

      // Validate destination is writable
      const isWritable = await this.isDirectoryWritable(newPath);
      if (!isWritable) {
        return {
          success: false,
          message: 'Destination directory is not writable',
        };
      }

      // Perform the migration
      console.log(`Starting board migration from ${oldPath} to ${newPath}`);
      const result = await this.copyDirectory(oldPath, newPath, onProgress);

      if (!result.success) {
        return {
          success: false,
          message: `Migration failed: ${result.errors.length} errors occurred`,
          copiedFiles: result.copiedFiles,
          errors: result.errors,
        };
      }

      console.log(`Migration completed: ${result.copiedFiles} files copied`);
      return {
        success: true,
        message: `Successfully migrated ${result.copiedFiles} files`,
        copiedFiles: result.copiedFiles,
      };
    } catch (error) {
      console.error('Migration error:', error);
      return {
        success: false,
        message: `Migration error: ${error}`,
      };
    }
  }

  /**
   * Get list of boards in a directory
   * @param boardsDirectory Optional directory path, uses current config if not provided
   */
  async listBoards(boardsDirectory?: string): Promise<string[]> {
    const dir = boardsDirectory || await this.getBoardsDirectory();
    try {
      const info = await FileSystem.getInfoAsync(dir);
      if (!info.exists) {
        return [];
      }
      const items = await FileSystem.readDirectoryAsync(dir);
      return items.filter(item => item.endsWith('.md'));
    } catch (error) {
      console.error('Error listing boards:', error);
      return [];
    }
  }

  private async isDirectoryWritable(path: string): Promise<boolean> {
    try {
      const testFile = `${path}/.test-${Date.now()}`;
      await FileSystem.writeAsStringAsync(testFile, 'test');
      await FileSystem.deleteAsync(testFile, { idempotent: true });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async copyDirectory(
    sourcePath: string,
    destPath: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: boolean; copiedFiles: number; errors: string[] }> {
    const errors: string[] = [];
    let copiedFiles = 0;

    try {
      const sourceInfo = await FileSystem.getInfoAsync(sourcePath);
      if (!sourceInfo.exists) {
        errors.push(`Source directory does not exist: ${sourcePath}`);
        return { success: false, copiedFiles, errors };
      }

      const destInfo = await FileSystem.getInfoAsync(destPath);
      if (!destInfo.exists) {
        await FileSystem.makeDirectoryAsync(destPath, { intermediates: true });
      }

      const items = await FileSystem.readDirectoryAsync(sourcePath);
      const totalFiles = items.length;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const sourceItemPath = `${sourcePath}/${item}`;
        const destItemPath = `${destPath}/${item}`;

        try {
          const itemInfo = await FileSystem.getInfoAsync(sourceItemPath);

          if (itemInfo.isDirectory) {
            const subResult = await this.copyDirectory(sourceItemPath, destItemPath, onProgress);
            copiedFiles += subResult.copiedFiles;
            errors.push(...subResult.errors);
          } else {
            await FileSystem.copyAsync({
              from: sourceItemPath,
              to: destItemPath,
            });
            copiedFiles++;
          }

          if (onProgress) {
            onProgress(i + 1, totalFiles);
          }
        } catch (error) {
          errors.push(`Failed to copy ${item}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        copiedFiles,
        errors,
      };
    } catch (error) {
      errors.push(`Directory copy failed: ${error}`);
      return { success: false, copiedFiles, errors };
    }
  }
}
