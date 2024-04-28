declare global {
  interface Navigator {
    /**
     * Exclusive to iOS, iPadOS, and macOS devices.
    */
    readonly standalone: boolean;
  }
}

export {};