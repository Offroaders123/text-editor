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

const app = import("./app.js").then(app => app.app);

export const myMenus = {
  /**
   * Initializes a drop down menu.
   *
   * @param container Container element with the drop down menu.
   */
  setup(container: HTMLElement): void {
    const toggleButton = container.querySelector('button.menuTop') as HTMLButtonElement;
    toggleButton.addEventListener('click', () => {
      myMenus._toggle(toggleButton);
    });
    myMenus.addKeyboardShortcut(toggleButton);
    container.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) {
        myMenus.hideAll();
        app.then(app => app.setFocus());
        return;
      }
      if (e.keyCode === 40) {
        const next = (e.srcElement as Element).nextElementSibling as HTMLElement;
        if (next) {
          next.focus();
        }
        return;
      }
      if (e.keyCode === 38) {
        const prev = (e.srcElement as Element).previousElementSibling as HTMLElement;
        if (prev) {
          prev.focus();
        }
        return;
      }
    });
  },

  /**
   * Initializes a drop down menu.
   *
   * @param button Toggle button to show/hide menu.
   */
  async addKeyboardShortcut(button: HTMLButtonElement): Promise<void> {
    if ((await app).isMac) {
      // Keyboard shortcuts aren't available on mac.
      return;
    }
    let key: string | undefined;
    try {
      key = button.querySelector('.kbdShortcut')!.textContent!.trim().toLowerCase();
    } catch (ex) {
      // No keyboard shortcut found.
    }
    if (!key) {
      return;
    }
    window.addEventListener('keydown', (e) => {
      if (e.altKey === true && e.key === key) {
        e.preventDefault();
        button.click();
      }
    });
  },

  /**
   * Hides all visible menus.
   */
  hideAll(): void {
    const elems = document.querySelectorAll('.menuContainer');
    elems.forEach((elem) => {
      myMenus.hide(elem);
    });
  },

  /**
   * Hides a menu dropdown.
   *
   * @param menuContainer Container element with the drop down menu.
   */
  hide(menuContainer: Element): void {
    const button = menuContainer.querySelector('.menuTop')!;
    button.setAttribute('aria-expanded', String(false));
    const panel = menuContainer.querySelector('.menuItemContainer');
    if (panel) {
      panel.classList.toggle('hidden', true);
    }
  },

  /**
   * Shows a menu dropdown.
   *
   * @param menuContainer Container element with the drop down menu.
   */
  show(menuContainer: Element): void {
    myMenus.hideAll();
    const button = menuContainer.querySelector('.menuTop')!;
    button.setAttribute('aria-expanded', String(true));
    const panel = menuContainer.querySelector('.menuItemContainer')!;
    panel.classList.toggle('hidden', false);
    const firstButton = panel.querySelector('button');
    if (!firstButton) {
      myMenus.hideAll();
      app.then(app => app.setFocus());
      return;
    }
    firstButton.focus();
  },

  /**
   * Creates a new menu item button.
   *
   * @param label Label for button
   * @returns Returns an HTML button.
   */
  createButton(label: string): HTMLButtonElement {
    const butt = document.createElement('button');
    butt.innerText = label;
    butt.setAttribute('type', 'button');
    butt.setAttribute('role', 'menuitem');
    return butt;
  },

  /**
   * Adds an element to the menu.
   *
   * @param menuContainer Container element with the drop down menu.
   * @param elem Element to add to the menu container.
   */
  addElement(menuContainer: Element, elem: Element): void {
    const container = menuContainer.querySelector('.menuItemContainer')!;
    container.appendChild(elem);
  },

  /**
   * Removes all items from the menu.
   *
   * @param menuContainer Container element with the drop down menu.
   */
  clearMenu(menuContainer: Element): void {
    const container = menuContainer.querySelector('.menuItemContainer')!;
    container.innerHTML = '';
  },

  /**
   * Toggles a menu open or closed.
   *
   * @private
   * @param button Toggle button to show/hide menu.
   */
  _toggle(button: Element): void {
    const parent = button.parentElement!;
    const expanded = button.getAttribute('aria-expanded');
    if (expanded === 'true') {
      myMenus.hide(parent);
    } else {
      myMenus.show(parent);
    }
  }
};

app.then(app => {
  /* Show shortcuts on menu items when ALT key is pressed, non-Mac only */
  if (!app.isMac) {
    window.addEventListener('keydown', (e) => {
      if (e.altKey === true && e.key === 'Alt') {
        document.body.classList.toggle('altKey', true);
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Alt') {
        document.body.classList.toggle('altKey', false);
      }
    });
  }
});