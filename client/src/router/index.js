import { createRouter, createWebHashHistory } from "vue-router";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/settings" },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/Settings.vue"),
    },
    {
      path: "/sessions",
      name: "sessions",
      component: () => import("../views/Sessions.vue"),
    },
    {
      path: "/change-username",
      name: "change-username",
      component: () => import("../views/ChangeUsername.vue"),
    },
    {
      path: "/change-email",
      name: "change-email",
      component: () => import("../views/ChangeEmail.vue"),
    },
    {
      path: "/change-password",
      name: "change-password",
      component: () => import("../views/ChangePassword.vue"),
    },
    {
      path: "/change-authenticator",
      name: "change-authenticator",
      component: () => import("../views/ChangeAuthenticator.vue"),
    },
    {
      path: "/delete-account",
      name: "delete-account",
      component: () => import("../views/DeleteAccount.vue"),
    },
    { path: "/me", name: "me", component: () => import("../views/Me.vue") },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/Register.vue"),
    },
  ],
});
