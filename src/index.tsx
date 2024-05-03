/* @refresh reload */
import { render } from "solid-js/web";
import App from "./app.js";

const root = document.querySelector<HTMLDivElement>("#root")!;

render(() => <App/>, root);