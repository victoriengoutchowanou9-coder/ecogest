import {
  AcademicPeriod,
  AcademicYear,
  BulletinAuditLog,
  BulletinStatus,
  ClassRoom,
  CompetencyDomain,
  CompetencyGradeRecord,
  CompetencyItem,
  CompetencyLevelDefinition,
  ComputedBulletin,
  ComputedPrimaryBulletin,
  ComputedPrimaryDomainGroup,
  ComputedPrimaryCompetencyRow,
  ComputedSubjectRow,
  DecisionConseil,
  EducationCycle,
  EvaluationGrade,
  GradeRecord,
  SchoolSettings,
  StudentProfile,
  SubjectConfig,
  TeacherInfo,
} from "./types/bulletin";

/**
 * Standard rounding to 2 decimal places with Number.EPSILON to avoid floating-point jitter.
 */
export function roundToTwoDecimals(num: number): number {
  if (isNaN(num) || num === null || num === undefined) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Normalizes a grade to the base 20 scale if needed.
 * e.g. 8/10 -> 16/20
 */
export function normalizeGradeToBase20(grade: EvaluationGrade, originalScale: number = 20): EvaluationGrade {
  if (typeof grade !== "number") return grade;
  if (originalScale <= 0 || originalScale === 20) return grade;
  return roundToTwoDecimals((grade / originalScale) * 20);
}

/**
 * Converts numbers from 0 to 99 to French words.
 */
function integerToFrenchWords(n: number): string {
  if (n < 0 || n > 99) return String(n);

  const units = [
    "zéro",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
  ];

  if (n <= 16) return units[n];

  if (n < 20) {
    return `dix-${units[n - 10]}`;
  }

  const tensNames: Record<number, string> = {
    20: "vingt",
    30: "trente",
    40: "quarante",
    50: "cinquante",
    60: "soixante",
  };

  const tens = Math.floor(n / 10) * 10;
  const rem = n % 10;

  // 20-69
  if (n < 70) {
    if (rem === 0) return tensNames[tens];
    if (rem === 1) return `${tensNames[tens]}-et-un`;
    return `${tensNames[tens]}-${units[rem]}`;
  }

  // 70-79: soixante-dix ...
  if (n < 80) {
    const sub = n - 60;
    if (sub === 11) return "soixante-et-onze";
    return `soixante-${integerToFrenchWords(sub)}`;
  }

  // 80-89: quatre-vingts, quatre-vingt-un ...
  if (n === 80) return "quatre-vingts";
  if (n < 90) {
    return `quatre-vingt-${units[rem]}`;
  }

  // 90-99: quatre-vingt-dix ...
  return `quatre-vingt-${integerToFrenchWords(n - 80)}`;
}

/**
 * Converts a decimal grade (e.g. 11.98, 14.5, 8.0) into official French words:
 * e.g. 11.98 -> "onze virgule quatre-vingt-dix-huit"
 * e.g. 14.50 -> "quatorze virgule cinquante"
 * e.g. 8.05  -> "huit virgule zéro cinq"
 */
export function numberToFrenchWords(grade: number): string {
  if (isNaN(grade) || grade === null || grade === undefined) return "-";

  const rounded = roundToTwoDecimals(grade);
  const intPart = Math.floor(rounded);
  const fracPart = Math.round((rounded - intPart) * 100);

  const intWords = integerToFrenchWords(intPart);

  if (fracPart === 0) {
    return `${intWords} virgule zéro zéro`;
  }

  let fracWords = "";
  if (fracPart < 10) {
    fracWords = `zéro ${integerToFrenchWords(fracPart)}`;
  } else {
    fracWords = integerToFrenchWords(fracPart);
  }

  return `${intWords} virgule ${fracWords}`;
}

/**
 * Returns appreciation based on Benin official scale:
 * - moins de 8 = Très insuffisant
 * - 8 à moins de 10 = Insuffisant
 * - 10 à moins de 12 = Passable
 * - 12 à moins de 14 = Assez bien
 * - 14 à moins de 16 = Bien
 * - 16 et plus = Très bien
 */
export function getAppreciationFromGrade(grade: number | null | undefined): string {
  if (grade === null || grade === undefined || isNaN(grade)) return "…";
  if (grade < 8) return "Très insuffisant";
  if (grade < 10) return "Insuffisant";
  if (grade < 12) return "Passable";
  if (grade < 14) return "Assez bien";
  if (grade < 16) return "Bien";
  return "Très bien";
}

/**
 * Formats rank with suffix "er" or "e", and "ex" if ex æquo:
 * e.g. 1 -> "1er" or "1ex"
 * e.g. 6 -> "6e" or "6ex"
 * e.g. 16 -> "16e" or "16ex"
 */
export function formatRank(rank: number | null | undefined, isExAequo: boolean): string {
  if (!rank || rank <= 0) return "…";
  if (isExAequo) return `${rank}ex`;
  if (rank === 1) return "1er";
  return `${rank}e`;
}

/**
 * Resolves an evaluation grade to a usable numeric value, or null if excluded.
 * Unjustified absences (ABS_NJ) count as 0.
 * Justified absences (ABS) are excluded from the calculation.
 */
function resolveEvaluationNumeric(grade: EvaluationGrade | undefined): { value: number | null; isCounted: boolean } {
  if (grade === undefined || grade === null) return { value: null, isCounted: false };
  if (typeof grade === "number") return { value: grade, isCounted: true };
  if (grade === "ABS_NJ") return { value: 0, isCounted: true };
  // Justified absence (ABS)
  return { value: null, isCounted: false };
}

/**
 * Computes official Benin bulletins for all students in a class dynamically.
 * Formula:
 * - Interro 1 + 2 + 3 = moyenne interro.
 * - Moyenne interro + devoir 1 + devoir 2 = moyenne sur 20:
 *   moyenne sur 20 = (Moyenne Interro + Devoir 1 + Devoir 2) / 3
 * - Conduite: Direct grade, no interro nor devoir.
 * - Never divide by zero: if totalCoef === 0, generalAverage is 0.
 * - Missing grades / absent:
 *   If a subject has no valid evaluations, displayed with empty cells and "…" in rank and appreciation,
 *   and strictly excluded from the total coefficient and general average.
 */
export function computeClassBulletins(
  school: SchoolSettings,
  academicYear: AcademicYear,
  period: AcademicPeriod,
  classRoom: ClassRoom,
  students: StudentProfile[],
  subjects: SubjectConfig[],
  grades: GradeRecord[],
  teachers: TeacherInfo[] = [],
  auditLogsMap: Map<string, BulletinAuditLog[]> = new Map(),
  statusMap?: Map<string, BulletinStatus>
): Map<string, ComputedBulletin> {
  const resultMap = new Map<string, ComputedBulletin>();
  const sortedSubjects = [...subjects].sort((a, b) => a.order - b.order);

  // Map of teacher by subject
  const teacherBySubject = new Map<string, string>();
  teachers.forEach((t) => {
    if (t.subjectId) teacherBySubject.set(t.subjectId, t.name);
  });

  interface StudentInterim {
    student: StudentProfile;
    rows: ComputedSubjectRow[];
    totalCoef: number;
    totalNoteCoef: number;
    generalAverage: number;
    groupAverages: {
      litteraire: number | null;
      scientifique: number | null;
      autre: number | null;
    };
  }

  const interimList: StudentInterim[] = [];

  students.forEach((student) => {
    const studentGrades = grades.filter(
      (g) => g.studentId === student.id && g.periodId === period.id
    );

    let totalCoef = 0;
    let totalNoteCoef = 0;

    let littNoteCoef = 0;
    let littCoef = 0;

    let sciNoteCoef = 0;
    let sciCoef = 0;

    let autreNoteCoef = 0;
    let autreCoef = 0;

    const rows: ComputedSubjectRow[] = sortedSubjects.map((subj) => {
      const g = studentGrades.find((grade) => grade.subjectId === subj.id);
      const originalScale = subj.customScale || 20;

      // Special rule: Conduite (Direct note on 20, no devoirs nor interros)
      if (subj.isConduite) {
        const rawNote = normalizeGradeToBase20(g?.noteConduite ?? null, originalScale);
        const resolved = resolveEvaluationNumeric(rawNote);

        const hasGrade = resolved.isCounted && resolved.value !== null;
        const moy = hasGrade ? roundToTwoDecimals(resolved.value!) : null;
        const nCoef = hasGrade && moy !== null ? roundToTwoDecimals(moy * subj.coef) : null;

        if (hasGrade && moy !== null && nCoef !== null) {
          totalCoef += subj.coef;
          totalNoteCoef += nCoef;
          autreCoef += subj.coef;
          autreNoteCoef += nCoef;
        }

        return {
          subjectId: subj.id,
          subjectName: subj.name,
          category: subj.category,
          coef: subj.coef,
          isConduite: true,
          hasGrade,
          interro1: null,
          interro2: null,
          interro3: null,
          moyInterro: null,
          devoir1: null,
          devoir2: null,
          devoir: null,
          compo: null,
          moyenne20: moy,
          noteCoef: nCoef,
          rankInSubject: null,
          isExAequo: false,
          rankFormatted: "…",
          appreciation: g?.teacherAppreciation || (hasGrade && moy !== null ? getAppreciationFromGrade(moy) : "…"),
          teacherName: teacherBySubject.get(subj.id) || classRoom.mainTeacher,
        };
      }

      // Regular subject: 3 interrogations, devoirs & compo
      // 1. Moyenne Interro (directe ou calculée)
      let moyInterro: number | null = null;
      const i1 = normalizeGradeToBase20(g?.interro1 ?? null, originalScale);
      const i2 = normalizeGradeToBase20(g?.interro2 ?? null, originalScale);
      const i3 = normalizeGradeToBase20(g?.interro3 ?? null, originalScale);

      if (typeof g?.moyInterro === "number") {
        moyInterro = roundToTwoDecimals(normalizeGradeToBase20(g.moyInterro, originalScale) as number);
      } else {
        const rI1 = resolveEvaluationNumeric(i1);
        const rI2 = resolveEvaluationNumeric(i2);
        const rI3 = resolveEvaluationNumeric(i3);
        const countedInterros = [rI1, rI2, rI3]
          .filter((r) => r.isCounted && r.value !== null)
          .map((r) => r.value!);
        if (countedInterros.length > 0) {
          moyInterro = roundToTwoDecimals(
            countedInterros.reduce((acc, v) => acc + v, 0) / countedInterros.length
          );
        }
      }

      // 2. Devoir
      let devoir: number | null = null;
      const rawDevoir = g?.devoir ?? g?.devoir1 ?? null;
      const normDevoir = normalizeGradeToBase20(rawDevoir, originalScale);
      const rDevoir = resolveEvaluationNumeric(normDevoir);
      if (rDevoir.isCounted && rDevoir.value !== null) {
        devoir = roundToTwoDecimals(rDevoir.value);
      }

      // 3. Compo
      let compo: number | null = null;
      const rawCompo = g?.compo ?? g?.devoir2 ?? null;
      const normCompo = normalizeGradeToBase20(rawCompo, originalScale);
      const rCompo = resolveEvaluationNumeric(normCompo);
      if (rCompo.isCounted && rCompo.value !== null) {
        compo = roundToTwoDecimals(rCompo.value);
      }

      // Évaluations réellement saisies pour cette matière
      const components: number[] = [];
      if (moyInterro !== null) components.push(moyInterro);
      if (devoir !== null) components.push(devoir);
      if (compo !== null) components.push(compo);

      const hasGrade = components.length > 0;
      let moy: number | null = null;
      let nCoef: number | null = null;

      if (hasGrade) {
        // Formule officielle Bénin : Moy. sur 20 = moyenne de (Moy. interro, Devoir, Compo) en ne comptant que les notes saisies
        moy = roundToTwoDecimals(components.reduce((acc, v) => acc + v, 0) / components.length);
        nCoef = roundToTwoDecimals(moy * subj.coef);
        totalCoef += subj.coef;
        totalNoteCoef += nCoef;

        if (subj.category === "LITTÉRAIRE") {
          littCoef += subj.coef;
          littNoteCoef += nCoef;
        } else if (subj.category === "SCIENTIFIQUE") {
          sciCoef += subj.coef;
          sciNoteCoef += nCoef;
        } else {
          autreCoef += subj.coef;
          autreNoteCoef += nCoef;
        }
      }

      const autoApprec = moy !== null ? getAppreciationFromGrade(moy) : "…";

      return {
        subjectId: subj.id,
        subjectName: subj.name,
        category: subj.category,
        coef: subj.coef,
        isConduite: false,
        hasGrade,
        interro1: i1,
        interro2: i2,
        interro3: i3,
        moyInterro,
        devoir1: normDevoir,
        devoir2: normCompo,
        devoir,
        compo,
        moyenne20: moy,
        noteCoef: nCoef,
        rankInSubject: null,
        isExAequo: false,
        rankFormatted: "…",
        appreciation: g?.teacherAppreciation || autoApprec,
        teacherName: teacherBySubject.get(subj.id) || "",
      };
    });

    // Zero-division protection
    const genAvg = totalCoef > 0 ? roundToTwoDecimals(totalNoteCoef / totalCoef) : 0;

    const groupAverages = {
      litteraire: littCoef > 0 ? roundToTwoDecimals(littNoteCoef / littCoef) : null,
      scientifique: sciCoef > 0 ? roundToTwoDecimals(sciNoteCoef / sciCoef) : null,
      autre: autreCoef > 0 ? roundToTwoDecimals(autreNoteCoef / autreCoef) : null,
    };

    interimList.push({
      student,
      rows,
      totalCoef: roundToTwoDecimals(totalCoef),
      totalNoteCoef: roundToTwoDecimals(totalNoteCoef),
      generalAverage: genAvg,
      groupAverages,
    });
  });

  // Calculate ranks per subject with ex æquo
  sortedSubjects.forEach((subj) => {
    const subjectScores = interimList
      .map((item) => {
        const row = item.rows.find((r) => r.subjectId === subj.id);
        return {
          studentId: item.student.id,
          moyenne: row?.moyenne20 ?? null,
          hasGrade: row?.hasGrade ?? false,
          row,
        };
      })
      .filter((s) => s.hasGrade && s.moyenne !== null);

    subjectScores.sort((a, b) => (b.moyenne ?? 0) - (a.moyenne ?? 0));

    let currentRank = 1;
    for (let i = 0; i < subjectScores.length; i++) {
      if (i > 0 && subjectScores[i].moyenne === subjectScores[i - 1].moyenne) {
        // Same rank
      } else {
        currentRank = i + 1;
      }

      const isEx =
        (i > 0 && subjectScores[i].moyenne === subjectScores[i - 1].moyenne) ||
        (i < subjectScores.length - 1 && subjectScores[i].moyenne === subjectScores[i + 1].moyenne);

      if (subjectScores[i].row) {
        subjectScores[i].row!.rankInSubject = currentRank;
        subjectScores[i].row!.isExAequo = isEx;
        subjectScores[i].row!.rankFormatted = formatRank(currentRank, isEx);
      }
    }
  });

  // Overall class rankings with ex æquo
  const rankedStudents = [...interimList].sort((a, b) => b.generalAverage - a.generalAverage);
  const generalRankMap = new Map<string, { rank: number; isEx: boolean; formatted: string }>();

  let currGenRank = 1;
  for (let i = 0; i < rankedStudents.length; i++) {
    if (i > 0 && rankedStudents[i].generalAverage === rankedStudents[i - 1].generalAverage) {
      // same rank
    } else {
      currGenRank = i + 1;
    }

    const isEx =
      (i > 0 && rankedStudents[i].generalAverage === rankedStudents[i - 1].generalAverage) ||
      (i < rankedStudents.length - 1 && rankedStudents[i].generalAverage === rankedStudents[i + 1].generalAverage);

    generalRankMap.set(rankedStudents[i].student.id, {
      rank: currGenRank,
      isEx,
      formatted: formatRank(currGenRank, isEx),
    });
  }

  // Class statistics
  const validAverages = interimList
    .map((item) => item.generalAverage)
    .filter((avg) => avg > 0);

  const highestAvg = validAverages.length > 0 ? Math.max(...validAverages) : 0;
  const lowestAvg = validAverages.length > 0 ? Math.min(...validAverages) : 0;
  const classAvg =
    validAverages.length > 0
      ? roundToTwoDecimals(validAverages.reduce((acc, v) => acc + v, 0) / validAverages.length)
      : 0;

  // Build the final ComputedBulletin
  interimList.forEach((item) => {
    const rankInfo = generalRankMap.get(item.student.id) || { rank: 1, isEx: false, formatted: "1er" };
    const mention = getAppreciationFromGrade(item.generalAverage);
    const avgInWords = numberToFrenchWords(item.generalAverage);

    // Décision du Conseil des enseignants (une case cochée selon le barème officiel)
    const decisionConseil: DecisionConseil = {
      felicitation: item.generalAverage >= 16,
      encouragement: item.generalAverage >= 14 && item.generalAverage < 16,
      tableauHonneur: item.generalAverage >= 12 && item.generalAverage < 14,
      avertissement: item.generalAverage < 10,
    };

    let titulaireApprec = "Travail satisfaisant.";
    if (item.generalAverage >= 16) titulaireApprec = "Excellent trimestre. Félicitations pour cette performance !";
    else if (item.generalAverage >= 14) titulaireApprec = "Très bon trimestre. Poursuivez dans cette dynamique positive.";
    else if (item.generalAverage >= 12) titulaireApprec = "Bon travail d'ensemble. Des progrès sont encore possibles.";
    else if (item.generalAverage >= 10) titulaireApprec = "Résultats passables. Un effort soutenu est attendu au prochain trimestre.";
    else titulaireApprec = "Résultats insuffisants. Redoublez d'efforts et travaillez avec plus de rigueur.";

    const barcodeValue = `${item.student.educMasterNumber || item.student.matricule}-${period.code}-${academicYear.id}`;
    const verificationUrl = `/ecole/verification?code=${encodeURIComponent(barcodeValue)}&std=${item.student.id}`;

    const studentAuditLogs = auditLogsMap.get(item.student.id) || [];
    const isModified = studentAuditLogs.length > 0;
    const explicitStatus = statusMap?.get(item.student.id);
    const status: BulletinStatus = explicitStatus || (isModified ? "MODIFIE_APRES_PUBLICATION" : "PUBLIE");
    const version = 1 + studentAuditLogs.length;

    const computed: ComputedBulletin = {
      id: `blt-${item.student.id}-${period.id}`,
      bulletinType: "PERIODIQUE",
      student: item.student,
      classRoom,
      school,
      period,
      academicYear,
      rows: item.rows,
      totalCoef: item.totalCoef,
      totalNoteCoef: item.totalNoteCoef,
      generalAverage: item.generalAverage,
      generalAverageInWords: avgInWords,
      rank: rankInfo.rank,
      isRankExAequo: rankInfo.isEx,
      rankFormatted: rankInfo.formatted,
      mention,
      groupAverages: item.groupAverages,
      classStats: {
        highestAvg,
        lowestAvg,
        classAvg,
        effectiveCount: classRoom.size || students.length,
      },
      decisionConseil,
      titulaireAppreciation: titulaireApprec,
      barcodeValue,
      verificationUrl,
      status,
      version,
      publishedAt: "2026-10-12 10:00",
      auditLogs: studentAuditLogs,
    };

    resultMap.set(item.student.id, computed);
  });

  return resultMap;
}

/**
 * Calcule les bulletins annuels (BULLETIN DE PASSAGE) pour toute la classe
 * Fait la synthèse des périodes T1, T2, T3 (ou S1, S2) avec moyennes, rangs et décision de passage.
 */
export function computeClassAnnualBulletins(
  school: SchoolSettings,
  academicYear: AcademicYear,
  classRoom: ClassRoom,
  students: StudentProfile[],
  subjects: SubjectConfig[],
  grades: GradeRecord[],
  periods: AcademicPeriod[],
  passingThreshold: number = 10.0,
  teachers: TeacherInfo[] = [],
  auditLogsMap: Map<string, BulletinAuditLog[]> = new Map(),
  statusMap?: Map<string, BulletinStatus>
): Map<string, ComputedBulletin> {
  const annualMap = new Map<string, ComputedBulletin>();
  if (!students || students.length === 0) return annualMap;

  // 1. Calcul des bulletins périodiques pour chaque trimestre/semestre
  const periodBulletins = new Map<string, Map<string, ComputedBulletin>>();
  periods.forEach((p) => {
    periodBulletins.set(
      p.id,
      computeClassBulletins(
        school,
        academicYear,
        p,
        classRoom,
        students,
        subjects,
        grades,
        teachers,
        auditLogsMap,
        statusMap
      )
    );
  });

  // Période de référence pour le tableau des matières (dernière période T3 par défaut)
  const lastPeriod = periods[periods.length - 1] || periods[0];
  const lastPeriodMap = periodBulletins.get(lastPeriod.id) || new Map<string, ComputedBulletin>();

  interface StudentAnnualInterim {
    student: StudentProfile;
    referenceBulletin: ComputedBulletin;
    periodPerformances: {
      periodId: string;
      periodName: string;
      average: number | null;
      rank: number | null;
      rankFormatted: string;
    }[];
    annualAverage: number;
  }

  const interimList: StudentAnnualInterim[] = [];

  students.forEach((std) => {
    const refBulletin =
      lastPeriodMap.get(std.id) ||
      computeClassBulletins(
        school,
        academicYear,
        lastPeriod,
        classRoom,
        [std],
        subjects,
        grades,
        teachers,
        auditLogsMap,
        statusMap
      ).get(std.id);

    if (!refBulletin) return;

    const perfs = periods.map((p) => {
      const b = periodBulletins.get(p.id)?.get(std.id);
      return {
        periodId: p.id,
        periodName: p.name,
        average: b && b.totalCoef > 0 ? b.generalAverage : null,
        rank: b?.rank || null,
        rankFormatted: b?.rankFormatted || "…",
      };
    });

    const validAvgs = perfs.filter((p) => p.average !== null && p.average > 0).map((p) => p.average!);
    const annualAvg =
      validAvgs.length > 0
        ? roundToTwoDecimals(validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length)
        : refBulletin.generalAverage;

    interimList.push({
      student: std,
      referenceBulletin: refBulletin,
      periodPerformances: perfs,
      annualAverage: annualAvg,
    });
  });

  // Classement annuel de la classe avec gestion des ex æquo
  interimList.sort((a, b) => b.annualAverage - a.annualAverage);
  const annualRankMap = new Map<string, { rank: number; isEx: boolean; formatted: string }>();

  let currRank = 1;
  for (let i = 0; i < interimList.length; i++) {
    if (i > 0 && interimList[i].annualAverage === interimList[i - 1].annualAverage) {
      // Ex æquo
    } else {
      currRank = i + 1;
    }
    const isEx =
      (i > 0 && interimList[i].annualAverage === interimList[i - 1].annualAverage) ||
      (i < interimList.length - 1 && interimList[i].annualAverage === interimList[i + 1].annualAverage);

    annualRankMap.set(interimList[i].student.id, {
      rank: currRank,
      isEx,
      formatted: formatRank(currRank, isEx),
    });
  }

  // Statistiques annuelles de la classe
  const validAnnualAvgs = interimList.map((i) => i.annualAverage).filter((a) => a > 0);
  const highestAnnualAvg = validAnnualAvgs.length > 0 ? Math.max(...validAnnualAvgs) : 0;
  const lowestAnnualAvg = validAnnualAvgs.length > 0 ? Math.min(...validAnnualAvgs) : 0;
  const annualClassAvg =
    validAnnualAvgs.length > 0
      ? roundToTwoDecimals(validAnnualAvgs.reduce((a, b) => a + b, 0) / validAnnualAvgs.length)
      : 0;

  // Construction du bulletin de passage annuel final
  interimList.forEach((item) => {
    const rankInfo = annualRankMap.get(item.student.id) || { rank: 1, isEx: false, formatted: "1er" };
    const avgInWords = numberToFrenchWords(item.annualAverage);

    // Décision finale officielle selon seuil de passage configurable
    let passageDecision: "PASSE EN CLASSE SUPÉRIEURE" | "REDOUBLE" | "EXCLU" = "REDOUBLE";
    if (item.annualAverage >= passingThreshold) {
      passageDecision = "PASSE EN CLASSE SUPÉRIEURE";
    } else if (item.annualAverage >= passingThreshold - 1.0) {
      passageDecision = "REDOUBLE";
    } else {
      passageDecision = "EXCLU";
    }

    const annualSummary = {
      periods: item.periodPerformances,
      annualAverage: item.annualAverage,
      annualAverageInWords: avgInWords,
      annualRank: rankInfo.rank,
      annualRankFormatted: rankInfo.formatted,
      highestAnnualAvg,
      lowestAnnualAvg,
      annualClassAvg,
      passageDecision,
      passingThreshold,
    };

    const annualBulletin: ComputedBulletin = {
      ...item.referenceBulletin,
      id: `blt-annuel-${item.student.id}`,
      bulletinType: "ANNUEL",
      annualSummary,
      generalAverage: item.annualAverage,
      generalAverageInWords: avgInWords,
      rank: rankInfo.rank,
      isRankExAequo: rankInfo.isEx,
      rankFormatted: rankInfo.formatted,
      mention: getAppreciationFromGrade(item.annualAverage),
      decisionConseil: {
        felicitation: item.annualAverage >= 16,
        encouragement: item.annualAverage >= 14 && item.annualAverage < 16,
        tableauHonneur: item.annualAverage >= 12 && item.annualAverage < 14,
        avertissement: item.annualAverage < 10,
      },
    };

    annualMap.set(item.student.id, annualBulletin);
  });

  return annualMap;
}

/**
 * ─── CALCUL DES BULLETINS OFFICIELS DU CYCLE PRIMAIRE ────────────────────────
 *
 * Moteur d'évaluation par compétences et domaines d'apprentissage :
 * - Regroupement par Domaine (Français, Maths, EST, ES, Arts, EPS).
 * - Association des paliers d'acquisition (A, ECA, NA, EXP).
 * - Calcul du taux d'acquisition global et par domaine.
 * - Intégration facultative de notes sur 10 sans coefficients obligatoires.
 * - Suivi qualitatif de progression sans classement forcé ni transformation abusive.
 */
export function computePrimaryClassBulletins(
  school: SchoolSettings,
  academicYear: AcademicYear,
  period: AcademicPeriod,
  classRoom: ClassRoom,
  students: StudentProfile[],
  domains: CompetencyDomain[],
  competencies: CompetencyItem[],
  gradeRecords: CompetencyGradeRecord[],
  levelDefs: CompetencyLevelDefinition[],
  auditLogsMap: Map<string, BulletinAuditLog[]> = new Map(),
  statusMap?: Map<string, BulletinStatus>
): Map<string, ComputedPrimaryBulletin> {
  const resultMap = new Map<string, ComputedPrimaryBulletin>();
  const sortedDomains = [...domains].sort((a, b) => a.order - b.order);

  // Map des définitions de niveaux d'acquisition
  const levelMap = new Map<string, CompetencyLevelDefinition>();
  levelDefs.forEach((ld) => levelMap.set(ld.code, ld));

  students.forEach((student) => {
    const studentGrades = gradeRecords.filter(
      (g) => g.studentId === student.id && g.periodId === period.id
    );

    let totalCompetenciesCount = 0;
    let acquiredCount = 0;
    let inProgressCount = 0;
    let notAcquiredCount = 0;
    let totalNotesSur10 = 0;
    let countedNotesSur10 = 0;

    const domainGroups: ComputedPrimaryDomainGroup[] = sortedDomains.map((domain) => {
      const domainCompetencies = competencies
        .filter((c) => c.domainId === domain.id)
        .sort((a, b) => a.order - b.order);

      let domainAcquiredCount = 0;

      const compRows: ComputedPrimaryCompetencyRow[] = domainCompetencies.map((comp) => {
        totalCompetenciesCount++;
        const gradeEntry = studentGrades.find((g) => g.competencyId === comp.id);
        const levelDef = gradeEntry?.levelCode ? levelMap.get(gradeEntry.levelCode) : undefined;

        if (levelDef?.isAcquired) {
          acquiredCount++;
          domainAcquiredCount++;
        } else if (gradeEntry?.levelCode === "ECA") {
          inProgressCount++;
        } else if (gradeEntry?.levelCode === "NA") {
          notAcquiredCount++;
        }

        if (typeof gradeEntry?.noteSur10 === "number") {
          totalNotesSur10 += gradeEntry.noteSur10;
          countedNotesSur10++;
        }

        return {
          competencyId: comp.id,
          competencyName: comp.name,
          domainId: domain.id,
          domainName: domain.name,
          levelCode: gradeEntry?.levelCode || null,
          levelLabel: levelDef?.label || "Non évalué",
          levelShortLabel: levelDef?.shortLabel || "—",
          badgeClass: levelDef?.badgeClass || "bg-slate-100 text-slate-600 border-slate-200",
          teacherObservation: gradeEntry?.teacherObservation || "—",
          noteSur10: typeof gradeEntry?.noteSur10 === "number" ? gradeEntry.noteSur10 : null,
        };
      });

      const domainRate =
        domainCompetencies.length > 0
          ? roundToTwoDecimals((domainAcquiredCount / domainCompetencies.length) * 100)
          : 0;

      let domainApprec = "Compétences en cours d'appropriation.";
      if (domainRate >= 85) domainApprec = "Excellente maîtrise du domaine.";
      else if (domainRate >= 70) domainApprec = "Très bons apprentissages.";
      else if (domainRate >= 50) domainApprec = "Résultats satisfaisants, à consolider.";
      else if (domainRate > 0) domainApprec = "Nécessite une remédiation ciblée.";

      return {
        domainId: domain.id,
        domainName: domain.name,
        competencies: compRows,
        acquisitionRate: domainRate,
        domainAppreciation: domainApprec,
      };
    });

    const evaluatedCount = acquiredCount + inProgressCount + notAcquiredCount;
    const overallRate =
      evaluatedCount > 0
        ? roundToTwoDecimals((acquiredCount / evaluatedCount) * 100)
        : 0;

    let titulaireApprec = "Travail satisfaisant.";
    if (overallRate >= 85) {
      titulaireApprec = "Excellente période. L'ensemble des compétences fondamentales du cycle est maîtrisé avec aisance.";
    } else if (overallRate >= 70) {
      titulaireApprec = "Très bon trimestre. Les objectifs pédagogiques sont atteints pour la grande majorité des domaines.";
    } else if (overallRate >= 50) {
      titulaireApprec = "Résultats satisfaisants. Les bases sont là, intensifiez l'effort pour transformer les acquis fragiles.";
    } else {
      titulaireApprec = "Période fragile. Un plan de soutien et de renforcement des apprentissages est mis en place.";
    }

    const avgNoteSur10 =
      countedNotesSur10 > 0
        ? roundToTwoDecimals(totalNotesSur10 / countedNotesSur10)
        : null;

    const barcodeValue = `${student.educMasterNumber || student.matricule}-${period.code}-${academicYear.id}`;
    const verificationUrl = `/ecole/verification?code=${encodeURIComponent(barcodeValue)}&std=${student.id}`;
    const studentAuditLogs = auditLogsMap.get(student.id) || [];
    const explicitStatus = statusMap?.get(student.id);
    const status: BulletinStatus = explicitStatus || (studentAuditLogs.length > 0 ? "MODIFIE_APRES_PUBLICATION" : "PUBLIE");

    const bulletin: ComputedPrimaryBulletin = {
      id: `blt-prim-${student.id}-${period.id}`,
      cycle: "PRIMAIRE",
      student,
      classRoom,
      school,
      period,
      academicYear,
      domainGroups,
      totalCompetencies: totalCompetenciesCount,
      acquiredCount,
      inProgressCount,
      notAcquiredCount,
      overallAcquisitionRate: overallRate,
      hasGrades: countedNotesSur10 > 0,
      averageNoteSur10: avgNoteSur10,
      absencesCount: 0,
      justifiedAbsencesCount: 0,
      latenessCount: 0,
      titulaireAppreciation: titulaireApprec,
      directorAppreciation: "Observations de la direction : Accord et félicitations pour les progrès accomplis.",
      barcodeValue,
      verificationUrl,
      status,
      version: 1 + studentAuditLogs.length,
      publishedAt: "2026-10-12 10:00",
      auditLogs: studentAuditLogs,
    };

    resultMap.set(student.id, bulletin);
  });

  return resultMap;
}
