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

  /* Setup the main textarea */
  textEditor.addEventListener('input', () => {
    app.setModified(true);
  });

  /* Hide menus any time we start typing */
  textEditor.addEventListener('focusin', () => {
    myMenus.hideAll();
  });

  /* Listen for tab key */
  textEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && app.options.captureTabs) {
      e.preventDefault();
      app.insertIntoDoc('\t');
    }
  });

  /* Initialize the textarea, set focus & font size */
  window.addEventListener('DOMContentLoaded', () => {
    textEditor.style.fontSize = `${app.options.fontSize}px`;
    /* Should I remove 'autofocus'? Chrome is notifying in the console that it gets overridden
        since an element in the DOM is already focused (I think `setFocus()` already gets called
        on the text editor), since this is now loaded with JSX */
    /* "Autofocus processing was blocked because a document already has a focused element." */
    // app.setFocus();
  });


  /**
   * Sets the text of the editor to the specified value
   */
  app.setText = (val: string): void => {
    val = val || '';
    textEditor.value = val;
  };

  /**
   * Gets the text from the editor
   */
  app.getText = (): string => {
    return textEditor.value;
  };

  /**
   * Inserts a string into the editor.
   *
   * @param contents Contents to insert into the document.
   */
  app.insertIntoDoc = (contents: string): void => {
    // Find the current cursor position
    const startPos = textEditor.selectionStart;
    const endPos = textEditor.selectionEnd;
    // Get the current contents of the editor
    const before = textEditor.value;
    // Get everything to the left of the start of the selection
    const left = before.substring(0, startPos);
    // Get everything to the right of the start of the selection
    const right = before.substring(endPos);
    // Concatenate the new contents.
    textEditor.value = left + contents + right;
    // Move the cursor to the end of the inserted content.
    const newPos = startPos + contents.length;
    textEditor.selectionStart = newPos;
    textEditor.selectionEnd = newPos;
    app.setModified(true);
  };


  /**
   * Adjust the font size of the textarea up or down by the specified amount.
   *
   * @param val Number of pixels to adjust font size by (eg: +2, -2).
   */
  app.adjustFontSize = (val: number): void => {
    const newFontSize = app.options.fontSize + val;
    if (newFontSize >= 2) {
      textEditor.style.fontSize = `${newFontSize}px`;
      app.options.fontSize = newFontSize;
    }
    gaEvent('Options', 'Font Size', null, newFontSize);
  };

  /**
   * Moves focus to the text area, and potentially cursor to position zero.
   */
  app.setFocus = (startAtTop: boolean): void => {
    if (startAtTop) {
      textEditor.selectionStart = 0;
      textEditor.selectionEnd = 0;
      textEditor.scrollTo(0, 0);
    }
    textEditor.focus();
  };

  
  // setTimeout(() => { app.setFocus(); console.log("focused"); }, 2000);