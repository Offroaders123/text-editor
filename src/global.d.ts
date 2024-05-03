declare global {
  interface Navigator {
    /**
     * Exclusive to iOS, iPadOS, and macOS devices.
    */
    readonly standalone: boolean;
  }

  // needs to be handled still
  var lastUpdated: HTMLElement;
}

export {};