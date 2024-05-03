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
import { app, installDisabled, installHidden, setInstallDisabled } from "./app.js";
import { myMenus } from "./menus.js";
import { gaEvent } from "./rum.js";

export default function ButInstall() {
  let butInstall: HTMLButtonElement;

  createEffect(async () => {
    await myMenus.addKeyboardShortcut(butInstall);
  });

  return (
    <button
      id="butInstall"
      ref={butInstall!}
      aria-label="Install"
      classList={{ menuTop: true, hidden: installHidden() }}
      disabled={installDisabled()}
      onclick={() => {
        setInstallDisabled(true);
        app.installPrompt.prompt();
        gaEvent('Install', 'clicked');
      }}
    >
      <span class="kbdShortcut">I</span>nstall
    </button>
  );
}