import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* =====================================================================
   Osmonoro — Quyosh tizimi simulyatori (Three.js)
   Tashqi rasm, API kalit yoki server kerak emas: barcha teksturalar
   brauzerning oʻzida kod bilan chiziladi. Musiqa — musiqa.mp3 fayli.
   ===================================================================== */

const $ = (s) => document.querySelector(s);
const TAU = Math.PI * 2;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =====================================================================
   0. KO'P TILLILIK (i18n)
   ===================================================================== */
const LANGUAGES = {
  uz: "Oʻzbekcha",
  en: "English",
  ru: "Русский",
  tr: "Türkçe",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
};

const I18N = {
  uz: {
    ui: {
      'page.title': 'Osmonoro — Quyosh tizimi simulyatori',
      'meta.desc': 'Osmonoro — Quyosh tizimining 3D simulyatori. Barmoq bilan aylantiring va sayyoralarni yaqindan koʻring.',
      'brand.sub': 'Quyosh tizimi simulyatori',
      'speed.group': 'Vaqt tezligi',
      'speed.pause': 'Toʻxtatish',
      'hint': 'Aylantirish uchun suring, yaqinlashtirish uchun ikki barmoq ishlating. Sayyorani bosing.',
      'lang': 'Til',
      'rec': 'Videoga yozish',
      'rec.stop': 'Yozishni toʻxtatish',
      'share': 'Ulashish',
      'tour': 'Avto sayr',
      'music': 'Musiqa',
      'orbits': 'Orbita',
      'labels': 'Nomlar',
      'menu.png': 'PNG rasm',
      'menu.jpg': 'JPG rasm',
      'menu.svg': 'SVG rasm',
      'all': 'Umumiy',
      'chips.aria': 'Osmon jismlari',
      'close': 'Yopish',
      'save': 'Saqlash',
      'loader.build': 'Sayyoralar yaratilmoqda…',
      'loader.fail': 'Yuklanmadi. Internetni tekshirib, sahifani yangilang.',
      'webgl': 'Qurilmangiz WebGL ni qoʻllab-quvvatlamaydi.',
      'toast.music_missing': 'Musiqa fayli topilmadi: musiqa.mp3 ni index.html yoniga qoʻying.',
      'toast.video_first': 'Avval video yozishni toʻxtating.',
      'toast.no_share': 'Ulashib boʻlmadi. "Saqlash" tugmasini bosing.',
      'toast.no_capture': 'Rasm yaratib boʻlmadi.',
      'toast.no_video': 'Bu brauzer video yozishni qoʻllab-quvvatlamaydi.',
      'toast.no_record': 'Video yozishni boshlab boʻlmadi.',
      'toast.webm': 'Bu qurilma MP4 yozmaydi, video WebM formatda saqlandi.',
      'overlay.default_title': 'Quyosh tizimi',
      'overlay.default_desc': 'Sayyoralarni 3D da kashf eting.',
    },
    bodies: {
      sun: {
        name: 'Quyosh',
        desc: 'Tizimimizdagi yagona yulduz. Sayyoralarning hammasi uning atrofida aylanadi.',
        stats: [
          ['Diametri', '1 392 700 km'], ['Sirt harorati', '≈ 5 500 °C'], ['Yoshi', '≈ 4,6 mlrd yil'],
          ['Massasi', 'tizim massasining 99,86%'], ['Turi', 'sariq mitti yulduz'], ['Yerdan kattaligi', '≈ 1,3 mln barobar hajm'],
        ],
      },
      mercury: {
        name: 'Merkuriy',
        desc: 'Quyoshga eng yaqin va eng kichik sayyora. Atmosferasi deyarli yoʻq.',
        stats: [
          ['Diametri', '4 879 km'], ['Quyoshgacha', '57,9 mln km'], ['Yili', '88 Yer kuni'],
          ['Sutkasi', '58,6 Yer kuni'], ['Yoʻldoshlari', 'yoʻq'], ['Harorati', '−180 … 430 °C'],
        ],
      },
      venus: {
        name: 'Venera',
        desc: 'Eng issiq sayyora: qalin gaz qatlami issiqni ushlab turadi.',
        stats: [
          ['Diametri', '12 104 km'], ['Quyoshgacha', '108,2 mln km'], ['Yili', '224,7 Yer kuni'],
          ['Sutkasi', '243 Yer kuni (teskari)'], ['Yoʻldoshlari', 'yoʻq'], ['Harorati', '≈ 465 °C'],
        ],
      },
      earth: {
        name: 'Yer',
        desc: 'Hayot maʼlum boʻlgan yagona sayyora. Yuzasining qariyb 71 foizi suv.',
        stats: [
          ['Diametri', '12 742 km'], ['Quyoshgacha', '149,6 mln km'], ['Yili', '365,25 kun'],
          ['Sutkasi', '23 soat 56 daqiqa'], ['Yoʻldoshlari', '1 ta (Oy)'], ['Harorati', 'oʻrtacha ≈ 15 °C'],
        ],
      },
      moon: {
        name: 'Oy',
        desc: 'Yerning yagona tabiiy yoʻldoshi. Doim bir tomoni bilan Yerga qaraydi.',
        stats: [
          ['Diametri', '3 474 km'], ['Yergacha', '384 400 km'], ['Yer atrofida', '27,3 kun'],
          ['Sutkasi', '27,3 kun'], ['Tortishishi', 'Yernikining 1/6 qismi'], ['Harorati', '−173 … 127 °C'],
        ],
      },
      mars: {
        name: 'Mars',
        desc: 'Qizil sayyora. Tuprogʻidagi temir oksidi unga qizil tus beradi.',
        stats: [
          ['Diametri', '6 779 km'], ['Quyoshgacha', '227,9 mln km'], ['Yili', '687 Yer kuni'],
          ['Sutkasi', '24 soat 37 daqiqa'], ['Yoʻldoshlari', '2 ta (Fobos, Deymos)'], ['Harorati', 'oʻrtacha ≈ −63 °C'],
        ],
      },
      jupiter: {
        name: 'Yupiter',
        desc: 'Eng katta sayyora. Katta Qizil Dogʻ — asrlardan beri davom etayotgan boʻron.',
        stats: [
          ['Diametri', '139 820 km'], ['Quyoshgacha', '778,5 mln km'], ['Yili', '11,9 Yer yili'],
          ['Sutkasi', '9 soat 56 daqiqa'], ['Yoʻldoshlari', '90 tadan ortiq'], ['Harorati', 'bulut usti ≈ −110 °C'],
        ],
      },
      saturn: {
        name: 'Saturn',
        desc: 'Muz va tosh boʻlaklaridan iborat goʻzal halqalari bilan mashhur.',
        stats: [
          ['Diametri', '116 460 km'], ['Quyoshgacha', '1 433,5 mln km'], ['Yili', '29,4 Yer yili'],
          ['Sutkasi', '10 soat 34 daqiqa'], ['Yoʻldoshlari', '270 tadan ortiq'], ['Harorati', 'bulut usti ≈ −140 °C'],
        ],
      },
      uranus: {
        name: 'Uran',
        desc: 'Yon tomoni bilan aylanadi: oʻqi deyarli orbita tekisligida yotadi.',
        stats: [
          ['Diametri', '50 724 km'], ['Quyoshgacha', '2 872 mln km'], ['Yili', '84 Yer yili'],
          ['Sutkasi', '17 soat 14 daqiqa (teskari)'], ['Yoʻldoshlari', '29 ta'], ['Harorati', '≈ −195 °C'],
        ],
      },
      neptune: {
        name: 'Neptun',
        desc: 'Eng uzoq sayyora. Unda Quyosh tizimidagi eng kuchli shamollar esadi.',
        stats: [
          ['Diametri', '49 244 km'], ['Quyoshgacha', '4 495 mln km'], ['Yili', '164,8 Yer yili'],
          ['Sutkasi', '16 soat 6 daqiqa'], ['Yoʻldoshlari', '16 ta'], ['Harorati', '≈ −200 °C'],
        ],
      },
    },
  },

  en: {
    ui: {
      'page.title': 'Osmonoro — Solar System Simulator',
      'meta.desc': 'Osmonoro — a 3D simulation of the Solar System. Swipe to rotate and zoom in on the planets.',
      'brand.sub': 'Solar System Simulator',
      'speed.group': 'Time speed',
      'speed.pause': 'Pause',
      'hint': 'Swipe to rotate, use two fingers to zoom. Tap a planet.',
      'lang': 'Language',
      'rec': 'Record video',
      'rec.stop': 'Stop recording',
      'share': 'Share',
      'tour': 'Auto tour',
      'music': 'Music',
      'orbits': 'Orbits',
      'labels': 'Labels',
      'menu.png': 'PNG image',
      'menu.jpg': 'JPG image',
      'menu.svg': 'SVG image',
      'all': 'All',
      'chips.aria': 'Celestial bodies',
      'close': 'Close',
      'save': 'Save',
      'loader.build': 'Creating planets…',
      'loader.fail': 'Failed to load. Check your connection and reload the page.',
      'webgl': "Your device doesn't support WebGL.",
      'toast.music_missing': 'Music file not found: place musiqa.mp3 next to index.html.',
      'toast.video_first': 'Stop recording first.',
      'toast.no_share': 'Sharing failed. Tap "Save" instead.',
      'toast.no_capture': "Couldn't create the image.",
      'toast.no_video': "This browser doesn't support video recording.",
      'toast.no_record': "Couldn't start recording.",
      'toast.webm': "This device doesn't record MP4; video saved as WebM.",
      'overlay.default_title': 'Solar System',
      'overlay.default_desc': 'Explore the planets in 3D.',
    },
    bodies: {
      sun: {
        name: 'Sun',
        desc: 'The only star in our system. All planets orbit around it.',
        stats: [
          ['Diameter', '1,392,700 km'], ['Surface temp.', '≈ 5,500 °C'], ['Age', '≈ 4.6 billion years'],
          ['Mass', '99.86% of the system'], ['Type', 'yellow dwarf star'], ['Size vs Earth', '≈ 1.3 million× volume'],
        ],
      },
      mercury: {
        name: 'Mercury',
        desc: 'The closest and smallest planet to the Sun. Almost no atmosphere.',
        stats: [
          ['Diameter', '4,879 km'], ['From Sun', '57.9 million km'], ['Year', '88 Earth days'],
          ['Day', '58.6 Earth days'], ['Moons', 'none'], ['Temperature', '−180 … 430 °C'],
        ],
      },
      venus: {
        name: 'Venus',
        desc: 'The hottest planet: a thick gas layer traps heat.',
        stats: [
          ['Diameter', '12,104 km'], ['From Sun', '108.2 million km'], ['Year', '224.7 Earth days'],
          ['Day', '243 Earth days (retrograde)'], ['Moons', 'none'], ['Temperature', '≈ 465 °C'],
        ],
      },
      earth: {
        name: 'Earth',
        desc: 'The only known planet with life. About 71% of its surface is water.',
        stats: [
          ['Diameter', '12,742 km'], ['From Sun', '149.6 million km'], ['Year', '365.25 days'],
          ['Day', '23 h 56 min'], ['Moons', '1 (Moon)'], ['Temperature', 'avg ≈ 15 °C'],
        ],
      },
      moon: {
        name: 'Moon',
        desc: "Earth's only natural satellite. Always shows one side to Earth.",
        stats: [
          ['Diameter', '3,474 km'], ['From Earth', '384,400 km'], ['Orbits Earth', '27.3 days'],
          ['Day', '27.3 days'], ['Gravity', "1/6 of Earth's"], ['Temperature', '−173 … 127 °C'],
        ],
      },
      mars: {
        name: 'Mars',
        desc: 'The Red Planet. Iron oxide in its soil gives it a reddish hue.',
        stats: [
          ['Diameter', '6,779 km'], ['From Sun', '227.9 million km'], ['Year', '687 Earth days'],
          ['Day', '24 h 37 min'], ['Moons', '2 (Phobos, Deimos)'], ['Temperature', 'avg ≈ −63 °C'],
        ],
      },
      jupiter: {
        name: 'Jupiter',
        desc: 'The largest planet. The Great Red Spot — a storm raging for centuries.',
        stats: [
          ['Diameter', '139,820 km'], ['From Sun', '778.5 million km'], ['Year', '11.9 Earth years'],
          ['Day', '9 h 56 min'], ['Moons', 'more than 90'], ['Temperature', 'cloud tops ≈ −110 °C'],
        ],
      },
      saturn: {
        name: 'Saturn',
        desc: 'Famous for its beautiful rings of ice and rock.',
        stats: [
          ['Diameter', '116,460 km'], ['From Sun', '1,433.5 million km'], ['Year', '29.4 Earth years'],
          ['Day', '10 h 34 min'], ['Moons', 'more than 270'], ['Temperature', 'cloud tops ≈ −140 °C'],
        ],
      },
      uranus: {
        name: 'Uranus',
        desc: 'Rotates on its side: its axis lies almost in the orbital plane.',
        stats: [
          ['Diameter', '50,724 km'], ['From Sun', '2,872 million km'], ['Year', '84 Earth years'],
          ['Day', '17 h 14 min (retrograde)'], ['Moons', '29'], ['Temperature', '≈ −195 °C'],
        ],
      },
      neptune: {
        name: 'Neptune',
        desc: 'The farthest planet. Strongest winds in the Solar System blow here.',
        stats: [
          ['Diameter', '49,244 km'], ['From Sun', '4,495 million km'], ['Year', '164.8 Earth years'],
          ['Day', '16 h 6 min'], ['Moons', '16'], ['Temperature', '≈ −200 °C'],
        ],
      },
    },
  },

  ru: {
    ui: {
      'page.title': 'Osmonoro — Симулятор Солнечной системы',
      'meta.desc': 'Osmonoro — 3D-симулятор Солнечной системы. Проведите пальцем, чтобы вращать, и приблизьте планеты.',
      'brand.sub': 'Симулятор Солнечной системы',
      'speed.group': 'Скорость времени',
      'speed.pause': 'Пауза',
      'hint': 'Проведите пальцем, чтобы вращать; используйте два пальца для масштаба. Коснитесь планеты.',
      'lang': 'Язык',
      'rec': 'Записать видео',
      'rec.stop': 'Остановить запись',
      'share': 'Поделиться',
      'tour': 'Автотур',
      'music': 'Музыка',
      'orbits': 'Орбиты',
      'labels': 'Названия',
      'menu.png': 'PNG изображение',
      'menu.jpg': 'JPG изображение',
      'menu.svg': 'SVG изображение',
      'all': 'Обзор',
      'chips.aria': 'Небесные тела',
      'close': 'Закрыть',
      'save': 'Сохранить',
      'loader.build': 'Создаём планеты…',
      'loader.fail': 'Не удалось загрузить. Проверьте соединение и обновите страницу.',
      'webgl': 'Ваше устройство не поддерживает WebGL.',
      'toast.music_missing': 'Музыкальный файл не найден: поместите musiqa.mp3 рядом с index.html.',
      'toast.video_first': 'Сначала остановите запись.',
      'toast.no_share': 'Не удалось поделиться. Нажмите «Сохранить».',
      'toast.no_capture': 'Не удалось создать изображение.',
      'toast.no_video': 'Этот браузер не поддерживает запись видео.',
      'toast.no_record': 'Не удалось начать запись.',
      'toast.webm': 'Устройство не записывает MP4; видео сохранено как WebM.',
      'overlay.default_title': 'Солнечная система',
      'overlay.default_desc': 'Исследуйте планеты в 3D.',
    },
    bodies: {
      sun: {
        name: 'Солнце',
        desc: 'Единственная звезда нашей системы. Все планеты вращаются вокруг неё.',
        stats: [
          ['Диаметр', '1 392 700 км'], ['Темп. поверхности', '≈ 5 500 °C'], ['Возраст', '≈ 4,6 млрд лет'],
          ['Масса', '99,86% массы системы'], ['Тип', 'жёлтый карлик'], ['Размер vs Земля', '≈ в 1,3 млн раз'],
        ],
      },
      mercury: {
        name: 'Меркурий',
        desc: 'Ближайшая к Солнцу и самая маленькая планета. Атмосферы почти нет.',
        stats: [
          ['Диаметр', '4 879 км'], ['До Солнца', '57,9 млн км'], ['Год', '88 земных дней'],
          ['Сутки', '58,6 земных дней'], ['Спутники', 'нет'], ['Температура', '−180 … 430 °C'],
        ],
      },
      venus: {
        name: 'Венера',
        desc: 'Самая горячая планета: плотный газовый слой удерживает тепло.',
        stats: [
          ['Диаметр', '12 104 км'], ['До Солнца', '108,2 млн км'], ['Год', '224,7 земных дней'],
          ['Сутки', '243 земных дня (обратные)'], ['Спутники', 'нет'], ['Температура', '≈ 465 °C'],
        ],
      },
      earth: {
        name: 'Земля',
        desc: 'Единственная известная планета с жизнью. Около 71% поверхности — вода.',
        stats: [
          ['Диаметр', '12 742 км'], ['До Солнца', '149,6 млн км'], ['Год', '365,25 дней'],
          ['Сутки', '23 ч 56 мин'], ['Спутники', '1 (Луна)'], ['Температура', 'средняя ≈ 15 °C'],
        ],
      },
      moon: {
        name: 'Луна',
        desc: 'Единственный естественный спутник Земли. Всегда обращена к ней одной стороной.',
        stats: [
          ['Диаметр', '3 474 км'], ['До Земли', '384 400 км'], ['Орбита', '27,3 дня'],
          ['Сутки', '27,3 дня'], ['Гравитация', '1/6 земной'], ['Температура', '−173 … 127 °C'],
        ],
      },
      mars: {
        name: 'Марс',
        desc: 'Красная планета. Оксид железа в грунте придаёт ей красноватый оттенок.',
        stats: [
          ['Диаметр', '6 779 км'], ['До Солнца', '227,9 млн км'], ['Год', '687 земных дней'],
          ['Сутки', '24 ч 37 мин'], ['Спутники', '2 (Фобос, Деймос)'], ['Температура', 'средняя ≈ −63 °C'],
        ],
      },
      jupiter: {
        name: 'Юпитер',
        desc: 'Самая большая планета. Большое Красное Пятно — шторм, бушующий веками.',
        stats: [
          ['Диаметр', '139 820 км'], ['До Солнца', '778,5 млн км'], ['Год', '11,9 земных лет'],
          ['Сутки', '9 ч 56 мин'], ['Спутники', 'более 90'], ['Температура', 'у облаков ≈ −110 °C'],
        ],
      },
      saturn: {
        name: 'Сатурн',
        desc: 'Известен красивыми кольцами из льда и камня.',
        stats: [
          ['Диаметр', '116 460 км'], ['До Солнца', '1 433,5 млн км'], ['Год', '29,4 земных лет'],
          ['Сутки', '10 ч 34 мин'], ['Спутники', 'более 270'], ['Температура', 'у облаков ≈ −140 °C'],
        ],
      },
      uranus: {
        name: 'Уран',
        desc: 'Вращается на боку: его ось почти лежит в плоскости орбиты.',
        stats: [
          ['Диаметр', '50 724 км'], ['До Солнца', '2 872 млн км'], ['Год', '84 земных лет'],
          ['Сутки', '17 ч 14 мин (обратные)'], ['Спутники', '29'], ['Температура', '≈ −195 °C'],
        ],
      },
      neptune: {
        name: 'Нептун',
        desc: 'Самая далёкая планета. Здесь дуют сильнейшие ветры Солнечной системы.',
        stats: [
          ['Диаметр', '49 244 км'], ['До Солнца', '4 495 млн км'], ['Год', '164,8 земных лет'],
          ['Сутки', '16 ч 6 мин'], ['Спутники', '16'], ['Температура', '≈ −200 °C'],
        ],
      },
    },
  },

  tr: {
    ui: {
      'page.title': 'Osmonoro — Güneş Sistemi Simülatörü',
      'meta.desc': "Osmonoro — Güneş Sistemi'nin 3D simülasyonu. Döndürmek için kaydırın ve gezegenlere yaklaşın.",
      'brand.sub': 'Güneş Sistemi Simülatörü',
      'speed.group': 'Zaman hızı',
      'speed.pause': 'Duraklat',
      'hint': 'Döndürmek için kaydırın, yakınlaştırmak için iki parmak kullanın. Bir gezegene dokunun.',
      'lang': 'Dil',
      'rec': 'Video kaydet',
      'rec.stop': 'Kaydı durdur',
      'share': 'Paylaş',
      'tour': 'Oto tur',
      'music': 'Müzik',
      'orbits': 'Yörüngeler',
      'labels': 'Etiketler',
      'menu.png': 'PNG görsel',
      'menu.jpg': 'JPG görsel',
      'menu.svg': 'SVG görsel',
      'all': 'Genel',
      'chips.aria': 'Gök cisimleri',
      'close': 'Kapat',
      'save': 'Kaydet',
      'loader.build': 'Gezegenler oluşturuluyor…',
      'loader.fail': 'Yüklenemedi. Bağlantınızı kontrol edin ve sayfayı yenileyin.',
      'webgl': 'Cihazınız WebGL desteklemiyor.',
      'toast.music_missing': 'Müzik dosyası bulunamadı: musiqa.mp3 dosyasını index.html yanına koyun.',
      'toast.video_first': 'Önce kaydı durdurun.',
      'toast.no_share': 'Paylaşılamadı. "Kaydet" düğmesine basın.',
      'toast.no_capture': 'Görsel oluşturulamadı.',
      'toast.no_video': 'Bu tarayıcı video kaydını desteklemiyor.',
      'toast.no_record': 'Kayıt başlatılamadı.',
      'toast.webm': 'Bu cihaz MP4 kaydetmiyor; video WebM olarak kaydedildi.',
      'overlay.default_title': 'Güneş Sistemi',
      'overlay.default_desc': 'Gezegenleri 3D olarak keşfedin.',
    },
    bodies: {
      sun: { name: 'Güneş', desc: 'Sistemimizdeki tek yıldız. Tüm gezegenler onun etrafında döner.', stats: [['Çap', '1.392.700 km'], ['Yüzey sıcaklığı', '≈ 5.500 °C'], ['Yaş', '≈ 4,6 milyar yıl'], ["Kütle", "%99,86 sistem kütlesi"], ['Tür', 'sarı cüce yıldız'], ["Dünya'ya göre", '≈ 1,3 milyon× hacim']] },
      mercury: { name: 'Merkür', desc: "Güneş'e en yakın ve en küçük gezegen. Atmosferi neredeyse yok.", stats: [['Çap', '4.879 km'], ["Güneş'e uzaklık", '57,9 milyon km'], ['Yıl', '88 Dünya günü'], ['Gün', '58,6 Dünya günü'], ['Uydular', 'yok'], ['Sıcaklık', '−180 … 430 °C']] },
      venus: { name: 'Venüs', desc: 'En sıcak gezegen: kalın gaz tabakası ısıyı tutar.', stats: [['Çap', '12.104 km'], ["Güneş'e uzaklık", '108,2 milyon km'], ['Yıl', '224,7 Dünya günü'], ['Gün', '243 Dünya günü (ters)'], ['Uydular', 'yok'], ['Sıcaklık', '≈ 465 °C']] },
      earth: { name: 'Dünya', desc: "Yaşamın bilindiği tek gezegen. Yüzeyinin yaklaşık %71'i su.", stats: [['Çap', '12.742 km'], ["Güneş'e uzaklık", '149,6 milyon km'], ['Yıl', '365,25 gün'], ['Gün', '23 sa 56 dk'], ['Uydular', '1 (Ay)'], ['Sıcaklık', 'ortalama ≈ 15 °C']] },
      moon: { name: 'Ay', desc: "Dünya'nın tek doğal uydusu. Her zaman aynı yüzünü gösterir.", stats: [['Çap', '3.474 km'], ["Dünya'ya uzaklık", '384.400 km'], ['Yörünge', '27,3 gün'], ['Gün', '27,3 gün'], ['Yerçekimi', "Dünya'nın 1/6'sı"], ['Sıcaklık', '−173 … 127 °C']] },
      mars: { name: 'Mars', desc: 'Kızıl Gezegen. Toprağındaki demir oksit ona kızıl renk verir.', stats: [['Çap', '6.779 km'], ["Güneş'e uzaklık", '227,9 milyon km'], ['Yıl', '687 Dünya günü'], ['Gün', '24 sa 37 dk'], ['Uydular', '2 (Phobos, Deimos)'], ['Sıcaklık', 'ortalama ≈ −63 °C']] },
      jupiter: { name: 'Jüpiter', desc: 'En büyük gezegen. Büyük Kırmızı Leke — yüzyıllardır süren fırtına.', stats: [['Çap', '139.820 km'], ["Güneş'e uzaklık", '778,5 milyon km'], ['Yıl', '11,9 Dünya yılı'], ['Gün', '9 sa 56 dk'], ['Uydular', "90'dan fazla"], ['Sıcaklık', 'bulut üstü ≈ −110 °C']] },
      saturn: { name: 'Satürn', desc: 'Buz ve kayadan oluşan güzel halkalarıyla ünlü.', stats: [['Çap', '116.460 km'], ["Güneş'e uzaklık", '1.433,5 milyon km'], ['Yıl', '29,4 Dünya yılı'], ['Gün', '10 sa 34 dk'], ['Uydular', "270'ten fazla"], ['Sıcaklık', 'bulut üstü ≈ −140 °C']] },
      uranus: { name: 'Uranüs', desc: 'Yan yatarak döner: ekseni neredeyse yörünge düzlemindedir.', stats: [['Çap', '50.724 km'], ["Güneş'e uzaklık", '2.872 milyon km'], ['Yıl', '84 Dünya yılı'], ['Gün', '17 sa 14 dk (ters)'], ['Uydular', '29'], ['Sıcaklık', '≈ −195 °C']] },
      neptune: { name: 'Neptün', desc: "En uzak gezegen. Güneş Sistemi'nin en güçlü rüzgarları burada eser.", stats: [['Çap', '49.244 km'], ["Güneş'e uzaklık", '4.495 milyon km'], ['Yıl', '164,8 Dünya yılı'], ['Gün', '16 sa 6 dk'], ['Uydular', '16'], ['Sıcaklık', '≈ −200 °C']] },
    },
  },

  es: {
    ui: {
      'page.title': 'Osmonoro — Simulador del Sistema Solar',
      'meta.desc': 'Osmonoro — simulación 3D del Sistema Solar. Desliza para girar y acércate a los planetas.',
      'brand.sub': 'Simulador del Sistema Solar',
      'speed.group': 'Velocidad del tiempo',
      'speed.pause': 'Pausar',
      'hint': 'Desliza para girar, usa dos dedos para acercar. Toca un planeta.',
      'lang': 'Idioma',
      'rec': 'Grabar vídeo',
      'rec.stop': 'Detener grabación',
      'share': 'Compartir',
      'tour': 'Recorrido auto',
      'music': 'Música',
      'orbits': 'Órbitas',
      'labels': 'Nombres',
      'menu.png': 'Imagen PNG',
      'menu.jpg': 'Imagen JPG',
      'menu.svg': 'Imagen SVG',
      'all': 'General',
      'chips.aria': 'Cuerpos celestes',
      'close': 'Cerrar',
      'save': 'Guardar',
      'loader.build': 'Creando planetas…',
      'loader.fail': 'No se pudo cargar. Verifica tu conexión y recarga la página.',
      'webgl': 'Tu dispositivo no admite WebGL.',
      'toast.music_missing': 'Archivo de música no encontrado: coloca musiqa.mp3 junto a index.html.',
      'toast.video_first': 'Detén la grabación primero.',
      'toast.no_share': 'No se pudo compartir. Pulsa «Guardar».',
      'toast.no_capture': 'No se pudo crear la imagen.',
      'toast.no_video': 'Este navegador no admite grabación de vídeo.',
      'toast.no_record': 'No se pudo iniciar la grabación.',
      'toast.webm': 'Este dispositivo no graba MP4; vídeo guardado como WebM.',
      'overlay.default_title': 'Sistema Solar',
      'overlay.default_desc': 'Explora los planetas en 3D.',
    },
    bodies: {
      sun: { name: 'Sol', desc: 'La única estrella de nuestro sistema. Todos los planetas orbitan a su alrededor.', stats: [['Diámetro', '1.392.700 km'], ['Temp. superficial', '≈ 5.500 °C'], ['Edad', '≈ 4,6 mil millones de años'], ['Masa', '99,86% del sistema'], ['Tipo', 'enana amarilla'], ['Tamaño vs Tierra', '≈ 1,3 millones× volumen']] },
      mercury: { name: 'Mercurio', desc: 'El planeta más cercano al Sol y el más pequeño. Casi sin atmósfera.', stats: [['Diámetro', '4.879 km'], ['Distancia al Sol', '57,9 millones km'], ['Año', '88 días terrestres'], ['Día', '58,6 días terrestres'], ['Lunas', 'ninguna'], ['Temperatura', '−180 … 430 °C']] },
      venus: { name: 'Venus', desc: 'El planeta más caliente: una espesa capa de gas atrapa el calor.', stats: [['Diámetro', '12.104 km'], ['Distancia al Sol', '108,2 millones km'], ['Año', '224,7 días terrestres'], ['Día', '243 días terrestres (retrógrado)'], ['Lunas', 'ninguna'], ['Temperatura', '≈ 465 °C']] },
      earth: { name: 'Tierra', desc: 'El único planeta conocido con vida. Cerca del 71% de su superficie es agua.', stats: [['Diámetro', '12.742 km'], ['Distancia al Sol', '149,6 millones km'], ['Año', '365,25 días'], ['Día', '23 h 56 min'], ['Lunas', '1 (Luna)'], ['Temperatura', 'media ≈ 15 °C']] },
      moon: { name: 'Luna', desc: 'El único satélite natural de la Tierra. Siempre muestra la misma cara.', stats: [['Diámetro', '3.474 km'], ['Distancia a la Tierra', '384.400 km'], ['Órbita', '27,3 días'], ['Día', '27,3 días'], ['Gravedad', '1/6 de la terrestre'], ['Temperatura', '−173 … 127 °C']] },
      mars: { name: 'Marte', desc: 'El planeta rojo. El óxido de hierro del suelo le da su tono rojizo.', stats: [['Diámetro', '6.779 km'], ['Distancia al Sol', '227,9 millones km'], ['Año', '687 días terrestres'], ['Día', '24 h 37 min'], ['Lunas', '2 (Fobos, Deimos)'], ['Temperatura', 'media ≈ −63 °C']] },
      jupiter: { name: 'Júpiter', desc: 'El planeta más grande. La Gran Mancha Roja — una tormenta de siglos.', stats: [['Diámetro', '139.820 km'], ['Distancia al Sol', '778,5 millones km'], ['Año', '11,9 años terrestres'], ['Día', '9 h 56 min'], ['Lunas', 'más de 90'], ['Temperatura', 'cimas nubosas ≈ −110 °C']] },
      saturn: { name: 'Saturno', desc: 'Famoso por sus hermosos anillos de hielo y roca.', stats: [['Diámetro', '116.460 km'], ['Distancia al Sol', '1.433,5 millones km'], ['Año', '29,4 años terrestres'], ['Día', '10 h 34 min'], ['Lunas', 'más de 270'], ['Temperatura', 'cimas nubosas ≈ −140 °C']] },
      uranus: { name: 'Urano', desc: 'Gira de lado: su eje yace casi en el plano orbital.', stats: [['Diámetro', '50.724 km'], ['Distancia al Sol', '2.872 millones km'], ['Año', '84 años terrestres'], ['Día', '17 h 14 min (retrógrado)'], ['Lunas', '29'], ['Temperatura', '≈ −195 °C']] },
      neptune: { name: 'Neptuno', desc: 'El planeta más lejano. Aquí soplan los vientos más fuertes del Sistema Solar.', stats: [['Diámetro', '49.244 km'], ['Distancia al Sol', '4.495 millones km'], ['Año', '164,8 años terrestres'], ['Día', '16 h 6 min'], ['Lunas', '16'], ['Temperatura', '≈ −200 °C']] },
    },
  },

  fr: {
    ui: {
      'page.title': 'Osmonoro — Simulateur du Système solaire',
      'meta.desc': 'Osmonoro — simulation 3D du Système solaire. Faites glisser pour tourner et approchez les planètes.',
      'brand.sub': 'Simulateur du Système solaire',
      'speed.group': 'Vitesse du temps',
      'speed.pause': 'Pause',
      'hint': 'Glissez pour tourner, utilisez deux doigts pour zoomer. Touchez une planète.',
      'lang': 'Langue',
      'rec': 'Enregistrer une vidéo',
      'rec.stop': "Arrêter l'enregistrement",
      'share': 'Partager',
      'tour': 'Visite auto',
      'music': 'Musique',
      'orbits': 'Orbites',
      'labels': 'Noms',
      'menu.png': 'Image PNG',
      'menu.jpg': 'Image JPG',
      'menu.svg': 'Image SVG',
      'all': 'Général',
      'chips.aria': 'Corps célestes',
      'close': 'Fermer',
      'save': 'Enregistrer',
      'loader.build': 'Création des planètes…',
      'loader.fail': 'Échec du chargement. Vérifiez votre connexion et rechargez la page.',
      'webgl': 'Votre appareil ne prend pas en charge WebGL.',
      'toast.music_missing': 'Fichier audio introuvable : placez musiqa.mp3 à côté de index.html.',
      'toast.video_first': "Arrêtez d'abord l'enregistrement.",
      'toast.no_share': 'Partage impossible. Appuyez sur « Enregistrer ».',
      'toast.no_capture': "Impossible de créer l'image.",
      'toast.no_video': "Ce navigateur ne prend pas en charge l'enregistrement vidéo.",
      'toast.no_record': "Impossible de démarrer l'enregistrement.",
      'toast.webm': "Cet appareil n'enregistre pas en MP4 ; vidéo enregistrée en WebM.",
      'overlay.default_title': 'Système solaire',
      'overlay.default_desc': 'Explorez les planètes en 3D.',
    },
    bodies: {
      sun: { name: 'Soleil', desc: "L'unique étoile de notre système. Toutes les planètes orbitent autour d'elle.", stats: [['Diamètre', '1 392 700 km'], ['Temp. de surface', '≈ 5 500 °C'], ['Âge', '≈ 4,6 milliards d’années'], ['Masse', '99,86 % du système'], ['Type', 'naine jaune'], ['Taille vs Terre', '≈ 1,3 million× volume']] },
      mercury: { name: 'Mercure', desc: 'La planète la plus proche du Soleil et la plus petite. Presque pas d’atmosphère.', stats: [['Diamètre', '4 879 km'], ['Distance au Soleil', '57,9 millions km'], ['Année', '88 jours terrestres'], ['Jour', '58,6 jours terrestres'], ['Lunes', 'aucune'], ['Température', '−180 … 430 °C']] },
      venus: { name: 'Vénus', desc: 'La planète la plus chaude : une épaisse couche de gaz retient la chaleur.', stats: [['Diamètre', '12 104 km'], ['Distance au Soleil', '108,2 millions km'], ['Année', '224,7 jours terrestres'], ['Jour', '243 jours terrestres (rétrograde)'], ['Lunes', 'aucune'], ['Température', '≈ 465 °C']] },
      earth: { name: 'Terre', desc: 'La seule planète connue abritant la vie. Environ 71 % de sa surface est de l’eau.', stats: [['Diamètre', '12 742 km'], ['Distance au Soleil', '149,6 millions km'], ['Année', '365,25 jours'], ['Jour', '23 h 56 min'], ['Lunes', '1 (Lune)'], ['Température', 'moyenne ≈ 15 °C']] },
      moon: { name: 'Lune', desc: 'L’unique satellite naturel de la Terre. Montre toujours la même face.', stats: [['Diamètre', '3 474 km'], ['Distance à la Terre', '384 400 km'], ['Orbite', '27,3 jours'], ['Jour', '27,3 jours'], ['Gravité', '1/6 de la Terre'], ['Température', '−173 … 127 °C']] },
      mars: { name: 'Mars', desc: 'La planète rouge. L’oxyde de fer dans son sol lui donne sa teinte rougeâtre.', stats: [['Diamètre', '6 779 km'], ['Distance au Soleil', '227,9 millions km'], ['Année', '687 jours terrestres'], ['Jour', '24 h 37 min'], ['Lunes', '2 (Phobos, Déimos)'], ['Température', 'moyenne ≈ −63 °C']] },
      jupiter: { name: 'Jupiter', desc: 'La plus grande planète. La Grande Tache Rouge — une tempête qui dure depuis des siècles.', stats: [['Diamètre', '139 820 km'], ['Distance au Soleil', '778,5 millions km'], ['Année', '11,9 années terrestres'], ['Jour', '9 h 56 min'], ['Lunes', 'plus de 90'], ['Température', 'sommets nuageux ≈ −110 °C']] },
      saturn: { name: 'Saturne', desc: 'Célèbre pour ses magnifiques anneaux de glace et de roche.', stats: [['Diamètre', '116 460 km'], ['Distance au Soleil', '1 433,5 millions km'], ['Année', '29,4 années terrestres'], ['Jour', '10 h 34 min'], ['Lunes', 'plus de 270'], ['Température', 'sommets nuageux ≈ −140 °C']] },
      uranus: { name: 'Uranus', desc: 'Tourne sur le côté : son axe est presque dans le plan orbital.', stats: [['Diamètre', '50 724 km'], ['Distance au Soleil', '2 872 millions km'], ['Année', '84 années terrestres'], ['Jour', '17 h 14 min (rétrograde)'], ['Lunes', '29'], ['Température', '≈ −195 °C']] },
      neptune: { name: 'Neptune', desc: 'La planète la plus éloignée. Les vents les plus violents du Système solaire y soufflent.', stats: [['Diamètre', '49 244 km'], ['Distance au Soleil', '4 495 millions km'], ['Année', '164,8 années terrestres'], ['Jour', '16 h 6 min'], ['Lunes', '16'], ['Température', '≈ −200 °C']] },
    },
  },

  de: {
    ui: {
      'page.title': 'Osmonoro — Sonnensystem-Simulator',
      'meta.desc': 'Osmonoro — 3D-Simulation des Sonnensystems. Wischen zum Drehen und zoomen Sie die Planeten heran.',
      'brand.sub': 'Sonnensystem-Simulator',
      'speed.group': 'Zeitgeschwindigkeit',
      'speed.pause': 'Pause',
      'hint': 'Wischen zum Drehen, zwei Finger zum Zoomen. Tippen Sie einen Planeten an.',
      'lang': 'Sprache',
      'rec': 'Video aufnehmen',
      'rec.stop': 'Aufnahme stoppen',
      'share': 'Teilen',
      'tour': 'Auto-Tour',
      'music': 'Musik',
      'orbits': 'Umlaufbahnen',
      'labels': 'Namen',
      'menu.png': 'PNG-Bild',
      'menu.jpg': 'JPG-Bild',
      'menu.svg': 'SVG-Bild',
      'all': 'Übersicht',
      'chips.aria': 'Himmelskörper',
      'close': 'Schließen',
      'save': 'Speichern',
      'loader.build': 'Planeten werden erstellt…',
      'loader.fail': 'Laden fehlgeschlagen. Prüfe deine Verbindung und lade die Seite neu.',
      'webgl': 'Dein Gerät unterstützt WebGL nicht.',
      'toast.music_missing': 'Audiodatei nicht gefunden: Lege musiqa.mp3 neben index.html ab.',
      'toast.video_first': 'Stoppe zuerst die Aufnahme.',
      'toast.no_share': 'Teilen fehlgeschlagen. Tippe auf „Speichern“.',
      'toast.no_capture': 'Bild konnte nicht erstellt werden.',
      'toast.no_video': 'Dieser Browser unterstützt keine Videoaufnahme.',
      'toast.no_record': 'Aufnahme konnte nicht gestartet werden.',
      'toast.webm': 'Dieses Gerät nimmt kein MP4 auf; Video als WebM gespeichert.',
      'overlay.default_title': 'Sonnensystem',
      'overlay.default_desc': 'Entdecke die Planeten in 3D.',
    },
    bodies: {
      sun: { name: 'Sonne', desc: 'Der einzige Stern in unserem System. Alle Planeten umkreisen ihn.', stats: [['Durchmesser', '1.392.700 km'], ['Oberflächentemp.', '≈ 5.500 °C'], ['Alter', '≈ 4,6 Mrd. Jahre'], ['Masse', '99,86 % des Systems'], ['Typ', 'gelber Zwergstern'], ['Größe vs Erde', '≈ 1,3 Mio.× Volumen']] },
      mercury: { name: 'Merkur', desc: 'Der sonnennächste und kleinste Planet. Fast keine Atmosphäre.', stats: [['Durchmesser', '4.879 km'], ['Von der Sonne', '57,9 Mio. km'], ['Jahr', '88 Erdentage'], ['Tag', '58,6 Erdentage'], ['Monde', 'keine'], ['Temperatur', '−180 … 430 °C']] },
      venus: { name: 'Venus', desc: 'Der heißeste Planet: eine dicke Gasschicht speichert die Wärme.', stats: [['Durchmesser', '12.104 km'], ['Von der Sonne', '108,2 Mio. km'], ['Jahr', '224,7 Erdentage'], ['Tag', '243 Erdentage (retrograd)'], ['Monde', 'keine'], ['Temperatur', '≈ 465 °C']] },
      earth: { name: 'Erde', desc: 'Der einzige bekannte Planet mit Leben. Etwa 71 % der Oberfläche sind Wasser.', stats: [['Durchmesser', '12.742 km'], ['Von der Sonne', '149,6 Mio. km'], ['Jahr', '365,25 Tage'], ['Tag', '23 Std. 56 Min.'], ['Monde', '1 (Mond)'], ['Temperatur', 'Ø ≈ 15 °C']] },
      moon: { name: 'Mond', desc: 'Der einzige natürliche Satellit der Erde. Zeigt immer dieselbe Seite.', stats: [['Durchmesser', '3.474 km'], ['Von der Erde', '384.400 km'], ['Umlaufbahn', '27,3 Tage'], ['Tag', '27,3 Tage'], ['Schwerkraft', '1/6 der Erde'], ['Temperatur', '−173 … 127 °C']] },
      mars: { name: 'Mars', desc: 'Der Rote Planet. Eisenoxid im Boden verleiht ihm seinen rötlichen Ton.', stats: [['Durchmesser', '6.779 km'], ['Von der Sonne', '227,9 Mio. km'], ['Jahr', '687 Erdentage'], ['Tag', '24 Std. 37 Min.'], ['Monde', '2 (Phobos, Deimos)'], ['Temperatur', 'Ø ≈ −63 °C']] },
      jupiter: { name: 'Jupiter', desc: 'Der größte Planet. Der Große Rote Fleck — ein jahrhundertealter Sturm.', stats: [['Durchmesser', '139.820 km'], ['Von der Sonne', '778,5 Mio. km'], ['Jahr', '11,9 Erdjahre'], ['Tag', '9 Std. 56 Min.'], ['Monde', 'über 90'], ['Temperatur', 'Wolkenspitzen ≈ −110 °C']] },
      saturn: { name: 'Saturn', desc: 'Berühmt für seine schönen Ringe aus Eis und Gestein.', stats: [['Durchmesser', '116.460 km'], ['Von der Sonne', '1.433,5 Mio. km'], ['Jahr', '29,4 Erdjahre'], ['Tag', '10 Std. 34 Min.'], ['Monde', 'über 270'], ['Temperatur', 'Wolkenspitzen ≈ −140 °C']] },
      uranus: { name: 'Uranus', desc: 'Dreht sich auf der Seite: seine Achse liegt fast in der Bahnebene.', stats: [['Durchmesser', '50.724 km'], ['Von der Sonne', '2.872 Mio. km'], ['Jahr', '84 Erdjahre'], ['Tag', '17 Std. 14 Min. (retrograd)'], ['Monde', '29'], ['Temperatur', '≈ −195 °C']] },
      neptune: { name: 'Neptun', desc: 'Der entfernteste Planet. Hier wehen die stärksten Winde des Sonnensystems.', stats: [['Durchmesser', '49.244 km'], ['Von der Sonne', '4.495 Mio. km'], ['Jahr', '164,8 Erdjahre'], ['Tag', '16 Std. 6 Min.'], ['Monde', '16'], ['Temperatur', '≈ −200 °C']] },
    },
  },

  ar: {
    ui: {
      'page.title': 'أوسمونورو — محاكي النظام الشمسي',
      'meta.desc': 'أوسمونورو — محاكاة ثلاثية الأبعاد للنظام الشمسي. اسحب للتدوير واقترب من الكواكب.',
      'brand.sub': 'محاكي النظام الشمسي',
      'speed.group': 'سرعة الوقت',
      'speed.pause': 'إيقاف مؤقت',
      'hint': 'اسحب للتدوير، استخدم إصبعين للتكبير. اضغط على كوكب.',
      'lang': 'اللغة',
      'rec': 'تسجيل فيديو',
      'rec.stop': 'إيقاف التسجيل',
      'share': 'مشاركة',
      'tour': 'جولة تلقائية',
      'music': 'موسيقى',
      'orbits': 'المدارات',
      'labels': 'الأسماء',
      'menu.png': 'صورة PNG',
      'menu.jpg': 'صورة JPG',
      'menu.svg': 'صورة SVG',
      'all': 'عام',
      'chips.aria': 'الأجرام السماوية',
      'close': 'إغلاق',
      'save': 'حفظ',
      'loader.build': 'جارٍ إنشاء الكواكب…',
      'loader.fail': 'فشل التحميل. تحقق من اتصالك وأعد تحميل الصفحة.',
      'webgl': 'جهازك لا يدعم WebGL.',
      'toast.music_missing': 'ملف الموسيقى غير موجود: ضع musiqa.mp3 بجوار index.html.',
      'toast.video_first': 'أوقف التسجيل أولاً.',
      'toast.no_share': 'فشلت المشاركة. اضغط «حفظ».',
      'toast.no_capture': 'تعذّر إنشاء الصورة.',
      'toast.no_video': 'هذا المتصفح لا يدعم تسجيل الفيديو.',
      'toast.no_record': 'تعذّر بدء التسجيل.',
      'toast.webm': 'هذا الجهاز لا يسجّل MP4؛ تم حفظ الفيديو بصيغة WebM.',
      'overlay.default_title': 'النظام الشمسي',
      'overlay.default_desc': 'استكشف الكواكب ثلاثية الأبعاد.',
    },
    bodies: {
      sun: { name: 'الشمس', desc: 'النجم الوحيد في نظامنا. تدور حوله جميع الكواكب.', stats: [['القطر', '1,392,700 كم'], ['حرارة السطح', '≈ 5,500 °C'], ['العمر', '≈ 4.6 مليار سنة'], ['الكتلة', '99.86% من كتلة النظام'], ['النوع', 'نجم قزم أصفر'], ['الحجم vs الأرض', '≈ 1.3 مليون×']] },
      mercury: { name: 'عطارد', desc: 'أقرب الكواكب إلى الشمس وأصغرها. لا يوجد غلاف جوي تقريبًا.', stats: [['القطر', '4,879 كم'], ['من الشمس', '57.9 مليون كم'], ['السنة', '88 يومًا أرضيًا'], ['اليوم', '58.6 يومًا أرضيًا'], ['الأقمار', 'لا يوجد'], ['الحرارة', '−180 … 430 °C']] },
      venus: { name: 'الزهرة', desc: 'أشد الكواكب حرارة: طبقة غازية سميكة تحبس الحرارة.', stats: [['القطر', '12,104 كم'], ['من الشمس', '108.2 مليون كم'], ['السنة', '224.7 يومًا أرضيًا'], ['اليوم', '243 يومًا (عكسي)'], ['الأقمار', 'لا يوجد'], ['الحرارة', '≈ 465 °C']] },
      earth: { name: 'الأرض', desc: 'الكوكب الوحيد المعروف بوجود الحياة. نحو 71% من سطحه ماء.', stats: [['القطر', '12,742 كم'], ['من الشمس', '149.6 مليون كم'], ['السنة', '365.25 يومًا'], ['اليوم', '23 س 56 د'], ['الأقمار', '1 (القمر)'], ['الحرارة', 'متوسط ≈ 15 °C']] },
      moon: { name: 'القمر', desc: 'القمر الطبيعي الوحيد للأرض. يُظهر دائمًا وجهًا واحدًا.', stats: [['القطر', '3,474 كم'], ['من الأرض', '384,400 كم'], ['المدار', '27.3 يومًا'], ['اليوم', '27.3 يومًا'], ['الجذب', '1/6 من جذب الأرض'], ['الحرارة', '−173 … 127 °C']] },
      mars: { name: 'المريخ', desc: 'الكوكب الأحمر. أكسيد الحديد في تربته يمنحه لونه الأحمر.', stats: [['القطر', '6,779 كم'], ['من الشمس', '227.9 مليون كم'], ['السنة', '687 يومًا أرضيًا'], ['اليوم', '24 س 37 د'], ['الأقمار', '2 (فوبوس، ديموس)'], ['الحرارة', 'متوسط ≈ −63 °C']] },
      jupiter: { name: 'المشتري', desc: 'أكبر الكواكب. البقعة الحمراء العظيمة — عاصفة مستمرة منذ قرون.', stats: [['القطر', '139,820 كم'], ['من الشمس', '778.5 مليون كم'], ['السنة', '11.9 سنة أرضية'], ['اليوم', '9 س 56 د'], ['الأقمار', 'أكثر من 90'], ['الحرارة', 'قمم السحب ≈ −110 °C']] },
      saturn: { name: 'زحل', desc: 'يشتهر بحلقاته الجميلة من الجليد والصخور.', stats: [['القطر', '116,460 كم'], ['من الشمس', '1,433.5 مليون كم'], ['السنة', '29.4 سنة أرضية'], ['اليوم', '10 س 34 د'], ['الأقمار', 'أكثر من 270'], ['الحرارة', 'قمم السحب ≈ −140 °C']] },
      uranus: { name: 'أورانوس', desc: 'يدور على جانبه: محوره شبه موازٍ لمستوى المدار.', stats: [['القطر', '50,724 كم'], ['من الشمس', '2,872 مليون كم'], ['السنة', '84 سنة أرضية'], ['اليوم', '17 س 14 د (عكسي)'], ['الأقمار', '29'], ['الحرارة', '≈ −195 °C']] },
      neptune: { name: 'نبتون', desc: 'أبعد الكواكب. تجري فيه أقوى رياح في النظام الشمسي.', stats: [['القطر', '49,244 كم'], ['من الشمس', '4,495 مليون كم'], ['السنة', '164.8 سنة أرضية'], ['اليوم', '16 س 6 د'], ['الأقمار', '16'], ['الحرارة', '≈ −200 °C']] },
    },
  },
};

