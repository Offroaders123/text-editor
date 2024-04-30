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

import { setHeaderAppNameHidden, setHeaderFileName, setModifiedHeaderHidden } from "./AppComponent.js";
import { app } from "./app.js";

  // Setup the before unload listener to prevent accidental loss on navigation.
  window.addEventListener('beforeunload', (e) => {
    const msg = `There are unsaved changes. Are you sure you want to leave?`;
    if (app.file.isModified) {
      e.preventDefault();
      e.returnValue = msg;
    }
  });

  /**
   * Confirms user does not want to save before closing the current doc.
   * @returns True if it's OK to discard.
   */
  app.confirmDiscard = (): boolean => {
    if (!app.file.isModified) {
      return true;
    }
    const confirmMsg = 'Discard changes? All changes will be lost.';
    return confirm(confirmMsg);
  };

  /**
   * Updates the UI with the current file name.
   * @param fileHandle Filename to display in header.
   */
  app.setFile = (fileHandle: string | FileSystemFileHandle): void => {
    if (typeof fileHandle !== "string" && "name" in fileHandle) {
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
  };

  /**
   * Updates the UI if the file has been modified.
   * @param val True if the file has been modified.
   */
  app.setModified = (val: boolean): void => {
    if (!app.hasFSAccess) {
      return;
    }
    app.file.isModified = val;
    document.body.classList.toggle('modified', val);
    const hidden = !val;
    setModifiedHeaderHidden(hidden);
    modifiedFooter.classList.toggle('hidden', hidden);
  };
