/* @refresh reload */
/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createSignal, lazy } from "solid-js";
import { Suspense, render } from "solid-js/web";
import { getFileHandle, getNewFileHandle, readFile, verifyPermission, writeFile } from "./fs-helpers.js";
import { clear, get, set } from "./idb-keyval-iife.js";
import { gaEvent } from "./rum.js";

import type { Signal } from "solid-js";

const root = document.querySelector<HTMLDivElement>("#root")!;

export const [aDownloadFile, setADownloadFile] = createSignal<HTMLAnchorElement | null>(null);
export const [filePicker, setFilePicker] = createSignal<HTMLInputElement | null>(null);
export const [menuRecent, setMenuRecent] = createSignal<HTMLDivElement | null>(null);
export const [textEditor, setTextEditor] = createSignal<HTMLTextAreaElement | null>(null);

export const [headerFileName, setHeaderFileName] = createSignal<string>("Text Editor");
export const [headerAppNameHidden, setHeaderAppNameHidden] = createSignal<boolean>(true);
export const [butSaveHidden, setButSaveHidden] = createSignal<boolean>(false);
export const [modifiedHeaderHidden, setModifiedHeaderHidden] = createSignal<boolean>(true);
export const [modifiedFooterHidden, setModifiedFooterHidden] = createSignal<boolean>(true);
export const [notSupportedHidden, setNotSupportedHidden] = createSignal<boolean>(false);
export const [lblLegacyFSHidden, setLblLegacyFSHidden] = createSignal<boolean>(true);
export const [lblTabMovesFocusHidden, setLblTabMovesFocusHidden] = createSignal<boolean>(true);
export const [recentFiles, setRecentFiles] = createSignal<FileSystemFileHandle[]>([]);

