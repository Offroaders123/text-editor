/* @refresh reload */
import { createSignal, lazy } from "solid-js";
import { Suspense, render } from "solid-js/web";

const root = document.querySelector<HTMLDivElement>("#root")!;

export const [headerFileName, setHeaderFileName] = createSignal<string>("Text Editor");
export const [headerAppNameHidden, setHeaderAppNameHidden] = createSignal<boolean>(true);
export const [modifiedHeaderHidden, setModifiedHeaderHidden] = createSignal<boolean>(true);
export const [modifiedFooterHidden, setModifiedFooterHidden] = createSignal<boolean>(true);
export const [notSupportedHidden, setNotSupportedHidden] = createSignal<boolean>(false);

render(() => <AppComponent/>, root);

export default function AppComponent() {
  const MenuFile = lazy(() => import("./menu-file.js"));
  const MenuRecent = lazy(() => import("./menu-recent.js"));
  const MenuEdit = lazy(() => import("./menu-edit.js"));
  const MenuView = lazy(() => import("./menu-view.js"));
  const MenuInstall = lazy(() => import("./menu-install.js"));
  const TextArea = lazy(() => import("./text-area.js"));
  const Fallback = lazy(() => import("./fallback.js"));

  return (
    <>
      <header>
        <h1>
          <span id="headerFileName">{headerFileName()}</span><span id="modifiedHeader" classList={{ hidden: modifiedHeaderHidden() }}>*</span>
          <span id="headerAppName" classList={{ hidden: headerAppNameHidden() }}> - Text Editor</span>
        </h1>
        <nav class="menubar">
          <Suspense>
            <MenuFile/>
          </Suspense>
          <Suspense>
            <MenuRecent/>
          </Suspense>
          <Suspense>
            <MenuEdit/>
          </Suspense>
          <Suspense>
            <MenuView/>
          </Suspense>
          <Suspense>
            <MenuInstall/>
          </Suspense>
        </nav>
      </header>
      <Suspense>
        <TextArea/>
      </Suspense>

      <Suspense>
        <Fallback/>
      </Suspense>

      <details id="footer" class="footer">
        <summary>About
          <span>
            <span id="modifiedFooter" classList={{ hidden: modifiedFooterHidden() }}>*</span>
            <span id="lblLegacyFS" class="hidden footer-label">Legacy Mode</span>
            <span id="lblTabMovesFocus" class="hidden footer-label">Tab Moves Focus</span>
          </span>
        </summary>
        <div id="notSupported" classList={{ hidden: notSupportedHidden() }}>{`
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