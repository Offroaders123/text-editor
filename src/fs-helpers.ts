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

'use strict';

/* exported getFileHandle, getNewFileHandle, readFile, verifyPermission,
            writeFile */

/**
 * Open a handle to an existing file on the local file system.
 *
 * @returns Handle to the existing file.
 */
export function getFileHandle(): Promise<FileSystemFileHandle> {
  // For Chrome 86 and later...
  if ('showOpenFilePicker' in window) {
    return window.showOpenFilePicker().then((handles) => handles[0]);
  }
  // For Chrome 85 and earlier...
  return (window as typeof globalThis).chooseFileSystemEntries();
}

/**
 * Create a handle to a new (text) file on the local file system.
 *
 * @returns Handle to the new file.
 */
export function getNewFileHandle(): Promise<FileSystemFileHandle> {
  // For Chrome 86 and later...
  if ('showSaveFilePicker' in window) {
    const opts: SaveFilePickerOptions = {
      types: [{
        description: 'Text file',
        accept: {'text/plain': ['.txt']},
      }],
    };
    return window.showSaveFilePicker(opts);
  }
  // For Chrome 85 and earlier...
  const opts: ChooseFileSystemEntriesFileOptions & { type: "save-file"; } = {
    type: 'save-file',
    accepts: [{
      description: 'Text file',
      extensions: ['txt'],
      mimeTypes: ['text/plain'],
    }],
  };
  return (window as typeof globalThis).chooseFileSystemEntries(opts);
}

/**
 * Reads the raw text from a file.
 *
 * @returns A promise that resolves to the parsed string.
 */
export function readFile(file: File): Promise<string> {
  // If the new .text() reader is available, use it.
  if (file.text) {
    return file.text();
  }
  // Otherwise use the traditional file reading technique.
  return _readFileLegacy(file);
}

/**
 * Reads the raw text from a file.
 *
 * @private
 * @returns A promise that resolves to the parsed string.
 */
function _readFileLegacy(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', (e) => {
      const text: string = (e.srcElement as FileReader).result as string;
      resolve(text);
    });
    reader.readAsText(file);
  });
}

/**
 * Writes the contents to disk.
 *
 * @param fileHandle File handle to write to.
 * @param contents Contents to write.
 */
export async function writeFile(fileHandle: FileSystemFileHandle, contents: string): Promise<void> {
  // Support for Chrome 82 and earlier.
  // @ts-expect-error - legacy support
  if (fileHandle.createWriter) {
    // Create a writer (request permission if necessary).
    // @ts-expect-error
    const writer = await fileHandle.createWriter();
    // Write the full length of the contents
    await writer.write(0, contents);
    // Close the file and write the contents to disk
    await writer.close();
    return;
  }
  // For Chrome 83 and later.
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();
  // Write the contents of the file to the stream.
  await writable.write(contents);
  // Close the file and write the contents to disk.
  await writable.close();
}

/**
 * Verify the user has granted permission to read or write to the file, if
 * permission hasn't been granted, request permission.
 *
 * @param fileHandle File handle to check.
 * @param withWrite True if write permission should be checked.
 * @returns True if the user has granted read/write permission.
 */
export async function verifyPermission(fileHandle: FileSystemFileHandle, withWrite: boolean): Promise<boolean> {
  const opts: FileSystemHandlePermissionDescriptor = {};
  if (withWrite) {
    opts.writable = true;
    // For Chrome 86 and later...
    opts.mode = 'readwrite';
  }
  // Check if we already have permission, if so, return true.
  if (await fileHandle.queryPermission(opts) === 'granted') {
    return true;
  }
  // Request permission to the file, if the user grants permission, return true.
  if (await fileHandle.requestPermission(opts) === 'granted') {
    return true;
  }
  // The user did nt grant permission, return false.
  return false;
}
