import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import common_en from "./locales/en/common.json";
import overview_en from "./locales/en/overview.json";
import peers_en from "./locales/en/peers.json";
import sessions_en from "./locales/en/sessions.json";
import conclusions_en from "./locales/en/conclusions.json";
import settings_en from "./locales/en/settings.json";
import common_zh from "./locales/zh-CN/common.json";
import overview_zh from "./locales/zh-CN/overview.json";
import peers_zh from "./locales/zh-CN/peers.json";
import sessions_zh from "./locales/zh-CN/sessions.json";
import conclusions_zh from "./locales/zh-CN/conclusions.json";
import settings_zh from "./locales/zh-CN/settings.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "zh-CN"],
    defaultNS: "common",
    ns: ["common", "overview", "peers", "sessions", "conclusions", "settings"],
    resources: {
      en: {
        common: common_en,
        overview: overview_en,
        peers: peers_en,
        sessions: sessions_en,
        conclusions: conclusions_en,
        settings: settings_en,
      },
      "zh-CN": {
        common: common_zh,
        overview: overview_zh,
        peers: peers_zh,
        sessions: sessions_zh,
        conclusions: conclusions_zh,
        settings: settings_zh,
      },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
