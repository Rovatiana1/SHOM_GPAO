import React, { useState, useEffect } from 'react';
import { Lot } from '../../../types/Lot';
import { Dossier } from '../../../types/Dossier';
import { LotClient } from '../../../types/LotClient';
import { Etape } from '../../../types/Etape';
import { ManagedUser } from '../../../types/Users';
import { X, Save, Loader, Plus, Layers, Edit, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchableSelect from '../../../shared/SearchableSelect';
import DossiersService from '../../../services/DossiersService';
import LotClientService from '../../../services/LotClientService';
import UsersService from '../../../services/UsersService';
import EtapeService from '../../../services/EtapeService';

type PanelState = 'idle' | 'newLot' | 'viewLot' | 'editLot' | 'deleteLot';

interface CrudPanelProps {
    panelState: PanelState;
    lot: Lot | null;
    onAddNew: () => void;
    onCancel: () => void;
    onSave: (lotData: Partial<Lot>) => Promise<boolean>;
    onDelete: () => void;
    onEdit: (lot: Lot) => void;
    onConfirmDelete: (lot: Lot) => void;
}

const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

const CrudPanel: React.FC<CrudPanelProps> = ({ panelState, lot, onAddNew, onCancel, onSave, onDelete, onEdit, onConfirmDelete }) => {
    
    const renderContent = () => {
        switch(panelState) {
            case 'viewLot':
                return lot && <ViewPanel lot={lot} onEdit={onEdit} onConfirmDelete={onConfirmDelete} onCancel={onCancel} />;
            case 'newLot':
            case 'editLot':
                return <FormPanel lotToEdit={lot} onSave={onSave} onCancel={onCancel} />;
            case 'deleteLot':
                return lot && <DeletePanel lot={lot} onDelete={onDelete} onCancel={onCancel} />;
            case 'idle':
            default:
                return <IdlePanel onAddNew={onAddNew} />;
        }
    };

    return (
        <aside className="w-[28rem] bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
             <AnimatePresence mode="wait">
                <motion.div
                    key={panelState}
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col h-full"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </aside>
    );
};

const IdlePanel: React.FC<{ onAddNew: () => void }> = ({ onAddNew }) => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
        <Layers className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Gestion des lots</h3>
        <p className="text-sm text-gray-500 mt-1">Sélectionnez un lot pour voir ses détails ou en ajouter un nouveau.</p>
        <button
            onClick={onAddNew}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
            <Plus size={18} /> Ajouter un lot
        </button>
    </div>
);

