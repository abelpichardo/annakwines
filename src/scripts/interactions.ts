/**
 * Interacciones de cliente de la landing:
 *   - Scroll suave (Lenis) + anclas suaves.
 *   - Nav shrink + barra de progreso de scroll.
 *   - Reveals al entrar en viewport (IntersectionObserver) con stagger.
 *   - Parallax suave del retrato (elementos marcados con `data-parallax`).
 *   - Formulario de contacto (formateo y validación, en `./form.ts`).
 *   - Conmutador de idioma: conserva el hash actual al cambiar de idioma.
 *
 * Respeta `prefers-reduced-motion`: sin scroll suave, sin parallax y con todos
 * los reveals visibles al instante.
 */
import Lenis from 'lenis';
import { initContactForm } from './form';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Añade el hash actual a los enlaces del conmutador de idioma. */
function initLangHashPreservation(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('a[data-lang-link]');
  const apply = (): void => {
    const hash = window.location.hash;
    links.forEach((link) => {
      const base = (link.getAttribute('href') ?? '').split('#')[0];
      link.setAttribute('href', hash ? base + hash : base);
    });
  };
  apply();
  window.addEventListener('hashchange', apply);
}

function init(): void {
  document.body.classList.add('loaded');

  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');

  const onScroll = (): void => {
    const y = window.scrollY || document.documentElement.scrollTop;
    nav?.classList.toggle('shrunk', y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;
    }
  };

  // Scroll suave (Lenis), desactivado con reduced-motion.
  let lenis: Lenis | null = null;
  if (!reduced) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', onScroll);
    const raf = (time: number): void => {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Anclas suaves.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const id = anchor.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -10 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  // Reveals con stagger por hermano.
  const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
  reveals.forEach((el) => {
    const parent = el.parentElement;
    if (!parent) return;
    const siblings = Array.from(parent.querySelectorAll<HTMLElement>(':scope > .reveal'));
    const index = siblings.indexOf(el);
    if (index > 0) el.style.transitionDelay = `${Math.min(index * 0.08, 0.4)}s`;
  });

  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    reveals.forEach((el) => observer.observe(el));
  }

  // Parallax suave del retrato.
  const plate = document.querySelector<HTMLElement>('[data-parallax]');
  if (plate && !reduced) {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const rect = plate.getBoundingClientRect();
          const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.04;
          plate.style.transform = `translateY(${offset.toFixed(1)}px)`;
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  // Formulario de contacto: formateo asistido y validación en línea.
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (form) initContactForm(form);

  initLangHashPreservation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
