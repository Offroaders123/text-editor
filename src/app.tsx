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

import { createSignal } from "solid-js";
import { clear, get, set } from "idb-keyval";
import { getFileHandle, getNewFileHandle, readFile, verifyPermission, writeFile } from "./fs-helpers.js";
import { gaEvent, gaTiming } from "./rum.js";
import Header from "./Header.js";
import TextArea from "./text-area.js";
import Fallback from "./fallback.js";
import Footer from "./Footer.js";

export const [aDownloadFile, setADownloadFile] = createSignal<HTMLAnchorElement | null>(null);
export const [filePicker, setFilePicker] = createSignal<HTMLInputElement | null>(null);
export const [menuRecent, setMenuRecent] = createSignal<HTMLDivElement | null>(null);
export const [textEditor, setTextEditor] = createSignal<HTMLTextAreaElement | null>(null);

export const [headerFileName, setHeaderFileName] = createSignal<string>("Text Editor");
export const [headerAppNameHidden, setHeaderAppNameHidden] = createSignal<boolean>(true);
export const [butSaveHidden, setButSaveHidden] = createSignal<boolean>(false);
export const [installDisabled, setInstallDisabled] = createSignal<boolean>(false);
export const [installHidden, setInstallHidden] = createSignal<boolean>(true);
export const [modifiedHeaderHidden, setModifiedHeaderHidden] = createSignal<boolean>(true);
export const [modifiedFooterHidden, setModifiedFooterHidden] = createSignal<boolean>(true);
export const [notSupportedHidden, setNotSupportedHidden] = createSignal<boolean>(false);
export const [lblLegacyFSHidden, setLblLegacyFSHidden] = createSignal<boolean>(true);
export const [lblTabMovesFocusHidden, setLblTabMovesFocusHidden] = createSignal<boolean>(true);
export const [recentFiles, setRecentFiles] = createSignal<FileSystemFileHandle[]>([]);

export const app = {
  appName: 'Text Editor',
  file: {
    handle: null as FileSystemFileHandle | null,
    name: null as string | null,
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
  installPrompt: null as BeforeInstallPromptEvent | null,

  /**
   * Creates an empty notepad with no details in it.
   */
  newFile: (): void => {
    if (!app.confirmDiscard()) {
      return;
    }
    app.setText();
    app.setFile();
    app.setModified(false);
    app.setFocus(true);
    gaEvent('FileAction', 'New');
  },

  /**
   * Opens a file for reading.
   *
   * @param fileHandle File handle to read from.
   */
  openFile: async (fileHandle?: FileSystemFileHandle): Promise<void> => {
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
  },

  /**
   * Read the file from disk.
   *
   *  @param file File to read from.
   *  @param fileHandle File handle to read from.
   */
  readFile: async (file: File, fileHandle?: FileSystemFileHandle): Promise<void> => {
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
  },

  /**
   * Saves a file to disk.
   */
  saveFile: async (): Promise<void> => {
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
  },

  /**
   * Saves a new file to disk.
   */
  saveFileAs: async (): Promise<void> => {
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
  },

  /**
   * Attempts to close the window
   */
  quitApp: (): void => {
    if (!app.confirmDiscard()) {
      return;
    }
    gaEvent('FileAction', 'Quit');
    window.close();
  },

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
  setText: (val?: string): void => {
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
  setFocus: (startAtTop?: boolean): void => {
    if (startAtTop) {
      textEditor()!.selectionStart = 0;
      textEditor()!.selectionEnd = 0;
      textEditor()!.scrollTo(0, 0);
    }
    textEditor()!.focus();
  },

  /**
   * Confirms user does not want to save before closing the current doc.
   * @returns True if it's OK to discard.
   */
  confirmDiscard: (): boolean => {
    if (!app.file.isModified) {
      return true;
    }
    const confirmMsg = 'Discard changes? All changes will be lost.';
    return confirm(confirmMsg);
  },

  /**
   * Updates the UI with the current file name.
   * @param fileHandle Filename to display in header.
   */
  setFile: (fileHandle: string | FileSystemFileHandle | null = null): void => {
    if (fileHandle && typeof fileHandle !== "string" && "name" in fileHandle) {
      app.file.handle = fileHandle;
      app.file.name = fileHandle.name;
      document.title = `${fileHandle.name} - ${app.appName}`;
      setHeaderFileName(fileHandle.name);
      setHeaderAppNameHidden(false);
      app.addRecent(fileHandle);
    } else {
      app.file.handle = null;
      app.file.name = fileHandle;
      document.title = app.appName;
      setHeaderFileName(app.appName);
      setHeaderAppNameHidden(true);
    }
  },

  /**
   * Updates the UI if the file has been modified.
   * @param val True if the file has been modified.
   */
  setModified: (val: boolean): void => {
    if (!app.hasFSAccess) {
      return;
    }
    app.file.isModified = val;
    document.body.classList.toggle('modified', val);
    const hidden = !val;
    setModifiedHeaderHidden(hidden);
    setModifiedFooterHidden(hidden);
  },
};

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator && window.isSecureContext && !import.meta.env.DEV) {
    navigator.serviceWorker
        .register('./service-worker.js');
  }
});