let currentLang = (() => {
  try {
    const saved = localStorage.getItem('osmonoro-lang');
    if (saved && I18N[saved]) return saved;
    const nav = (navigator.language || 'uz').slice(0, 2).toLowerCase();
    return I18N[nav] ? nav : 'uz';
  } catch (e) { return 'uz'; }
})();

function t(key) {
  const dict = I18N[currentLang] || I18N.uz;
  return dict.ui[key] ?? I18N.uz.ui[key] ?? key;
}

function tBody(id) {
  const dict = I18N[currentLang] || I18N.uz;
  return dict.bodies[id] || I18N.uz.bodies[id];
}

/* ---------------------------------------------------------------------
   1. Maʼlumotlar (faqat jismoniy parametrlar; matnlar I18N da)
   --------------------------------------------------------------------- */
const BODIES = [
  { id: 'sun',     r: 6,    dist: 0,   period: 0,     spin: 0.04, tilt: 0,    view: 36,  color: '#ffb347' },
  { id: 'mercury', r: 0.55, dist: 13,  period: 0.24,  spin: 0.25, tilt: 0.03, view: 4.2, color: '#b5aca2' },
  { id: 'venus',   r: 0.95, dist: 19,  period: 0.62,  spin: -0.12,tilt: 3.1,  view: 6,   color: '#e3c27e' },
  { id: 'earth',   r: 1.0,  dist: 26,  period: 1,     spin: 0.9,  tilt: 0.41, view: 6.2, color: '#4f9be0' },
  { id: 'moon',    r: 0.27, dist: 2.3, period: 0.35,  spin: 0,    tilt: 0.1,  view: 2.2, color: '#c9c9c9', parent: 'earth' },
  { id: 'mars',    r: 0.72, dist: 33,  period: 1.88,  spin: 0.85, tilt: 0.44, view: 5,   color: '#d1693f' },
  { id: 'jupiter', r: 2.9,  dist: 52,  period: 11.86, spin: 1.7,  tilt: 0.05, view: 15,  color: '#d8b48a' },
  { id: 'saturn',  r: 2.4,  dist: 73,  period: 29.4,  spin: 1.6,  tilt: 0.47, view: 15,  color: '#e2cf9f', ring: true },
  { id: 'uranus',  r: 1.6,  dist: 93,  period: 84,    spin: -1.0, tilt: 1.71, view: 8.5, color: '#95dde3' },
  { id: 'neptune', r: 1.55, dist: 111, period: 164.8, spin: 1.0,  tilt: 0.49, view: 8.5, color: '#4a74e8' },
];

