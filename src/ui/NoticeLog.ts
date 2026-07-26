export type NoticeLevel = "info" | "success" | "warning" | "danger";

interface Notice {
  readonly id: number;
  readonly level: NoticeLevel;
  readonly message: string;
  readonly element: HTMLLIElement;
  /** Handle del temporizador de auto-descarte activo, o `null` si está en pausa (hover) o ya se
   * descartó — nunca debe quedar un timer corriendo sin una entrada aquí que lo referencie. */
  timer: ReturnType<typeof setTimeout> | null;
  /** Tiempo restante hasta el auto-descarte, en ms. Se recalcula al pausar por hover para poder
   * reanudar desde donde quedó, no desde el principio. */
  remainingMs: number;
  /** `performance.now()` de cuándo arrancó/reanudó el temporizador actual — junto con
   * `remainingMs`, es lo que permite pausar/reanudar sin perder precisión. */
  startedAt: number;
}

/** Duración de auto-descarte por nivel. Los avisos de bloqueo de enclavamiento (`danger`) llevan
 * la explicación más importante del modo maniobra (investigaciones/11 §3, ciclo POE) — se quedan
 * más tiempo en pantalla que una simple confirmación. */
const DURATION_MS: Record<NoticeLevel, number> = {
  info: 4500,
  success: 4500,
  warning: 7000,
  danger: 8000,
};

/** Debe ser ≤ la duración de la transición CSS de `.notice-log__item--leaving` (ver style.css) —
 * el nodo se retira del DOM cuando la animación de salida ya terminó visualmente. */
const LEAVE_TRANSITION_MS = 200;

/**
 * Registro visual de eventos "notice" del dominio (investigaciones/11 §5: el feedback debe
 * explicar el porqué, no solo "correcto/incorrecto" — cada notice del dominio ya trae el mensaje
 * completo, incluida la razón cuando el enclavamiento bloquea una maniobra).
 *
 * El arreglo `notices` es la fuente de verdad del estado; el DOM es una proyección de él, nunca
 * al revés. Cada notice es, en esencia, un temporizador vivo con tres formas de terminar
 * (expiración natural, cierre manual, desalojo por límite de items) y una de pausarse (hover) —
 * esta clase existe para que esas transiciones nunca dejen un timer huérfano corriendo sobre un
 * nodo ya eliminado, ni dupliquen avisos idénticos ante un click repetido.
 */
export class NoticeLog {
  readonly element: HTMLDivElement;

  private readonly listEl: HTMLElement;
  private readonly maxItems: number;
  private readonly notices: Notice[] = [];
  private nextId = 1;

  constructor(maxItems = 5) {
    this.maxItems = maxItems;
    this.element = document.createElement("div");
    this.element.className = "notice-log";
    this.listEl = document.createElement("ul");
    this.element.appendChild(this.listEl);
  }

  push(level: NoticeLevel, message: string): void {
    // Deduplicación: un click repetido contra el mismo enclavamiento bloqueado no debe apilar el
    // mismo aviso varias veces (y desalojar avisos distintos en el proceso) — solo reinicia el
    // temporizador del más reciente y lo resalta.
    const mostRecent = this.notices[0];
    if (mostRecent && mostRecent.level === level && mostRecent.message === message) {
      this.restartTimer(mostRecent);
      this.pulse(mostRecent.element);
      return;
    }

    const id = this.nextId++;
    const element = this.buildElement(id, level, message);
    const notice: Notice = {
      id,
      level,
      message,
      element,
      timer: null,
      remainingMs: DURATION_MS[level],
      startedAt: 0,
    };

    this.notices.unshift(notice);
    this.listEl.prepend(element);
    this.restartTimer(notice);

    while (this.notices.length > this.maxItems) {
      const oldest = this.notices[this.notices.length - 1];
      if (!oldest) break;
      this.dismiss(oldest.id, { immediate: true });
    }
  }

  private buildElement(id: number, level: NoticeLevel, message: string): HTMLLIElement {
    const item = document.createElement("li");
    item.className = `notice-log__item notice-log__item--${level}`;

    const text = document.createElement("span");
    text.className = "notice-log__text";
    text.textContent = message;
    item.appendChild(text);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "notice-log__close";
    closeButton.setAttribute("aria-label", "Descartar aviso");
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => this.dismiss(id));
    item.appendChild(closeButton);

    // Pausar en hover: un usuario leyendo la razón de un bloqueo no debería perder el aviso solo
    // porque tardó en leerlo — mismo principio que cualquier toast bien comportado.
    item.addEventListener("mouseenter", () => this.pauseTimer(id));
    item.addEventListener("mouseleave", () => this.resumeTimer(id));

    return item;
  }

  private indexOf(id: number): number {
    return this.notices.findIndex((notice) => notice.id === id);
  }

  private restartTimer(notice: Notice): void {
    if (notice.timer !== null) clearTimeout(notice.timer);
    notice.remainingMs = DURATION_MS[notice.level];
    notice.startedAt = performance.now();
    notice.timer = setTimeout(() => this.dismiss(notice.id), notice.remainingMs);
  }

  private pauseTimer(id: number): void {
    const notice = this.notices[this.indexOf(id)];
    if (!notice || notice.timer === null) return;
    clearTimeout(notice.timer);
    notice.timer = null;
    notice.remainingMs = Math.max(0, notice.remainingMs - (performance.now() - notice.startedAt));
  }

  private resumeTimer(id: number): void {
    const notice = this.notices[this.indexOf(id)];
    if (!notice || notice.timer !== null) return;
    notice.startedAt = performance.now();
    notice.timer = setTimeout(() => this.dismiss(notice.id), notice.remainingMs);
  }

  private pulse(element: HTMLLIElement): void {
    element.classList.remove("notice-log__item--pulse");
    void element.offsetWidth; // fuerza reflow para poder re-disparar la animación si ya corría
    element.classList.add("notice-log__item--pulse");
  }

  /**
   * Retira un notice: cancela su temporizador (si lo hay) y lo saca del estado interno de
   * inmediato — el DOM sigue la transición de salida un instante más, salvo `immediate` (usado
   * al desalojar por límite de items, donde no vale la pena animar una salida que el usuario
   * probablemente no está mirando).
   */
  private dismiss(id: number, options: { immediate?: boolean } = {}): void {
    const index = this.indexOf(id);
    if (index === -1) return;
    const notice = this.notices[index];
    this.notices.splice(index, 1);
    if (!notice) return;
    if (notice.timer !== null) clearTimeout(notice.timer);

    if (options.immediate) {
      notice.element.remove();
      return;
    }
    notice.element.classList.add("notice-log__item--leaving");
    setTimeout(() => notice.element.remove(), LEAVE_TRANSITION_MS);
  }

  /** Cancela todos los temporizadores pendientes y limpia el DOM. No hace falta en el ciclo de
   * vida actual (una SPA de una sola escena que nunca se desmonta), pero evita timers huérfanos
   * si en el futuro el simulador reinicia o reemplaza su escena sin recargar la página. */
  dispose(): void {
    for (const notice of this.notices) {
      if (notice.timer !== null) clearTimeout(notice.timer);
    }
    this.notices.length = 0;
    this.listEl.innerHTML = "";
  }
}
