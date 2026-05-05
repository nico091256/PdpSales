/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Locale = 'ru' | 'uz' | 'en';
type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    // ─── Common ───
    'common.search': 'Поиск',
    'common.profile': 'Профиль',
    'common.settings': 'Настройки',
    'common.logout': 'Выйти',
    'common.viewAll': 'Смотреть все',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.loading': 'Загрузка...',
    'common.error.loadFailed': 'Не удалось загрузить данные',
    'common.error.tryAgain': 'Попробуйте снова или обратитесь в поддержку.',
    'common.noData': 'Нет данных',

    // ─── Layout Sidebar ───
    'layout.overview': 'Обзор',
    'layout.management': 'Управление',
    'layout.operations': 'Операции',
    'layout.dashboard': 'Дашборд',
    'layout.rankings': 'Рейтинг',
    'layout.users': 'Пользователи',
    'layout.appointments': 'Встречи',
    'layout.callLogs': 'Звонки',
    'layout.alerts': 'Алерты',
    'layout.invitations': 'Приглашения',

    // ─── Page Titles ───
    'page.dashboard': 'Дашборд',
    'page.rankings': 'Рейтинг менеджеров',
    'page.users': 'Пользователи и команда',
    'page.appointments': 'Встречи',
    'page.callLogs': 'Журнал звонков',
    'page.alerts': 'Системные алерты',
    'page.invitations': 'Приглашения в команду',
    'page.profile': 'Профиль',
    'page.settings': 'Настройки',
    'page.account': 'Аккаунт',

    // ─── Breadcrumbs ───
    'breadcrumb.overview': 'Обзор',
    'breadcrumb.management': 'Управление',
    'breadcrumb.operations': 'Операции',
    'breadcrumb.account': 'Аккаунт',

    // ─── Header ───
    'header.theme': 'Тема',
    'header.language': 'Язык',
    'header.theme.light': 'Светлая',
    'header.theme.dark': 'Тёмная',
    'header.theme.custom': 'Кастомная',
    'header.searchPlaceholder': 'Поиск менеджеров, встреч, контактов...',
    'header.notifications': 'Уведомления',

    // ─── Dashboard ───
    'dashboard.welcome': 'С возвращением',
    'dashboard.subtitle': 'Сводка эффективности',
    'dashboard.kpi.totalRevenue': 'Выручка (факт)',
    'dashboard.kpi.target': 'Плановый показатель',
    'dashboard.kpi.personalTarget': 'Личный план',
    'dashboard.kpi.calls': 'Звонков зафиксировано',
    'dashboard.kpi.score': 'Оценка KPI',
    'dashboard.kpi.completion': '% выполнения',
    'dashboard.chart.title': 'Динамика выполнения',
    'dashboard.chart.subtitle': 'Факт vs. план по периодам',
    'dashboard.chart.plan': 'План',
    'dashboard.chart.fact': 'Факт',
    'dashboard.section.topPerformers': 'Топ менеджеры',
    'dashboard.section.personalRanking': 'Личный рейтинг',
    'dashboard.section.alerts': 'Последние алерты',
    'dashboard.section.progress': 'Прогресс выполнения',
    'dashboard.section.overall': 'Общий прогресс',
    'dashboard.section.gapToTarget': 'Разрыв до плана',
    'dashboard.section.forecast': 'Прогноз',
    'dashboard.section.onTrack': 'В норме',
    'dashboard.noRankingData': 'Данных о рейтинге нет',
    'dashboard.noAlerts': 'Нет новых алертов',
    'dashboard.error.title': 'Ошибка загрузки',
    'dashboard.error.body': 'Не удалось получить данные. Попробуйте позже.',

    // ─── Account ───
    'account.title': 'Аккаунт',
    'account.description': 'Профиль и персональные настройки',
    'account.tab.profile': 'Профиль',
    'account.tab.settings': 'Настройки',

    // ─── Settings ───
    'settings.appearance': 'Внешний вид',
    'settings.themeColor': 'Акцентный цвет',
    'settings.themeType': 'Режим темы',
    'settings.themeHint': 'Выберите light/dark или задайте свой HEX-цвет.',
    'settings.themePreset.light': 'Светлая',
    'settings.themePreset.dark': 'Тёмная',
    'settings.colorPicker': 'Выбрать цвет',
    'settings.presetColors': 'Быстрый выбор',
    'settings.saving': 'Сохранение...',
    'settings.saved': 'Тема сохранена',
    'settings.invalidHex': 'Введите корректный HEX (#RRGGBB)',

    // ─── Profile ───
    'profile.role': 'Роль',
    'profile.email': 'Email',
    'profile.phone': 'Телефон',
    'profile.fullName': 'Полное имя',
    'profile.editProfile': 'Редактировать профиль',
    'profile.saveChanges': 'Сохранить изменения',
  },

  uz: {
    // ─── Common ───
    'common.search': 'Qidiruv',
    'common.profile': 'Profil',
    'common.settings': 'Sozlamalar',
    'common.logout': 'Chiqish',
    'common.viewAll': "Barchasini ko'rish",
    'common.save': 'Saqlash',
    'common.cancel': 'Bekor qilish',
    'common.loading': 'Yuklanmoqda...',
    'common.error.loadFailed': "Ma'lumotlarni yuklab bo'lmadi",
    'common.error.tryAgain': "Qayta urinib ko'ring yoki qo'llab-quvvatlash xizmatiga murojaat qiling.",
    'common.noData': "Ma'lumot yo'q",

    // ─── Layout Sidebar ───
    'layout.overview': 'Umumiy',
    'layout.management': 'Boshqaruv',
    'layout.operations': 'Operatsiyalar',
    'layout.dashboard': 'Dashboard',
    'layout.rankings': 'Reyting',
    'layout.users': 'Foydalanuvchilar',
    'layout.appointments': 'Uchrashuvlar',
    'layout.callLogs': "Qo'ng'iroqlar",
    'layout.alerts': 'Ogohlantirishlar',
    'layout.invitations': 'Taklifnomalar',

    // ─── Page Titles ───
    'page.dashboard': 'Dashboard',
    'page.rankings': 'Menejerlar reytingi',
    'page.users': 'Foydalanuvchilar va jamoa',
    'page.appointments': 'Uchrashuvlar',
    'page.callLogs': "Qo'ng'iroqlar jurnali",
    'page.alerts': 'Tizim ogohlantirishlari',
    'page.invitations': 'Jamoaga takliflar',
    'page.profile': 'Profil',
    'page.settings': 'Sozlamalar',
    'page.account': 'Akkaunt',

    // ─── Breadcrumbs ───
    'breadcrumb.overview': 'Umumiy',
    'breadcrumb.management': 'Boshqaruv',
    'breadcrumb.operations': 'Operatsiyalar',
    'breadcrumb.account': 'Akkaunt',

    // ─── Header ───
    'header.theme': 'Mavzu',
    'header.language': 'Til',
    'header.theme.light': "Yorug'",
    'header.theme.dark': "Qorong'i",
    'header.theme.custom': 'Maxsus',
    'header.searchPlaceholder': "Menejerlar, uchrashuvlar, kontaktlarni qidirish...",
    'header.notifications': 'Bildirishnomalar',

    // ─── Dashboard ───
    'dashboard.welcome': 'Xush kelibsiz',
    'dashboard.subtitle': "Natijalar bo'yicha umumiy ko'rinish",
    'dashboard.kpi.totalRevenue': 'Daromad (fakt)',
    'dashboard.kpi.target': 'Rejalashtirilgan',
    'dashboard.kpi.personalTarget': 'Shaxsiy reja',
    'dashboard.kpi.calls': "Qo'ng'iroqlar soni",
    'dashboard.kpi.score': 'KPI ball',
    'dashboard.kpi.completion': '% bajarilishi',
    'dashboard.chart.title': 'Bajarilish dinamikasi',
    'dashboard.chart.subtitle': 'Fakt vs. reja davrlari bo\'yicha',
    'dashboard.chart.plan': 'Reja',
    'dashboard.chart.fact': 'Fakt',
    'dashboard.section.topPerformers': 'Top menejerlar',
    'dashboard.section.personalRanking': 'Shaxsiy reyting',
    'dashboard.section.alerts': 'So\'nggi ogohlantirishlar',
    'dashboard.section.progress': 'Bajarilish jarayoni',
    'dashboard.section.overall': 'Umumiy jarayon',
    'dashboard.section.gapToTarget': 'Rejagacha farq',
    'dashboard.section.forecast': 'Bashorat',
    'dashboard.section.onTrack': 'Muvofiq',
    'dashboard.noRankingData': 'Reyting ma\'lumotlari yo\'q',
    'dashboard.noAlerts': 'Yangi ogohlantirishlar yo\'q',
    'dashboard.error.title': 'Yuklash xatosi',
    'dashboard.error.body': "Ma'lumotlarni olishda xato yuz berdi. Keyinroq urinib ko'ring.",

    // ─── Account ───
    'account.title': 'Akkaunt',
    'account.description': 'Profil va shaxsiy sozlamalar',
    'account.tab.profile': 'Profil',
    'account.tab.settings': 'Sozlamalar',

    // ─── Settings ───
    'settings.appearance': "Ko'rinish",
    'settings.themeColor': 'Aksent rangi',
    'settings.themeType': 'Mavzu rejimi',
    'settings.themeHint': "light/dark tanlang yoki o'z HEX rangingizni kiriting.",
    'settings.themePreset.light': "Yorug'",
    'settings.themePreset.dark': "Qorong'i",
    'settings.colorPicker': 'Rang tanlash',
    'settings.presetColors': 'Tez tanlash',
    'settings.saving': 'Saqlanmoqda...',
    'settings.saved': 'Mavzu saqlandi',
    'settings.invalidHex': "To'g'ri HEX kiriting (#RRGGBB)",

    // ─── Profile ───
    'profile.role': 'Rol',
    'profile.email': 'Email',
    'profile.phone': 'Telefon',
    'profile.fullName': "To'liq ism",
    'profile.editProfile': 'Profilni tahrirlash',
    'profile.saveChanges': "O'zgarishlarni saqlash",
  },

  en: {
    // ─── Common ───
    'common.search': 'Search',
    'common.profile': 'Profile',
    'common.settings': 'Settings',
    'common.logout': 'Log out',
    'common.viewAll': 'View all',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error.loadFailed': 'Failed to load data',
    'common.error.tryAgain': 'Please try again or contact support.',
    'common.noData': 'No data',

    // ─── Layout Sidebar ───
    'layout.overview': 'Overview',
    'layout.management': 'Management',
    'layout.operations': 'Operations',
    'layout.dashboard': 'Dashboard',
    'layout.rankings': 'Rankings',
    'layout.users': 'Users',
    'layout.appointments': 'Appointments',
    'layout.callLogs': 'Call Logs',
    'layout.alerts': 'Alerts',
    'layout.invitations': 'Invitations',

    // ─── Page Titles ───
    'page.dashboard': 'Dashboard',
    'page.rankings': 'Performance Rankings',
    'page.users': 'Users & Team',
    'page.appointments': 'Appointments',
    'page.callLogs': 'Call Logs',
    'page.alerts': 'System Alerts',
    'page.invitations': 'Team Invitations',
    'page.profile': 'Profile',
    'page.settings': 'Settings',
    'page.account': 'Account',

    // ─── Breadcrumbs ───
    'breadcrumb.overview': 'Overview',
    'breadcrumb.management': 'Management',
    'breadcrumb.operations': 'Operations',
    'breadcrumb.account': 'Account',

    // ─── Header ───
    'header.theme': 'Theme',
    'header.language': 'Language',
    'header.theme.light': 'Light',
    'header.theme.dark': 'Dark',
    'header.theme.custom': 'Custom',
    'header.searchPlaceholder': 'Search managers, appointments, contacts...',
    'header.notifications': 'Notifications',

    // ─── Dashboard ───
    'dashboard.welcome': 'Welcome back',
    'dashboard.subtitle': 'Performance overview',
    'dashboard.kpi.totalRevenue': 'Revenue (Fact)',
    'dashboard.kpi.target': 'Planned Target',
    'dashboard.kpi.personalTarget': 'Personal Target',
    'dashboard.kpi.calls': 'Calls Logged',
    'dashboard.kpi.score': 'KPI Score',
    'dashboard.kpi.completion': '% Completion',
    'dashboard.chart.title': 'Performance Trend',
    'dashboard.chart.subtitle': 'Sales trajectory vs targets',
    'dashboard.chart.plan': 'Plan',
    'dashboard.chart.fact': 'Fact',
    'dashboard.section.topPerformers': 'Top Performers',
    'dashboard.section.personalRanking': 'Personal Ranking',
    'dashboard.section.alerts': 'Recent Alerts',
    'dashboard.section.progress': 'Completion Progress',
    'dashboard.section.overall': 'Overall Progress',
    'dashboard.section.gapToTarget': 'Gap to Target',
    'dashboard.section.forecast': 'Forecast',
    'dashboard.section.onTrack': 'On Track',
    'dashboard.noRankingData': 'No ranking data available',
    'dashboard.noAlerts': 'No new alerts',
    'dashboard.error.title': 'Error Loading Dashboard',
    'dashboard.error.body': 'There was a problem fetching your data. Please try again later.',

    // ─── Account ───
    'account.title': 'Account',
    'account.description': 'Profile and personal settings',
    'account.tab.profile': 'Profile',
    'account.tab.settings': 'Settings',

    // ─── Settings ───
    'settings.appearance': 'Appearance',
    'settings.themeColor': 'Accent Color',
    'settings.themeType': 'Theme Mode',
    'settings.themeHint': 'Choose light/dark or set a custom HEX color.',
    'settings.themePreset.light': 'Light',
    'settings.themePreset.dark': 'Dark',
    'settings.colorPicker': 'Pick color',
    'settings.presetColors': 'Quick Pick',
    'settings.saving': 'Saving...',
    'settings.saved': 'Theme saved',
    'settings.invalidHex': 'Enter a valid HEX color (#RRGGBB)',

    // ─── Profile ───
    'profile.role': 'Role',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.fullName': 'Full Name',
    'profile.editProfile': 'Edit Profile',
    'profile.saveChanges': 'Save Changes',
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = 'sales-locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'uz' || saved === 'en') return saved;
    return 'ru';
  });

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string) => dictionaries[locale][key] ?? dictionaries.en[key] ?? key,
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