const YEAR_SECONDS = 40;
const TOUR = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const MAX_REC_SECONDS = 90;

/* ---------------------------------------------------------------------
   2. Protsedural shovqin va teksturalar
   --------------------------------------------------------------------- */
function textureKit() {
  const TAU = Math.PI * 2;
  function hash3(x, y, z) {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440662683);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const fade = (t) => t * t * (3 - 2 * t);

  function noise3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
    return lerp(
      lerp(
        lerp(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), xf),
        lerp(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), xf),
        yf
      ),
      lerp(
        lerp(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), xf),
        lerp(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), xf),
        yf
      ),
      zf
    );
  }

  function fbm(x, y, z, oct = 4) {
    let sum = 0, amp = 0.5, norm = 0;
    for (let i = 0; i < oct; i++) {
      sum += amp * noise3(x, y, z);
      norm += amp;
      x *= 2.03; y *= 2.03; z *= 2.03;
      amp *= 0.5;
    }
    return sum / norm;
  }

  const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  const mix = (a, b, t) => {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  };
  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const WHITE = [255, 255, 255];

  const COL = {
    sunA: hex(0xff5a00), sunB: hex(0xffe27a), sunC: hex(0xfff2b8),
    merA: hex(0x6e675f), merB: hex(0xc7bfb4),
    venA: hex(0xb98a4b), venB: hex(0xf0dca8),
    deep: hex(0x0a2766), sea: hex(0x1d63b0), shallow: hex(0x46b0cc),
    grass: hex(0x2e7d3c), forest: hex(0x1f5e34), sand: hex(0xb39a5e), rock: hex(0x7c6f60), snow: hex(0xf2f6fb),
    marA: hex(0x8f3a1d), marB: hex(0xd68a52), marDark: hex(0x4a2418),
    jupA: hex(0xefe0c0), jupB: hex(0xa8633a), jupC: hex(0x7a4630), jupSpot: hex(0xb5442a),
    satA: hex(0xeadbb0), satB: hex(0xbf9f6c),
    uraA: hex(0x86d6dc), uraB: hex(0xaef0f2),
    nepA: hex(0x2849c2), nepB: hex(0x5a88f5),
    moonA: hex(0x5d5d5d), moonB: hex(0xc4c4c4),
    skyA: hex(0x1a2050), skyB: hex(0xd8b89a),
    city: hex(0xffc878),
  };

  const GAL = (() => {
    const x = 0.32, y = 0.82, z = 0.47, l = Math.hypot(x, y, z);
    return { x: x / l, y: y / l, z: z / l };
  })();

  const earthHeight = (x, y, z) => fbm(x * 2 + 7, y * 2, z * 2, 5);
  const SEA_LEVEL = 0.54;

  const SHADERS = {
    sky(x, y, z) {
      const d = x * GAL.x + y * GAL.y + z * GAL.z;
      const band = Math.exp(-(d * d) / 0.03);
      const n1 = fbm(x * 3 + 5, y * 3, z * 3, 5);
      const n2 = fbm(x * 9, y * 9 + 3, z * 9, 4);
      const dust = smooth(0.45, 0.7, n2);
      const v = band * (0.25 + 0.9 * n1) * (1 - 0.55 * dust);
      const c = mix(COL.skyA, COL.skyB, smooth(0.2, 0.8, n1) * band);
      return [3 + c[0] * v * 0.55, 4 + c[1] * v * 0.55, 10 + c[2] * v * 0.55];
    },
    sun(x, y, z) {
      const n = fbm(x * 4, y * 4, z * 4, 5);
      const g = fbm(x * 14 + 3, y * 14, z * 14, 3);
      const spots = smooth(0.62, 0.7, fbm(x * 6 + 11, y * 6, z * 6, 3));
      let c = mix(COL.sunA, COL.sunB, n * 1.4 - 0.15 + (g - 0.5) * 0.3);
      c = mix(c, COL.sunC, smooth(0.62, 0.8, g) * 0.35);
      return mix(c, COL.sunA, spots * 0.45);
    },
    mercury(x, y, z) {
      const n = fbm(x * 3 + 1, y * 3, z * 3, 5);
      const c = fbm(x * 9, y * 9, z * 9 + 4, 3);
      return mix(COL.merA, COL.merB, n * 1.3 - 0.1 - Math.max(0, c - 0.6) * 1.2);
    },
    venus(x, y, z) {
      const w = fbm(x * 3, y * 3, z * 3, 3) * 1.5;
      const w2 = fbm(x * 2.2 + w, y * 4, z * 2.2, 4);
      const streak = Math.sin((y + w2 * 0.35) * 22) * 0.5 + 0.5;
      return mix(COL.venA, COL.venB, w2 * 1.1 - 0.05 + streak * 0.12);
    },
    earth(x, y, z) {
      const h = earthHeight(x, y, z);
      let c;
      if (h < SEA_LEVEL) {
        const d = h / SEA_LEVEL;
        c = d < 0.86 ? mix(COL.deep, COL.sea, d / 0.86) : mix(COL.sea, COL.shallow, (d - 0.86) / 0.14);
      } else {
        const e = (h - SEA_LEVEL) / 0.2;
        const dry = smooth(0, 0.5, 0.45 - Math.abs(y)) * fbm(x * 4 + 3, y * 4, z * 4, 3);
        c = mix(COL.forest, COL.grass, fbm(x * 6, y * 6, z * 6, 3) * 1.2);
        c = mix(c, COL.sand, dry * 1.3);
        c = mix(c, COL.rock, e * e * 1.2);
      }
      const ice = Math.abs(y) + (fbm(x * 5, y * 5, z * 5, 2) - 0.5) * 0.12;
      if (ice > 0.88) c = mix(c, COL.snow, smooth(0.88, 0.92, ice));
      return c;
    },
    earthClouds(x, y, z) {
      const w = fbm(x * 2, y * 3, z * 2, 3) * 0.8;
      const cl = smooth(0.54, 0.74, fbm(x * 3 + 20 + w, y * 5, z * 3, 5));
      return [255, 255, 255, cl * 235];
    },
    earthLights(x, y, z) {
      if (earthHeight(x, y, z) < SEA_LEVEL + 0.01 || Math.abs(y) > 0.78) return [0, 0, 0];
      const dense = smooth(0.46, 0.62, fbm(x * 5 + 2, y * 5, z * 5, 3));
      const dots = smooth(0.6, 0.76, fbm(x * 16 + 1, y * 16, z * 16, 3));
      const v = dense * dots;
      return [COL.city[0] * v, COL.city[1] * v, COL.city[2] * v];
    },
    moon(x, y, z) {
      const n = fbm(x * 3, y * 3, z * 3, 5);
      const maria = smooth(0.45, 0.6, fbm(x * 1.6 + 9, y * 1.6, z * 1.6, 3));
      const c = fbm(x * 12, y * 12, z * 12 + 2, 3);
      return mix(COL.moonA, COL.moonB, n * 1.2 - maria * 0.35 - Math.max(0, c - 0.62) * 1.0);
    },
    mars(x, y, z) {
      const n = fbm(x * 3, y * 3, z * 3, 5);
      const m = fbm(x * 7 + 5, y * 7, z * 7, 3);
      let c = mix(COL.marA, COL.marB, n * 1.3 - 0.1);
      if (m < 0.42) c = mix(c, COL.marDark, (0.42 - m) * 2.6);
      if (Math.abs(y) > 0.93) c = mix(c, WHITE, smooth(0.93, 0.97, Math.abs(y)) * 0.9);
      return c;
    },
    jupiter(x, y, z, lat, lon) {
      const warp = fbm(x * 2, y * 6, z * 2, 4);
      const band = Math.sin(lat * 16 + warp * 4) * 0.5 + 0.5;
      const fine = Math.sin(lat * 41 + warp * 9) * 0.5 + 0.5;
      const b2 = fbm(x * 1.5, y * 14, z * 1.5, 3);
      let c = mix(COL.jupA, COL.jupB, band * 0.75 + b2 * 0.45 - 0.15);
      c = mix(c, COL.jupC, smooth(0.6, 0.95, fine) * 0.28 * band);
      const dx = ((lon - 3.5) * Math.cos(lat)) / 0.3;
      const dy = (lat + 0.35) / 0.15;
      const d = Math.hypot(dx, dy);
      if (d < 1) c = mix(c, COL.jupSpot, (1 - d) * 1.1);
      else if (d < 1.5) c = mix(c, COL.jupC, (1.5 - d) * 0.25);
      return c;
    },
    saturn(x, y, z, lat) {
      const warp = fbm(x * 2, y * 5, z * 2, 3);
      const band = Math.sin(lat * 22 + warp * 3) * 0.5 + 0.5;
      return mix(COL.satA, COL.satB, band * 0.65 + fbm(x, y * 12, z, 3) * 0.3 - 0.1);
    },
    uranus(x, y, z, lat) {
      const band = Math.sin(lat * 10 + fbm(x * 2, y * 4, z * 2, 3) * 2) * 0.5 + 0.5;
      return mix(COL.uraA, COL.uraB, band * 0.7);
    },
    neptune(x, y, z, lat) {
      const warp = fbm(x * 2, y * 5, z * 2, 4);
      const band = Math.sin(lat * 12 + warp * 3) * 0.5 + 0.5;
      const c = mix(COL.nepA, COL.nepB, band * 0.75 + (warp - 0.5) * 0.4);
      const streak = smooth(0.68, 0.8, fbm(x * 5 + 9, y * 12, z * 5, 3));
      return mix(c, WHITE, streak * 0.35);
    },
  };

  function generate(name, w, h) {
    const shade = SHADERS[name];
    const out = new Uint8ClampedArray(w * h * 4);
    for (let j = 0; j < h; j++) {
      const lat = (0.5 - (j + 0.5) / h) * Math.PI;
      const y = Math.sin(lat), cl = Math.cos(lat);
      for (let i = 0; i < w; i++) {
        const lon = ((i + 0.5) / w) * TAU;
        const col = shade(cl * Math.cos(lon), y, cl * Math.sin(lon), lat, lon);
        const k = (j * w + i) * 4;
        out[k] = col[0];
        out[k + 1] = col[1];
        out[k + 2] = col[2];
        out[k + 3] = col.length > 3 ? col[3] : 255;
      }
    }
    return out;
  }

  return { generate, noise3 };
}

