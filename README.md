# Верстак — Frontend

Цей фронтенд реалізований на Next.js 16 App Router та інтегрується з бекендом, який працює через JWT, refresh токени та REST API.

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
  - `app/(auth)/login` — сторінка входу
  - `app/(auth)/register` — сторінка реєстрації
  - `app/(dashboard)/worker` — дашборд працівника
  - `app/(dashboard)/admin` — адмінський дашборд
- `components/` — UI-примітиви та загальні компоненти
  - `components/ui/` — кнопки, інпут, селект, картка
  - `components/layout/TopNav.tsx` — верхня навігація
  - `components/auth/ProtectedPage.tsx` — клієнтський захист роута
- `lib/` — утиліти, API-клієнт, стейт
  - `lib/api/` — централізований `apiFetch` та endpoint-функції
  - `lib/store/auth.ts` — Zustand сховище для auth
  - `lib/types.ts` — спільні типи

## Технічні деталі

- `@tanstack/react-query` — запити, кешування, мутації
- `zustand` — auth-стан
- CSS Modules (`*.module.css`) для стилізації компонентів
- `next/font` для IBM Plex Mono в цифрових значеннях
- Protected routes реалізовані клієнтським компонентом з редіректом на `/login`

## Що реалізовано

- Стартова сторінка з описом сервісу
- Логін / реєстрація з клієнтською валідацією
- Інтерактивний дашборд worker для створення записів і перегляду історії
- Адмінський інтерфейс для CRUD каталогу та перегляду записів всіх працівників
- Централізований fetch wrapper з підстановкою access token і автоматичним refresh
- Візуальний стиль у кольорах «ink / paper / bench» з моноширинними сумами

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
