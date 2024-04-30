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

import { createEffect } from "solid-js";
import { app } from "./app.js";
import { set, clear, get } from "./idb-keyval-iife.js";
import { myMenus } from "./menus.js";

/* global idbKeyval */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

export default function MenuRecent() {
  let menuRecent: HTMLDivElement;

  createEffect(() => {

  myMenus.setup(menuRecent);

  let recentFiles: FileSystemFileHandle[] = [];

  /**
   * Adds a new item to the list of recent files.
   *
   * @param fileHandle File handle to add.
   */
  app.addRecent = async function(fileHandle: FileSystemFileHandle): Promise<void> {
    // If isSameEntry isn't available, we can't store the file handle
    if (!fileHandle.isSameEntry) {
      console.warn('Saving of recents is unavailable.');
      return;
    }

    // Loop through the list of recent files and make sure the file we're
    // adding isn't already there. This is gross.
    const inList = await Promise.all(recentFiles.map((f) => {
      return fileHandle.isSameEntry(f);
    }));
    if (inList.some((val) => val)) {
      return;
    }

    // Add the new file handle to the top of the list, and remove any old ones.
    recentFiles.unshift(fileHandle);
    if (recentFiles.length > 5) {
      recentFiles.pop();
    }

    // Update the list of menu items.
    refreshRecents();

    // Save the list of recent files.
    set('recentFiles', recentFiles);
  };

  /**
   * Refresh the list of files in the menu.
   */
  async function refreshRecents(): Promise<void> {
    // Clear the existing menu.
    myMenus.clearMenu(menuRecent);

    // If there are no recents, don't draw anything.
    if (recentFiles.length === 0) {
      return;
    }

    // Loop through the list of recent files and add a button for each.
    recentFiles.forEach((recent) => {
      const butt = myMenus.createButton(recent.name);
      butt.addEventListener('click', () => {
        myMenus.hide(menuRecent);
        app.openFile(recent);
      });
      myMenus.addElement(menuRecent, butt);
    });

    // Add a button to clear the list of recent items.
    addClearButton();
  }

  /**
   * Adds a clear button to the menu that clears the list of most recent items.
   */
  function addClearButton(): void {
    const clearButt = myMenus.createButton('Clear');
    clearButt.addEventListener('click', () => {
      myMenus.clearMenu(menuRecent);
      recentFiles = [];
      clear();
      app.setFocus();
    });
    myMenus.addElement(menuRecent, clearButt);
  }

  /**
   * Initializes the recents menu.
   */
  async function init(): Promise<void> {
    recentFiles = await get('recentFiles') || [];
    refreshRecents();
  }

  init();

  });

  return (
    <div id="menuRecent" ref={menuRecent!} class="menuContainer">
      <button id="butRecent" class="menuTop" aria-label="Recent" aria-haspopup="true" aria-expanded="false">
        <span class="kbdShortcut">R</span>ecent
      </button>
      <div id="recentContainer" role="menu" class="menuItemContainer hidden">
      </div>
    </div>
  );
}