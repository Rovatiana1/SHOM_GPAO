
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { loginUser } from '../../store/slices/authSlice';

const clientLots = [
    { id: 30018, name: '20191212_TEST' },
    { id: 61804, name: '20230712' },
    { id: 74326, name: '20250702' },
    { id: 56870, name: 'AJACCIO' },
    { id: 55250, name: 'BASSE_TERRE' },
    { id: 57032, name: 'BAYONNE_BOUCAU' },
    { id: 57033, name: 'BELLE_ILE' },
    { id: 57034, name: 'CAYENNE' },
    { id: 33114, name: 'DA2020-400-1' },
    { id: 33132, name: 'DA2020-400-2' },
    { id: 33133, name: 'DA2020-400-3' },
    { id: 33134, name: 'DA2020-400-4' },
    { id: 33135, name: 'DA2020-400-5' },
    { id: 33623, name: 'DA2020-400-6' },
    { id: 33742, name: 'DA2020-400-7' },
    { id: 33805, name: 'DA2020-400-8' },
    { id: 53835, name: 'DIEGO_SUAREZ' },
    { id: 63136, name: 'FORT_DE_FRANCE' },
    { id: 57035, name: 'GUERNESEY' },
    { id: 56679, name: 'ILE_DU_SALUT' },
    { id: 56629, name: 'ILE_ROYALE' },
    { id: 56665, name: 'JERSEY' },
    { id: 38149, name: 'LA_REUNION' },
    { id: 37917, name: 'MAYOTTE' },
    { id: 53834, name: 'NOSY_BE' },
    { id: 56620, name: 'POINTE_A_PITRE' },
    { id: 57036, name: 'PORT_TUDY' },
    { id: 37918, name: 'SOCOA' },
    { id: 55458, name: 'TAMATAVE' },
    { id: 30187, name: 'TEST' },
    { id: 31914, name: 'TEST_2' },
    { id: 30752, name: 'TEST_DEV' },
    { id: 30475, name: 'TEST_REAL' },
    { id: 55598, name: 'TULEAR' },
];

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [idEtape, setIdEtape] = useState<number>(4674); // Default to CQ
    const [idLotClient, setIdLotClient] = useState<number>(30752); // Default to TEST_DEV
    const [formError, setFormError] = useState<string | null>(null);

    const dispatch: AppDispatch = useDispatch();
    const { isAuthenticated, loading, error: authError } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            if (idEtape === 4688) { // CQ_ISO
                navigate('/processing/cq-iso');
            } else { // CQ (default) is at /processing
                navigate('/processing');
            }
        }
    }, [isAuthenticated, navigate, idEtape]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!username || !password) {
            setFormError('Veuillez saisir un identifiant et un mot de passe.');
            return;
        }

        dispatch(loginUser({ username, password, idEtape, idLotClient }));
    };

    return (
        <div id="login-page" className="min-h-screen login-bg flex items-center justify-center p-4 text-gray-900">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md" data-aos="fade-up">
                <div className="bg-green-50 py-6 px-4 border-b border-green-100">
                    <h2 className="mt-4 text-center text-2xl font-bold text-gray-800">Connexion au système</h2>
                    <p className="mt-1 text-center text-sm text-gray-600">Session interne</p>
                </div>
                
                <form className="px-8 py-6" onSubmit={handleSubmit} noValidate>
                    {(authError || formError) && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Erreur: </strong>
                            <span className="block sm:inline">{authError || formError}</span>
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="processType" className="block text-sm font-medium text-gray-700 mb-1">Type de traitement</label>
                        <select
                            id="processType"
                            name="processType"
                            value={idEtape}
                            onChange={(e) => setIdEtape(Number(e.target.value))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border"
                        >
                            <option value={4674}>CQ cible</option>
                            <option value={4688}>CQ ISO</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="clientLot" className="block text-sm font-medium text-gray-700 mb-1">Lot Client</label>
                        <select
                            id="clientLot"
                            name="clientLot"
                            value={idLotClient}
                            onChange={(e) => setIdLotClient(Number(e.target.value))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border"
                        >
                            {clientLots.map(lot => (
                                <option key={lot.id} value={lot.id}>{lot.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="h-5 w-5 text-gray-400 fas fa-user"></i>
                            </div>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" 
                                placeholder="Votre identifiant"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="h-5 w-5 text-gray-400 fas fa-key"></i>
                            </div>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" 
                                placeholder="Votre mot de passe"
                                required
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-green-400" disabled={loading}>
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                    
                    <div className="mt-4 text-center">
                        <a href="#" className="text-sm text-green-600 hover:text-green-800">Problème de connexion ?</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
