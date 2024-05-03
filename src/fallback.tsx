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

import { createEffect } from "solid-js";
import { setADownloadFile, setFilePicker } from "./app.js";

export default function ADownloadFile() {
  let aDownloadFile: HTMLAnchorElement;
  let filePicker: HTMLInputElement;

  createEffect(() => {
    setADownloadFile(aDownloadFile);
    setFilePicker(filePicker);
  });

  return (
    <>
      <a
        id="aDownloadFile"
        ref={aDownloadFile!}
        download
      />
      <input
        type="file"
        id="filePicker"
        ref={filePicker!}
      />
    </>
  );
}