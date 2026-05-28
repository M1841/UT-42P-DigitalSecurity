<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { get, getSessionId, post } from "../services/api";
import { logout } from "../services/auth";

const router = useRouter();

const user = ref(undefined);
const sessions = ref([]);
(async () => {
  const {
    username,
    email,
    err: errMe,
  } = await post("/api/me", undefined, true);
  if (errMe) {
    await handleLogout();
    return;
  }
  user.value = { username, email };

  const { sessions: result, err: errSessions } = await get(
    "/api/auth/sessions",
    true,
  );
  if (errSessions) {
    alert(errSessions);
    return;
  }
  const currentSessionId = await getSessionId();
  sessions.value = result
    .sort((a, b) => Number(b.time) - Number(a.time))
    .map((session) => {
      const rawTime = new Date(session.time);
      const time = `${String(rawTime.getHours()).padStart(2, "0")}:${String(rawTime.getMinutes()).padStart(2, "0")} ${String(rawTime.getDate()).padStart(2, "0")}/${String(rawTime.getMonth()).padStart(2, "0")}/${rawTime.getFullYear()}`;
      return {
        ...session,
        isCurrent: session.id === currentSessionId,
        time,
      };
    });
})();

async function handleLogout(sessionId) {
  if (!sessionId) {
    await logout(sessionId);
    router.push("/login");
    return;
  }
  await logout();
  sessions.value = sessions.value.filter((session) => session.id !== sessionId);
}
</script>

<template>
  <div v-if="user" class="gtk-h6 gtk-container">
    <p>Username: {{ user.username }}</p>
    <p>Email: {{ user.email }}</p>
    <p>&nbsp;</p>
    <p>Sessions:</p>
    <div v-for="session in sessions" :key="session.id">
      <hr />
      <p v-if="session.isCurrent" class="gtk-helper-text">Current session</p>
      <p>ID: {{ session.id }}</p>
      <p>Location: {{ session.location }}</p>
      <p>IP address: {{ session.ipaddr }}</p>
      <p>Last login: {{ session.time }}</p>
      <button
        @click="async () => handleLogout(session.id)"
        class="gtk-btn gtk-btn-sm"
      >
        Log out
      </button>
    </div>
  </div>
</template>
