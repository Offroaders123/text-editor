import { lblLegacyFSHidden, lblTabMovesFocusHidden, modifiedFooterHidden, notSupportedHidden } from "./AppComponent.js";

export default function Footer() {
  return (
    <details id="footer" class="footer">
      <summary>About
        <span>
          <span id="modifiedFooter" classList={{ hidden: modifiedFooterHidden() }}>*</span>
          <span id="lblLegacyFS" classList={{ hidden: lblLegacyFSHidden(), "footer-label": true }}>Legacy Mode</span>
          <span id="lblTabMovesFocus" classList={{ hidden: lblTabMovesFocusHidden(), "footer-label": true }}>Tab Moves Focus</span>
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
  );
}