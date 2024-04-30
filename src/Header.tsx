import { Suspense, lazy } from "solid-js";
import { headerAppNameHidden, headerFileName, modifiedHeaderHidden } from "./AppComponent.js";

export default function Header() {
  const MenuFile = lazy(() => import("./menu-file.js"));
  const MenuRecent = lazy(() => import("./menu-recent.js"));
  const MenuEdit = lazy(() => import("./menu-edit.js"));
  const MenuView = lazy(() => import("./menu-view.js"));
  const MenuInstall = lazy(() => import("./menu-install.js"));

  return (
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
  );
}