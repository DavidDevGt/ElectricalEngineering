export type NoticeLevel = "info" | "success" | "warning" | "danger";

/**
 * Registro visual de eventos "notice" del dominio (investigaciones/11 §5: el feedback debe
 * explicar el porqué, no solo "correcto/incorrecto" — cada notice del dominio ya trae el mensaje
 * completo, incluida la razón cuando el enclavamiento bloquea una maniobra).
 */
export class NoticeLog {
  readonly element: HTMLDivElement;
  private readonly listEl: HTMLElement;
  private readonly maxItems: number;

  constructor(maxItems = 5) {
    this.maxItems = maxItems;
    this.element = document.createElement("div");
    this.element.className = "notice-log";
    this.listEl = document.createElement("ul");
    this.element.appendChild(this.listEl);
  }

  push(level: NoticeLevel, message: string): void {
    const item = document.createElement("li");
    item.className = `notice-log__item notice-log__item--${level}`;
    item.textContent = message;
    this.listEl.prepend(item);

    while (this.listEl.children.length > this.maxItems) {
      this.listEl.lastElementChild?.remove();
    }
  }
}
