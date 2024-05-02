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
import { menuRecent, setMenuRecent } from "./app.js";
import { myMenus } from "./menus.js";

/* global idbKeyval */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

export default function MenuRecent() {
  createEffect(() => {

  myMenus.setup(menuRecent()!);

  });

  return (
    <div id="menuRecent" ref={ref => setMenuRecent(ref)} class="menuContainer">
      <button id="butRecent" class="menuTop" aria-label="Recent" aria-haspopup="true" aria-expanded="false">
        <span class="kbdShortcut">R</span>ecent
      </button>
      <div id="recentContainer" role="menu" class="menuItemContainer hidden">
      </div>
    </div>
  );
}