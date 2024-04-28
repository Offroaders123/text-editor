export interface App {
  appName: string;
  file: {
    handle: FileSystemFileHandle | null;
    name: string | null;
    isModified: boolean;
  };
  options: {
    captureTabs: boolean;
    fontSize: number;
    monoSpace: boolean;
    wordWrap: boolean;
  };
  hasFSAccess: boolean;
  isMac: boolean;
  installPrompt: BeforeInstallPromptEvent;
  newFile(): void;
  openFile(fileHandle?: FileSystemHandle): void;
  readFile(file?: File, fileHandle?: FileSystemHandle): Promise<void>;
  saveFile(): Promise<void>;
  saveFileAs(): Promise<void>;
  quitApp(): void;
  getFileLegacy(): Promise<File>;
  saveAsLegacy(filename: string, contents: string): void;
  addRecent(fileHandle: FileSystemFileHandle): Promise<void>;
  toggleWordWrap(): void;
  toggleMonospace(): void;
  toggleCaptureTabs(): void;
  setText(val?: string): void;
  getText(): string;
  insertIntoDoc(contents: string): void;
  adjustFontSize(val: number): void;
  setFocus(startAtTop?: boolean): void;
  confirmDiscard(): boolean;
  setFile(fileHandle?: string | FileSystemFileHandle): void;
  setModified(val: boolean): void;
}