/**
 * Analytics for window type: browser, standalone, standalone-ios
 */
window.addEventListener('load', () => {
  setTimeout(() => {
    let windowStyle = 'browser';
    if (window.navigator.standalone === true) {
      windowStyle = 'standalone-ios';
    } else if (matchMedia('(display-mode: standalone)').matches === true) {
      windowStyle = 'standalone';
    }
    gaEvent('Window Style', windowStyle, null, null, true);
  }, 3100);
});

/**
 * Performance analytics: load & paint
 */
window.addEventListener('load', () => {
  if ('performance' in window) {
    const pNow = Math.round(performance.now());
    gaTiming('Start', 'window-load', pNow);
    setTimeout(() => {
      const paintMetrics = performance.getEntriesByType('paint');
      if (paintMetrics && paintMetrics.length > 0) {
        paintMetrics.forEach((entry) => {
          const name = entry.name;
          const time = Math.round(entry.startTime + entry.duration);
          gaTiming('Start', name, time);
        });
      }
    }, 3000);
  }
});

/**
 * Performance analytics: GA PageView, DOMContentLoaded
 */
window.addEventListener('DOMContentLoaded', () => {
  if ('performance' in window) {
    const pNow = Math.round(performance.now());
    gaTiming('Start', 'dom-content-loaded', pNow);
  }
});

/**
 * Add Analytics script to page
 */
window.addEventListener('DOMContentLoaded', () => {
  if (location.hostname === 'localhost') {
    // eslint-disable-next-line no-console
    console.log('🔕', 'Running on localhost, analytics not loaded.');
    return;
  }

  /* Enable Google Analytics Here. */
  // const gaScript = document.createElement('script');
  // gaScript.src = 'https://www.google-analytics.com/analytics.js';
  // document.head.appendChild(gaScript);
});

/**
 * Log the app version.
 */
window.addEventListener('load', () => {
  gaEvent('App Version', '[[VERSION]]', null, null, true);
});

/**
 * Log page visibility.
 */
document.addEventListener('visibilitychange', () => {
  const state = document.hidden === true ? 'hidden' : 'visible';
  gaEvent('Page Visibility', state, null, null, true);
});

/**
 * Setup keyboard shortcuts
 */
window.addEventListener('keydown', (e) => {
  // console.log('key', e.code, e.ctrlKey, e.metaKey, e.shiftKey, e.key);

  // Save As
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyS') {
    e.preventDefault();
    app.saveFileAs();
    return;
  }

  // Save
  if ((e.ctrlKey === true || e.metaKey === true) && e.key === 's') {
    e.preventDefault();
    app.saveFile();
    return;
  }

  // Open
  if ((e.ctrlKey === true || e.metaKey === true) && e.key === 'o') {
    e.preventDefault();
    app.openFile();
    return;
  }

  // Close
  if ((e.ctrlKey === true || e.metaKey === true) && e.key === 'n') {
    e.preventDefault();
    app.newFile();
    return;
  }

  // Quit
  if ((e.ctrlKey === true || e.metaKey === true) &&
      (e.key === 'q' || e.key === 'w')) {
    e.preventDefault();
    app.quitApp();
    return;
  }

  // Capture Tabs
  if (e.ctrlKey === true && e.shiftKey === true && e.key === 'M') {
    e.preventDefault();
    e.stopPropagation();
    app.toggleCaptureTabs();
  }
});

/* Show shortcuts on menu items when ALT key is pressed, non-Mac only */
if (!app.isMac) {
  window.addEventListener('keydown', (e) => {
    if (e.altKey === true && e.key === 'Alt') {
      document.body.classList.toggle('altKey', true);
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Alt') {
      document.body.classList.toggle('altKey', false);
    }
  });
}

/**
 * Track successful app installs
 */
window.addEventListener('appinstalled', () => {
  gaEvent('Install', 'installed');
});

/**
 * Listen for 'beforeinstallprompt' event, and update the UI to indicate
 * text-editor can be installed.
 */
window.addEventListener('beforeinstallprompt', (e) => {
  // Don't show the mini-info bar
  e.preventDefault();

  // Log that install is available.
  gaEvent('Install', 'available');

  // Save the deferred prompt
  app.installPrompt = e;

  // Show the install button
  setInstallDisabled(false);
  setInstallHidden(false);
});

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

// Setup the before unload listener to prevent accidental loss on navigation.
window.addEventListener('beforeunload', (e) => {
  const msg = `There are unsaved changes. Are you sure you want to leave?`;
  if (app.file.isModified) {
    e.preventDefault();
    e.returnValue = msg;
  }
});

export default function App() {
  return (
    <>
      <Header/>
      <TextArea/>
      <Fallback/>
      <Footer/>
    </>
  );
}