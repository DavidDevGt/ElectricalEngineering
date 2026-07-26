import type { InspectionData } from "../domain/types";

/**
 * Panel de inspección genérico: renderiza cualquier `InspectionData` sin conocer de qué
 * componente viene — el mismo panel sirve para el transformador, el interruptor, el seccionador
 * y cada componente que se agregue después (docs/how-to/agregar-un-componente-3d.md).
 */
export class InspectionPanel {
  readonly element: HTMLDivElement;

  private readonly emptyEl: HTMLElement;
  private readonly contentEl: HTMLElement;
  private readonly titleEl: HTMLElement;
  private readonly subtitleEl: HTMLElement;
  private readonly rowsEl: HTMLElement;
  private readonly actionsEl: HTMLElement;
  private readonly extraEl: HTMLElement;
  private readonly referenceEl: HTMLAnchorElement;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "panel panel--inspection";
    this.element.innerHTML = `
      <p class="panel__empty" data-role="empty">Haz click en un componente del patio para inspeccionarlo.</p>
      <div data-role="content" class="panel__content" hidden>
        <h1 data-role="title"></h1>
        <div class="panel__subtitle" data-role="subtitle"></div>
        <dl data-role="rows"></dl>
        <div class="panel__actions" data-role="actions"></div>
        <div data-role="extra"></div>
        <a class="panel__reference" data-role="reference" target="_blank" rel="noopener"></a>
      </div>
    `;

    this.emptyEl = this.query("[data-role='empty']");
    this.contentEl = this.query("[data-role='content']");
    this.titleEl = this.query("[data-role='title']");
    this.subtitleEl = this.query("[data-role='subtitle']");
    this.rowsEl = this.query("[data-role='rows']");
    this.actionsEl = this.query("[data-role='actions']");
    this.extraEl = this.query("[data-role='extra']");
    this.referenceEl = this.query<HTMLAnchorElement>("[data-role='reference']");
  }

  private query<T extends HTMLElement>(selector: string): T {
    const el = this.element.querySelector<T>(selector);
    if (!el) throw new Error(`InspectionPanel: no se encontró "${selector}"`);
    return el;
  }

  /**
   * Actualiza título, subtítulo, filas, acciones y referencia — **no** toca el slot "extra"
   * (ver `setExtra`). Se llama en cada refresco de datos (ej. tras mover un slider), a
   * diferencia de `setExtra`, que solo debe llamarse al cambiar la selección: si reconstruyera
   * el slider del transformador en cada refresco, se perdería el nodo DOM a mitad de un
   * arrastre y el usuario no podría mover el control con el mouse.
   */
  show(data: InspectionData): void {
    this.emptyEl.hidden = true;
    this.contentEl.hidden = false;

    this.titleEl.textContent = data.title;
    this.subtitleEl.textContent = data.subtitle ?? "";
    this.subtitleEl.hidden = !data.subtitle;

    this.rowsEl.innerHTML = "";
    for (const row of data.rows) {
      const dt = document.createElement("dt");
      dt.textContent = row.label;
      const dd = document.createElement("dd");
      dd.textContent = row.value;
      dd.dataset.tone = row.tone ?? "neutral";
      if (row.hint) dd.title = row.hint;
      this.rowsEl.append(dt, dd);
    }

    this.actionsEl.innerHTML = "";
    for (const action of data.actions ?? []) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = action.label;
      button.disabled = Boolean(action.disabled);
      button.addEventListener("click", action.run);
      this.actionsEl.append(button);
    }
    this.actionsEl.hidden = (data.actions ?? []).length === 0;

    if (data.reference) {
      this.referenceEl.textContent = `${data.reference.text} →`;
      this.referenceEl.href = data.reference.href;
      this.referenceEl.hidden = false;
    } else {
      this.referenceEl.hidden = true;
    }
  }

  clear(): void {
    this.emptyEl.hidden = false;
    this.contentEl.hidden = true;
    this.setExtra(null);
  }

  /** Control extra específico de un componente (ej. el slider de carga del transformador).
   * Llamar solo al cambiar de selección — ver nota en `show()`. */
  setExtra(element: HTMLElement | null): void {
    this.extraEl.innerHTML = "";
    if (element) this.extraEl.appendChild(element);
  }
}
