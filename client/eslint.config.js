import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import css from "@eslint/css";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  pluginVue.configs["flat/essential"],
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
  {
    files: ["**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  globalIgnores(["./src-tauri/target"]),
]);