export interface App {
  appName: string;
  file: {
    handle: FileSystemFileHandle | null;
    name: string | null;
    isModified: boolean;
  };
  options: {
    captureTabs: Signal<boolean>;
    fontSize: number;
    monoSpace: Signal<boolean>;
    wordWrap: Signal<boolean>;
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

/* globals getFileHandle, getNewFileHandle, readFile, verifyPermission,
           writeFile */

// eslint-disable-next-line no-redeclare
export const app = {
  appName: 'Text Editor',
  file: {
    handle: null,
    name: null,
    isModified: false,
  },
  options: {
    captureTabs: createSignal<boolean>(true),
    fontSize: 14,
    monoSpace: createSignal<boolean>(false),
    wordWrap: createSignal<boolean>(true),
  },
  hasFSAccess: 'chooseFileSystemEntries' in window ||
               'showOpenFilePicker' in window,
  isMac: navigator.userAgent.includes('Mac OS X'),

  /**
   * Uses the <input type="file"> to open a new file
   *
   * @returns File selected by the user.
   */
  getFileLegacy: (): Promise<File> => {
    return new Promise((resolve, reject) => {
      filePicker()!.onchange = () => {
        const file = filePicker()!.files![0];
        if (file) {
          resolve(file);
          return;
        }
        reject(new Error('AbortError'));
      };
      filePicker()!.click();
    });
  },

  /**
   * Saves a file by creating a downloadable instance, and clicking on the
   * download link.
   *
   * @param filename Filename to save the file as.
   * @param contents Contents of the file to save.
   */
  // function saveAsLegacy(filename, contents) {
  saveAsLegacy: (filename: string, contents: string): void => {
    filename = filename || 'Untitled.txt';
    const opts = {type: 'text/plain'};
    const file = new File([contents], '', opts);
    aDownloadFile()!.href = window.URL.createObjectURL(file);
    aDownloadFile()!.setAttribute('download', filename);
    aDownloadFile()!.click();
  },

  /**
   * Adds a new item to the list of recent files.
   *
   * @param fileHandle File handle to add.
   */
  addRecent: async function(fileHandle: FileSystemFileHandle): Promise<void> {
    // If isSameEntry isn't available, we can't store the file handle
    if (!fileHandle.isSameEntry) {
      console.warn('Saving of recents is unavailable.');
      return;
    }

    // Loop through the list of recent files and make sure the file we're
    // adding isn't already there. This is gross.
    const inList = await Promise.all(recentFiles().map((f) => {
      return fileHandle.isSameEntry(f);
    }));
    if (inList.some((val) => val)) {
      return;
    }

    // Add the new file handle to the top of the list, and remove any old ones.
    setRecentFiles(recentFiles => [fileHandle, ...recentFiles]);
    if (recentFiles.length > 5) {
      setRecentFiles(recentFiles => recentFiles.slice(0, -1));
    }

    // Update the list of menu items.
    refreshRecents();

    // Save the list of recent files.
    set('recentFiles', recentFiles());
  },

  /**
   * Toggle word wrap
   */
  toggleWordWrap: (): void => {
    const newVal = document.body.classList.toggle('wordwrap');
    app.options.wordWrap[1](newVal);
    gaEvent('Options', 'Word Wrap', newVal ? 'true' : 'false');
  },

  /**
   * Toggle Monospace
   */
  toggleMonospace: (): void => {
    const newVal = document.body.classList.toggle('monospace');
    app.options.monoSpace[1](newVal);
    gaEvent('Options', 'Font Face', newVal ? 'monospace' : 'normal');
  },

  /**
   * Toggles the capture tab functionality
   */
  toggleCaptureTabs: (): void => {
    const newVal = !app.options.captureTabs[0]();
    app.options.captureTabs[1](newVal);
    setLblTabMovesFocusHidden(newVal);
    gaEvent('Options', 'Capture Tabs', String(newVal));
  },

  /**
   * Sets the text of the editor to the specified value
   */
  setText: (val: string): void => {
    val = val || '';
    textEditor()!.value = val;
  },

  /**
   * Gets the text from the editor
   */
  getText: (): string => {
    return textEditor()!.value;
  },

  /**
   * Inserts a string into the editor.
   *
   * @param contents Contents to insert into the document.
   */
  insertIntoDoc: (contents: string): void => {
    // Find the current cursor position
    const startPos = textEditor()!.selectionStart;
    const endPos = textEditor()!.selectionEnd;
    // Get the current contents of the editor
    const before = textEditor()!.value;
    // Get everything to the left of the start of the selection
    const left = before.substring(0, startPos);
    // Get everything to the right of the start of the selection
    const right = before.substring(endPos);
    // Concatenate the new contents.
    textEditor()!.value = left + contents + right;
    // Move the cursor to the end of the inserted content.
    const newPos = startPos + contents.length;
    textEditor()!.selectionStart = newPos;
    textEditor()!.selectionEnd = newPos;
    app.setModified(true);
  },

  /**
   * Adjust the font size of the textarea up or down by the specified amount.
   *
   * @param val Number of pixels to adjust font size by (eg: +2, -2).
   */
  adjustFontSize: (val: number): void => {
    const newFontSize = app.options.fontSize + val;
    if (newFontSize >= 2) {
      textEditor()!.style.fontSize = `${newFontSize}px`;
      app.options.fontSize = newFontSize;
    }
    gaEvent('Options', 'Font Size', null, newFontSize);
  },

  /**
   * Moves focus to the text area, and potentially cursor to position zero.
   */
  setFocus: (startAtTop: boolean): void => {
    if (startAtTop) {
      textEditor()!.selectionStart = 0;
      textEditor()!.selectionEnd = 0;
      textEditor()!.scrollTo(0, 0);
    }
    textEditor()!.focus();
  },
} as App;

// Verify the APIs we need are supported, show a polite warning if not.
if (app.hasFSAccess) {
  setNotSupportedHidden(true);
  gaEvent('File System APIs', 'FSAccess');
} else {
  setLblLegacyFSHidden(false);
  setButSaveHidden(true);
  gaEvent('File System APIs', 'Legacy');
}

/**
 * Creates an empty notepad with no details in it.
 */
app.newFile = (): void => {
  if (!app.confirmDiscard()) {
    return;
  }
  app.setText();
  app.setFile();
  app.setModified(false);
  app.setFocus(true);
  gaEvent('FileAction', 'New');
};

/**
 * Opens a file for reading.
 *
 * @param fileHandle File handle to read from.
 */
app.openFile = async (fileHandle?: FileSystemFileHandle): Promise<void> => {
  if (!app.confirmDiscard()) {
    return;
  }

  // If the File System Access API is not supported, use the legacy file apis.
  if (!app.hasFSAccess) {
    gaEvent('FileAction', 'Open', 'Legacy');
    const file = await app.getFileLegacy();
    if (file) {
      app.readFile(file);
    }
    return;
  }

  // If a fileHandle is provided, verify we have permission to read/write it,
  // otherwise, show the file open prompt and allow the user to select the file.
  if (fileHandle) {
    gaEvent('FileAction', 'OpenRecent', 'FSAccess');
    if (await verifyPermission(fileHandle, true) === false) {
      console.error(`User did not grant permission to '${fileHandle.name}'`);
      return;
    }
  } else {
    gaEvent('FileAction', 'Open', 'FSAccess');
    try {
      fileHandle = await getFileHandle();
    } catch (ex: any) {
      if (ex.name === 'AbortError') {
        return;
      }
      gaEvent('Error', 'FileOpen', ex.name);
      const msg = 'An error occured trying to open the file.';
      console.error(msg, ex);
      alert(msg);
    }
  }

  if (!fileHandle) {
    return;
  }
  const file = await fileHandle.getFile();
  app.readFile(file, fileHandle);
};

/**
 * Read the file from disk.
 *
 *  @param file File to read from.
 *  @param fileHandle File handle to read from.
 */
app.readFile = async (file: File, fileHandle?: FileSystemFileHandle): Promise<void> => {
  try {
    app.setText(await readFile(file));
    app.setFile(fileHandle || file.name);
    app.setModified(false);
    app.setFocus(true);
  } catch (ex: any) {
    gaEvent('Error', 'FileRead', ex.name);
    const msg = `An error occured reading ${app.file.name}`;
    console.error(msg, ex);
    alert(msg);
  }
};

/**
 * Saves a file to disk.
 */
app.saveFile = async (): Promise<void> => {
  try {
    if (!app.file.handle) {
      return await app.saveFileAs();
    }
    gaEvent('FileAction', 'Save');
    await writeFile(app.file.handle, app.getText());
    app.setModified(false);
  } catch (ex: any) {
    gaEvent('Error', 'FileSave', ex.name);
    const msg = 'Unable to save file';
    console.error(msg, ex);
    alert(msg);
  }
  app.setFocus();
};

/**
 * Saves a new file to disk.
 */
app.saveFileAs = async (): Promise<void> => {
  if (!app.hasFSAccess) {
    gaEvent('FileAction', 'Save As', 'Legacy');
    app.saveAsLegacy(app.file.name || 'Untitled.txt', app.getText());
    app.setFocus();
    return;
  }
  gaEvent('FileAction', 'Save As', 'FSAccess');
  let fileHandle;
  try {
    fileHandle = await getNewFileHandle();
  } catch (ex: any) {
    if (ex.name === 'AbortError') {
      return;
    }
    gaEvent('Error', 'FileSaveAs1', ex.name);
    const msg = 'An error occured trying to open the file.';
    console.error(msg, ex);
    alert(msg);
    return;
  }
  try {
    await writeFile(fileHandle, app.getText());
    app.setFile(fileHandle);
    app.setModified(false);
  } catch (ex: any) {
    gaEvent('Error', 'FileSaveAs2', ex.name);
    const msg = 'Unable to save file.';
    console.error(msg, ex);
    alert(msg);
    gaEvent('Error', 'Unable to write file', 'FSAccess');
    return;
  }
  app.setFocus();
};

/**
 * Attempts to close the window
 */
app.quitApp = (): void => {
  if (!app.confirmDiscard()) {
    return;
  }
  gaEvent('FileAction', 'Quit');
  window.close();
};

  /**
   * Refresh the list of files in the menu.
   */
  export async function refreshRecents(): Promise<void> {
    const { myMenus } = await import("./menus.js");

    // Clear the existing menu.
    myMenus.clearMenu(menuRecent()!);

    // If there are no recents, don't draw anything.
    if (recentFiles().length === 0) {
      return;
    }

    // Loop through the list of recent files and add a button for each.
    recentFiles().forEach((recent) => {
      const butt = myMenus.createButton(recent.name);
      butt.addEventListener('click', () => {
        myMenus.hide(menuRecent()!);
        app.openFile(recent);
      });
      myMenus.addElement(menuRecent()!, butt);
    });

    // Add a button to clear the list of recent items.
    addClearButton(myMenus);
  }

  /**
   * Adds a clear button to the menu that clears the list of most recent items.
   */
  function addClearButton(myMenus: typeof import("./menus.js").myMenus): void {
    const clearButt = myMenus.createButton('Clear');
    clearButt.addEventListener('click', () => {
      myMenus.clearMenu(menuRecent()!);
      setRecentFiles([]);
      clear();
      app.setFocus();
    });
    myMenus.addElement(menuRecent()!, clearButt);
  }

render(() => <AppComponent/>, root);

setRecentFiles(await get('recentFiles') || []);
refreshRecents();

/* Initialize the textarea, set focus & font size */
window.addEventListener('DOMContentLoaded', () => {
  textEditor()!.style.fontSize = `${app.options.fontSize}px`;
  /* Should I remove 'autofocus'? Chrome is notifying in the console that it gets overridden
      since an element in the DOM is already focused (I think `setFocus()` already gets called
      on the text editor), since this is now loaded with JSX */
  /* "Autofocus processing was blocked because a document already has a focused element." */
  // app.setFocus();
});

// setTimeout(() => { app.setFocus(); console.log("focused"); }, 2000);

export default function AppComponent() {
  const Header = lazy(() => import("./Header.js"));
  const TextArea = lazy(() => import("./text-area.js"));
  const Fallback = lazy(() => import("./fallback.js"));
  const Footer = lazy(() => import("./Footer.js"));

  return (
    <>
      <Suspense>
        <Header/>
      </Suspense>
      <Suspense>
        <TextArea/>
      </Suspense>

      <Suspense>
        <Fallback/>
      </Suspense>

      <Suspense>
        <Footer/>
      </Suspense>
    </>
  );
}