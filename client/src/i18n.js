import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to our Music Platform",
      "play": "Play",
      "pause": "Pause",
      "subscribe": "Subscribe",
      // Tambahkan lebih banyak terjemahan
    }
  },
  id: {
    translation: {
      "welcome": "Selamat datang di Platform Musik Kami",
      "play": "Putar",
      "pause": "Jeda",
      "subscribe": "Berlangganan",
      // Tambahkan lebih banyak terjemahan
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;