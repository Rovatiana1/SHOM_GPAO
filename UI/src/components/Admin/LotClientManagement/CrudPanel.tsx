import React, { useState, useEffect } from 'react';
import { LotClient } from '../../../types/LotClient';
import { Dossier } from '../../../types/Dossier';
import { ManagedUser } from '../../../types/Users';
import { X, Save, Loader, Plus, Briefcase, Edit, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchableSelect from '../../../shared/SearchableSelect';
import DossiersService from '../../../services/DossiersService';
import UsersService from '../../../services/UsersService';

type PanelState = 'idle' | 'newLotClient' | 'viewLotClient' | 'editLotClient' | 'deleteLotClient';

interface CrudPanelProps {
    panelState: PanelState;
    lotClient: LotClient | null;
    onAddNew: () => void;
    onCancel: () => void;
    onSave: (data: Partial<LotClient>) => Promise<boolean>;
    onDelete: () => void;
    onEdit: (lotClient: LotClient) => void;
    onConfirmDelete: (lotClient: LotClient) => void;
}

const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

const CrudPanel: React.FC<CrudPanelProps> = ({ panelState, lotClient, onAddNew, onCancel, onSave, onDelete, onEdit, onConfirmDelete }) => {
    
    const renderContent = () => {
        switch(panelState) {
            case 'viewLotClient':
                return lotClient && <ViewPanel lotClient={lotClient} onEdit={onEdit} onConfirmDelete={onConfirmDelete} onCancel={onCancel} />;
            case 'newLotClient':
            case 'editLotClient':
                return <FormPanel lotClientToEdit={lotClient} onSave={onSave} onCancel={onCancel} />;
            case 'deleteLotClient':
                return lotClient && <DeletePanel lotClient={lotClient} onDelete={onDelete} onCancel={onCancel} />;
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
        <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Gestion des Lots Client</h3>
        <p className="text-sm text-gray-500 mt-1">Sélectionnez un lot client pour voir ses détails ou en ajouter un nouveau.</p>
        <button
            onClick={onAddNew}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
            <Plus size={18} /> Ajouter un lot client
        </button>
    </div>
);

const ViewPanel: React.FC<{ lotClient: LotClient, onEdit: (lotClient: LotClient) => void, onConfirmDelete: (lotClient: LotClient) => void, onCancel: () => void }> = ({ lotClient, onEdit, onConfirmDelete, onCancel }) => {
     const getStatusBadge = (statusId: number | null) => {
        switch(statusId) {
            case 1: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Nouveau</span>;
            case 2: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Actif</span>;
            case 3: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En Pause</span>;
            case 4: return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Terminé</span>;
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
                    <Briefcase className="w-6 h-6 text-green-700" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{lotClient.libelle}</h2>
                    <p className="text-sm text-gray-500">ID: {lotClient.idLotClient}</p>
                </div>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <InfoGroup title="Assignations">
                    <InfoItem label="Dossier" value={lotClient.dossierNum || lotClient.idDossier?.toString() || 'N/A'} />
                    <InfoItem label="Personne" value={lotClient.userName || lotClient.idPers?.toString() || 'N/A'} />
                    <InfoItem label="Catégorie" value={lotClient.idCategorie?.toString() || 'N/A'} />
                     <div>
                        <p className="text-sm font-medium text-gray-500">État</p>
                        <div className="mt-2">{getStatusBadge(lotClient.idEtat)}</div>
                    </div>
                </InfoGroup>

                <InfoGroup title="Cibles de performance">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Cible A" value={lotClient.cibleA?.toString() || 'N/A'} />
                        <InfoItem label="Cible B" value={lotClient.cibleB?.toString() || 'N/A'} />
                        <InfoItem label="Cible C" value={lotClient.cibleC?.toString() || 'N/A'} />
                        <InfoItem label="Cible D" value={lotClient.cibleD?.toString() || 'N/A'} />
                    </div>
                     <InfoItem label="Vitesse d'équilibre" value={lotClient.vitesseEquilibre?.toString() || 'N/A'} />
                </InfoGroup>
                
                 <InfoGroup title="Informations Techniques">
                    <InfoItem label="ID CAE" value={lotClient.idCae?.toString() || 'N/A'} />
                    <InfoItem label="ID CAE 2" value={lotClient.idCae2?.toString() || 'N/A'} />
                    <InfoItem label="ID CAE Projet" value={lotClient.idCaeProjet?.toString() || 'N/A'} />
                </InfoGroup>

                 <InfoGroup title="Commentaires">
                    <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-x-auto">
                        {lotClient.commentaires ? JSON.stringify(lotClient.commentaires, null, 2) : 'Aucun commentaire'}
                    </pre>
                </InfoGroup>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => onConfirmDelete(lotClient)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <Trash2 size={16} /> Supprimer
                </button>
                <button onClick={() => onEdit(lotClient)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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


const FormPanel: React.FC<{ lotClientToEdit: LotClient | null; onSave: (data: Partial<LotClient>) => Promise<boolean>; onCancel: () => void }> = ({ lotClientToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<LotClient>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = lotClientToEdit !== null;

    useEffect(() => {
        if (lotClientToEdit) {
            setFormData({
                ...lotClientToEdit,
                commentaires: lotClientToEdit.commentaires ? JSON.stringify(lotClientToEdit.commentaires, null, 2) : ''
            });
        } else {
            setFormData({ libelle: '', idEtat: 1, commentaires: '' });
        }
    }, [lotClientToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name: keyof LotClient, value: number | null) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        let commentsPayload = formData.commentaires;
        try {
            if (typeof commentsPayload === 'string' && commentsPayload.trim() !== '') {
                commentsPayload = JSON.parse(commentsPayload);
            }
        } catch(err) {
            alert('Le champ "Commentaires" contient un JSON invalide.');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            ...formData,
            commentaires: commentsPayload,
        };

        console.log("payload => ",payload)
        const success = await onSave(payload);
        if (!success) {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Modifier' : 'Ajouter'} un lot client</h2>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>
            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                <FieldGroup title="Informations Principales">
                    <InputField label="Libellé" name="libelle" value={formData.libelle || ''} onChange={handleChange} required />
                    <SearchableSelect
                        label="Dossier"
                        fetchOptions={DossiersService.getDossiers}
                        optionValue={(d: Dossier) => d.idDossier}
                        optionLabel={(d: Dossier) => `${d.numDossier} (ID: ${d.idDossier})`}
                        value={formData.idDossier || null}
                        onChange={(id) => handleSelectChange('idDossier', id)}
                        placeholder="Sélectionner un dossier"
                    />
                </FieldGroup>
                
                 <FieldGroup title="Assignation & Statut">
                    <SearchableSelect
                        label="Personne"
                        fetchOptions={UsersService.getUsers}
                        optionValue={(u: ManagedUser) => u.id_pers}
                        optionLabel={(u: ManagedUser) => `${u.prenom} ${u.nom}`}
                        value={formData.idPers || null}
                        onChange={(id) => handleSelectChange('idPers', id)}
                        placeholder="Sélectionner une personne"
                    />
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                         <div>
                            <label htmlFor="idEtat" className="block text-sm font-medium text-gray-700">État</label>
                            <select name="idEtat" id="idEtat" value={formData.idEtat || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                                <option value="1">Nouveau</option>
                                <option value="2">Actif</option>
                                <option value="3">En Pause</option>
                                <option value="4">Terminé</option>
                            </select>
                        </div>
                        <InputField type="number" label="ID Catégorie" name="idCategorie" value={formData.idCategorie || ''} onChange={handleChange} />
                    </div>
                </FieldGroup>
                
                 <FieldGroup title="Performance">
                     <div className="grid grid-cols-2 gap-4">
                        <InputField type="number" label="Cible A" name="cibleA" value={formData.cibleA || ''} onChange={handleChange} step="any" />
                        <InputField type="number" label="Cible B" name="cibleB" value={formData.cibleB || ''} onChange={handleChange} step="any" />
                        <InputField type="number" label="Cible C" name="cibleC" value={formData.cibleC || ''} onChange={handleChange} step="any" />
                        <InputField type="number" label="Cible D" name="cibleD" value={formData.cibleD || ''} onChange={handleChange} step="any" />
                    </div>
                    <InputField type="number" label="Vitesse d'équilibre" name="vitesseEquilibre" value={formData.vitesseEquilibre || ''} onChange={handleChange} step="any" />
                </FieldGroup>

                <FieldGroup title="Technique & Commentaires">
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <InputField type="number" label="ID CAE" name="idCae" value={formData.idCae || ''} onChange={handleChange} />
                        <InputField type="number" label="ID CAE 2" name="idCae2" value={formData.idCae2 || ''} onChange={handleChange} />
                        <InputField type="number" label="ID CAE Projet" name="idCaeProjet" value={formData.idCaeProjet || ''} onChange={handleChange} />
                    </div>
                     <div>
                        <label htmlFor="commentaires" className="block text-sm font-medium text-gray-700">Commentaires (JSON)</label>
                        <textarea id="commentaires" name="commentaires" value={formData.commentaires || ''} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm font-mono"></textarea>
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
    <div className="space-y-4 border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {children}
    </div>
);

const InputField: React.FC<{ label: string, name: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, type?: string, required?: boolean, step?: string }> = ({ label, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input id={name} name={name} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
    </div>
);

const DeletePanel: React.FC<{ lotClient: LotClient, onDelete: () => void, onCancel: () => void }> = ({ lotClient, onDelete, onCancel }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete();
    };
    
    return (
        <div className="flex flex-col h-full">
             <div className="flex items-center p-4 border-b">
                 <h2 className="text-xl font-semibold text-gray-800">Supprimer le Lot Client</h2>
            </div>
            <div className="p-6 flex-1">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                            Êtes-vous sûr de vouloir supprimer le lot client <strong>{lotClient.libelle}</strong> ? Cette action est irréversible.
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
