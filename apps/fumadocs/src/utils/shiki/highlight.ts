import bash from "@shikijs/langs/bash";
import css from "@shikijs/langs/css";
// Languages:
import html from "@shikijs/langs/html";
import js from "@shikijs/langs/js";
import json from "@shikijs/langs/json";
import markdown from "@shikijs/langs/mdx";
import ts from "@shikijs/langs/ts";
import tsx from "@shikijs/langs/tsx";
import darkTheme from "@shikijs/themes/one-dark-pro";
// Themes:
import lightTheme from "@shikijs/themes/one-light";
import { createHighlighterCore } from "shiki/core";
import type { HighlighterCore, RegexEngine } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

let jsEngine: RegexEngine | null = null;
let highlighter: Promise<HighlighterCore> | null = null;

// Settings for UI components
const Themes = {
  dark: "one-dark-pro",
  light: "one-light",
};

type Languages = "html" | "js" | "ts" | "tsx" | "css" | "bash" | "json" | "mdx";

const getJsEngine = (): RegexEngine => {
  jsEngine ??= createJavaScriptRegexEngine();
  return jsEngine;
};

const highlight = (): Promise<HighlighterCore> => {
  highlighter ??= createHighlighterCore({
    engine: getJsEngine(),
    langs: [bash, js, ts, tsx, css, markdown, html, json],
    themes: [lightTheme, darkTheme],
  });
  return highlighter;
};

export { highlight, Themes, type Languages };
