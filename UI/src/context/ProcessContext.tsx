
// import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// import gpaoService from '../services/GpaoService';
// import { useAuthContext } from './AuthContext';
// import { LotDetails } from '../types';

// interface ProcessContextType {
//     currentLot: LotDetails | null;
//     isProcessing: boolean;
//     elapsedTime: number;
//     loading: boolean;
//     error: string | null;
//     getAndStartNextLot: () => Promise<void>;
//     pauseCurrentLot: () => Promise<void>;
//     resumeCurrentLot: () => Promise<void>;
//     completeAndMoveToNextStep: () => Promise<void>;
//     clearError: () => void;
// }

// const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

// export const ProcessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//     const { user } = useAuthContext();
//     const [currentLot, setCurrentLot] = useState<LotDetails | null>(null);
//     const [isProcessing, setIsProcessing] = useState<boolean>(false);
//     const [elapsedTime, setElapsedTime] = useState<number>(0);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [error, setError] = useState<string | null>(null);

//     // console.log("currentLot => ", currentLot)
//     useEffect(() => {
//         // Fix: Use `ReturnType<typeof setInterval>` for the interval timer type. This is environment-agnostic
//         // and works in both browser (returns a number) and Node.js (returns a Timeout object) contexts,
//         // resolving the error about `NodeJS.Timeout` not being found.
//         let interval: ReturnType<typeof setInterval> | null = null;
//         if (isProcessing) {
//             interval = setInterval(() => {
//                 setElapsedTime(prev => prev + 1);
//             }, 1000);
//         } else if (interval) {
//             clearInterval(interval);
//         }
//         return () => {
//             if (interval) clearInterval(interval);
//         };
//     }, [isProcessing]);

//     const clearError = () => setError(null);

//     const getAndStartNextLot = useCallback(async () => {
//         if (!user) {
//             setError("Utilisateur non authentifié.");
//             return;
//         }
//         setLoading(true);
//         setError(null);

//         console.log("User ID:", user);
//         try {
//             // IDs hardcodés comme demandé car non fournis par l'UI
//             // const lotData = await gpaoService.getLot(918, 4674, parseInt(user.userId, 10), 30752);
//             const lotData = await gpaoService.getLot(918, 4674, 107, 30752);
//             console.log("getLot lotData => ", lotData)
//             setCurrentLot(lotData.lot);
//             setIsProcessing(true);
//             setElapsedTime(0);
//         } catch (err: any) {
//             setError(err.message || 'Erreur inconnue');
//         } finally {
//             setLoading(false);
//         }
//     }, [user]);

//     const pauseCurrentLot = useCallback(async () => {
//         if (!currentLot || !user) return;
//         setLoading(true);
//         try {
//             const params = {
//                 _idDossier: currentLot.idDossier!,
//                 _idEtape: currentLot.idEtape!,
//                 _idPers: parseInt(user.userId, 10),
//                 _idLotClient: currentLot.idLotClient!,
//                 _idLot: currentLot.idLot!,
//                 _idTypeLdt: 0,
//                 _qte: 500,
//             };
//             console.log("endLdt pause currentLot => ", currentLot)
//             console.log("endLdt pause params => ", params)
//             await gpaoService.endLdt(params);
//             setIsProcessing(false);
//         } catch (err: any) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, [currentLot, user]);

//     const resumeCurrentLot = useCallback(async () => {
//         if (!currentLot || !user) return;
//         setLoading(true);
//         try {
//             const params = {
//                 _idDossier: currentLot.idDossier!,
//                 _idEtape: currentLot.idEtape!,
//                 _idPers: parseInt(user.userId, 10),
//                 _idLotClient: currentLot.idLotClient!,
//                 _idLot: currentLot.idLot!,
//                 _idTypeLdt: 0,
//             };
//             console.log("start params => ", params)
//             await gpaoService.startNewLdt(params);
//             setIsProcessing(true);
//         } catch (err: any) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, [currentLot, user]);

//     const completeAndMoveToNextStep = useCallback(async () => {
//         if (!currentLot || !user) return;
//         setLoading(true);
//         try {
//             const endParams = {
//                 _idDossier: currentLot.idDossier!,
//                 _idEtape: currentLot.idEtape!,
//                 _idPers: parseInt(user.userId, 10),
//                 _idLotClient: currentLot.idLotClient!,
//                 _idLot: currentLot.idLot!,
//                 _idTypeLdt: 0,
//                 _qte: 500,
//             };
//             console.log("endParams => ", endParams)
//             await gpaoService.endLdt(endParams);

//             const nextEtapeParams = {
//                 _idDossier: currentLot.idDossier!,
//                 _idEtape: currentLot.idEtape!,
//                 _idLotClient: currentLot.idLotClient!,
//                 _libelle: currentLot.libelle!,
//                 _qte: currentLot.qte!.toString(),
//             };
//             console.log("nextEtapeParams => ", nextEtapeParams)
//             await gpaoService.injectNextEtape(nextEtapeParams);

//             // Reset state for next lot
//             setCurrentLot(null);
//             setIsProcessing(false);
//             setElapsedTime(0);

//         } catch (err: any) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, [currentLot, user]);


//     const value = {
//         currentLot,
//         isProcessing,
//         elapsedTime,
//         loading,
//         error,
//         getAndStartNextLot,
//         pauseCurrentLot,
//         resumeCurrentLot,
//         completeAndMoveToNextStep,
//         clearError
//     };

