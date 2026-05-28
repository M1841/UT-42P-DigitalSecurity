<script setup>
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

import { ref } from "vue";
import { useRouter } from "vue-router";

import {
  sendEmailCode,
  checkEmailCode,
  generateTotp,
  validateTotp,
  registerStart,
  registerFinish,
} from "../services/auth";

const router = useRouter();
const email = ref("");
const emailCode = ref("");
const username = ref("");
const password = ref("");
const totpCode = ref("");
const totpQr = ref("");
const totpUri = ref("");
const emailErr = ref("");
const emailCodeErr = ref("");
const usernameErr = ref("");
const passwordErr = ref("");
const totpCodeErr = ref("");
const otherErr = ref("");
const isLoading = ref(false);
const isPasswordVisible = ref(false);
const handler = ref(handleEmailCode);

async function handleEmailCode() {
  emailErr.value = "";
  otherErr.value = "";
  isLoading.value = true;

  if (!email.value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    emailErr.value = "Email address is invalid";
    isLoading.value = false;
    return;
  }

  const { err } = await sendEmailCode(email.value);
  if (err) {
    if (err.match(/email/i)) emailErr.value = err;
    else otherErr.value = err;
    isLoading.value = false;
    return;
  }

  handler.value = handleRegister;
  isLoading.value = false;
}

let regRec = "";

async function handleRegister() {
  emailCodeErr.value = "";
  usernameErr.value = "";
  passwordErr.value = "";
  otherErr.value = "";
  isLoading.value = true;

  if (!emailCode.value.match(/^\d{6}$/)) {
    emailCodeErr.value = "The verification code should be a 6 digit string";
  }
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
  if (emailCodeErr.value || usernameErr.value || passwordErr.value) {
    isLoading.value = false;
    return;
  }

  const { err: errCode } = await checkEmailCode(email.value, emailCode.value);
  if (errCode) {
    emailCodeErr.value = errCode;
    isLoading.value = false;
    return;
  }

  const { registrationRecord, err: errRegister } = await registerStart(
    username.value,
    password.value,
  );
  if (errRegister) {
    if (errRegister.match(/email/i)) emailErr.value = errRegister;
    else if (errRegister.match(/username/i)) usernameErr.value = errRegister;
    else if (errRegister.match(/password/i)) passwordErr.value = errRegister;
    else otherErr.value = errRegister;
    isLoading.value = false;
    return;
  }

  regRec = registrationRecord;
  const { uri, qr, err: errTotpGen } = await generateTotp(username.value);
  if (errTotpGen) {
    otherErr.value = errTotpGen;
  }
  totpQr.value = qr;
  totpUri.value = uri;

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

  const { err } = await validateTotp(username.value, totpCode.value);
  if (err) {
    if (err.match(/code/i)) totpCodeErr.value = err;
    else otherErr.value = err;
    isLoading.value = false;
    return;
  }

  const { err: errFinish } = await registerFinish(
    email.value,
    username.value,
    regRec,
  );
  regRec = "";
  if (errFinish) {
    otherErr.value = errFinish;
    isLoading.value = false;
    return;
  }

  isLoading.value = false;
  router.push("/login");
}
</script>

<template>
  <form @submit.prevent="handler" class="gtk-form-group gtk-flex gtk-flex-col">
    <template v-if="handler == handleEmailCode">
      <div class="gtk-container">
        <label class="gtk-label">Email</label>
        <input
          v-model="email"
          placeholder="yourname@example.com"
          :class="`gtk-input ${emailErr && 'gtk-input-error'}`"
        />
        <p v-if="emailErr" class="gtk-error-text">{{ emailErr }}</p>
      </div>
    </template>
    <template v-if="handler == handleRegister">
      <div class="gtk-container">
        <label class="gtk-label">Verification code</label>
        <input
          v-model="emailCode"
          placeholder="000000"
          :class="`gtk-input ${emailCodeErr && 'gtk-input-error'}`"
        />
        <p v-if="emailCodeErr" class="gtk-error-text">{{ emailCodeErr }}</p>
        <p class="gtk-profile-form-hint">
          You should receive an email with a verification code.
        </p>
      </div>
      <div class="gtk-container gtk-mt-2">
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
        <p v-if="passwordErr" class="gtk-error-text">{{ passwordErr }}</p>
      </div>
    </template>
    <template v-if="handler == handleTotp">
      <div class="gtk-container">
        <div
          class="gtk-container gtk-flex gtk-flex-col gtk-justify-center gtk-items-center"
        >
          <img :src="totpQr" class="qr" />
        </div>
        <div class="gtk-input-group">
          <input class="gtk-input" disabled :value="totpUri" />
          <button
            @click="async () => await writeText(totpUri)"
            type="button"
            class="gtk-input-addon gtk-btn"
          >
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
              class="lucide lucide-copy-icon lucide-copy"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path
                d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
              />
            </svg>
          </button>
        </div>
        <p class="gtk-helper-text">
          Scan the QR code or paste the URI in your authenticator app.
        </p>
      </div>
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
          handler == handleEmailCode
            ? isLoading
              ? "Sending verification code..."
              : "Send verification code"
            : handler == handleRegister
              ? isLoading
                ? "Creating account..."
                : "Create account"
              : isLoading
                ? "Verifying authenticator app..."
                : "Verify authenticator app"
        }}
      </button>
      <router-link
        v-if="handler == handleEmailCode"
        to="/login"
        class="gtk-helper-text login-link"
      >
        Already have an account?
      </router-link>
    </div>
  </form>
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
.login-link {
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
.qr {
  height: 12rem;
  width: 12rem;
  border-radius: 5%;
  position: absolute;
  top: 5rem;
}
</style>