const ViewPanel: React.FC<{ lot: Lot, onEdit: (lot: Lot) => void, onConfirmDelete: (lot: Lot) => void, onCancel: () => void }> = ({ lot, onEdit, onConfirmDelete, onCancel }) => {
    const getStatusBadge = (statusId: number | null) => {
        switch(statusId) {
            case 1: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Nouveau</span>;
            case 2: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Actif</span>;
            case 3: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En Pause</span>;
            case 4: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Terminé</span>;
            case 5: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Erreur</span>;
            case 6: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Rejeté</span>;
            default: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inconnu</span>;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 flex items-center gap-4">
                 <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-green-700" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 truncate" title={lot.libelle || ''}>{lot.libelle}</h2>
                    <p className="text-sm text-gray-500">Lot ID: {lot.idLot}</p>
                </div>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <InfoGroup title="Identification">
                    <InfoItem label="Dossier" value={lot.dossierNum || lot.idDossier?.toString() || 'N/A'} />
                    <InfoItem label="Lot Client" value={lot.lotClientLibelle || lot.idLotClient?.toString() || 'N/A'} />
                </InfoGroup>
                <InfoGroup title="Statut & Quantité">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Quantité" value={lot.qte || 'N/A'} />
                        <InfoItem label="Quantité Op." value={lot.qteOp || 'N/A'} />
                        <InfoItem label="Quantité Réelle" value={lot.qteReele?.toString() || 'N/A'} />
                        <InfoItem label="Vérifier Qté" value={lot.verifQte ? 'Oui' : 'Non'} />
                    </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">État</p>
                        <div className="mt-2">{getStatusBadge(lot.idEtat)}</div>
                    </div>
                </InfoGroup>
                <InfoGroup title="Traitement">
                    <InfoItem label="Étape" value={lot.idEtape?.toString() || 'N/A'} />
                    <InfoItem label="Personne" value={lot.idPers?.toString() || 'N/A'} />
                    <InfoItem label="Priorité" value={lot.priority?.toString() || '0'} />
                    <InfoItem label="Nombre d'erreurs" value={lot.nbreErreur || '0'} />
                </InfoGroup>
                <InfoGroup title="Temporalité">
                    <InfoItem label="Date de début" value={lot.dateDeb || 'N/A'} />
                    <InfoItem label="Heure de début" value={lot.hDeb || 'N/A'} />
                    <InfoItem label="Durée (min)" value={lot.duree?.toString() || 'N/A'} />
                    <InfoItem label="Durée Max (min)" value={lot.dureeMax?.toString() || 'N/A'} />
                </InfoGroup>
                <InfoGroup title="Spécifications Techniques">
                    <InfoItem label="ID ALM Sous-spé" value={lot.idAlmSousSousSpe?.toString() || 'N/A'} />
                    <InfoItem label="ID Détail Référence" value={lot.idDetRef?.toString() || 'N/A'} />
                </InfoGroup>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => onConfirmDelete(lot)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <Trash2 size={16} /> Supprimer
                </button>
                <button onClick={() => onEdit(lot)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Edit size={16} /> Modifier
                </button>
            </div>
        </div>
    );
};

const InfoGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 space-y-3 border-t border-gray-200 pt-3">{children}</div>
    </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-sm text-gray-800 font-semibold">{value}</p>
    </div>
);

const FormPanel: React.FC<{ lotToEdit: Lot | null; onSave: (data: Partial<Lot>) => Promise<boolean>; onCancel: () => void }> = ({ lotToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Lot>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = lotToEdit !== null;

    useEffect(() => {
        if (lotToEdit) {
            setFormData(lotToEdit);
        } else {
            setFormData({
                libelle: '',
                idEtat: 1,
                priority: 0,
                verifQte: false,
            });
        }
    }, [lotToEdit]);

    const handleSelectChange = (name: keyof Lot, value: number | null) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = Object.entries(formData).reduce((acc, [key, value]) => {
            const numericFields = ['idLotClient', 'idDossier', 'idEtat', 'idEtape', 'priority', 'idPers', 'duree', 'dureeMax', 'qteReele', 'idAlmSousSousSpe', 'idDetRef'];
            if (numericFields.includes(key) && value !== null && value !== '') {
                (acc as any)[key] = Number(value);
            } else {
                (acc as any)[key] = value;
            }
            return acc;
        }, {} as Partial<Lot>);
        
        const success = await onSave(payload);
        if (!success) {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Modifier' : 'Ajouter'} un lot</h2>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>
            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                <FieldGroup title="Informations Principales">
                    <InputField label="Libellé" name="libelle" value={formData.libelle || ''} onChange={handleChange} required />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                         {/* FIX: Explicitly type the parameter `d` as `Dossier` to resolve property access errors. */}
                         <SearchableSelect
                            label="Dossier"
                            fetchOptions={DossiersService.getDossiers}
                            optionValue={(d: Dossier) => d.idDossier}
                            optionLabel={(d: Dossier) => `${d.numDossier} (ID: ${d.idDossier})`}
                            value={formData.idDossier || null}
                            onChange={(id) => handleSelectChange('idDossier', id)}
                            placeholder="Sélectionner un dossier"
                        />
                         {/* FIX: Explicitly type the parameter `lc` as `LotClient` to resolve property access errors. */}
                         <SearchableSelect
                            label="Lot Client"
                            fetchOptions={LotClientService.getLotClients}
                            // FIX: Corrected property 'id_lot_client' to 'idLotClient' to match the LotClient type definition.
                            optionValue={(lc: LotClient) => lc.idLotClient}
                            optionLabel={(lc: LotClient) => lc.libelle!}
                            value={formData.idLotClient || null}
                            onChange={(id) => handleSelectChange('idLotClient', id)}
                            placeholder="Sélectionner un lot client"
                        />
                    </div>
                </FieldGroup>
                
                <FieldGroup title="Statut & Quantité">
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="idEtat" className="block text-sm font-medium text-gray-700">État</label>
                            <select name="idEtat" id="idEtat" value={formData.idEtat || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                                <option value="1">Nouveau</option>
                                <option value="2">Actif</option>
                                <option value="3">En Pause</option>
                                <option value="4">Terminé</option>
                                <option value="5">Erreur</option>
                                <option value="6">Rejeté</option>
                            </select>
                        </div>
                        <InputField type="number" label="Priorité" name="priority" value={formData.priority ?? 0} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField label="Quantité" name="qte" value={formData.qte || ''} onChange={handleChange} />
                        <InputField label="Quantité Op." name="qteOp" value={formData.qteOp || ''} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField type="number" label="Quantité Réelle" name="qteReele" value={formData.qteReele || ''} onChange={handleChange} />
                        <div className="flex items-center pt-6">
                            <input id="verifQte" name="verifQte" type="checkbox" checked={formData.verifQte || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"/>
                            <label htmlFor="verifQte" className="ml-2 block text-sm text-gray-900">Vérifier Quantité</label>
                        </div>
                    </div>
                </FieldGroup>

                <FieldGroup title="Assignation & Suivi">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* FIX: Explicitly type the parameter `e` as `Etape` to resolve property access errors. */}
                        <SearchableSelect
                            label="Étape"
                            fetchOptions={EtapeService.getEtapes}
                            optionValue={(e: Etape) => e.idEtape}
                            optionLabel={(e: Etape) => `${e.libelle} (ID: ${e.idEtape})`}
                            value={formData.idEtape || null}
                            onChange={(id) => handleSelectChange('idEtape', id)}
                            placeholder="Sélectionner une étape"
                        />
                         {/* FIX: Explicitly type the parameter `u` as `ManagedUser` to resolve property access errors. */}
                         <SearchableSelect
                            label="Personne"
                            fetchOptions={UsersService.getUsers}
                            optionValue={(u: ManagedUser) => u.id_pers}
                            optionLabel={(u: ManagedUser) => `${u.prenom} ${u.nom}`}
                            value={formData.idPers || null}
                            onChange={(id) => handleSelectChange('idPers', id)}
                            placeholder="Sélectionner une personne"
                        />
                    </div>
                    <InputField label="Nombre d'erreurs" name="nbreErreur" value={formData.nbreErreur || ''} onChange={handleChange} />
                </FieldGroup>

                <FieldGroup title="Temporalité">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField type="text" label="Date Début" name="dateDeb" placeholder="YYYYMMDD" value={formData.dateDeb || ''} onChange={handleChange} />
                        <InputField type="text" label="Heure Début" name="hDeb" placeholder="HH:MM:SS" value={formData.hDeb || ''} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField type="number" label="Durée (min)" name="duree" value={formData.duree || ''} onChange={handleChange} />
                        <InputField type="number" label="Durée Max (min)" name="dureeMax" value={formData.dureeMax || ''} onChange={handleChange} />
                    </div>
                </FieldGroup>
                
                <FieldGroup title="Technique">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField type="number" label="ID ALM Sous-spé" name="idAlmSousSousSpe" value={formData.idAlmSousSousSpe || ''} onChange={handleChange} />
                        <InputField type="number" label="ID Détail Réf." name="idDetRef" value={formData.idDetRef || ''} onChange={handleChange} />
                    </div>
                </FieldGroup>
            </div>
            <div className="flex justify-end items-center p-4 bg-gray-50 border-t rounded-b-lg">
                <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Annuler
                </button>
                <button type="submit" disabled={isSubmitting} className="ml-3 inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300">
                    {isSubmitting ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                    <span className="ml-2">Enregistrer</span>
                </button>
            </div>
        </form>
    );
};

const FieldGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {children}
    </div>
);


const InputField: React.FC<{ label: string, name: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, type?: string, required?: boolean, placeholder?: string }> = ({ label, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input id={name} name={name} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
    </div>
);

const DeletePanel: React.FC<{ lot: Lot, onDelete: () => void, onCancel: () => void }> = ({ lot, onDelete, onCancel }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete();
    };
    
    return (
        <div className="flex flex-col h-full">
             <div className="flex items-center p-4 border-b">
                 <h2 className="text-xl font-semibold text-gray-800">Supprimer le lot</h2>
            </div>
            <div className="p-6 flex-1">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                            Êtes-vous sûr de vouloir supprimer le lot <strong>{lot.libelle}</strong> ? Cette action est irréversible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button type="button" onClick={handleDelete} disabled={isDeleting} className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-300">
                    {isDeleting ? <Loader className="animate-spin" size={20} /> : <Trash2 size={20} />}
                    <span className="ml-2">Supprimer</span>
                </button>
                <button type="button" onClick={onCancel} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                    Annuler
                </button>
            </div>
        </div>
    );
};

export default CrudPanel;
