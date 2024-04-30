declare global {
  interface Navigator {
    /**
     * Exclusive to iOS, iPadOS, and macOS devices.
    */
    readonly standalone: boolean;
  }

  // var headerFileName: HTMLSpanElement;
  // var modifiedHeader: HTMLSpanElement;
  // var headerAppName: HTMLSpanElement;
  // var menuFile: HTMLDivElement;
  var butFile: HTMLButtonElement;
  var butNew: HTMLButtonElement;
  var butOpen: HTMLButtonElement;
  var butSave: HTMLButtonElement;
  var butSaveAs: HTMLButtonElement;
  var butClose: HTMLButtonElement;
  // var menuRecent: HTMLDivElement;
  var butRecent: HTMLButtonElement;
  var recentContainer: HTMLDivElement;
  // var menuEdit: HTMLDivElement;
  var butEdit: HTMLButtonElement;
  var butCut: HTMLButtonElement;
  var butCopy: HTMLButtonElement;
  var butPaste: HTMLButtonElement;
  // var menuView: HTMLDivElement;
  var butView: HTMLButtonElement;
  var butWordWrap: HTMLButtonElement;
  var butMonospace: HTMLButtonElement;
  var butCaptureTabs: HTMLButtonElement;
  var butFontBigger: HTMLButtonElement;
  var butFontSmaller: HTMLButtonElement;
  // var menuInstall: HTMLDivElement;
  // var butInstall: HTMLButtonElement;
  // var textEditor: HTMLTextAreaElement;
  // var aDownloadFile: HTMLAnchorElement;
  // var filePicker: HTMLInputElement;
  var footer: HTMLDetailsElement;
  // var modifiedFooter: HTMLSpanElement;
  // var lblLegacyFS: HTMLSpanElement;
  var lblTabMovesFocus: HTMLSpanElement;
  // var notSupported: HTMLDivElement;
  var lastUpdated: HTMLElement;
}

export {};