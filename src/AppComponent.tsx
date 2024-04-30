/* @refresh reload */
import { createSignal, lazy } from "solid-js";
import { Suspense, render } from "solid-js/web";

const root = document.querySelector<HTMLDivElement>("#root")!;

export const [headerFileName, setHeaderFileName] = createSignal<string>("Text Editor");

render(() => <AppComponent/>, root);

export default function AppComponent() {
  const TextArea = lazy(() => import("./text-area.js"));

  return (
    <>
      <header>
        <h1>
          <span id="headerFileName">{headerFileName()}</span><span id="modifiedHeader" class="hidden">*</span>
          <span id="headerAppName" class="hidden"> - Text Editor</span>
        </h1>
        <nav class="menubar">
          <div id="menuFile" class="menuContainer">
            <button id="butFile" class="menuTop" aria-label="File" aria-haspopup="true" aria-expanded="false">
              <span class="kbdShortcut">F</span>ile
            </button>
            <div role="menu" class="menuItemContainer hidden">
              <button id="butNew" type="button" role="menuitem">
                New <kbd>^N</kbd>
              </button>
              <button id="butOpen" type="button" role="menuitem">
                Open <kbd>^O</kbd>
              </button>
              <button id="butSave" type="button" role="menuitem">
                Save <kbd>^S</kbd>
              </button>
              <button id="butSaveAs" type="button" role="menuitem">
                Save As <kbd>^&uparrow;S</kbd>
              </button>
              <button id="butClose" type="button" role="menuitem">
                Close <kbd>^W</kbd>
              </button>
            </div>
          </div>
          <div id="menuRecent" class="menuContainer">
            <button id="butRecent" class="menuTop" aria-label="Recent" aria-haspopup="true" aria-expanded="false">
              <span class="kbdShortcut">R</span>ecent
            </button>
            <div id="recentContainer" role="menu" class="menuItemContainer hidden">
            </div>
          </div>
          <div id="menuEdit" class="menuContainer">
            <button id="butEdit" class="menuTop" aria-label="Edit" aria-haspopup="true" aria-expanded="false">
                <span class="kbdShortcut">E</span>dit
            </button>
            <div role="menu" class="menuItemContainer hidden">
              <button id="butCut" type="button" role="menuitem">
                Cut <kbd>^X</kbd>
              </button>
              <button id="butCopy" type="button" role="menuitem">
                Copy <kbd>^C</kbd>
              </button>
              <button id="butPaste" type="button" role="menuitem">
                Paste <kbd>^V</kbd>
              </button>
            </div>
          </div>
          <div id="menuView" class="menuContainer">
            <button id="butView" class="menuTop" aria-label="View" aria-haspopup="true" aria-expanded="false">
                <span class="kbdShortcut">V</span>iew
            </button>
            <div role="menu" class="menuItemContainer hidden">
              <button id="butWordWrap" type="button" aria-checked="true" role="menuitemcheckbox">
                Word Wrap
              </button>
              <button id="butMonospace" type="button" aria-checked="false" role="menuitemcheckbox">
                Monospace Font
              </button>
              <button id="butCaptureTabs" type="button" aria-checked="true" role="menuitemcheckbox">
                Capture Tabs <kbd>^&uparrow;M</kbd>
              </button>
              <button id="butFontBigger" type="button" role="menuitem">
                Increase Font Size
              </button>
              <button id="butFontSmaller" type="button" role="menuitem">
                Decrease Font Size
              </button>
            </div>
          </div>
          <div id="menuInstall" class="menuContainer">
            <button id="butInstall" aria-label="Install" class="menuTop hidden">
                <span class="kbdShortcut">I</span>nstall
            </button>
          </div>
        </nav>
      </header>
      <Suspense>
        <TextArea/>
      </Suspense>

      <a id="aDownloadFile" download></a>
      <input type="file" id="filePicker"/>

      <details id="footer" class="footer">
        <summary>About
          <span>
            <span id="modifiedFooter" class="hidden">*</span>
            <span id="lblLegacyFS" class="hidden footer-label">Legacy Mode</span>
            <span id="lblTabMovesFocus" class="hidden footer-label">Tab Moves Focus</span>
          </span>
        </summary>
        <div id="notSupported">{`
          The
          `}<a href="https://wicg.github.io/file-system-access/" target="_blank">File System Access API</a>{`
          is `}<b>not</b>{` supported in this browser yet, and Text Editor is running
          in legacy mode. In legacy mode, the file modified indicators are not shown.
        `}</div>
        <div>{`
          Text Editor is a simple text editor similar to notepad that makes
          it easy to edit text files on your local file system. It shows how
          to easily use the new HTML5 File System Access APIs. To learn more
          about the File System Access APIs and how this demo was built, check out
          `}<a href="https://web.dev/file-system-access/" target="_blank">{`
          The file system access APIs`}</a>{` article on Web Fundamentals, or see the
          `}<a href="https://github.com/GoogleChromeLabs/text-editor/" target="_blank">{`
          source code on GitHub`}</a>{`.
          Written by `}<a href="https://twitter.com/petele" target="_blank">Pete LePage</a>{`.
          `}<small id="lastUpdated">{`
            Last Updated: [[BUILD_DATE]] (v[[VERSION]])
          `}</small>
        </div>
      </details>
    </>
  );
}