const kitMain = textureKit();

const TEXTURE_PLAN = [
  ['earth', 1024, 512],
  ['jupiter', 1024, 512],
  ['earthClouds', 768, 384],
  ['saturn', 640, 320],
  ['sky', 512, 256],
  ['sun', 512, 256],
  ['earthLights', 512, 256],
  ['venus', 512, 256],
  ['mars', 512, 256],
  ['neptune', 512, 256],
  ['mercury', 512, 256],
  ['moon', 512, 256],
  ['uranus', 512, 256],
];

const nextTick = () => new Promise((r) => setTimeout(r, 0));
const TEX_VERSION = 'v1';
const texKey = (name, w, h) => `${TEX_VERSION}:${name}:${w}x${h}`;

function toTexture(px, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d').putImageData(new ImageData(px, w, h), 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const idb = {
  db: null,
  open() {
    return new Promise((res) => {
      try {
        const r = indexedDB.open('osmonoro-tex', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('t');
        r.onsuccess = () => { idb.db = r.result; res(true); };
        r.onerror = () => res(false);
        r.onblocked = () => res(false);
      } catch (err) {
        res(false);
      }
    });
  },
  get(key) {
    return new Promise((res) => {
      if (!idb.db) return res(null);
      try {
        const q = idb.db.transaction('t').objectStore('t').get(key);
        q.onsuccess = () => res(q.result || null);
        q.onerror = () => res(null);
      } catch (err) {
        res(null);
      }
    });
  },
  put(key, val) {
    try {
      if (idb.db) idb.db.transaction('t', 'readwrite').objectStore('t').put(val, key);
    } catch (err) { /* muhim emas */ }
  },
};

function makeWorkerPool(n) {
  const src = `const kit = (${textureKit.toString()})();
    self.onmessage = (e) => {
      const { name, w, h } = e.data;
      const px = kit.generate(name, w, h);
      self.postMessage({ name, w, h, px }, [px.buffer]);
    };`;
  const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  const workers = [];
  try {
    for (let i = 0; i < n; i++) workers.push(new Worker(url));
  } catch (err) {
    workers.forEach((x) => x.terminate());
    URL.revokeObjectURL(url);
    throw err;
  }
  return { workers, url };
}

async function buildTextures(onProgress) {
  const out = {};
  const total = TEXTURE_PLAN.reduce((s, [, w, h]) => s + w * h, 0);
  let done = 0;
  const pending = [];

  await idb.open();
  for (const [name, w, h] of TEXTURE_PLAN) {
    const buf = await idb.get(texKey(name, w, h));
    if (buf && buf.byteLength === w * h * 4) {
      out[name] = toTexture(new Uint8ClampedArray(buf), w, h);
      done += w * h;
    } else {
      pending.push([name, w, h]);
    }
  }
  onProgress(done / total);

  if (pending.length) {
    pending.sort((a, b) => b[1] * b[2] - a[1] * a[2]);

    let pool = null;
    try {
      pool = makeWorkerPool(Math.min(4, Math.max(2, navigator.hardwareConcurrency || 2)));
    } catch (err) {
      pool = null;
    }
    if (pool) {
      try {
        await new Promise((resolve, reject) => {
          let next = 0, running = 0;
          const launch = (wk) => {
            if (next >= pending.length) {
              if (running === 0) resolve();
              return;
            }
            const [name, w, h] = pending[next++];
            running++;
            wk.onmessage = (e) => {
              const { name: nm, w: ww, h: hh, px } = e.data;
              idb.put(texKey(nm, ww, hh), px.buffer.slice(0));
              out[nm] = toTexture(px, ww, hh);
              done += ww * hh;
              onProgress(done / total);
              running--;
              launch(wk);
            };
            wk.onerror = (err) => reject(err);
            wk.postMessage({ name, w, h });
          };
          pool.workers.forEach(launch);
        });
      } catch (err) {
        console.warn('Worker ishlamadi, asosiy oqimda davom etamiz', err);
      }
      pool.workers.forEach((x) => x.terminate());
      URL.revokeObjectURL(pool.url);
    }

    for (const [name, w, h] of pending) {
      if (out[name]) continue;
      await nextTick();
      const px = kitMain.generate(name, w, h);
      idb.put(texKey(name, w, h), px.buffer.slice(0));
      out[name] = toTexture(px, w, h);
      done += w * h;
      onProgress(done / total);
    }
  }
  return out;
}

function makeRingTexture() {
  const w = 1024;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = 2;
  const g = c.getContext('2d');
  for (let i = 0; i < w; i++) {
    const t = i / (w - 1);
    let a = 0;
    if (t > 0.06) a = 0.35;
    if (t > 0.2) a = 0.8;
    if (t > 0.62 && t < 0.68) a = 0.06;
    if (t >= 0.68) a = 0.64;
    if (t > 0.92) a *= 1 - (t - 0.92) / 0.08;
    a *= 0.72 + 0.28 * kitMain.noise3(t * 70, 1.3, 2.7);
    const s = 0.8 + 0.2 * kitMain.noise3(t * 110, 0.5, 0.5);
    g.fillStyle = `rgba(${(226 * s) | 0},${(206 * s) | 0},${(166 * s) | 0},${a.toFixed(3)})`;
    g.fillRect(i, 0, 1, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(255,255,255,0.65)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.7)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

/* ---------------------------------------------------------------------
   3. Sahna
   --------------------------------------------------------------------- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $('#scene'), antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  $('#loaderText').textContent = t('webgl');
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060f);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 6000);
camera.position.set(0, 230, 500);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.rotateSpeed = 0.7;
controls.zoomSpeed = 0.8;
controls.minDistance = 12;
controls.maxDistance = 650;

scene.add(new THREE.AmbientLight(0x3a4170, 0.55));
scene.add(new THREE.PointLight(0xfff2dd, 3.2, 0, 0));

const SUN_V = { value: new THREE.Vector3() };
const SPHERE = new THREE.SphereGeometry(1, 96, 64);

(function addStars() {
  const N = 2600;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * TAU;
    const s = Math.sqrt(1 - u * u);
    const r = 2300 + Math.random() * 600;
    pos[i * 3] = r * s * Math.cos(a);
    pos[i * 3 + 1] = r * u;
    pos[i * 3 + 2] = r * s * Math.sin(a);
    const k = Math.random();
    c.setHSL(k < 0.6 ? 0.62 : k < 0.85 ? 0.1 : 0.0, 0.5, 0.65 + Math.random() * 0.3);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 2.4, sizeAttenuation: false, vertexColors: true, map: dotTexture(),
    transparent: true, depthWrite: false, opacity: 0.95, toneMapped: false,
  });
  const stars = new THREE.Points(geo, mat);
  stars.renderOrder = -1;
  scene.add(stars);
})();

const belt = (function addBelt() {
  const N = 2400;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * TAU;
    const r = 38.5 + ((Math.random() + Math.random()) / 2) * 8;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.6, sizeAttenuation: false, color: 0xa39a8c, map: dotTexture(),
    transparent: true, depthWrite: false, opacity: 0.8, toneMapped: false,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
})();

function atmosphere(radius, color, power, intensity) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      c: { value: new THREE.Color(color) },
      p: { value: power },
      k: { value: intensity },
      sunV: SUN_V,
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vP;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vP = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 c; uniform float p; uniform float k; uniform vec3 sunV;
      varying vec3 vN; varying vec3 vP;
      void main() {
        vec3 V = normalize(-vP);
        float rim = pow(1.0 - max(dot(vN, V), 0.0), p);
        vec3 S = normalize(sunV - vP);
        float lit = smoothstep(-0.25, 0.6, dot(vN, S));
        gl_FragColor = vec4(c * rim * k * lit, 1.0);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const m = new THREE.Mesh(SPHERE, mat);
  m.scale.setScalar(radius * 1.14);
  return m;
}

const ATMOS = {
  venus: [0xffd28a, 2.6, 1.0],
  earth: [0x5aa8ff, 3.0, 1.45],
  mars: [0xff9b6a, 3.5, 0.6],
  jupiter: [0xe8c9a0, 4.0, 0.35],
  saturn: [0xe8d9a8, 4.0, 0.35],
  uranus: [0x9ff0ff, 3.0, 0.9],
  neptune: [0x5f8dff, 3.0, 1.0],
};

const BUMP = { mercury: 2.2, moon: 2.4, mars: 1.6, earth: 0.9 };

function planetMaterial(def, tex) {
  if (def.id === 'sun') return new THREE.MeshBasicMaterial({ map: tex.sun, toneMapped: false });
  const opts = { map: tex[def.id], roughness: 1, metalness: 0 };
  if (BUMP[def.id]) {
    opts.bumpMap = tex[def.id];
    opts.bumpScale = BUMP[def.id];
  }
  const m = new THREE.MeshStandardMaterial(opts);
  if (def.id === 'earth') {
    m.roughness = 0.8;
    m.emissive = new THREE.Color(0xffffff);
    m.emissiveMap = tex.earthLights;
    m.emissiveIntensity = 1.25;
    m.onBeforeCompile = (sh) => {
      sh.uniforms.sunV = SUN_V;
      sh.fragmentShader = 'uniform vec3 sunV;\n' + sh.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         float nightDot = dot(normalize(normal), normalize(sunV + vViewPosition));
         totalEmissiveRadiance *= (1.0 - smoothstep(-0.12, 0.18, nightDot));`
      );
    };
  }
  return m;
}

/* ---------------------------------------------------------------------
   4. Jismlarni yaratish
   --------------------------------------------------------------------- */
const byId = {};
const list = [];
const hitMeshes = [];
const labelsEl = $('#labels');
const sunGlows = [];

function buildBodies(tex) {
  for (const def of BODIES) {
    const b = { ...def };
    b.phase = Math.random() * TAU;
    b.omega = def.period ? TAU / (YEAR_SECONDS * def.period) : 0;

    b.pivot = new THREE.Object3D();
    b.holder = new THREE.Object3D();
    b.holder.position.x = def.dist;
    b.pivot.add(b.holder);

    b.tiltGroup = new THREE.Group();
    b.tiltGroup.rotation.z = def.tilt;
    b.holder.add(b.tiltGroup);

    b.mesh = new THREE.Mesh(SPHERE, planetMaterial(def, tex));
    b.mesh.scale.setScalar(def.r);
    b.mesh.rotation.y = Math.random() * TAU;
    b.tiltGroup.add(b.mesh);

    if (def.id === 'earth') {
      b.clouds = new THREE.Mesh(SPHERE, new THREE.MeshStandardMaterial({
        map: tex.earthClouds, transparent: true, depthWrite: false, roughness: 1, metalness: 0,
      }));
      b.clouds.scale.setScalar(def.r * 1.012);
      b.tiltGroup.add(b.clouds);
    }

    if (ATMOS[def.id]) {
      const [color, power, k] = ATMOS[def.id];
      b.tiltGroup.add(atmosphere(def.r, color, power, k));
    }

    if (def.ring) {
      const inner = def.r * 1.35, outer = def.r * 2.45;
      const geo = new THREE.RingGeometry(inner, outer, 128, 1);
      const pos = geo.attributes.position, uv = geo.attributes.uv, v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
      }
      const ringMat = new THREE.MeshStandardMaterial({
        map: tex.ring, transparent: true, side: THREE.DoubleSide, depthWrite: false,
        roughness: 1, emissive: 0xffffff, emissiveMap: tex.ring, emissiveIntensity: 0.22,
      });
      const ring = new THREE.Mesh(geo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      b.tiltGroup.add(ring);
    }

    b.hit = new THREE.Mesh(SPHERE, new THREE.MeshBasicMaterial({ visible: false }));
    b.hit.userData.id = def.id;
    b.holder.add(b.hit);
    hitMeshes.push(b.hit);

    if (def.dist && !def.parent) {
      const pts = [];
      for (let i = 0; i <= 256; i++) {
        const a = (i / 256) * TAU;
        pts.push(new THREE.Vector3(Math.cos(a) * def.dist, 0, Math.sin(a) * def.dist));
      }
      b.orbit = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x7885c4, transparent: true, opacity: 0.3 })
      );
      scene.add(b.orbit);
    }

    b.label = document.createElement('div');
    b.label.className = 'label';
    b.label.textContent = tBody(def.id).name;
    labelsEl.appendChild(b.label);

    byId[def.id] = b;
    list.push(b);
  }

  for (const b of list) {
    if (b.parent) byId[b.parent].holder.add(b.pivot);
    else scene.add(b.pivot);
  }

  const gt = glowTexture();
  const g1 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: gt, color: 0xffb347, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false,
  }));
  g1.scale.setScalar(36);
  const g2 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: gt, color: 0xff7a2e, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.35, toneMapped: false,
  }));
  g2.scale.setScalar(100);
  scene.add(g1, g2);
  sunGlows.push(g1, g2);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(3500, 48, 32),
    new THREE.MeshBasicMaterial({ map: tex.sky, side: THREE.BackSide, depthWrite: false, toneMapped: false })
  );
  sky.renderOrder = -2;
  scene.add(sky);
}

