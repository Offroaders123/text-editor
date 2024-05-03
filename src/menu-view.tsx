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

export default function MenuView() {
  let menuView: HTMLDivElement;

  createEffect(() => {
    myMenus.setup(menuView);
  });

  return (
    <div id="menuView" ref={menuView!} class="menuContainer">
      <button id="butView" class="menuTop" aria-label="View" aria-haspopup="true" aria-expanded="false">
        <span class="kbdShortcut">V</span>iew
      </button>
      <div role="menu" class="menuItemContainer hidden">
        <button id="butWordWrap" type="button" aria-checked={app.options.wordWrap[0]()} role="menuitemcheckbox" onclick={() => {
          myMenus.hide(menuView);
          app.toggleWordWrap();
        }}>
          Word Wrap
        </button>
        <button id="butMonospace" type="button" aria-checked={app.options.monoSpace[0]()} role="menuitemcheckbox" onclick={() => {
          myMenus.hide(menuView);
          app.toggleMonospace();
        }}>
          Monospace Font
        </button>
        <button id="butCaptureTabs" type="button" aria-checked={app.options.captureTabs[0]()} role="menuitemcheckbox" onclick={() => {
          myMenus.hide(menuView);
          app.toggleCaptureTabs();
        }}>
          Capture Tabs <kbd>^&uparrow;M</kbd>
        </button>
        <button id="butFontBigger" type="button" role="menuitem" onclick={() => {
          myMenus.hide(menuView);
          app.adjustFontSize(+2);
        }}>
          Increase Font Size
        </button>
        <button id="butFontSmaller" type="button" role="menuitem" onclick={() => {
          myMenus.hide(menuView);
          app.adjustFontSize(-2);
        }}>
          Decrease Font Size
        </button>
      </div>
    </div>
  );
}