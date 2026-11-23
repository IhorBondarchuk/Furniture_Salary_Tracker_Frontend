export type Locale = "uk" | "pl" | "en";

export const LOCALES: { code: Locale; label: string; name: string }[] = [
  { code: "uk", label: "UA", name: "Українська" },
  { code: "pl", label: "PL", name: "Polski" },
  { code: "en", label: "EN", name: "English" },
];

// Тег для Intl: формат дат і чисел відповідно до мови інтерфейсу
export const INTL_LOCALES: Record<Locale, string> = {
  uk: "uk-UA",
  pl: "pl-PL",
  en: "en-GB",
};

const uk = {
  meta: {
    title: "Верстак — облік зарплат меблевих бригад",
  },
  language: {
    label: "Мова",
  },
  nav: {
    records: "Записи",
    catalog: "Каталог",
    logout: "Вийти",
  },
  auth: {
    title: "Вхід до Верстака",
    subtitle: "Увійдіть, щоб вести облік робіт і каталог.",
    login: "Логін",
    password: "Пароль",
    submit: "Увійти",
    checking: "Перевірка входу...",
    errors: {
      loginRequired: "Введіть логін",
      passwordRequired: "Введіть пароль",
    },
    server: {
      wrongCredentials: "Невірний логін або пароль",
      tooManyAttempts: "Забагато спроб входу. Спробуйте за 15 хвилин.",
    },
  },
  common: {
    brand: "Верстак",
    loading: "Завантаження...",
    saving: "Зберігаємо...",
    save: "Зберегти",
    cancel: "Скасувати",
    edit: "Редагувати",
    delete: "Видалити",
    done: "Готово",
    from: "З",
    to: "До",
    date: "Дата",
    item: "Позиція",
    quantity: "Кількість",
    amount: "Сума",
    actions: "Дії",
    noRecords: "Немає записів за обраний період.",
  },
  combobox: {
    placeholder: "Почніть вводити назву",
    empty: "Нічого не знайдено",
  },
  worker: {
    pretitle: "Облік робіт",
    title: "Мої записи за вибраний період",
    subtitle: "Додавайте нові роботи та дивіться розрахунок зарплати за кожну позицію.",
    earned: "Зароблено",
    recordsCount: "Записів",
    addTitle: "Додати робочий запис",
    addHint: "Позиція з каталогу + кількість + дата",
    addSubmit: "Додати запис",
    filterTitle: "Фільтр періоду",
    filterHint: "Оберіть діапазон дат для розрахунку.",
    historyTitle: "Історія записів",
    period: (from: string, to: string) => `За період ${from} – ${to}`,
    errors: {
      itemRequired: "Оберіть позицію з каталогу",
      quantityInvalid: "Кількість має бути цілим числом, щонайменше 1",
      dateRequired: "Оберіть дату",
    },
    deleteConfirm: (item: string, quantity: number, date: string) =>
      `Видалити запис «${item}» × ${quantity} від ${date}?`,
  },
  catalog: {
    pretitle: "Каталог",
    title: "Позиції та ціни",
    subtitle: "Додавайте та редагуйте меблі, за які нараховується зарплата.",
    addTitle: "Додати позицію",
    catalogTitle: "Каталог меблів",
    itemsCount: (n: number) => `Позицій: ${n}`,
    catalogHint: "Створюйте та редагуйте позиції для розрахунку зарплатні.",
    name: "Назва",
    basePrice: "Базова ціна, zł",
    price: "Ціна, zł",
    addSubmit: "Додати позицію",
    catalogLoading: "Завантаження каталогу…",
    errors: {
      nameRequired: "Введіть назву позиції",
      priceInvalid: "Введіть ціну більшу за 0, наприклад 12,50",
    },
    deleteConfirm: (item: string) => `Видалити позицію «${item}»?`,
  },
  errors: {
    network: "Сервер недоступний. Перевірте з'єднання та спробуйте ще раз.",
  },
};

export type Dictionary = typeof uk;

