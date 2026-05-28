<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { loginFinish, loginStart, validateTotp } from "../services/auth.js";
import { isLoggedIn } from "../services/api.js";

const route = useRoute();
const router = useRouter();
const username = ref("");
const password = ref("");
const totpCode = ref("");
const usernameErr = ref("");
const passwordErr = ref("");
const totpCodeErr = ref("");
const otherErr = ref("");
const isLoading = ref(false);
const isPasswordVisible = ref(false);
const handler = ref(handleLogin);

async function handleLogin() {
  usernameErr.value = "";
  passwordErr.value = "";
  otherErr.value = "";
  isLoading.value = true;

  if (!username.value.match(/^[a-zA-Z0-9_]{3,20}$/)) {
    usernameErr.value =
      "Username must be 3-20 characters long and contain only alphanumeric characters and/or underscores";
  }
  if (
    !password.value.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_])[A-Za-z\d!@#$%^&*()_]{8,}$/,
    )
  ) {
    passwordErr.value =
      "Password must be 8+ characters long and contain at least one lowercase letter, one uppercase letter, one digit and one symbol";
  }
  if (usernameErr.value || passwordErr.value) {
    isLoading.value = false;
    return;
  }

  isLoading.value = false;
  handler.value = handleCaptcha;
  sessionStorage.clear();
  sessionStorage.setItem("username", username.value);
  sessionStorage.setItem("password", password.value);
  window.location.replace(
    `${import.meta.env["VITE_SERVER_HOST"]}/api/captcha?userIdentifier=${username.value}`,
  );
}

const { captchaId } = route.query;
if (
  captchaId &&
  sessionStorage.getItem("username") &&
  sessionStorage.getItem("password")
) {
  handler.value = handleCaptcha;
  username.value = sessionStorage.getItem("username");
  password.value = sessionStorage.getItem("password");
  sessionStorage.clear();
  (async () => await handler.value())();
}

const finishLoginRequest = ref("");
const sessionKey = ref("");
async function handleCaptcha() {
  otherErr.value = "";
  isLoading.value = true;

  const {
    finishLoginRequest: flr,
    sessionKey: sk,
    err,
  } = await loginStart(username.value, password.value);
  if (err) {
    if (err.match(/user/i)) {
      usernameErr.value = err;
      handler.value = handleLogin;
    } else if (err.match(/password/i)) {
      passwordErr.value = err;
      handler.value = handleLogin;
    } else otherErr.value = err;
    isLoading.value = false;
    return;
  }
  finishLoginRequest.value = flr;
  sessionKey.value = sk;
  handler.value = handleTotp;
  isLoading.value = false;
}

async function handleTotp() {
  totpCodeErr.value = "";
  otherErr.value = "";
  isLoading.value = true;

  if (!totpCode.value.match(/^\d{6}$/)) {
    totpCodeErr.value = "The authenticator code should be a 6 digit string";
    isLoading.value = false;
    return;
  }

  const { err: errTotp } = await validateTotp(username.value, totpCode.value);
  if (errTotp) {
    if (errTotp.match(/code/i)) totpCodeErr.value = errTotp;
    else otherErr.value = errTotp;
    isLoading.value = false;
    return;
  }
  const { err: errLogin } = await loginFinish(
    username.value,
    finishLoginRequest.value,
    sessionKey.value,
  );
  if (errLogin) {
    otherErr.value = errLogin;
    isLoading.value = false;
    return;
  }

  isLoading.value = false;
  router.push("/settings");
}
</script>

<template>
  <form @submit.prevent="handler" class="gtk-form-group gtk-flex gtk-flex-col">
    <template v-if="handler != handleTotp">
      <div class="gtk-container">
        <label class="gtk-label">Username</label>
        <input
          v-model="username"
          placeholder="yourname"
          :class="`gtk-input ${usernameErr && 'gtk-input-error'}`"
        />
        <p v-if="usernameErr" class="gtk-error-text">{{ usernameErr }}</p>
      </div>
      <div class="gtk-container gtk-mt-2">
        <label class="gtk-label">Password</label>
        <div class="gtk-input-group">
          <input
            v-model="password"
            placeholder="********"
            :type="isPasswordVisible ? 'text' : 'password'"
            :class="`gtk-input ${passwordErr && 'gtk-input-error'}`"
          />
          <button
            @click="() => (isPasswordVisible = !isPasswordVisible)"
            type="button"
            class="gtk-input-addon gtk-btn"
          >
            <template v-if="isPasswordVisible">
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
                class="lucide lucide-eye-icon lucide-eye"
              >
                <path
                  d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </template>
            <template v-else>
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
            </template>
          </button>
        </div>
        <span v-if="passwordErr" class="gtk-error-text">{{ passwordErr }}</span>
      </div>
    </template>
    <template v-if="handler == handleTotp">
      <div class="gtk-container gtk-mt-4">
        <label class="gtk-label">One-time code</label>
        <input
          v-model="totpCode"
          placeholder="000000"
          :class="`gtk-input ${totpCodeErr && 'gtk-input-error'}`"
        />
        <p v-if="totpCodeErr" class="gtk-error-text">{{ totpCodeErr }}</p>
      </div>
    </template>
    <div class="gtk-container gtk-flex gtk-flex-col gtk-gap-2">
      <button
        type="submit"
        class="gtk-btn gtk-btn-primary gtk-mt-4"
        :disabled="isLoading"
      >
        {{
          handler == handleTotp
            ? isLoading
              ? "Verifying code..."
              : "Verify code"
            : isLoading
              ? "Logging in..."
              : "Login"
        }}
      </button>
      <router-link
        v-if="handler == handleLogin"
        to="/register"
        class="gtk-helper-text register-link"
      >
        Do not have an account?
      </router-link>
    </div>
  </form>
  <router-link v-if="isLoggedIn()" to="/" class="gtk-helper-text register-link">
    Go back
  </router-link>
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

<style scoped>
.register-link {
  width: 100%;
  text-align: center;
}
.gtk-input-addon svg {
  height: 1.5em;
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
