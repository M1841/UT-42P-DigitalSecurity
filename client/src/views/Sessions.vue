<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { relativeTime } from "../helpers/relativeTime.js";
import { get, getSessionId } from "../services/api.js";
import { logout } from "../services/auth";

const router = useRouter();
const currentSession = ref(undefined);
const otherSessions = ref([]);
const otherErr = ref("");

(async () => {
  const { sessions, err } = await get("/api/auth/sessions", true);
  if (err) {
    otherErr.value = err;
    return;
  }
  const currentSessionId = await getSessionId();
  const processedSesions = sessions
    .sort((a, b) => Number(b.time) - Number(a.time))
    .map((session) => ({
      ...session,
      timestamp: session.time,
      time: relativeTime(new Date(session.time)),
    }));
  currentSession.value = processedSesions.find(
    (session) => session.id === currentSessionId,
  );
  otherSessions.value = processedSesions
    .filter((session) => session.id !== currentSessionId)
    .sort((a, b) => Number(b.time) - Number(a.time));
  setInterval(
    () => {
      currentSession.value = {
        ...currentSession.value,
        time: relativeTime(new Date(currentSession.value.timestamp)),
      };
      otherSessions.value = otherSessions.value.map((session) => ({
        ...session,
        time: relativeTime(new Date(session.timestamp)),
      }));
    },
    Math.min(
      processedSesions.map((session) => Date.now - new Date(session.timestamp)),
    ),
  );
})();

async function handleLogout(sessionId, sessionKey) {
  await logout(sessionId, sessionKey);
  if (sessionId === currentSession.value.id) {
    router.push("/login");
    return;
  }
  otherSessions.value = otherSessions.value.filter(
    (session) => session.id !== sessionId,
  );
}
</script>

<template>
  <div class="gtk-mobile-header">
    <div class="gtk-mobile-header-start"></div>
    <div class="gtk-mobile-header-center">
      <h1 class="gtk-mobile-header-title">Sessions</h1>
    </div>
    <div class="gtk-mobile-header-end">
      <div class="gtk-mobile-header-back"></div>
    </div>
  </div>

  <div class="gtk-mobile-content gtk-settings-container">
    <div class="gtk-settings-section">
      <div class="gtk-settings-section-header">Current session</div>
      <div v-if="currentSession" class="gtk-settings-group">
        <div class="gtk-settings-item gtk-settings-item-static">
          <div class="gtk-settings-item-content">
            <h4 class="gtk-settings-item-title">
              {{ currentSession.location }}
            </h4>
            <p class="gtk-settings-item-subtitle">
              {{ currentSession.os }} • {{ currentSession.ipaddr }}
            </p>
            <p class="gtk-settings-item-subtitle" style="font-size: 0.75rem">
              {{ currentSession.time }}
            </p>
          </div>
          <button
            @click="
              async () =>
                await handleLogout(currentSession.id, currentSession.key)
            "
            class="gtk-btn gtk-settings-item-value"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-power-off-icon lucide-power-off"
            >
              <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
              <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
              <path d="M12 2v4" />
              <path d="m2 2 20 20" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="gtk-settings-section">
      <div class="gtk-settings-section-header">Other sessions</div>
      <div
        v-for="session in otherSessions"
        :key="session.id"
        class="gtk-settings-group"
      >
        <div class="gtk-settings-item gtk-settings-item-static">
          <div class="gtk-settings-item-content">
            <h4 class="gtk-settings-item-title">
              {{ session.location }}
            </h4>
            <p class="gtk-settings-item-subtitle">
              {{ session.os }} • {{ session.ipaddr }}
            </p>
            <p class="gtk-settings-item-subtitle" style="font-size: 0.75rem">
              {{ session.time }}
            </p>
          </div>
          <button
            @click="async () => await handleLogout(session.id, session.key)"
            class="gtk-btn gtk-settings-item-value"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-power-off-icon lucide-power-off"
            >
              <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
              <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
              <path d="M12 2v4" />
              <path d="m2 2 20 20" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div v-if="otherSessions.length < 1" class="gtk-settings-group">
      <div class="gtk-settings-item gtk-settings-item-static">
        <div class="gtk-settings-item-content">
          <p class="gtk-settings-item-subtitle">No other sessions</p>
        </div>
      </div>
    </div>
  </div>
  <div v-if="otherErr" class="gtk-container error-container">
    <div class="gtk-alert gtk-alert-error">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-circle-x-icon lucide-circle-x gtk-alert-icon"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
      <div class="gtk-alert-content">
        <p class="gtk-alert-title">Error</p>
        <p class="gtk-alert-message">{{ otherErr }}</p>
      </div>
    </div>
  </div>
</template>

<style>
div.gtk-mobile-header-start > .gtk-mobile-header-back {
  position: absolute;
  left: 0.5rem;
}
div.gtk-mobile-header-end > .gtk-mobile-header-back {
  position: absolute;
}
a.gtk-mobile-header-back > svg.lucide {
  color: var(--gtk-text-secondary);
}
div.gtk-settings-section {
  margin-bottom: 0;
}
.error-container {
  position: absolute;
  bottom: 3em;
  left: 0em;
}
.gtk-alert-icon {
  margin-top: 2px;
}
.gtk-alert-content {
  font-size: 0.9em;
}
</style>