/* ---------------------------------------------------------------------
   5. Holat va interfeys
   --------------------------------------------------------------------- */
let focus = null;
let settle = 0;
let settleDur = 1.8;
let desired = 210;
let speed = 4;
let simTime = 0;
let orbitsOn = true;
let labelsOn = true;
let musicOn = true;
let infoOpen = false;
let viewOffset = 0;

let tourOn = false;
let tourIdx = 0;
let tourT = 0;
let flyDir = null;

const chipsEl = $('#chips');
const infoEl = $('#info');
const hintEl = $('#hint');

function setPressed(sel, on) {
  const el = $(sel);
  el.setAttribute('aria-pressed', String(on));
  el.classList.toggle('on', on);
}

function toast(msg, ms = 3400) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { el.hidden = true; }, ms);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function buildChips() {
  chipsEl.innerHTML = '';
  const all = document.createElement('button');
  all.type = 'button';
  all.className = 'chip' + (focus ? '' : ' on');
  all.dataset.id = 'all';
  all.innerHTML = `<i class="all"></i>${esc(t('all'))}`;
  all.addEventListener('click', () => setFocus(null));
  chipsEl.appendChild(all);

  for (const b of list) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (focus && focus.id === b.id ? ' on' : '');
    btn.dataset.id = b.id;
    btn.innerHTML = `<i style="background:${b.color}"></i>${esc(tBody(b.id).name)}`;
    btn.addEventListener('click', () => setFocus(focus && focus.id === b.id ? null : b.id));
    chipsEl.appendChild(btn);
  }
}

