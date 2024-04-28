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
import { gaEvent } from "./rum.js";

  const menuView = document.getElementById('menuView')!;
  myMenus.setup(menuView);

  const butWordWrap = document.getElementById('butWordWrap')!;
  const butMonospace = document.getElementById('butMonospace')!;
  const butCaptureTabs = document.getElementById('butCaptureTabs')!;
  const lblTabMovesFocus = document.getElementById('lblTabMovesFocus')!;

  butWordWrap.addEventListener('click', () => {
    myMenus.hide(menuView);
    app.toggleWordWrap();
  });

  butMonospace.addEventListener('click', () => {
    myMenus.hide(menuView);
    app.toggleMonospace();
  });

  butCaptureTabs.addEventListener('click', () => {
    myMenus.hide(menuView);
    app.toggleCaptureTabs();
  });

  document.getElementById('butFontBigger')!.addEventListener('click', () => {
    myMenus.hide(menuView);
    app.adjustFontSize(+2);
  });

  document.getElementById('butFontSmaller')!.addEventListener('click', () => {
    myMenus.hide(menuView);
    app.adjustFontSize(-2);
  });

  /**
   * Toggle word wrap
   */
  app.toggleWordWrap = (): void => {
    const newVal = document.body.classList.toggle('wordwrap');
    butWordWrap.setAttribute('aria-checked', String(newVal));
    app.options.wordWrap = newVal;
    gaEvent('Options', 'Word Wrap', newVal ? 'true' : 'false');
  };

  /**
   * Toggle Monospace
   */
  app.toggleMonospace = (): void => {
    const newVal = document.body.classList.toggle('monospace');
    butMonospace.setAttribute('aria-checked', String(newVal));
    app.options.monoSpace = newVal;
    gaEvent('Options', 'Font Face', newVal ? 'monospace' : 'normal');
  };

  /**
   * Toggles the capture tab functionality
   */
  app.toggleCaptureTabs = (): void => {
    const newVal = !app.options.captureTabs;
    app.options.captureTabs = newVal;
    butCaptureTabs.setAttribute('aria-checked', String(newVal));
    lblTabMovesFocus.classList.toggle('hidden', newVal);
    gaEvent('Options', 'Capture Tabs', String(newVal));
  };
