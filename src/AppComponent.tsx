/* @refresh reload */
import { createSignal, lazy } from "solid-js";
import { Suspense, render } from "solid-js/web";

const root = document.querySelector<HTMLDivElement>("#root")!;

export const [headerFileName, setHeaderFileName] = createSignal<string>("Text Editor");
export const [headerAppNameHidden, setHeaderAppNameHidden] = createSignal<boolean>(true);
export const [butSaveHidden, setButSaveHidden] = createSignal<boolean>(false);
export const [modifiedHeaderHidden, setModifiedHeaderHidden] = createSignal<boolean>(true);
export const [modifiedFooterHidden, setModifiedFooterHidden] = createSignal<boolean>(true);
export const [notSupportedHidden, setNotSupportedHidden] = createSignal<boolean>(false);
export const [lblLegacyFSHidden, setLblLegacyFSHidden] = createSignal<boolean>(true);
export const [lblTabMovesFocusHidden, setLblTabMovesFocusHidden] = createSignal<boolean>(true);

render(() => <AppComponent/>, root);

export default function AppComponent() {
  const Header = lazy(() => import("./Header.js"));
  const TextArea = lazy(() => import("./text-area.js"));
  const Fallback = lazy(() => import("./fallback.js"));
  const Footer = lazy(() => import("./Footer.js"));

  return (
    <>
      <Suspense>
        <Header/>
      </Suspense>
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