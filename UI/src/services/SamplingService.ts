import { Point } from '../types/Image';

/**
 * Calcule la taille de l'échantillon requise en fonction de la taille de la population.
 * @param population La taille totale de la population de points pour une date donnée.
 * @returns La taille de l'échantillon à prélever.
 */
export function calculateSampleSize(population: number): number {
    const thresholds = [
        { min: 2, max: 8, sample: 2 },
        { min: 9, max: 15, sample: 3 },
        { min: 16, max: 25, sample: 5 },
        { min: 26, max: 50, sample: 8 },
        { min: 51, max: 90, sample: 13 },
        { min: 91, max: 150, sample: 20 },
        { min: 151, max: 280, sample: 32 },
        { min: 281, max: 500, sample: 50 },
        { min: 501, max: 1200, sample: 80 },
        { min: 1201, max: 3200, sample: 125 },
        { min: 3201, max: 10000, sample: 200 },
        { min: 10001, max: 35000, sample: 315 },
        { min: 35001, max: 150000, sample: 500 },
        { min: 150001, max: 500000, sample: 800 },
        { min: 500001, max: Infinity, sample: 1250 },
    ];

    for (const { min, max, sample } of thresholds) {
        if (population >= min && population <= max) {
            return sample;
        }
    }

    return population; // Si la population est inférieure au seuil min, on prend tout.
}

/**
 * Algorithme de brassage Fisher-Yates pour mélanger un tableau sur place.
 * @param array Le tableau à mélanger.
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Sélectionne un échantillon de points basé sur les règles de taille d'échantillon par date.
 * @param points La liste complète des points.
 * @param dates La liste des dates correspondantes.
 * @returns Un tableau d'objets contenant le point échantillonné et son index d'origine.
 */
export function getSampledPoints(points: Point[], dates: string[]): Array<{ point: Point; originalIndex: number }> {
    if (points.length !== dates.length) {
        throw new Error("Points and dates arrays must have the same length.");
    }

    console.log(`Total de points reçus pour échantillonnage: ${points.length}`);
    console.log("points sample ==> ", points);

    const pointsByDate: Record<string, number[]> = {};
    dates.forEach((date, index) => {
        if (!pointsByDate[date]) {
            pointsByDate[date] = [];
        }
        pointsByDate[date]!.push(index);
    });

    const sampledIndices: number[] = [];
    console.log("--- Début du calcul d'échantillonnage ---");

    for (const date in pointsByDate) {
        const indicesForDate = pointsByDate[date]!;
        const populationSize = indicesForDate.length;
        const sampleSize = calculateSampleSize(populationSize);

        const chosenIndices = shuffleArray(indicesForDate).slice(0, sampleSize);
        sampledIndices.push(...chosenIndices);

        console.log(`Date: ${date}, Total: ${populationSize}, Échantillon: ${sampleSize}`);
    }
    
    console.log(`--- Total de points échantillonnés: ${sampledIndices.length} ---`);


    return sampledIndices
        .sort((a, b) => a - b) // Trier pour un ordre de validation prévisible
        .map(index => ({
            point: points[index]!,
            originalIndex: index,
        }));
}
