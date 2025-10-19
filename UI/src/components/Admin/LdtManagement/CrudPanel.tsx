import React, { useState, useEffect } from 'react';
import { Ldt } from '../../../types/Ldt';
import { Lot } from '../../../types/Lot';
import { Dossier } from '../../../types/Dossier';
import { LotClient } from '../../../types/LotClient';
import { Etape } from '../../../types/Etape';
import { ManagedUser } from '../../../types/Users';
import { X, Save, Loader, Plus, Clock, Edit, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchableSelect from '../../../shared/SearchableSelect';
import LotService from '../../../services/LotService';
import DossiersService from '../../../services/DossiersService';
import LotClientService from '../../../services/LotClientService';
import UsersService from '../../../services/UsersService';
import EtapeService from '../../../services/EtapeService';

type PanelState = 'idle' | 'newLdt' | 'viewLdt' | 'editLdt' | 'deleteLdt';

interface CrudPanelProps {
    panelState: PanelState;
    ldt: Ldt | null;
    onAddNew: () => void;
    onCancel: () => void;
    onSave: (ldtData: Partial<Ldt>) => Promise<boolean>;
    onDelete: () => void;
    onEdit: (ldt: Ldt) => void;
    onConfirmDelete: (ldt: Ldt) => void;
}

const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

const CrudPanel: React.FC<CrudPanelProps> = ({ panelState, ldt, onAddNew, onCancel, onSave, onDelete, onEdit, onConfirmDelete }) => {

    const renderContent = () => {
        switch (panelState) {
            case 'viewLdt':
                return ldt && <ViewPanel ldt={ldt} onEdit={onEdit} onConfirmDelete={onConfirmDelete} onCancel={onCancel} />;
            case 'newLdt':
            case 'editLdt':
                return <FormPanel ldtToEdit={ldt} onSave={onSave} onCancel={onCancel} />;
            case 'deleteLdt':
                return ldt && <DeletePanel ldt={ldt} onDelete={onDelete} onCancel={onCancel} />;
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
        <Clock className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Gestion des Lignes de Temps</h3>
        <p className="text-sm text-gray-500 mt-1">Sélectionnez une ligne de temps pour voir ses détails ou en ajouter une nouvelle.</p>
        <button
            onClick={onAddNew}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
            <Plus size={18} /> Ajouter une LDT
        </button>
    </div>
);

const ViewPanel: React.FC<{ ldt: Ldt, onEdit: (ldt: Ldt) => void, onConfirmDelete: (ldt: Ldt) => void, onCancel: () => void }> = ({ ldt, onEdit, onConfirmDelete, onCancel }) => {
    const formatDateTime = (dateStr: string | null, timeStr: string | null) => {
        if (!dateStr || !timeStr) return 'N/A';
        try {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const date = new Date(`${year}-${month}-${day}T${timeStr}`);
            return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' });
        } catch (e) { return 'Date invalide'; }
    };
    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 flex items-center gap-4">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-700" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">LDT ID: {ldt.idLdt}</h2>
                    <p className="text-sm text-gray-500">{ldt.typeLdtLibelle || 'Type non défini'}</p>
                </div>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <InfoGroup title="Identification">
                    <InfoItem label="Lot" value={ldt.lotLibelle || `ID: ${ldt.idLot}`} />
                    <InfoItem label="Lot Client" value={ldt.lotClientLibelle || `ID: ${ldt.idLotClient}`} />
                    <InfoItem label="Dossier" value={ldt.dossierNum || `ID: ${ldt.idDossier}`} />
                    <InfoItem label="Utilisateur" value={ldt.userName || `ID: ${ldt.idPers}`} />
                    <InfoItem label="Étape" value={ldt.etapeLibelle || `ID: ${ldt.idEtape}`} />
                </InfoGroup>
                <InfoGroup title="Temporalité">
                    <InfoItem label="Début" value={formatDateTime(ldt.dateDebLdt, ldt.hDeb)} />
                    <InfoItem label="Fin" value={formatDateTime(ldt.dateFinLdt, ldt.hFin)} />
                    <InfoItem label="Durée (min)" value={ldt.dureeLdt?.toString() || 'N/A'} />
                    <InfoItem label="Heures Sup." value={ldt.heureSup ? 'Oui' : 'Non'} />
                </InfoGroup>
                <InfoGroup title="Données de production">
                    <InfoItem label="Quantité" value={ldt.quantite || 'N/A'} />
                    <InfoItem label="Nombre d'erreurs" value={ldt.nbreErreur || 'N/A'} />
                    <InfoItem label="Commentaire" value={ldt.commentaire || 'N/A'} />
                </InfoGroup>
                <InfoGroup title="Informations Techniques">
                    <InfoItem label="Machine" value={ldt.machine || 'N/A'} />
                    <InfoItem label="Adresse IP" value={ldt.addressIp || 'N/A'} />
                    <InfoItem label="Adresse MAC" value={ldt.mac || 'N/A'} />
                </InfoGroup>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => onConfirmDelete(ldt)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <Trash2 size={16} /> Supprimer
                </button>
                <button onClick={() => onEdit(ldt)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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

const FormPanel: React.FC<{ ldtToEdit: Ldt | null; onSave: (data: Partial<Ldt>) => Promise<boolean>; onCancel: () => void }> = ({ ldtToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Ldt>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = ldtToEdit !== null;

    useEffect(() => {
        if (ldtToEdit) {
            setFormData(ldtToEdit);
        } else {
            setFormData({
                idEtat: 1,
                heureSup: false,
                modifBatch: false,
                byExcelTeletravail: false,
                dateDebLdt: new Date().toISOString().substring(0, 10).replace(/-/g, '')!, // YYYYMMDD
                hDeb: new Date().toTimeString().split(' ')[0]!, // HH:MM:SS
            });
        }
    }, [ldtToEdit]);

    const handleSelectChange = (name: keyof Ldt, value: number | null) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        const payload = { ...formData };
        const success = await onSave(payload);
        if (!success) setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Modifier' : 'Ajouter'} une LDT</h2>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                <FieldGroup title="Assignations">
                    <SearchableSelect label="Utilisateur" fetchOptions={UsersService.getUsers} optionValue={(u: ManagedUser) => u.id_pers} optionLabel={(u: ManagedUser) => `${u.prenom} ${u.nom}`} value={formData.idPers!} onChange={id => handleSelectChange('idPers', id)} placeholder="Sélectionner un utilisateur" />
                    <SearchableSelect label="Dossier" fetchOptions={DossiersService.getDossiers} optionValue={(d: Dossier) => d.idDossier} optionLabel={(d: Dossier) => d.numDossier} value={formData.idDossier!} onChange={id => handleSelectChange('idDossier', id)} placeholder="Sélectionner un dossier" />
                    <SearchableSelect label="Lot Client" fetchOptions={LotClientService.getLotClients} optionValue={(lc: LotClient) => lc.idLotClient} optionLabel={(lc: LotClient) => lc.libelle!} value={formData.idLotClient!} onChange={id => handleSelectChange('idLotClient', id)} placeholder="Sélectionner un lot client" />
                    <SearchableSelect label="Lot" fetchOptions={LotService.getLots} optionValue={(l: Lot) => l.idLot} optionLabel={(l: Lot) => l.libelle!} value={formData.idLot!} onChange={id => handleSelectChange('idLot', id)} placeholder="Sélectionner un lot" />
                </FieldGroup>
                <FieldGroup title="Statut & Type">
                    <SearchableSelect label="Étape" fetchOptions={EtapeService.getEtapes} optionValue={(e: Etape) => e.idEtape} optionLabel={(e: Etape) => e.libelle!} value={formData.idEtape!} onChange={id => handleSelectChange('idEtape', id)} placeholder="Sélectionner une étape" />
                    <InputField type="number" label="ID Type LDT" name="idTypeLdt" value={formData.idTypeLdt || ''} onChange={handleChange} />
                    <SelectField label="État" name="idEtat" value={formData.idEtat || ''} onChange={handleChange}>
                        <option value="1">Nouveau</option><option value="2">Actif</option><option value="3">En Pause</option><option value="4">Terminé</option><option value="5">Erreur</option><option value="6">Rejeté</option>
                    </SelectField>
                </FieldGroup>
                <FieldGroup title="Temporalité">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField type="text" label="Date Début" name="dateDebLdt" placeholder="YYYYMMDD" value={formData.dateDebLdt || ''} onChange={handleChange} />
                        <InputField type="time" label="Heure Début" name="hDeb" value={formData.hDeb || ''} onChange={handleChange} step="1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField type="text" label="Date Fin" name="dateFinLdt" placeholder="YYYYMMDD" value={formData.dateFinLdt || ''} onChange={handleChange} />
                        <InputField type="time" label="Heure Fin" name="hFin" value={formData.hFin || ''} onChange={handleChange} step="1" />
                    </div>
                    <InputField type="number" label="Durée (min)" name="dureeLdt" value={formData.dureeLdt || ''} onChange={handleChange} />
                </FieldGroup>
                <FieldGroup title="Production">
                    <InputField label="Quantité" name="quantite" value={formData.quantite || ''} onChange={handleChange} />
                    <InputField label="Nombre d'erreurs" name="nbreErreur" value={formData.nbreErreur || ''} onChange={handleChange} />
                    <InputField label="Commentaire" name="commentaire" value={formData.commentaire || ''} onChange={handleChange} />
                </FieldGroup>
                <FieldGroup title="Technique">
                    <InputField label="Machine" name="machine" value={formData.machine || ''} onChange={handleChange} />
                    <InputField label="Adresse IP" name="addressIp" value={formData.addressIp || ''} onChange={handleChange} />
                    <InputField label="Adresse MAC" name="mac" value={formData.mac || ''} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField type="number" label="ID LDT Neocles" name="idLdtNeocles" value={formData.idLdtNeocles || ''} onChange={handleChange} />
                        <InputField type="number" label="ID ALM" name="idAlmSousSousSpe" value={formData.idAlmSousSousSpe || ''} onChange={handleChange} />
                    </div>
                    <div className="flex space-x-6 pt-2">
                        <CheckboxField label="Heures Sup." name="heureSup" checked={formData.heureSup || false} onChange={handleChange} />
                        <CheckboxField label="Modif Batch" name="modifBatch" checked={formData.modifBatch || false} onChange={handleChange} />
                        <CheckboxField label="Excel Télétravail" name="byExcelTeletravail" checked={formData.byExcelTeletravail || false} onChange={handleChange} />
                    </div>
                </FieldGroup>
            </div>
            <div className="flex justify-end items-center p-4 bg-gray-50 border-t rounded-b-lg">
                <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="ml-3 inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300">
                    {isSubmitting ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                    <span className="ml-2">Enregistrer</span>
                </button>
            </div>
        </form>
    );
};

const FieldGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (<div className="space-y-4 border-t border-gray-200 pt-4 first:border-t-0 first:pt-0"><h3 className="text-sm font-medium text-gray-600">{title}</h3>{children}</div>);
const InputField: React.FC<{ label: string, name: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean, placeholder?: string, step?: string }> = ({ label, name, ...props }) => (<div><label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label><input id={name} name={name} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" /></div>);
const SelectField: React.FC<{ label: string, name: string, value: any, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode }> = ({ label, name, value, onChange, children }) => (<div><label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label><select id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">{children}</select></div>);
const CheckboxField: React.FC<{ label: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, checked, onChange }) => (<div className="flex items-center"><input id={name} name={name} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" /><label htmlFor={name} className="ml-2 block text-sm text-gray-900">{label}</label></div>);

const DeletePanel: React.FC<{ ldt: Ldt, onDelete: () => void, onCancel: () => void }> = ({ ldt, onDelete, onCancel }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const handleDelete = async () => { setIsDeleting(true); await onDelete(); };
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b"><h2 className="text-xl font-semibold text-gray-800">Supprimer la Ligne de Temps</h2></div>
            <div className="p-6 flex-1">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <div className="mt-2"><p className="text-sm text-gray-500">Êtes-vous sûr de vouloir supprimer la LDT ID <strong>{ldt.idLdt}</strong> ? Cette action est irréversible.</p></div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button type="button" onClick={handleDelete} disabled={isDeleting} className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-300">
                    {isDeleting ? <Loader className="animate-spin" size={20} /> : <Trash2 size={20} />} <span className="ml-2">Supprimer</span>
                </button>
                <button type="button" onClick={onCancel} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">Annuler</button>
            </div>
        </div>
    );
};

export default CrudPanel;