import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.hero}>
      <section className={styles.panel}>
        <div className={styles.intro}>
          <span className={styles.badge}>Верстак — облік зарплат меблевих бригад</span>
          <h1>Прозорий інтерфейс для контролю робочих результатів.</h1>
          <p className={styles.description}>
            Реєструйте збирання меблів, дивіться місячні підсумки та керуйте каталогом у зрозумілому та концентрованому UI.
          </p>
          <div className={styles.actions}>
            <Link href="/login" className={styles.primary}>
              Увійти
            </Link>
            <Link href="/register" className={styles.secondary}>
              Реєстрація
            </Link>
          </div>
        </div>
        <aside className={styles.visual}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Прибуток за місяць</span>
            <strong className={styles.metricValue}>₴ 62 400</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Деталі зібрано</span>
            <strong className={styles.metricValue}>16 позицій</strong>
          </div>
        </aside>
      </section>
    </main>
  );
}
