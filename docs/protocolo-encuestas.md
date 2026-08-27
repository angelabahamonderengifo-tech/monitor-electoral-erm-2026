# Protocolo de Investigación, Validación e Ingesta de Encuestas (ERM 2026)

Este documento define el estándar operativo para la incorporación sistemática de mediciones de intención de voto en el **Monitor Electoral Territorial - ERM 2026**, asegurando rigor estadístico, trazabilidad metodológica y cumplimiento con las disposiciones del Jurado Nacional de Elecciones (JNE).

---

## 1. Jerarquía de Fuentes y Criterios de Priorización

1. **Nivel 1 (Prioridad Máxima - Top 3 Nacionales):**
   * **Firmas:** IPSOS Perú, DATUM Internacional y CPI.
   * **Criterio:** Máximo rigor técnico, muestreo probabilístico presencial y menor varianza histórica frente a resultados oficiales de la ONPE. Si alguna de estas firmas ha medido la circunscripción, sus resultados encabezan obligatoriamente la data territorial.
2. **Nivel 2 (Estudios Regionales/Distritales Autorizados):**
   * **Criterio:** Aplicable cuando las Top 3 no cubren la jurisdicción. Se admiten **únicamente** encuestadoras con inscripción vigente en el **Registro Electoral de Encuestadoras (REE)** del JNE (ej. IMASOLU, Sensor S.R.L., ICOP Perú, BIGDATA Consultores, Encuestadora Viral).
   * **Obligación:** Toda firma de este nivel debe consignar su código oficial `XXX-REE/JNE`.
3. **Nivel 3 (Filtro de Exclusión y Descarte Absoluto):**
   * **Descarte:** Sondeos virtuales abiertos de participación voluntaria (redes sociales, formularios web, Facebook, encuestas sin marco muestral) y firmas con registro cancelado o suspendido por el JNE. Si solo existen estos sondeos, la circunscripción se registra como *"Sin encuestas oficiales científicas disponibles"*.

---

## 2. Protocolo de Investigación en 4 Pasos

* **Paso 1: Búsqueda en Medios Primarios Aliados (Direct Site Search):**
  * Para **CPI**: consultar difusor exclusivo (`site:rpp.pe "CPI"` o `site:cpi.pe`).
  * Para **Ipsos**: consultar `site:elcomercio.pe`, `site:peru21.pe` o `site:ipsos.com`.
  * Para **Datum**: consultar `site:elcomercio.pe`, `site:americatv.com.pe` o `site:datum.com.pe`.
  * Para encuestas regionales/distritales autorizadas: diarios y medios locales oficiales.
* **Paso 2: Lectura Integral del Reporte:**
  * Extraer: universo, tamaño de muestra ($n$), margen de error ($\pm e\%$), nivel de confianza ($z\%$), fechas exactas de campo y desglose total de candidatos e indecisos.
* **Paso 3: Validación de Casos Especiales y Movimientos de Lista:**
  * Registrar explícitamente en el esquema las anomalías estratégicas o electorales:
    - **`renuncia_cabeza_lista`**: Candidatos que dimiten para promover la sucesión del primer regidor o teniente alcalde.
    - **`teniente_alcalde`**: Autoridades en funciones que postulan como primer regidor para eludir la restricción de reelección inmediata.
    - **`arrastre_gestion`**: Encuestas que evalúan la marca o aprobación de la autoridad saliente en vez del candidato formal.
    - **`empate_tecnico`**: Diferencia entre primer y segundo lugar menor al margen de error muestral del estudio.
* **Paso 4: Verificación de Estatus REE:**
  * Verificar en la plataforma oficial del JNE (`web.jne.gob.pe/encuestadoras`) la vigencia de la firma encuestadora.

---

## 3. Esquema de Datos (`app/vote-intention.ts`)

Cada medición se estructura conforme al tipo:

```typescript
export type VoteIntentionMeasurement = {
  pollster: "Ipsos" | "CPI" | "Datum" | string;
  measuredAt: string; // Formato YYYY-MM-DD (término de trabajo de campo)
  territory: {
    level: "4" | "5" | "6"; // 4: Regional, 5: Provincial, 6: Distrital
    departmentCode: string;
    provinceCode?: string;
    districtCode?: string;
  };
  entries: Array<{
    organization: string; // Nombre formal en mayúsculas
    percentage: number;  // % de intención de voto
    rank?: number;        // Puesto publicado en el estudio
    aliases?: string[];   // Variantes oficiales del JNE para matching exacto
    specialCase?: {
      type: "teniente_alcalde" | "renuncia_cabeza_lista" | "empate_tecnico" | "arrastre_gestion";
      candidateName?: string;
      description: string;
    };
  }>;
  analysisHref?: string;
  methodologyHref?: string;
  specialCaseNote?: string;
};
```

---

## 4. Reglas de Ingesta y Limpieza

1. **Exclusión de no-candidaturas del array `entries`:** Votos blancos, viciados, nulos, "no precisa" o "ninguno" no se incorporan a `entries` (este array vincula exclusivamente listas políticas inscritas ante el JNE).
2. **Preservación del `rank`:** Si una opción no-electoral ocupó una posición (ej. Blanco/Viciado con 15% en puesto 2), el siguiente candidato conserva su puesto publicado (ej. `rank: 3`).
3. **Normalización de Aliases:** Agregar siempre las variantes que utiliza el JNE en `l.strOrganizacionPolitica` (ej. `"PARTIDO DEMOCRATICO SOMOS PERU"`, `"RENOVACION POPULAR PERU"`, `"AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"`).