function updateInfoCard() {
  if (!focus) return;
  const tr = tBody(focus.id);
  $('#infoName').textContent = tr.name;
  $('#infoDesc').textContent = tr.desc;
  $('#infoStats').innerHTML = tr.stats
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('');
}

function updateBodyLabels() {
  for (const b of list) {
    b.label.textContent = tBody(b.id).name;
  }
}

function computeFlyDir() {
  const P = focus.holder.getWorldPosition(new THREE.Vector3());
  const dir = P.lengthSq() < 1e-4 ? new THREE.Vector3(0.3, 0, 1) : P.clone().negate().normalize();
  dir.applyAxisAngle(Y_AXIS, 0.7);
  dir.y += 0.22;
  return dir.normalize();
}

function setFocus(id, fromTour = false) {
  if (!fromTour && tourOn) stopTour(true);
  focus = id ? byId[id] : null;
  settle = 0;
  settleDur = tourOn ? 2.6 : 1.8;
  desired = focus ? focus.view : 210;
  flyDir = tourOn && focus ? computeFlyDir() : null;
  controls.minDistance = focus ? focus.r * 1.8 : 12;

  chipsEl.querySelectorAll('.chip').forEach((el) => {
    const on = el.dataset.id === (id || 'all');
    el.classList.toggle('on', on);
    if (on) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  });

  for (const b of list) {
    if (!b.orbit) continue;
    const active = focus && b.id === focus.id;
    b.orbit.material.color.set(active ? 0xffc46b : 0x7885c4);
    b.orbit.material.opacity = active ? 0.85 : 0.3;
  }

  if (focus) {
    updateInfoCard();
    hideHint();
  }
  syncInfo();
}

function syncInfo() {
  const show = !!focus && !tourOn;
  infoEl.hidden = !show;
  if (show) {
    infoEl.style.animation = 'none';
    void infoEl.offsetWidth;
    infoEl.style.animation = '';
  }
  infoOpen = show;
}

function hideHint() {
  hintEl.classList.add('gone');
}
setTimeout(hideHint, 9000);

$('#infoClose').addEventListener('click', () => setFocus(null));

$('#speed').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  speed = Number(btn.dataset.s);
  $('#speed').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === btn));
});

function bindToggle(sel, onChange) {
  const el = $(sel);
  el.addEventListener('click', () => {
    const on = el.getAttribute('aria-pressed') !== 'true';
    setPressed(sel, on);
    onChange(on);
  });
}
bindToggle('#tglOrbits', (on) => {
  orbitsOn = on;
  for (const b of list) if (b.orbit) b.orbit.visible = on;
  belt.visible = on;
});
bindToggle('#tglLabels', (on) => {
  labelsOn = on;
});
bindToggle('#tglTour', (on) => (on ? startTour() : stopTour()));
bindToggle('#tglMusic', (on) => setMusic(on));

