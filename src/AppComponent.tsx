/* @refresh reload */
import { createSignal, lazy } from "solid-js";
import { Suspense, render } from "solid-js/web";

const root = document.querySelector<HTMLDivElement>("#root")!;

export const [headerFileName, setHeaderFileName] = createSignal<string>("Text Editor");
export const [headerAppNameHidden, setHeaderAppNameHidden] = createSignal<boolean>(true);
export const [modifiedHeaderHidden, setModifiedHeaderHidden] = createSignal<boolean>(true);
export const [modifiedFooterHidden, setModifiedFooterHidden] = createSignal<boolean>(true);
export const [notSupportedHidden, setNotSupportedHidden] = createSignal<boolean>(false);
export const [lblLegacyFSHidden, setLblLegacyFSHidden] = createSignal<boolean>(true);
export const [lblTabMovesFocusHidden, setLblTabMovesFocusHidden] = createSignal<boolean>(true);

render(() => <AppComponent/>, root);

export default function AppComponent() {
  const MenuFile = lazy(() => import("./menu-file.js"));
  const MenuRecent = lazy(() => import("./menu-recent.js"));
  const MenuEdit = lazy(() => import("./menu-edit.js"));
  const MenuView = lazy(() => import("./menu-view.js"));
  const MenuInstall = lazy(() => import("./menu-install.js"));
  const TextArea = lazy(() => import("./text-area.js"));
  const Fallback = lazy(() => import("./fallback.js"));
  const Footer = lazy(() => import("./Footer.js"));

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

      <Suspense>
        <Footer/>
      </Suspense>
    </>
  );
}