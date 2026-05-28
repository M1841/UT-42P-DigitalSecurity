<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";

import { get } from "../services/api";
import { logout } from "../services/auth";

const router = useRouter();
const user = reactive({ username: undefined, email: undefined });

(async () => {
  const { username, email, err } = await get("/api/settings/user", true);
  if (err) {
    await handleLogout();
    return;
  }
  user.username = username;
  user.email = email;
})();

async function handleLogout() {
  await logout();
  router.push("/login");
}
</script>

<template>
  <div class="gtk-mobile-header">
    <div class="gtk-mobile-header-start">
      <h1 class="gtk-mobile-header-title">Settings</h1>
    </div>
    <div class="gtk-mobile-header-end">
      <button @click="handleLogout" class="gtk-mobile-header-back">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-log-out-icon lucide-log-out"
        >
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        </svg>
      </button>
    </div>
  </div>
  <div class="gtk-mobile-content">
    <div class="gtk-settings-section">
      <div class="gtk-settings-section-header">Account info</div>
      <div class="gtk-settings-group">
        <router-link to="/change-username" class="gtk-settings-item">
          <div class="gtk-settings-icon gtk-settings-icon-muted">
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
              class="lucide lucide-user-icon lucide-user"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div class="gtk-settings-item-content">
            <h4 class="gtk-settings-item-title">Change username</h4>
            <p class="gtk-settings-item-subtitle">{{ user.username }}</p>
          </div>
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
            class="lucide lucide-chevron-right-icon lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </router-link>
        <router-link to="/change-email" class="gtk-settings-item">
          <div class="gtk-settings-icon gtk-settings-icon-muted">
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
              class="lucide lucide-mail-icon lucide-mail"
            >
              <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
              <rect x="2" y="4" width="20" height="16" rx="2" />
            </svg>
          </div>
          <div class="gtk-settings-item-content">
            <h4 class="gtk-settings-item-title">Change email address</h4>
            <p class="gtk-settings-item-subtitle">{{ user.email }}</p>
          </div>
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
            class="lucide lucide-chevron-right-icon lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </router-link>
      </div>
    </div>
    <div class="gtk-settings-section">
      <div class="gtk-settings-section-header">Security</div>
      <div class="gtk-settings-group">
        <router-link to="/change-password" class="gtk-settings-item">
          <div class="gtk-settings-icon gtk-settings-icon-muted">
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
              class="lucide lucide-lock-icon lucide-lock"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div class="gtk-settings-item-content">
            <h4 class="gtk-settings-item-title">Change password</h4>
          </div>
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
            class="lucide lucide-chevron-right-icon lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </router-link>
        <router-link to="/change-authenticator" class="gtk-settings-item">
          <div class="gtk-settings-icon gtk-settings-icon-muted">
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
              class="lucide lucide-key-round-icon lucide-key-round"
            >
              <path
                d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
              />
              <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
            </svg>
          </div>
          <div class="gtk-settings-item-content">
            <h4 class="gtk-settings-item-title">Change authenticator</h4>
          </div>
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
            class="lucide lucide-chevron-right-icon lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </router-link>
      </div>
    </div>
    <div class="gtk-settings-section">
      <div class="gtk-settings-section-header">Sessions</div>
      <div class="gtk-settings-group">
        <router-link to="/sessions" class="gtk-settings-item">
          <div class="gtk-settings-icon gtk-settings-icon-muted">
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
              class="lucide lucide-map-pinned-icon lucide-map-pinned"
            >
              <path
                d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"
              />
              <circle cx="12" cy="8" r="2" />
              <path
                d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"
              />
            </svg>
          </div>
          <div class="gtk-settings-item-content">
            <h4 class="gtk-settings-item-title">Manage sessions</h4>
            <p class="gtk-settings-item-subtitle">
              Monitor and terminate sessions
            </p>
          </div>
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
            class="lucide lucide-chevron-right-icon lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </router-link>
      </div>
    </div>
    <div class="gtk-settings-section">
      <div class="gtk-settings-section-header">Deletion</div>
      <div class="gtk-settings-group">
        <router-link to="/delete-account" class="gtk-settings-item">
          <div class="gtk-settings-icon gtk-settings-icon-primary">
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
              class="lucide lucide-trash2-icon lucide-trash-2"
            >
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <div class="gtk-settings-item-content">
            <h4 class="gtk-settings-item-title">Delete account</h4>
            <p class="gtk-settings-item-subtitle">
              Permanently remove all data
            </p>
          </div>
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
            class="lucide lucide-chevron-right-icon lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
div.gtk-mobile-header-end > .gtk-mobile-header-back {
  position: absolute;
  right: 0.5rem;
}
div.gtk-settings-section {
  margin-bottom: 0;
}
a > svg.lucide {
  color: var(--gtk-text-secondary);
}
div.gtk-settings-icon-primary {
  color: var(--gtk-bg-secondary);
}
</style>
