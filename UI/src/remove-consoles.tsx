// Déclaration de la fonction GlobalDebugCustom, qui est une fonction auto-invoquée.
// Cette fonction retourne une autre fonction qui permet de configurer les paramètres de débogage.
export const GlobalDebugCustom = (function () {
    // Sauvegarde l'objet console d'origine pour pouvoir le restaurer plus tard
    const savedConsole: Console = console;

    /**
     * Cette fonction permet de contrôler l'utilisation des messages console.
     * @param debugOn - Active ou désactive le débogage. Si `false`, console.log sera désactivé.
     * @param suppressAll - Si `true`, supprime également console.info, console.warn et console.error.
     *                      Par défaut, seule console.log est supprimée.
     */
    return function (debugOn: boolean, suppressAll: boolean = false): void {
        const suppress: boolean = suppressAll;

        if (!debugOn) {
            // Création d'un objet console minimal
            const disabledConsole: Partial<Console> = {
                log: () => { }
            };

            if (suppress) {
                // Supprime toutes les méthodes principales
                disabledConsole.info = () => { };
                disabledConsole.warn = () => { };
                disabledConsole.error = () => { };
            } else {
                // Conserve les autres méthodes
                disabledConsole.info = savedConsole.info.bind(savedConsole);
                disabledConsole.warn = savedConsole.warn.bind(savedConsole);
                disabledConsole.error = savedConsole.error.bind(savedConsole);
            }

            // Remplace l'objet console global par la version modifiée
            (window as any).console = disabledConsole as Console;
        } else {
            // Restaure la console d'origine
            (window as any).console = savedConsole;
        }
    };
})();
