/**
 * Контент трёх сценариев интерактивного дашборда «Пульс компании сегодня».
 * Каждый сценарий — взгляд на один и тот же продукт под углом одной роли.
 * Данные мокап-уровня, иллюстрируют типичный набор задач роли в реальном
 * строй-подряде. Стиль карточек 1-в-1 с UI-kit Юры (Main #202F4D, Red_01
 * #FF3A4A, Gray_01-03, line-icons из Icon.astro).
 */

export type CardStatus = "danger" | "warning" | "neutral";

export type CardItem = {
  label: string;
  meta?: string;
  status?: CardStatus;
};

export type Card = {
  icon: string; // Icon.astro name
  title: string;
  primary?: { value: string; label: string };
  items: CardItem[];
  accent?: "primary" | "danger" | "warning";
};

export type Scenario = {
  id: "director" | "rp" | "supplier";
  label: string;
  subtitle: string;
  aiSummary: string;
  cards: Card[];
};

export const scenarios: Scenario[] = [
  {
    id: "director",
    label: "Утро директора",
    subtitle: "Стратегический взгляд — все объекты, риски, финансы",
    aiSummary:
      "За ночь: 2 объекта в риске по ГПР, 6 заявок на оплату ждут вашего согласования, 5 счетов у заказчиков просрочены более 30 дней.",
    cards: [
      {
        icon: "building",
        title: "Объекты в риске",
        primary: { value: "3", label: "из 9 объектов" },
        accent: "danger",
        items: [
          { label: "ЖК «Альянс»", meta: "отставание 8 дней", status: "danger" },
          { label: "ЖК «Северный»", meta: "бюджет +12%", status: "warning" },
          { label: "Школа №48", meta: "документы у заказчика", status: "warning" },
        ],
      },
      {
        icon: "credit-card",
        title: "Финансы сегодня",
        primary: { value: "2 350 000 ₽", label: "к согласованию" },
        items: [
          { label: "4 заявки на оплату от снабженца" },
          { label: "3 акта подписаны заказчиками" },
          { label: "1 счёт с истекающим сроком" },
        ],
      },
      {
        icon: "trending-up",
        title: "ГПР по компании",
        primary: { value: "67%", label: "среднее выполнение" },
        items: [
          { label: "1 объект в красной зоне", status: "danger" },
          { label: "2 объекта в жёлтой зоне", status: "warning" },
          { label: "6 объектов идут по плану", status: "neutral" },
        ],
      },
      {
        icon: "users",
        title: "Команда",
        primary: { value: "24", label: "сотрудника" },
        items: [
          { label: "4 заявки на отпуск" },
          { label: "1 новая роль на согласовании" },
          { label: "12 на объектах сегодня" },
        ],
      },
      {
        icon: "file-signature",
        title: "Документы у заказчика",
        items: [
          { label: "5 счетов > 30 дней", status: "danger" },
          { label: "2 акта ждут подписи", status: "warning" },
          { label: "1 КС-3 готов к отправке" },
        ],
      },
      {
        icon: "sparkles",
        title: "Решения на сегодня",
        accent: "primary",
        items: [
          { label: "Утвердить смету этапа 3 ЖК «Альянс»" },
          { label: "Подписать договор с подрядчиком кровли" },
          { label: "Согласовать график отпусков на июнь" },
        ],
      },
    ],
  },

  {
    id: "rp",
    label: "Утро руководителя проектов",
    subtitle: "Оперативный взгляд — мои объекты, задачи, команда",
    aiSummary:
      "У вас 4 объекта в работе. Ключевое сегодня: ЖК «Альянс» — поставка ПВХ-мембраны задерживается на 3 дня, нужно решение по подрядчику. Подробности в карточках ниже.",
    cards: [
      {
        icon: "building",
        title: "Мои объекты",
        primary: { value: "4", label: "в работе" },
        items: [
          { label: "ЖК «Альянс»", meta: "48% готовности", status: "danger" },
          { label: "ЖК «Северный»", meta: "72% готовности", status: "warning" },
          { label: "Школа №48", meta: "91% готовности", status: "neutral" },
          { label: "Офис на Ленина", meta: "30% готовности", status: "neutral" },
        ],
      },
      {
        icon: "alert-triangle",
        title: "Просроченные задачи",
        primary: { value: "3", label: "требуют действий" },
        accent: "danger",
        items: [
          { label: "Согласовать смету подрядчика", meta: "2 дня", status: "danger" },
          { label: "Подтвердить ГПР этапа 2", meta: "вчера", status: "warning" },
          { label: "Принять работы кровельщиков", meta: "сегодня", status: "neutral" },
        ],
      },
      {
        icon: "message-square",
        title: "Запросы от прорабов",
        primary: { value: "4", label: "новых сообщения" },
        items: [
          { label: "Замена ПВХ-мембраны 200 м²", meta: "ЖК «Альянс»" },
          { label: "Доп. самосвал на 16:00", meta: "Школа №48" },
          { label: "Стыковка фасада — уточнение", meta: "ЖК «Северный»" },
          { label: "Перенос приёмки на четверг", meta: "Офис на Ленина" },
        ],
      },
      {
        icon: "trending-up",
        title: "ГПР отставание",
        items: [
          { label: "ЖК «Альянс» этап 3", meta: "−8 дней", status: "danger" },
          { label: "ЖК «Северный» этап 5", meta: "−2 дня", status: "warning" },
          { label: "Школа №48 этап 4", meta: "по плану", status: "neutral" },
        ],
      },
      {
        icon: "file-signature",
        title: "Документы на согласование",
        items: [
          { label: "Смета подрядчика кровли", meta: "3 250 000 ₽" },
          { label: "Акт от ПТО, готовность 48%", meta: "ЖК «Альянс»" },
          { label: "Журнал работ за апрель", meta: "Школа №48" },
        ],
      },
      {
        icon: "calendar-clock",
        title: "Команда сегодня",
        items: [
          { label: "4 прораба на объектах" },
          { label: "12 рабочих по сменам" },
          { label: "Погода: ясно, +14 °C", status: "neutral" },
        ],
      },
    ],
  },

  {
    id: "supplier",
    label: "Утро снабженца",
    subtitle: "Закупки и логистика — материалы, поставки, оплаты",
    aiSummary:
      "12 заявок на материалы ждут решения, 3 поставки сегодня. По ПВХ-мембране от Технониколь пришёл частичный отказ — нужно пересогласовать объём с подрядчиком кровли.",
    cards: [
      {
        icon: "package",
        title: "Заявки на материалы",
        primary: { value: "12", label: "новых заявок" },
        items: [
          { label: "ПВХ-мембрана 5 500 м²", meta: "срочно", status: "danger" },
          { label: "Биполь ЭПП 1 200 м²", meta: "к 16.05" },
          { label: "Утеплитель XPS 850 м³", meta: "к 18.05" },
          { label: "+9 заявок поменьше" },
        ],
      },
      {
        icon: "calendar-clock",
        title: "Поставки сегодня",
        primary: { value: "3", label: "грузовика" },
        items: [
          { label: "Технониколь — мембрана", meta: "09:30" },
          { label: "Стройдвор — саморезы", meta: "14:00" },
          { label: "ПИК-крепёж — анкера", meta: "16:30" },
        ],
      },
      {
        icon: "alert-triangle",
        title: "Просроченные заказы",
        accent: "danger",
        items: [
          { label: "Битум БНК", meta: "2 дня", status: "danger" },
          { label: "Грунт ТехноНИКОЛЬ", meta: "3 дня", status: "danger" },
        ],
      },
      {
        icon: "credit-card",
        title: "Заявки на оплату",
        primary: { value: "8", label: "на согласовании" },
        items: [
          { label: "ООО «Технониколь»", meta: "1 250 000 ₽" },
          { label: "ИП Иванов", meta: "320 000 ₽" },
          { label: "ООО «ПИК-крепёж»", meta: "180 000 ₽" },
          { label: "+5 заявок поменьше" },
        ],
      },
      {
        icon: "users",
        title: "Контрагенты с долгами",
        items: [
          { label: "ООО «Стройдвор»", meta: "450 000 ₽ / 45 дней", status: "warning" },
          { label: "ИП Воронин", meta: "180 000 ₽ / 20 дней", status: "neutral" },
        ],
      },
      {
        icon: "package",
        title: "Складские остатки",
        items: [
          { label: "ПВХ-мембрана", meta: "320 м² (на 1 день)", status: "danger" },
          { label: "Саморезы", meta: "12 кг (норма)", status: "neutral" },
          { label: "Утеплитель", meta: "180 м³ (на 5 дней)", status: "neutral" },
        ],
      },
    ],
  },
];

export const scenarioById = (id: Scenario["id"]): Scenario =>
  scenarios.find((s) => s.id === id) ?? scenarios[0];
