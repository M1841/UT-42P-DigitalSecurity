import { ready } from "@serenity-kit/opaque";
import { createApp } from "vue";

import App from "./App.vue";
import { router } from "./router";

(async () => await ready)();

const app = createApp(App);
app.use(router);
app.mount("#app");
