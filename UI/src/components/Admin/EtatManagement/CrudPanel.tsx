import React, { useState, useEffect } from 'react';
import { Etat } from '../../../types/Etat';
import { X, Save, Loader, Plus, Shield, Edit, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type PanelState = 'idle' | 'newEtat' | 'viewEtat' | 'editEtat' | 'deleteEtat';

interface CrudPanelProps {
    panelState: PanelState;
    etat: Etat | null;
    onAddNew: () => void;
    onCancel: () => void;
    onSave: (etapeData: Partial<Etat>) => Promise<boolean>;
    onDelete: () => void;
    onEdit: (etat: Etat) => void;
    onConfirmDelete: (etat: Etat) => void;
}

const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

const CrudPanel: React.FC<CrudPanelProps> = ({ panelState, etat, onAddNew, onCancel, onSave, onDelete, onEdit, onConfirmDelete }) => {
    
    const renderContent = () => {
        switch(panelState) {
            case 'viewEtat':
                return etat && <ViewPanel etat={etat} onEdit={onEdit} onConfirmDelete={onConfirmDelete} onCancel={onCancel} />;
            case 'newEtat':
            case 'editEtat':
                return <FormPanel etatToEdit={etat} onSave={onSave} onCancel={onCancel} />;
            case 'deleteEtat':
                return etat && <DeletePanel etat={etat} onDelete={onDelete} onCancel={onCancel} />;
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
        <Shield className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Gestion des états</h3>
        <p className="text-sm text-gray-500 mt-1">Sélectionnez un état pour voir ses détails ou en ajouter un nouveau.</p>
        <button
            onClick={onAddNew}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
            <Plus size={18} /> Ajouter un état
        </button>
    </div>
);

const ViewPanel: React.FC<{ etat: Etat, onEdit: (etat: Etat) => void, onConfirmDelete: (etat: Etat) => void, onCancel: () => void }> = ({ etat, onEdit, onConfirmDelete, onCancel }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 flex items-center gap-4">
                 <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-700" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{etat.libelle}</h2>
                    <p className="text-sm text-gray-500">ID: {etat.idEtat}</p>
                </div>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                 {/* No extra details to show for now */}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => onConfirmDelete(etat)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <Trash2 size={16} /> Supprimer
                </button>
                <button onClick={() => onEdit(etat)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Edit size={16} /> Modifier
                </button>
            </div>
        </div>
    );
};

const FormPanel: React.FC<{ etatToEdit: Etat | null; onSave: (data: Partial<Etat>) => Promise<boolean>; onCancel: () => void }> = ({ etatToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ libelle: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = etatToEdit !== null;

    useEffect(() => {
        if (etatToEdit) {
            setFormData({ libelle: etatToEdit.libelle || '' });
        } else {
            setFormData({ libelle: '' });
        }
    }, [etatToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await onSave(formData);
        if (!success) {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Modifier' : 'Ajouter'} un état</h2>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>
            <div className="p-6 flex-1 space-y-4 overflow-y-auto">
                <InputField label="Libellé" name="libelle" value={formData.libelle} onChange={handleChange} required />
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

const InputField: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean }> = ({ label, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input id={name} name={name} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
    </div>
);

const DeletePanel: React.FC<{ etat: Etat, onDelete: () => void, onCancel: () => void }> = ({ etat, onDelete, onCancel }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete();
    };
    
    return (
        <div className="flex flex-col h-full">
             <div className="flex items-center p-4 border-b">
                 <h2 className="text-xl font-semibold text-gray-800">Supprimer l'état</h2>
            </div>
            <div className="p-6 flex-1">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                            Êtes-vous sûr de vouloir supprimer l'état <strong>{etat.libelle}</strong> ? Cette action est irréversible.
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