const pl: Dictionary = {
  meta: {
    title: "Warsztat — rozliczanie wynagrodzeń brygad meblowych",
  },
  language: {
    label: "Język",
  },
  nav: {
    records: "Wpisy",
    catalog: "Katalog",
    logout: "Wyloguj",
  },
  auth: {
    title: "Logowanie do Warsztatu",
    subtitle: "Zaloguj się, aby prowadzić ewidencję prac i katalog.",
    login: "Login",
    password: "Hasło",
    submit: "Zaloguj się",
    checking: "Sprawdzanie logowania...",
    errors: {
      loginRequired: "Podaj login",
      passwordRequired: "Podaj hasło",
    },
    server: {
      wrongCredentials: "Nieprawidłowy login lub hasło",
      tooManyAttempts: "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.",
    },
  },
  common: {
    brand: "Warsztat",
    loading: "Ładowanie...",
    saving: "Zapisywanie...",
    save: "Zapisz",
    cancel: "Anuluj",
    edit: "Edytuj",
    delete: "Usuń",
    done: "Gotowe",
    from: "Od",
    to: "Do",
    date: "Data",
    item: "Pozycja",
    quantity: "Ilość",
    amount: "Kwota",
    actions: "Akcje",
    noRecords: "Brak wpisów w wybranym okresie.",
  },
  combobox: {
    placeholder: "Zacznij wpisywać nazwę",
    empty: "Nic nie znaleziono",
  },
  worker: {
    pretitle: "Ewidencja prac",
    title: "Moje wpisy w wybranym okresie",
    subtitle: "Dodawaj nowe prace i sprawdzaj wyliczenie wynagrodzenia za każdą pozycję.",
    earned: "Zarobiono",
    recordsCount: "Wpisów",
    addTitle: "Dodaj wpis pracy",
    addHint: "Pozycja z katalogu + ilość + data",
    addSubmit: "Dodaj wpis",
    filterTitle: "Filtr okresu",
    filterHint: "Wybierz zakres dat do wyliczenia.",
    historyTitle: "Historia wpisów",
    period: (from: string, to: string) => `Za okres ${from} – ${to}`,
    errors: {
      itemRequired: "Wybierz pozycję z katalogu",
      quantityInvalid: "Ilość musi być liczbą całkowitą, co najmniej 1",
      dateRequired: "Wybierz datę",
    },
    deleteConfirm: (item: string, quantity: number, date: string) =>
      `Usunąć wpis „${item}” × ${quantity} z dnia ${date}?`,
  },
  catalog: {
    pretitle: "Katalog",
    title: "Pozycje i ceny",
    subtitle: "Dodawaj i edytuj meble, za które naliczane jest wynagrodzenie.",
    addTitle: "Dodaj pozycję",
    catalogTitle: "Katalog mebli",
    itemsCount: (n: number) => `Pozycji: ${n}`,
    catalogHint: "Twórz i edytuj pozycje do wyliczania wynagrodzeń.",
    name: "Nazwa",
    basePrice: "Cena bazowa, zł",
    price: "Cena, zł",
    addSubmit: "Dodaj pozycję",
    catalogLoading: "Ładowanie katalogu…",
    errors: {
      nameRequired: "Wpisz nazwę pozycji",
      priceInvalid: "Wpisz cenę większą od 0, np. 12,50",
    },
    deleteConfirm: (item: string) => `Usunąć pozycję „${item}”?`,
  },
  errors: {
    network: "Serwer jest niedostępny. Sprawdź połączenie i spróbuj ponownie.",
  },
};

const en: Dictionary = {
  meta: {
    title: "Workbench — payroll tracking for furniture crews",
  },
  language: {
    label: "Language",
  },
  nav: {
    records: "Records",
    catalog: "Catalog",
    logout: "Sign out",
  },
  auth: {
    title: "Sign in to Workbench",
    subtitle: "Sign in to manage your work log and catalog.",
    login: "Login",
    password: "Password",
    submit: "Sign in",
    checking: "Checking sign-in...",
    errors: {
      loginRequired: "Enter your login",
      passwordRequired: "Enter your password",
    },
    server: {
      wrongCredentials: "Wrong login or password",
      tooManyAttempts: "Too many sign-in attempts. Try again in 15 minutes.",
    },
  },
  common: {
    brand: "Workbench",
    loading: "Loading...",
    saving: "Saving...",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    done: "Done",
    from: "From",
    to: "To",
    date: "Date",
    item: "Item",
    quantity: "Quantity",
    amount: "Amount",
    actions: "Actions",
    noRecords: "No records for the selected period.",
  },
  combobox: {
    placeholder: "Start typing a name",
    empty: "Nothing found",
  },
  worker: {
    pretitle: "Work log",
    title: "My records for the selected period",
    subtitle: "Add new work and see the salary calculation for each item.",
    earned: "Earned",
    recordsCount: "Records",
    addTitle: "Add a work record",
    addHint: "Catalog item + quantity + date",
    addSubmit: "Add record",
    filterTitle: "Period filter",
    filterHint: "Choose a date range for the calculation.",
    historyTitle: "Record history",
    period: (from: string, to: string) => `For the period ${from} – ${to}`,
    errors: {
      itemRequired: "Choose an item from the catalog",
      quantityInvalid: "Quantity must be a whole number, at least 1",
      dateRequired: "Choose a date",
    },
    deleteConfirm: (item: string, quantity: number, date: string) =>
      `Delete the record “${item}” × ${quantity} from ${date}?`,
  },
  catalog: {
    pretitle: "Catalog",
    title: "Items and prices",
    subtitle: "Add and edit the furniture items your salary is calculated from.",
    addTitle: "Add item",
    catalogTitle: "Furniture catalog",
    itemsCount: (n: number) => `${n} items`,
    catalogHint: "Create and edit items used for salary calculation.",
    name: "Name",
    basePrice: "Base price, zł",
    price: "Price, zł",
    addSubmit: "Add item",
    catalogLoading: "Loading catalog…",
    errors: {
      nameRequired: "Enter the item name",
      priceInvalid: "Enter a price greater than 0, e.g. 12.50",
    },
    deleteConfirm: (item: string) => `Delete the item “${item}”?`,
  },
  errors: {
    network: "The server is unavailable. Check your connection and try again.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { uk, pl, en };
