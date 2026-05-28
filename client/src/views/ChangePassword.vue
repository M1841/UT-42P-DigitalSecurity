<script setup></script>

<template>
  <div class="gtk-mobile-header">
    <div class="gtk-mobile-header-start">
      <router-link to="/settings" class="gtk-mobile-header-back">
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
          class="lucide lucide-chevron-left-icon lucide-chevron-left"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </router-link>
    </div>
    <div class="gtk-mobile-header-center">
      <h1 class="gtk-mobile-header-title">Change your password</h1>
    </div>
    <div class="gtk-mobile-header-end">
      <button class="gtk-mobile-header-back">
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
          class="lucide lucide-check-icon lucide-check"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </button>
    </div>
  </div>
  <div class="gtk-mobile-content">
    <div class="gtk-profile-editor">
      <div class="gtk-container">
        <label class="gtk-label">New password</label>
        <div class="gtk-input-group">
          <input type="password" class="gtk-input" placeholder="********" />
          <button type="button" class="gtk-input-addon gtk-btn">
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
              class="lucide lucide-eye-off-icon lucide-eye-off"
            >
              <path
                d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
              />
              <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
              <path
                d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
              />
              <path d="m2 2 20 20" />
            </svg>
          </button>
        </div>
        <p class="gtk-profile-form-hint">
          Make sure you remember or write down this one
        </p>
      </div>
      <hr class="gtk-mt-4" />
      <div class="gtk-container gtk-mt-4">
        <label class="gtk-label">Email code</label>
        <input type="text" class="gtk-input" placeholder="000000" />
        <p class="gtk-profile-form-hint">
          You should receive an email with a verification code.
        </p>
      </div>
      <div class="gtk-container gtk-mt-2">
        <label class="gtk-label">One-time code</label>
        <input type="text" class="gtk-input" placeholder="000000" />
        <p class="gtk-profile-form-hint">
          Use your authenticator app to confirm your identity.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
hr {
  border-color: #555;
  box-shadow: none;
}
div.gtk-mobile-header-start > .gtk-mobile-header-back {
  position: absolute;
  left: 0.5rem;
}
div.gtk-mobile-header-end > .gtk-mobile-header-back {
  position: absolute;
  right: 0.5rem;
}
a.gtk-mobile-header-back > svg.lucide {
  color: var(--gtk-text-secondary);
}
</style>
