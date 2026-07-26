/**
 * Datos de placa de un transformador de potencia.
 * Ver investigaciones/01-transformadores-potencia.md para la derivación de cada fórmula
 * usada por esta clase.
 */
export interface TransformerRatings {
  /** Potencia nominal, en MVA. */
  ratedPowerMVA: number;
  /** Impedancia de cortocircuito, en % (investigaciones/01 §4). Limita la corriente de falla. */
  impedancePercent: number;
  /** Pérdidas en el hierro a tensión nominal — prácticamente constantes con la carga (§3.1). */
  ironLossKW: number;
  /** Pérdidas en el cobre a carga nominal (load factor = 1); escalan con x² bajo carga (§3.2). */
  copperLossAtRatedLoadKW: number;
  /** Grupo de conexión (IEC 60076-1), ej. "YNd11" (§2.2) — solo informativo en esta versión. */
  vectorGroup: string;
}

/**
 * Modelo de dominio de un transformador de potencia. Sin dependencia de Three.js
 * (ver docs/adr/0002-separacion-modelo-dominio-render.md) — testeable sin WebGL.
 */
export class Transformer {
  readonly ratings: TransformerRatings;

  /** Factor de carga (x): 0 = sin carga, 1 = carga nominal. Puede superar 1 (sobrecarga). */
  private loadFactor = 0;

  constructor(ratings: TransformerRatings) {
    this.ratings = ratings;
  }

  setLoadFactor(x: number): void {
    this.loadFactor = Math.max(0, x);
  }

  getLoadFactor(): number {
    return this.loadFactor;
  }

  /** Pérdidas en el cobre actuales: P_Cu(x) = x² · P_Cu,nominal (investigaciones/01 §3.2). */
  get copperLossKW(): number {
    return this.loadFactor ** 2 * this.ratings.copperLossAtRatedLoadKW;
  }

  /** Pérdidas en el hierro: aprox. constantes con la carga (§3.1). */
  get ironLossKW(): number {
    return this.ratings.ironLossKW;
  }

  /** Potencia de salida aproximada, en MW (asume factor de potencia unitario — simplificación
   * de este MVP; un modelo futuro debería incorporar cos φ explícitamente). */
  get outputPowerMW(): number {
    return this.ratings.ratedPowerMVA * this.loadFactor;
  }

  /** Eficiencia: η(x) = P_salida / (P_salida + P_Fe + P_Cu(x)) (§3.3). */
  get efficiency(): number {
    const outputKW = this.outputPowerMW * 1000;
    const totalLossKW = this.ironLossKW + this.copperLossKW;
    if (outputKW + totalLossKW === 0) return 0;
    return outputKW / (outputKW + totalLossKW);
  }

  /** Factor de carga de eficiencia máxima: x_óptimo = √(P_Fe / P_Cu,nominal) (§3.3). */
  get optimalLoadFactor(): number {
    return Math.sqrt(this.ratings.ironLossKW / this.ratings.copperLossAtRatedLoadKW);
  }

  /** Corriente de falla aproximada, en múltiplos de la corriente nominal:
   * I_falla = I_nominal × (100/%Z) (§4.2). Desprecia la impedancia de red aguas arriba. */
  get faultCurrentMultipleOfRated(): number {
    return 100 / this.ratings.impedancePercent;
  }
}
