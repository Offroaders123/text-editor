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
import { myMenus } from "./menus.js";
import { gaEvent } from "./rum.js";

export default function MenuEdit() {
  let menuEdit: HTMLDivElement;
  let butCut: HTMLButtonElement;
  let butCopy: HTMLButtonElement;
  let butPaste: HTMLButtonElement;

  createEffect(() => {

  myMenus.setup(menuEdit);

  butCut.addEventListener('click', () => {
    myMenus.hide(menuEdit);
    document.execCommand('cut');
    gaEvent('Edit', 'Cut');
  });

  butCopy.addEventListener('click', () => {
    myMenus.hide(menuEdit);
    document.execCommand('copy');
    gaEvent('Edit', 'Copy');
  });

  butPaste.addEventListener('click', async () => {
    myMenus.hide(menuEdit);
    try {
      const contents = await navigator.clipboard.readText();
      app.insertIntoDoc(contents);
      app.setModified(true);
      app.setFocus();
      gaEvent('Edit', 'Paste');
    } catch (ex: any) {
      console.error('Unable to paste', ex);
      gaEvent('Error', 'Paste', ex.name);
    }
  });

  });

  return (
    <div id="menuEdit" ref={menuEdit!} class="menuContainer">
      <button id="butEdit" class="menuTop" aria-label="Edit" aria-haspopup="true" aria-expanded="false">
          <span class="kbdShortcut">E</span>dit
      </button>
      <div role="menu" class="menuItemContainer hidden">
        <button id="butCut" ref={butCut!} type="button" role="menuitem">
          Cut <kbd>^X</kbd>
        </button>
        <button id="butCopy" ref={butCopy!} type="button" role="menuitem">
          Copy <kbd>^C</kbd>
        </button>
        <button id="butPaste" ref={butPaste!} type="button" role="menuitem">
          Paste <kbd>^V</kbd>
        </button>
      </div>
    </div>
  );
}