/* ---------------------------------------------------------------------
   5b. Til tanlash
   --------------------------------------------------------------------- */
function applyLanguage() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('page.title');
  const md = document.querySelector('meta[name="description"]');
  if (md) md.content = t('meta.desc');

  const bs = document.getElementById('brandSub');
  if (bs) bs.textContent = t('brand.sub');
  const spg = document.getElementById('speed');
  if (spg) spg.setAttribute('aria-label', t('speed.group'));
  const spp = document.getElementById('speedPause');
  if (spp) spp.setAttribute('aria-label', t('speed.pause'));

  const rec = document.getElementById('btnRec');
  if (rec) rec.setAttribute('aria-label', REC.recorder ? t('rec.stop') : t('rec'));
  const sh = document.getElementById('btnShare');
  if (sh) sh.setAttribute('aria-label', t('share'));
  const lg = document.getElementById('btnLang');
  if (lg) lg.setAttribute('aria-label', t('lang'));

  const tt = document.getElementById('tglTour'); if (tt) tt.textContent = t('tour');
  const tm = document.getElementById('tglMusic'); if (tm) tm.textContent = t('music');
  const to = document.getElementById('tglOrbits'); if (to) to.textContent = t('orbits');
  const tl = document.getElementById('tglLabels'); if (tl) tl.textContent = t('labels');

  const sm = document.getElementById('shareMenu');
  if (sm) sm.querySelectorAll('button[data-fmt]').forEach(b => { b.textContent = t('menu.' + b.dataset.fmt); });

  const hint = document.getElementById('hint'); if (hint) hint.textContent = t('hint');
  const chips = document.getElementById('chips'); if (chips) chips.setAttribute('aria-label', t('chips.aria'));
  const ic = document.getElementById('infoClose'); if (ic) ic.setAttribute('aria-label', t('close'));

  const rs = document.getElementById('resultSave'); if (rs) rs.textContent = t('save');
  const rsh = document.getElementById('resultShare'); if (rsh) rsh.textContent = t('share');
  const rc = document.getElementById('resultClose'); if (rc) rc.textContent = t('close');

  const lc = document.getElementById('langCode'); if (lc) lc.textContent = currentLang.toUpperCase();

  if (!window.__osmonoroReady) {
    const lt = document.getElementById('loaderText');
    if (lt && lt.textContent.indexOf('%') === -1) lt.textContent = t('loader.build');
  }

  buildChips();
  updateBodyLabels();
  if (focus) updateInfoCard();
}

function setLanguage(code) {
  if (!I18N[code] || code === currentLang) return;
  currentLang = code;
  try { localStorage.setItem('osmonoro-lang', code); } catch (e) {}
  applyLanguage();
  closeLangMenu();
}

function openLangMenu() {
  const menu = $('#langMenu');
  menu.innerHTML = '';
  for (const [code, label] of Object.entries(LANGUAGES)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.lang = code;
    btn.textContent = label;
    if (code === currentLang) {
      btn.style.fontWeight = '700';
      btn.style.color = 'var(--sun)';
    }
    btn.addEventListener('click', () => setLanguage(code));
    menu.appendChild(btn);
  }
  menu.hidden = false;
  $('#btnLang').setAttribute('aria-expanded', 'true');
}

function closeLangMenu() {
  $('#langMenu').hidden = true;
  $('#btnLang').setAttribute('aria-expanded', 'false');
}

$('#btnLang').addEventListener('click', () => {
  if ($('#langMenu').hidden) {
    closeShareMenu();
    openLangMenu();
  } else {
    closeLangMenu();
  }
});

/* ---------------------------------------------------------------------
   6. Avto sayr
   --------------------------------------------------------------------- */
function startTour() {
  tourOn = true;
  tourIdx = 0;
  setPressed('#tglTour', true);
  tourStep();
}

function tourStep() {
  tourT = 0;
  setFocus(TOUR[tourIdx], true);
}

function stopTour(skipSync = false) {
  if (!tourOn) return;
  tourOn = false;
  setPressed('#tglTour', false);
  if (!skipSync) syncInfo();
}

function updateTour(dt) {
  if (!tourOn) return;
  tourT += dt;
  const hold = TOUR[tourIdx] === 'moon' ? 5.5 : 8;
  if (tourT < hold) return;
  tourIdx++;
  if (tourIdx >= TOUR.length) {
    stopTour();
    setFocus(null);
  } else {
    tourStep();
  }
}

/* ---------------------------------------------------------------------
   7. Bosish
   --------------------------------------------------------------------- */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const canvas = renderer.domElement;
const pointers = new Set();
let tap = null;

canvas.addEventListener('pointerdown', (e) => {
  pointers.add(e.pointerId);
  hideHint();
  closeShareMenu();
  closeLangMenu();
  tap = pointers.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
});
canvas.addEventListener('pointerup', (e) => {
  pointers.delete(e.pointerId);
  if (!tap) return;
  const moved = Math.hypot(e.clientX - tap.x, e.clientY - tap.y);
  const dt = performance.now() - tap.t;
  tap = null;
  if (moved > 8 || dt > 400) return;

  const rect = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(hitMeshes, false)[0];
  if (hit) setFocus(hit.object.userData.id);
});
canvas.addEventListener('pointercancel', (e) => {
  pointers.delete(e.pointerId);
  tap = null;
});

/* ---------------------------------------------------------------------
   8. Musiqa
   --------------------------------------------------------------------- */
const audio = { el: null, ctx: null, gain: null, dest: null, ready: false };

function ensureAudio() {
  if (!musicOn) return;
  if (audio.ready) {
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    if (audio.el.paused && !document.hidden) audio.el.play().catch(() => {});
    return;
  }
  try {
    const el = new Audio('musiqa.mp3');
    el.loop = true;
    el.preload = 'auto';
    el.addEventListener('error', () => {
      toast(t('toast.music_missing'), 5000);
      musicOn = false;
      setPressed('#tglMusic', false);
    }, { once: true });
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const src = ctx.createMediaElementSource(el);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(gain);
    gain.connect(ctx.destination);
    let dest = null;
    if (ctx.createMediaStreamDestination) {
      dest = ctx.createMediaStreamDestination();
      gain.connect(dest);
    }
    Object.assign(audio, { el, ctx, gain, dest, ready: true });
    el.play().catch(() => {});
    gain.gain.setTargetAtTime(0.8, ctx.currentTime, 0.8);
  } catch (err) {
    console.warn('Audio ishga tushmadi', err);
  }
}

function setMusic(on) {
  musicOn = on;
  if (!audio.ready) {
    if (on) ensureAudio();
    return;
  }
  audio.gain.gain.setTargetAtTime(on ? 0.8 : 0, audio.ctx.currentTime, 0.15);
  if (on) {
    audio.ctx.resume();
    audio.el.play().catch(() => {});
  } else {
    setTimeout(() => { if (!musicOn && !REC.recorder) audio.el.pause(); }, 600);
  }
}

['pointerup', 'touchend', 'click', 'keydown'].forEach((ev) => window.addEventListener(ev, ensureAudio, { passive: true }));

document.addEventListener('visibilitychange', () => {
  if (!audio.ready || REC.recorder) return;
  if (document.hidden) audio.el.pause();
  else if (musicOn) audio.el.play().catch(() => {});
});

/* ---------------------------------------------------------------------
   9. Rasm / video uchun qoplama
   --------------------------------------------------------------------- */
const tmpV = new THREE.Vector3();
const tmpD = new THREE.Vector3();
const camDir = new THREE.Vector3();
const FOV_K = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
const FONT = '"Bricolage Grotesque", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const FONT_SVG = "'Bricolage Grotesque', system-ui, 'Segoe UI', Roboto, sans-serif";
const mctx = document.createElement('canvas').getContext('2d');
const wrapCache = new Map();

function wrapText(text, maxW, font) {
  const key = `${text}|${Math.round(maxW)}|${font}`;
  if (wrapCache.has(key)) return wrapCache.get(key);
  mctx.font = font;
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const tt = cur ? `${cur} ${w}` : w;
    if (mctx.measureText(tt).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = tt;
    }
  }
  if (cur) lines.push(cur);
  wrapCache.set(key, lines);
  return lines;
}

function labelInfo(b, w, h) {
  const hideMoon = b.id === 'moon' && !(focus && (focus.id === 'earth' || focus.id === 'moon'));
  if (!labelsOn || hideMoon || (focus && focus.id === b.id)) return null;
  b.holder.getWorldPosition(tmpV);
  tmpD.copy(tmpV).sub(camera.position);
  const dist = tmpD.length();
  if (tmpD.dot(camDir) <= 0) return null;
  tmpV.project(camera);
  const sx = (tmpV.x * 0.5 + 0.5) * w;
  const sy = (-tmpV.y * 0.5 + 0.5) * h;
  if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) return null;
  const rpx = (b.r * h) / (dist * FOV_K);
  return { x: sx, y: sy - rpx - 6 };
}

function buildOverlay(W, H) {
  const cw = window.innerWidth, ch = window.innerHeight;
  const s = W / cw;
  camera.getWorldDirection(camDir);

  const o = { W, H, s, labels: [], brand: { x: 20 * s, cy: 34 * s, size: 30 * s }, caption: null };
  for (const b of list) {
    const p = labelInfo(b, cw, ch);
    if (p) o.labels.push({ text: tBody(b.id).name, x: p.x * s, y: p.y * s, size: 12.5 * s });
  }

  const padX = 20 * s;
  const nameSize = 32 * s, descSize = 15 * s, statSize = 13.5 * s;
  const title = focus ? tBody(focus.id).name : t('overlay.default_title');
  const desc = focus ? tBody(focus.id).desc : t('overlay.default_desc');
  const statsArr = focus ? tBody(focus.id).stats : null;
  const stat = statsArr ? `${statsArr[0][0]}: ${statsArr[0][1]}     ${statsArr[2][0]}: ${statsArr[2][1]}` : '';
  const descLines = wrapText(desc, W - 2 * padX, `500 ${descSize}px ${FONT}`);

  let y = H - 26 * s;
  const cap = { padX, title, nameSize, descSize, statSize, descLines, stat };
  if (stat) {
    cap.statY = y;
    y -= statSize * 1.8;
  }
  cap.descY = descLines.map((_, i) => y - (descLines.length - 1 - i) * descSize * 1.35);
  cap.nameY = cap.descY[0] - descSize * 1.6;
  cap.gradTop = cap.nameY - nameSize * 2;
  o.caption = cap;
  return o;
}

function drawOverlay(ctx, o) {
  const { W, H, s, caption: c } = o;
  ctx.save();
  ctx.textBaseline = 'alphabetic';

  const g = ctx.createLinearGradient(0, c.gradTop, 0, H);
  g.addColorStop(0, 'rgba(5,6,15,0)');
  g.addColorStop(1, 'rgba(5,6,15,0.82)');
  ctx.fillStyle = g;
  ctx.fillRect(0, c.gradTop, W, H - c.gradTop);

  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 6 * s;
  ctx.fillStyle = '#eef1ff';
  for (const l of o.labels) {
    ctx.font = `600 ${l.size}px ${FONT}`;
    ctx.fillText(l.text, l.x, l.y);
  }
  ctx.shadowBlur = 0;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#eef1ff';
  ctx.font = `700 ${c.nameSize}px ${FONT}`;
  ctx.fillText(c.title, c.padX, c.nameY);
  ctx.fillStyle = '#c3caf0';
  ctx.font = `500 ${c.descSize}px ${FONT}`;
  c.descLines.forEach((line, i) => ctx.fillText(line, c.padX, c.descY[i]));
  if (c.stat) {
    ctx.fillStyle = '#ffb347';
    ctx.font = `600 ${c.statSize}px ${FONT}`;
    ctx.fillText(c.stat, c.padX, c.statY);
  }

  const b = o.brand, u = b.size / 32, cx = b.x + 16 * u, cy = b.cy;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 6 * s;
  ctx.fillStyle = '#ffb347';
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 1.5 * u;
  ctx.beginPath();
  ctx.arc(cx, cy, 5 * u, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 14 * u, 6 * u, (-28 * Math.PI) / 180, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 11.3 * u, cy - 1.6 * u, 2 * u, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#eef1ff';
  ctx.font = `700 ${22 * s}px ${FONT}`;
  ctx.fillText('Osmonoro', b.x + 38 * u, cy + 7 * s);
  ctx.restore();
}

function makeSvg(dataUrl, o) {
  const { W, H, s, caption: c } = o;
  const f = (n) => n.toFixed(1);
  let x = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  x += '<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060f" stop-opacity="0"/><stop offset="1" stop-color="#05060f" stop-opacity="0.82"/></linearGradient></defs>';
  x += `<image xlink:href="${dataUrl}" x="0" y="0" width="${W}" height="${H}"/>`;
  x += `<rect x="0" y="${f(c.gradTop)}" width="${W}" height="${f(H - c.gradTop)}" fill="url(#fade)"/>`;

  for (const l of o.labels) {
    x += `<text x="${f(l.x)}" y="${f(l.y)}" font-size="${f(l.size)}" font-weight="600" text-anchor="middle" fill="#eef1ff" stroke="#05060f" stroke-opacity="0.85" stroke-width="${f(l.size * 0.22)}" paint-order="stroke" font-family="${FONT_SVG}">${esc(l.text)}</text>`;
  }

  x += `<text x="${f(c.padX)}" y="${f(c.nameY)}" font-size="${f(c.nameSize)}" font-weight="700" fill="#eef1ff" font-family="${FONT_SVG}">${esc(c.title)}</text>`;
  c.descLines.forEach((line, i) => {
    x += `<text x="${f(c.padX)}" y="${f(c.descY[i])}" font-size="${f(c.descSize)}" font-weight="500" fill="#c3caf0" font-family="${FONT_SVG}">${esc(line)}</text>`;
  });
  if (c.stat) {
    x += `<text x="${f(c.padX)}" y="${f(c.statY)}" font-size="${f(c.statSize)}" font-weight="600" fill="#ffb347" xml:space="preserve" font-family="${FONT_SVG}">${esc(c.stat)}</text>`;
  }

  const b = o.brand, u = b.size / 32, cx = b.x + 16 * u, cy = b.cy;
  x += `<g fill="#ffb347" stroke="none"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(5 * u)}"/><circle cx="${f(cx + 11.3 * u)}" cy="${f(cy - 1.6 * u)}" r="${f(2 * u)}"/></g>`;
  x += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(14 * u)}" ry="${f(6 * u)}" fill="none" stroke="#ffb347" stroke-width="${f(1.5 * u)}" transform="rotate(-28 ${f(cx)} ${f(cy)})"/>`;
  x += `<text x="${f(b.x + 38 * u)}" y="${f(cy + 7 * s)}" font-size="${f(22 * s)}" font-weight="700" fill="#eef1ff" font-family="${FONT_SVG}">Osmonoro</text>`;
  x += '</svg>';
  return x;
}

