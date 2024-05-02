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
import { app, butSaveHidden } from "./app.js";
import { myMenus } from "./menus.js";

export default function MenuFile() {
  let menuFile: HTMLDivElement;
  let butFile: HTMLButtonElement;
  let butNew: HTMLButtonElement;
  let butOpen: HTMLButtonElement;
  let butSave: HTMLButtonElement;
  let butSaveAs: HTMLButtonElement;
  let butClose: HTMLButtonElement;

  createEffect(() => {

  myMenus.setup(menuFile);

  butNew.addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.newFile();
  });

  butOpen.addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.openFile();
  });

  butSave.addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.saveFile();
  });

  butSaveAs.addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.saveFileAs();
  });

  butClose.addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.quitApp();
  });

  });

  return (
    <div id="menuFile" ref={menuFile!} class="menuContainer">
      <button id="butFile" ref={butFile!} class="menuTop" aria-label="File" aria-haspopup="true" aria-expanded="false">
        <span class="kbdShortcut">F</span>ile
      </button>
      <div role="menu" class="menuItemContainer hidden">
        <button id="butNew" ref={butNew!} type="button" role="menuitem">
          New <kbd>^N</kbd>
        </button>
        <button id="butOpen" ref={butOpen!} type="button" role="menuitem">
          Open <kbd>^O</kbd>
        </button>
        <button id="butSave" ref={butSave!} type="button" role="menuitem" classList={{ hidden: butSaveHidden() }}>
          Save <kbd>^S</kbd>
        </button>
        <button id="butSaveAs" ref={butSaveAs!} type="button" role="menuitem">
          Save As <kbd>^&uparrow;S</kbd>
        </button>
        <button id="butClose" ref={butClose!} type="button" role="menuitem">
          Close <kbd>^W</kbd>
        </button>
      </div>
    </div>
  );
}
