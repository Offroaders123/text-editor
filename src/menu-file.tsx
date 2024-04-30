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

import { app } from "./app.js";
import { myMenus } from "./menus.js";

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