//     return <ProcessContext.Provider value={value}>{children}</ProcessContext.Provider>;
// };

// export const useProcessContext = (): ProcessContextType => {
//     const context = useContext(ProcessContext);
//     if (!context) {
//         throw new Error('useProcessContext must be used within a ProcessProvider');
//     }
//     return context;
// };



import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import gpaoService from '../services/GpaoService';
import { useAuthContext } from './AuthContext';
import { LotDetails } from '../types';

interface ProcessContextType {
    currentLot: LotDetails | null;
    isProcessing: boolean;
    elapsedTime: number;
    loading: boolean;
    error: string | null;
    paths: { in: string; out: string } | null;
    getAndStartNextLot: () => Promise<void>;
    pauseCurrentLot: () => Promise<void>;
    resumeCurrentLot: () => Promise<void>;
    completeAndMoveToNextStep: () => Promise<void>;
    clearError: () => void;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuthContext();
    const [currentLot, setCurrentLot] = useState<LotDetails | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [paths, setPaths] = useState<{ in: string; out: string } | null>(null);

    // console.log("currentLot => ", currentLot)
    useEffect(() => {
        // Fix: Use `ReturnType<typeof setInterval>` for the interval timer type. This is environment-agnostic
        // and works in both browser (returns a number) and Node.js (returns a Timeout object) contexts,
        // resolving the error about `NodeJS.Timeout` not being found.
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isProcessing) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isProcessing]);

    const clearError = () => setError(null);

    const getAndStartNextLot = useCallback(async () => {
        if (!user) {
            setError("Utilisateur non authentifié.");
            return;
        }
        setLoading(true);
        setError(null);
        setPaths(null);

        console.log("User ID:", user);
        try {
            // IDs hardcodés comme demandé car non fournis par l'UI
            // const lotData = await gpaoService.getLot(918, 4674, parseInt(user.userId, 10), 30752);
            const lotData = await gpaoService.getLot(918, 4674, 107, 30752);
            console.log("getLot lotData => ", lotData)
            
            if (lotData && lotData.lot) {
                setCurrentLot(lotData.lot);
                setIsProcessing(true);
                setElapsedTime(0);

                const lotName = lotData.lot.libelle;
                const basePath = "\\\\10.128.1.10\\005822\\PRODUCTION\\LOT6";
                const commonSubPath = `TEST_DEV\\${lotName}\\${lotName}.csv`;
                
                const inPath = `${basePath}\\SAISIE\\${commonSubPath}`;
                const outPath = `${basePath}\\CQ_CIBLE\\${commonSubPath}`;

                setPaths({ in: inPath, out: outPath });
            } else {
                setError("Aucun lot disponible à traiter.");
                setCurrentLot(null);
                setIsProcessing(false);
            }
        } catch (err: any) {
            setError(err.message || 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const pauseCurrentLot = useCallback(async () => {
        if (!currentLot || !user) return;
        setLoading(true);
        try {
            const params = {
                _idDossier: currentLot.idDossier!,
                _idEtape: currentLot.idEtape!,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot.idLotClient!,
                _idLot: currentLot.idLot!,
                _idTypeLdt: 0,
                _qte: 500,
            };
            console.log("endLdt pause currentLot => ", currentLot)
            console.log("endLdt pause params => ", params)
            await gpaoService.endLdt(params);
            setIsProcessing(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentLot, user]);

    const resumeCurrentLot = useCallback(async () => {
        if (!currentLot || !user) return;
        setLoading(true);
        try {
            const params = {
                _idDossier: currentLot.idDossier!,
                _idEtape: currentLot.idEtape!,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot.idLotClient!,
                _idLot: currentLot.idLot!,
                _idTypeLdt: 0,
            };
            console.log("start params => ", params)
            await gpaoService.startNewLdt(params);
            setIsProcessing(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentLot, user]);

    const completeAndMoveToNextStep = useCallback(async () => {
        if (!currentLot || !user) return;
        setLoading(true);
        try {
            const endParams = {
                _idDossier: currentLot.idDossier!,
                _idEtape: currentLot.idEtape!,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot.idLotClient!,
                _idLot: currentLot.idLot!,
                _idTypeLdt: 0,
                _qte: 500,
            };
            console.log("endParams => ", endParams)
            await gpaoService.endLdt(endParams);

            const nextEtapeParams = {
                _idDossier: currentLot.idDossier!,
                _idEtape: currentLot.idEtape!,
                _idLotClient: currentLot.idLotClient!,
                _libelle: currentLot.libelle!,
                _qte: currentLot.qte!.toString(),
            };
            console.log("nextEtapeParams => ", nextEtapeParams)
            await gpaoService.injectNextEtape(nextEtapeParams);

            // Reset state for next lot
            setCurrentLot(null);
            setIsProcessing(false);
            setElapsedTime(0);
            setPaths(null);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentLot, user]);


    const value = {
        currentLot,
        isProcessing,
        elapsedTime,
        loading,
        error,
        paths,
        getAndStartNextLot,
        pauseCurrentLot,
        resumeCurrentLot,
        completeAndMoveToNextStep,
        clearError
    };

    return <ProcessContext.Provider value={value}>{children}</ProcessContext.Provider>;
};

export const useProcessContext = (): ProcessContextType => {
    const context = useContext(ProcessContext);
    if (!context) {
        throw new Error('useProcessContext must be used within a ProcessProvider');
    }
    return context;
};
