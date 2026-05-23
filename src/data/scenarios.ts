/**
 * Контент интерактивного дашборда «Пульс компании сегодня».
 * Пять продуктовых модулей — взгляд собственника на оперативную картину подряда:
 * объекты в риске, согласование оплат, материалы, документы ПТО/КС, ИИ-сводка.
 * Данные мокап-уровня, иллюстрируют типичный набор задач. Стиль карточек 1-в-1
 * с UI-kit Юры (Main #202F4D, Red_01 #FF3A4A, Gray_01-03, line-icons из Icon.astro).
 * Подача — финансовые потери и контроль (линия Артёма/Наиля), без обещаний по ИИ.
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
  id: string;
  label: string;
  subtitle: string;
  aiSummary: string;
  cards: Card[];
};

export const scenarios: Scenario[] = [
  {
    id: "objects",
    label: "Объекты в риске",
    subtitle: "Где горят сроки и деньги — по всем объектам сразу",
    aiSummary:
      "По компании 2 объекта в красной зоне по графику. Где-то теряются объёмы и сроки сдачи — это видно до того, как заказчик начнёт штрафовать.",
    cards: [
      {
        icon: "building",
        title: "Объекты в красной зоне",
        primary: { value: "3", label: "из 12 объектов" },
        accent: "danger",
        items: [
          { label: "ЖК «Альянс»", meta: "отставание 8 дней", status: "danger" },
          { label: "ЖК «Северный»", meta: "перерасход +12%", status: "warning" },
          { label: "Школа №48", meta: "сдача под вопросом", status: "warning" },
        ],
      },
      {
        icon: "trending-up",
        title: "Выполнение по графику",
        primary: { value: "67%", label: "среднее по компании" },
        items: [
          { label: "1 объект в красной зоне", status: "danger" },
          { label: "2 объекта в жёлтой зоне", status: "warning" },
          { label: "9 объектов идут по плану", status: "neutral" },
        ],
      },
      {
        icon: "alert-triangle",
        title: "Где теряются деньги",
        accent: "danger",
        items: [
          { label: "Невыполнение в срок → штрафы", meta: "2 объекта", status: "danger" },
          { label: "Объём не закрыт, а оплачен", meta: "1 объект", status: "warning" },
          { label: "Аванс бригаде сверх факта", meta: "проверить", status: "warning" },
        ],
      },
    ],
  },

  {
    id: "payments",
    label: "Согласование оплат",
    subtitle: "Кому платить сегодня, где кассовый риск, что зависло",
    aiSummary:
      "К согласованию 2,35 млн ₽. Часть счетов можно оплатить частями — в реестре это видно сразу, не нужно дробить вручную.",
    cards: [
      {
        icon: "credit-card",
        title: "Заявки на оплату",
        primary: { value: "2 350 000 ₽", label: "к согласованию" },
        accent: "primary",
        items: [
          { label: "ООО «Технониколь»", meta: "1 250 000 ₽" },
          { label: "ИП Иванов", meta: "320 000 ₽" },
          { label: "+6 заявок поменьше" },
        ],
      },
      {
        icon: "file-signature",
        title: "Счета заказчикам",
        items: [
          { label: "5 счетов просрочены > 30 дней", status: "danger" },
          { label: "2 акта ждут подписи", status: "warning" },
          { label: "1 КС-3 готов к отправке", status: "neutral" },
        ],
      },
      {
        icon: "calendar-clock",
        title: "Платёжный календарь",
        primary: { value: "4", label: "платежа на неделе" },
        items: [
          { label: "Частичная оплата по счёту", meta: "реестр готов" },
          { label: "Отсрочка по 2 поставщикам", meta: "до 25.05" },
          { label: "Кассовый риск", meta: "пятница", status: "warning" },
        ],
      },
    ],
  },

  {
    id: "materials",
    label: "Материалы",
    subtitle: "Что заказано, что не заказано, где перерасход",
    aiSummary:
      "12 заявок на материалы ждут решения, 3 поставки сегодня. По мембране остаток на складе — на один день, стоит заказать заранее.",
    cards: [
      {
        icon: "package",
        title: "Заявки на материалы",
        primary: { value: "12", label: "новых заявок" },
        items: [
          { label: "ПВХ-мембрана 5 500 м²", meta: "срочно", status: "danger" },
          { label: "Биполь ЭПП 1 200 м²", meta: "к 16.05" },
          { label: "+10 заявок поменьше" },
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
        title: "Складские остатки",
        accent: "warning",
        items: [
          { label: "ПВХ-мембрана", meta: "на 1 день", status: "danger" },
          { label: "Утеплитель XPS", meta: "на 5 дней", status: "neutral" },
          { label: "Перерасход по объекту", meta: "ЖК «Северный»", status: "warning" },
        ],
      },
    ],
  },

  {
    id: "docs",
    label: "Документы ПТО / КС",
    subtitle: "КС-2/КС-3, акты и письма — с историей изменений",
    aiSummary:
      "5 документов у заказчика зависли. Закрытые акты защищены: видно, кто и когда их менял — переписать задним числом незаметно нельзя.",
    cards: [
      {
        icon: "file-signature",
        title: "Документы у заказчика",
        accent: "danger",
        items: [
          { label: "5 счетов > 30 дней без оплаты", status: "danger" },
          { label: "2 акта ждут подписи", status: "warning" },
          { label: "1 КС-3 готов к отправке", status: "neutral" },
        ],
      },
      {
        icon: "check",
        title: "Закрытие работ",
        primary: { value: "100%", label: "с историей изменений" },
        items: [
          { label: "Кто и когда менял акт — видно" },
          { label: "Закрытые КС защищены от правок" },
          { label: "Журнал работ по каждому объекту" },
        ],
      },
      {
        icon: "message-square",
        title: "Письма и претензии",
        items: [
          { label: "Черновик письма заказчику", meta: "помощник, ранний доступ" },
          { label: "Фиксация договорных нарушений" },
          { label: "Шаблоны актов и претензий" },
        ],
      },
    ],
  },

  {
    id: "ai",
    label: "ИИ-сводка",
    subtitle: "Встроенный помощник подсвечивает риски — на данных вашей компании",
    aiSummary:
      "Помощник в ранней разработке: подсвечивает отставания, риски по материалам и зависшие оплаты. Работает только на данных вашей компании, без выхода в интернет.",
    cards: [
      {
        icon: "sparkles",
        title: "Что заметил помощник",
        accent: "primary",
        items: [
          { label: "Отставание по ГПР на «Альянсе»", status: "danger" },
          { label: "Материал не заказан, срок подходит", status: "warning" },
          { label: "Заявка на оплату зависла 4 дня", status: "warning" },
        ],
      },
      {
        icon: "alert-triangle",
        title: "Риски на сегодня",
        items: [
          { label: "Объект уходит в минус по марже", status: "danger" },
          { label: "Срыв поставки тянет сроки", status: "warning" },
          { label: "Спор по допработам без фиксации", status: "warning" },
        ],
      },
      {
        icon: "check",
        title: "Как это задумано",
        items: [
          { label: "Подсказывает — решение за вами" },
          { label: "Только данные вашей компании" },
          { label: "Подключается поэтапно, ранний доступ" },
        ],
      },
    ],
  },
];

export const scenarioById = (id: string): Scenario =>
  scenarios.find((s) => s.id === id) ?? scenarios[0];
