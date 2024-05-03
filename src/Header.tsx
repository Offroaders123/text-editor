import { headerAppNameHidden, headerFileName, modifiedHeaderHidden } from "./app.js";
import MenuFile from "./menu-file.js";
import MenuRecent from "./menu-recent.js";
import MenuEdit from "./menu-edit.js";
import MenuView from "./menu-view.js";
import MenuInstall from "./menu-install.js";

export default function Header() {
  return (
    <header>
      <h1>
        <span id="headerFileName">{headerFileName()}</span>
        <span id="modifiedHeader" classList={{ hidden: modifiedHeaderHidden() }}>*</span>
        <span id="headerAppName" classList={{ hidden: headerAppNameHidden() }}> - Text Editor</span>
      </h1>
      <nav class="menubar">
        <MenuFile/>
        <MenuRecent/>
        <MenuEdit/>
        <MenuView/>
        <MenuInstall/>
      </nav>
    </header>
  );
}