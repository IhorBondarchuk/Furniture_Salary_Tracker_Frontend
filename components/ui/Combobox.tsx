'use client';

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import styles from "./Combobox.module.css";

export interface ComboboxOption {
  id: string;
  name: string;
  hint?: string;
}

interface ComboboxProps {
  label?: string;
  "aria-label"?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  error?: string;
  // false — список у потоці документа (напр. у таблиці з overflow, де випадаючий список обрізався б)
  floating?: boolean;
}

// Пошук без урахування регістру та діакритики: "lozko" знайде "Łóżko"
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l");
}

export function Combobox({
  label,
  "aria-label": ariaLabel,
  options,
  value,
  onChange,
  placeholder = "Почніть вводити назву",
  error,
  floating = true,
}: ComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((option) => option.id === value);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return needle ? options.filter((option) => normalize(option.name).includes(needle)) : options;
  }, [options, query]);

  const openList = () => {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  };

  const choose = (option: ComboboxOption) => {
    onChange(option.id);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (filtered.length ? (index + step + filtered.length) % filtered.length : 0));
    } else if (event.key === "Enter" && open) {
      // не надсилаємо форму, поки список відкритий
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) choose(option);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className={styles.control}>
        <input
          id={id}
          className={styles.input}
          type="text"
          role="combobox"
          aria-label={label ? undefined : ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[activeIndex] ? `${id}-${filtered[activeIndex].id}` : undefined}
          autoComplete="off"
          // закритий — показує вибрану позицію, відкритий — текст пошуку
          value={open ? query : (selected?.name ?? "")}
          placeholder={open && selected ? selected.name : placeholder}
          onFocus={openList}
          onClick={() => {
            if (!open) openList();
          }}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {open ? (
          <ul id={listId} role="listbox" className={cn(styles.list, floating && styles.floating)}>
            {filtered.length ? (
              filtered.map((option, index) => (
                <li
                  key={option.id}
                  id={`${id}-${option.id}`}
                  role="option"
                  aria-selected={option.id === value}
                  className={cn(
                    styles.option,
                    index === activeIndex && styles.active,
                    option.id === value && styles.selected,
                  )}
                  // mouseDown замість click, щоб вибір спрацював до blur поля
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span>{option.name}</span>
                  {option.hint ? <span className={styles.hint}>{option.hint}</span> : null}
                </li>
              ))
            ) : (
              <li className={styles.empty}>Нічого не знайдено</li>
            )}
          </ul>
        ) : null}
      </div>
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}
