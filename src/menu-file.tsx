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

  createEffect(() => {

  myMenus.setup(menuFile);

  });

  return (
    <div id="menuFile" ref={menuFile!} class="menuContainer">
      <button id="butFile" class="menuTop" aria-label="File" aria-haspopup="true" aria-expanded="false">
        <span class="kbdShortcut">F</span>ile
      </button>
      <div role="menu" class="menuItemContainer hidden">
        <button id="butNew" type="button" role="menuitem" onclick={() => {
          myMenus.hide(menuFile);
          app.newFile();
        }}>
          New <kbd>^N</kbd>
        </button>
        <button id="butOpen" type="button" role="menuitem" onclick={() => {
          myMenus.hide(menuFile);
          app.openFile();
        }}>
          Open <kbd>^O</kbd>
        </button>
        <button id="butSave" type="button" role="menuitem" classList={{ hidden: butSaveHidden() }} onclick={() => {
          myMenus.hide(menuFile);
          app.saveFile();
        }}>
          Save <kbd>^S</kbd>
        </button>
        <button id="butSaveAs" type="button" role="menuitem" onclick={() => {
          myMenus.hide(menuFile);
          app.saveFileAs();
        }}>
          Save As <kbd>^&uparrow;S</kbd>
        </button>
        <button id="butClose" type="button" role="menuitem" onclick={() => {
          myMenus.hide(menuFile);
          app.quitApp();
        }}>
          Close <kbd>^W</kbd>
        </button>
      </div>
    </div>
  );
}
