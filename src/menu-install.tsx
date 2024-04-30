import { Suspense, lazy } from "solid-js";

export default function MenuInstall() {
  const ButInstall = lazy(() => import("./app-install.js"));

  return (
    <div id="menuInstall" class="menuContainer">
      <Suspense>
        <ButInstall/>
      </Suspense>
    </div>
  );
}