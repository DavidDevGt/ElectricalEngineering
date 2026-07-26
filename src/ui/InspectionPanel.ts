import type { InspectionData } from "../domain/types";

/**
 * Panel de inspección genérico: renderiza cualquier `InspectionData` sin conocer de qué
 * componente viene — el mismo panel sirve para el transformador, el interruptor, el seccionador
 * y cada componente que se agregue después (docs/how-to/agregar-un-componente-3d.md).
 *
 * Separa el contenido en dos niveles: **siempre visible** (título, subtítulo, botones de
 * maniobra, el control "extra" si lo hay) y **colapsable** (la tabla completa de datos técnicos
 * + el enlace a la investigación). En mobile, una card con las 9-11 filas de un componente como
 * la malla de tierra o el relé ocupaba más de la mitad de la pantalla y tapaba la escena/
 * interfería con arrastrar la cámara — colapsar el detalle por defecto en pantallas angostas
 * resuelve eso sin perder la información (queda a un toque de distancia).
 */
export class InspectionPanel {
  readonly element: HTMLDivElement;

  private readonly emptyEl: HTMLElement;
  private readonly contentEl: HTMLElement;
  private readonly titleEl: HTMLElement;
  private readonly subtitleEl: HTMLElement;
  private readonly actionsEl: HTMLElement;
  private readonly extraEl: HTMLElement;
  private readonly toggleEl: HTMLButtonElement;
  private readonly detailsEl: HTMLElement;
  private readonly rowsEl: HTMLElement;
  private readonly referenceEl: HTMLAnchorElement;

  private collapsed = false;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "panel panel--inspection";
    this.element.innerHTML = `
      <p class="panel__empty" data-role="empty">Haz click en un componente del patio para inspeccionarlo.</p>
      <div data-role="content" class="panel__content" hidden>
        <h1 data-role="title"></h1>
        <div class="panel__subtitle" data-role="subtitle"></div>
        <div class="panel__actions" data-role="actions"></div>
        <div data-role="extra"></div>
        <button class="panel__toggle" data-role="toggle" type="button" aria-expanded="true"></button>
        <div class="panel__details" data-role="details">
          <dl data-role="rows"></dl>
          <a class="panel__reference" data-role="reference" target="_blank" rel="noopener"></a>
        </div>
      </div>
    `;

    this.emptyEl = this.query("[data-role='empty']");
    this.contentEl = this.query("[data-role='content']");
    this.titleEl = this.query("[data-role='title']");
    this.subtitleEl = this.query("[data-role='subtitle']");
    this.actionsEl = this.query("[data-role='actions']");
    this.extraEl = this.query("[data-role='extra']");
    this.toggleEl = this.query<HTMLButtonElement>("[data-role='toggle']");
    this.detailsEl = this.query("[data-role='details']");
    this.rowsEl = this.query("[data-role='rows']");
    this.referenceEl = this.query<HTMLAnchorElement>("[data-role='reference']");

    this.toggleEl.addEventListener("click", () => this.setCollapsed(!this.collapsed));
  }

  private query<T extends HTMLElement>(selector: string): T {
    const el = this.element.querySelector<T>(selector);
    if (!el) throw new Error(`InspectionPanel: no se encontró "${selector}"`);
    return el;
  }

  /**
   * Actualiza título, subtítulo, filas, acciones y referencia — **no** toca el slot "extra" ni
   * el estado colapsado/expandido (ver `setExtra` y `setCollapsed`). Se llama en cada refresco de
   * datos (ej. tras mover un slider o maniobrar un interruptor), a diferencia de `setCollapsed`,
   * que solo debe llamarse al cambiar la selección — si esta función reconstruyera el slider del
   * transformador o reiniciara el colapso en cada refresco, se perdería el nodo DOM a mitad de un
   * arrastre y la card se cerraría sola mientras el usuario la está leyendo.
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

    // Si no hay nada que colapsar (ni filas ni referencia), el botón de detalle sobra.
    const hasDetails = data.rows.length > 0 || Boolean(data.reference);
    this.toggleEl.hidden = !hasDetails;
    if (!hasDetails) this.detailsEl.hidden = true;
    else this.detailsEl.hidden = this.collapsed;
    this.updateToggleLabel();
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

  /**
   * Colapsa u oculta la tabla de detalle completa, dejando visibles título/subtítulo/acciones/
   * control extra. Llamar solo al cambiar de selección (típicamente `true` en pantallas angostas,
   * `false` en desktop) — nunca desde `show()`, para no cerrar la card mientras el usuario la está
   * leyendo tras un simple refresco de datos.
   */
  setCollapsed(collapsed: boolean): void {
    this.collapsed = collapsed;
    if (!this.toggleEl.hidden) this.detailsEl.hidden = collapsed;
    this.updateToggleLabel();
  }

  private updateToggleLabel(): void {
    this.toggleEl.textContent = this.collapsed ? "Ver detalles ▾" : "Ocultar detalles ▴";
    this.toggleEl.setAttribute("aria-expanded", String(!this.collapsed));
  }
}
