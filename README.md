# Верстак — Frontend

Цей фронтенд реалізований на Next.js 16 App Router та працює з REST API бекенду. Застосунок однокористувацький: реєстрації немає, вхід — одним обліковим записом, логін і пароль якого задаються на бекенді (`APP_LOGIN` / `APP_PASSWORD`).

## Запуск

1. Встановіть залежності:

```bash
npm install
```

2. Запустіть локально:

```bash
npm run dev
```

3. Відкрийте [http://localhost:3000](http://localhost:3000).

## Налаштування

Використовуйте змінну середовища для адреси API:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-host/api
```

За замовчуванням фронтенд звертається до `https://furniture-salary-tracker-beckend.onrender.com/api`.

## Структура проекту

- `app/` — маршрути та сторінки
  - `app/page.tsx` — записи робіт, фільтр періоду та підсумок зарплати
  - `app/catalog` — каталог меблів і цін
  - `app/login` — сторінка входу
- `components/` — UI-примітиви та загальні компоненти
  - `components/ui/` — кнопки, інпут, комбобокс, картка
  - `components/layout/TopNav.tsx` — верхня навігація та вихід
  - `components/auth/AuthGate.tsx` — без токена пускає лише на `/login`
- `lib/` — утиліти, API-клієнт, стейт
  - `lib/api/` — централізований `apiFetch` та endpoint-функції
  - `lib/store/locale.ts` — Zustand сховище мови інтерфейсу
  - `lib/store/auth.ts` — токен входу (localStorage)
  - `lib/types.ts` — спільні типи

## Технічні деталі

- `@tanstack/react-query` — запити, кешування, мутації
- `zustand` — вибрана мова (UA / PL / EN) і токен входу
- CSS Modules (`*.module.css`) для стилізації компонентів
- `next/font` для IBM Plex Mono в цифрових значеннях

## Що реалізовано

- Вхід за логіном і паролем; токен діє 30 днів, при 401 — повернення на `/login`
- Записи робіт: додавання, історія з режимом редагування, підсумок зарплати за період
- CRUD каталогу меблів
- Перемикач мов UA / PL / EN
- Централізований fetch wrapper: додає токен, перекладає помилку мережі
- Візуальний стиль у кольорах «ink / paper / bench» з моноширинними сумами

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
