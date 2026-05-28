<script setup>
import { useRouter } from "vue-router";

import { isLoggedIn, syncIsLoggedIn } from "./services/api.js";

const router = useRouter();

(async () => {
  await syncIsLoggedIn();
  if (!isLoggedIn()) router.push("/login");
})();
</script>

<template>
  <main class="gtk-app-shell">
    <router-view />
  </main>
</template>

<style scoped>
.gtk-app-shell {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