/* ---------------------------------------------------------------------
   10. Natija oynasi, rasm olish va ulashish
   --------------------------------------------------------------------- */
const REC = { recorder: null, chunks: [], canvas: null, ctx: null, last: 0, t0: 0, iv: null, mime: '', prevPR: 1 };
let pendingCapture = null;
let resultUrl = null;
let resultFile = null;

const stamp = () => new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function setRenderPR(pr) {
  renderer.setPixelRatio(pr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}

const shareBtn = $('#btnShare');
const shareMenu = $('#shareMenu');

function closeShareMenu() {
  shareMenu.hidden = true;
  shareBtn.setAttribute('aria-expanded', 'false');
}

shareBtn.addEventListener('click', () => {
  const open = shareMenu.hidden;
  closeLangMenu();
  shareMenu.hidden = !open;
  shareBtn.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', (e) => {
  if (!shareMenu.hidden && !shareMenu.contains(e.target) && !shareBtn.contains(e.target)) closeShareMenu();
  if (!($('#langMenu').hidden) && !$('#langMenu').contains(e.target) && !$('#btnLang').contains(e.target)) closeLangMenu();
});
shareMenu.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-fmt]');
  if (!b) return;
  closeShareMenu();
  if (REC.recorder) {
    toast(t('toast.video_first'));
    return;
  }
  pendingCapture = b.dataset.fmt;
});

function showResult(blob, filename, kind) {
  closeResult();
  resultUrl = URL.createObjectURL(blob);
  resultFile = new File([blob], filename, { type: blob.type });

  const media = $('#resultMedia');
  media.innerHTML = '';
  if (kind === 'video') {
    const v = document.createElement('video');
    v.src = resultUrl;
    v.controls = true;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    media.appendChild(v);
  } else {
    const img = new Image();
    img.src = resultUrl;
    img.alt = 'Result';
    media.appendChild(img);
  }
  $('#resultName').textContent = `${filename} (${(blob.size / 1048576).toFixed(1)} MB)`;
  const canShare = !!(navigator.canShare && navigator.canShare({ files: [resultFile] }));
  $('#resultShare').hidden = !canShare;
  $('#result').hidden = false;
}

function closeResult() {
  $('#result').hidden = true;
  $('#resultMedia').innerHTML = '';
  if (resultUrl) {
    const u = resultUrl;
    setTimeout(() => URL.revokeObjectURL(u), 1500);
  }
  resultUrl = null;
  resultFile = null;
}

$('#resultClose').addEventListener('click', closeResult);
$('#result').addEventListener('click', (e) => {
  if (e.target.id === 'result') closeResult();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeResult();
});

$('#resultSave').addEventListener('click', () => {
  if (!resultUrl) return;
  const a = document.createElement('a');
  a.href = resultUrl;
  a.download = resultFile.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
});

$('#resultShare').addEventListener('click', () => {
  if (!resultFile) return;
  navigator
    .share({ files: [resultFile], title: 'Osmonoro', text: 'Osmonoro' })
    .catch((err) => {
      if (err && err.name !== 'AbortError') toast(t('toast.no_share'));
    });
});

function doCapture(fmt) {
  const w = window.innerWidth, h = window.innerHeight;
  const prev = renderer.getPixelRatio();
  const target = Math.min(3.5, Math.max(prev, (h >= w ? 1440 : 1920) / w));

  setRenderPR(target);
  renderer.render(scene, camera);
  const src = renderer.domElement;
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(src, 0, 0);
  const ov = buildOverlay(c.width, c.height);
  setRenderPR(prev);
  renderer.render(scene, camera);

  const name = `osmonoro-${stamp()}`;
  if (fmt === 'svg') {
    const svg = makeSvg(c.toDataURL('image/jpeg', 0.92), ov);
    showResult(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`, 'image');
  } else {
    drawOverlay(ctx, ov);
    const jpg = fmt === 'jpg';
    c.toBlob((blob) => {
      if (blob) showResult(blob, `${name}.${jpg ? 'jpg' : 'png'}`, 'image');
      else toast(t('toast.no_capture'));
    }, jpg ? 'image/jpeg' : 'image/png', 0.95);
  }
}

/* ---------------------------------------------------------------------
   11. Video yozish
   --------------------------------------------------------------------- */
function pickMime() {
  const tries = [
    'video/mp4;codecs=avc1.640033,mp4a.40.2',
    'video/mp4;codecs=avc1.4d0033,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const tt of tries) {
    try {
      if (MediaRecorder.isTypeSupported(tt)) return tt;
    } catch (err) { /* keyingisiga */ }
  }
  return '';
}

function startRecording() {
  if (REC.recorder) return;
  if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
    toast(t('toast.no_video'));
    return;
  }
  ensureAudio();

  const w = window.innerWidth, h = window.innerHeight;
  const outW = h >= w ? 1080 : 1920;
  const outH = Math.round(((outW * h) / w) / 2) * 2;

  REC.canvas = document.createElement('canvas');
  REC.canvas.width = outW;
  REC.canvas.height = outH;
  REC.ctx = REC.canvas.getContext('2d', { alpha: false });
  REC.prevPR = renderer.getPixelRatio();
  setRenderPR(Math.min(3.5, outW / w));

  const stream = REC.canvas.captureStream(30);
  let hasAudio = false;
  if (audio.ready && audio.dest) {
    const trk = audio.dest.stream.getAudioTracks()[0];
    if (trk) {
      stream.addTrack(trk);
      hasAudio = true;
    }
  }

  REC.mime = pickMime();
  const opts = { videoBitsPerSecond: 16000000 };
  if (REC.mime) opts.mimeType = REC.mime;
  if (hasAudio) opts.audioBitsPerSecond = 192000;

  let recorder;
  try {
    recorder = new MediaRecorder(stream, opts);
  } catch (err) {
    try {
      recorder = new MediaRecorder(stream);
    } catch (err2) {
      setRenderPR(REC.prevPR);
      toast(t('toast.no_record'));
      return;
    }
  }

  REC.chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) REC.chunks.push(e.data);
  };
  recorder.onstop = () => {
    clearInterval(REC.iv);
    const type = (recorder.mimeType || REC.mime || 'video/webm').split(';')[0];
    const blob = new Blob(REC.chunks, { type });
    REC.recorder = null;
    REC.chunks = [];
    setRenderPR(REC.prevPR);
    $('#btnRec').classList.remove('rec');
    $('#recTime').hidden = true;
    $('#btnRec').setAttribute('aria-label', t('rec'));
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    if (ext === 'webm') toast(t('toast.webm'), 5000);
    if (blob.size > 0) showResult(blob, `osmonoro-${stamp()}.${ext}`, 'video');
  };

  REC.recorder = recorder;
  REC.last = 0;
  REC.t0 = performance.now();
  recorder.start(1000);

  $('#btnRec').classList.add('rec');
  $('#btnRec').setAttribute('aria-label', t('rec.stop'));
  $('#recTime').hidden = false;
  $('#recTime').textContent = '0:00';
  REC.iv = setInterval(() => {
    const sec = Math.floor((performance.now() - REC.t0) / 1000);
    $('#recTime').textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
    if (sec >= MAX_REC_SECONDS) stopRecording();
  }, 250);
}

function stopRecording() {
  if (!REC.recorder) return;
  try {
    REC.recorder.stop();
  } catch (err) { /* allaqachon */ }
}

$('#btnRec').addEventListener('click', () => (REC.recorder ? stopRecording() : startRecording()));

function composeRec(now) {
  if (now - REC.last < 30) return;
  REC.last = now;
  const { canvas: c, ctx } = REC;
  ctx.drawImage(renderer.domElement, 0, 0, c.width, c.height);
  drawOverlay(ctx, buildOverlay(c.width, c.height));
}

/* ---------------------------------------------------------------------
   12. Asosiy sikl
   --------------------------------------------------------------------- */
const clock = new THREE.Clock();

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  viewOffset = -1;
}
window.addEventListener('resize', resize);
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);

function applyViewOffset(dt, w, h) {
  const target = infoOpen ? h * 0.17 : 0;
  const next = viewOffset < 0 ? target : viewOffset + (target - viewOffset) * (1 - Math.exp(-dt * 6));
  if (Math.abs(next - viewOffset) > 0.3 || viewOffset < 0) {
    viewOffset = next;
    if (Math.abs(viewOffset) > 0.5) camera.setViewOffset(w, h, 0, viewOffset, w, h);
    else camera.clearViewOffset();
  }
}

function updateHits(h) {
  for (const b of list) {
    b.holder.getWorldPosition(tmpV);
    const d = tmpV.distanceTo(camera.position);
    const px = b.id === 'moon' ? 12 : 20;
    b.hit.scale.setScalar(Math.max(b.r * 1.1, (px * d * FOV_K) / h));
  }
}

function updateLabels(w, h) {
  camera.getWorldDirection(camDir);
  for (const b of list) {
    const p = labelInfo(b, w, h);
    if (!p) {
      b.label.style.opacity = 0;
      continue;
    }
    b.label.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -100%)`;
    b.label.style.opacity = 1;
  }
}

function tick(now = performance.now()) {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  const sdt = dt * speed;
  simTime += sdt;

  for (const b of list) {
    if (b.omega) b.pivot.rotation.y = b.phase + simTime * b.omega;
    b.mesh.rotation.y += sdt * b.spin * 0.6;
    if (b.clouds) b.clouds.rotation.y += sdt * b.spin * 0.6 * 1.08;
  }
  belt.rotation.y += sdt * 0.02;

  if (!reduceMotion) {
    const pulse = 1 + 0.03 * Math.sin(now * 0.0022);
    sunGlows[0].scale.setScalar(36 * pulse);
    sunGlows[1].scale.setScalar(100 * (2 - pulse));
  }

  updateTour(dt);

  const p = focus ? focus.holder.getWorldPosition(tmpV) : tmpV.set(0, 0, 0);
  const k = settle < 1 ? 1 - Math.exp(-dt * 5) : 1;
  tmpD.copy(p).sub(controls.target).multiplyScalar(k);
  controls.target.add(tmpD);
  camera.position.add(tmpD);

  if (settle < 1) {
    settle = Math.min(1, settle + dt / settleDur);
    tmpD.copy(camera.position).sub(controls.target);
    const len = tmpD.length();
    const newLen = len + (desired - len) * (1 - Math.exp(-dt * 4));
    if (flyDir) tmpD.normalize().lerp(flyDir, 1 - Math.exp(-dt * 3)).normalize();
    tmpD.setLength(newLen);
    camera.position.copy(controls.target).add(tmpD);
  } else if (tourOn && focus) {
    tmpD.copy(camera.position).sub(controls.target).applyAxisAngle(Y_AXIS, -0.12 * dt);
    camera.position.copy(controls.target).add(tmpD);
  }

  controls.update();
  camera.updateMatrixWorld();
  SUN_V.value.set(0, 0, 0).applyMatrix4(camera.matrixWorldInverse);

  const w = window.innerWidth, h = window.innerHeight;
  applyViewOffset(dt, w, h);
  updateHits(h);
  renderer.render(scene, camera);

  if (REC.recorder) composeRec(now);
  if (pendingCapture) {
    const fmt = pendingCapture;
    pendingCapture = null;
    doCapture(fmt);
  }
  updateLabels(w, h);
}

/* ---------------------------------------------------------------------
   13. Ishga tushirish
   --------------------------------------------------------------------- */
async function init() {
  const tex = await buildTextures((p) => {
    $('#loaderText').textContent = `${t('loader.build')} ${Math.round(p * 100)}%`;
  });
  tex.ring = makeRingTexture();

  buildBodies(tex);
  applyLanguage();
  resize();

  if (reduceMotion) {
    speed = 1;
    $('#speed').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.s === '1'));
    camera.position.set(0, 120, 190);
    settle = 1;
  }

  window.__osmonoroReady = true;
  $('#loader').classList.add('done');
  clock.start();
  tick();
}

init();