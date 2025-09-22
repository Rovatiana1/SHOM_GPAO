
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import ldtService from '../services/LdtService';
import { useAuthContext } from './AuthContext';
import { LotDetails } from '../types';

interface ProcessContextType {
    currentLot: LotDetails | null;
    isProcessing: boolean;
    elapsedTime: number;
    loading: boolean;
    error: string | null;
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

        console.log("User ID:", user);
        try {
            // IDs hardcodés comme demandé car non fournis par l'UI
            const lotData = await ldtService.getLot(1, 1, parseInt(user.userId, 10), 1);
            const params = {
                _idDossier: lotData._idDossier,
                _idEtape: lotData._idEtape,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: lotData._idLotClient,
                _idLot: lotData._idLot,
                _idTypeLdt: lotData._idTypeLdt,
            };
            await ldtService.startNewLdt(params);
            setCurrentLot(lotData);
            setIsProcessing(true);
            setElapsedTime(0);
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
                _idDossier: currentLot._idDossier,
                _idEtape: currentLot._idEtape,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot._idLotClient,
                _idLot: currentLot._idLot,
                _idTypeLdt: currentLot._idTypeLdt,
                _commentaire: "Traitement mis en pause par l'utilisateur",
            };
            await ldtService.endLdt(params);
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
                _idDossier: currentLot._idDossier,
                _idEtape: currentLot._idEtape,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot._idLotClient,
                _idLot: currentLot._idLot,
                _idTypeLdt: currentLot._idTypeLdt,
            };
            await ldtService.startNewLdt(params);
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
                _idDossier: currentLot._idDossier,
                _idEtape: currentLot._idEtape,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot._idLotClient,
                _idLot: currentLot._idLot,
                _idTypeLdt: currentLot._idTypeLdt,
                _commentaire: "Lot terminé avec succès",
            };
            await ldtService.endLdt(endParams);

            const nextEtapeParams = {
                _idDossier: currentLot._idDossier,
                _idEtape: currentLot._idEtape,
                _idLotClient: currentLot._idLotClient,
                _libelle: currentLot.libelle,
                _qte: currentLot.qte.toString(),
            };
            await ldtService.injectNextEtape(nextEtapeParams);

            // Reset state for next lot
            setCurrentLot(null);
            setIsProcessing(false);
            setElapsedTime(0);

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