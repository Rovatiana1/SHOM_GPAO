
import React, { useState } from 'react';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const isUsernameValid = !!username;
        const isPasswordValid = !!password;
        
        setUsernameError(!isUsernameValid);
        setPasswordError(!isPasswordValid);

        if (isUsernameValid && isPasswordValid) {
            onLoginSuccess();
        }
    };

    return (
        <div id="login-page" className="min-h-screen login-bg flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md" data-aos="fade-up">
                <div className="bg-green-50 py-6 px-4 border-b border-green-100">
                    <div className="flex justify-center">
                        <div className="bg-green-100 p-3 rounded-full">
                            <i data-feather="lock" className="text-green-600 w-8 h-8"></i>
                        </div>
                    </div>
                    <h2 className="mt-4 text-center text-2xl font-bold text-gray-800">Connexion au système</h2>
                    <p className="mt-1 text-center text-sm text-gray-600">Authentification LDAPS</p>
                </div>
                
                <form className="px-8 py-6" onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i data-feather="user" className="h-5 w-5 text-gray-400"></i>
                            </div>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" 
                                placeholder="Votre identifiant"
                            />
                        </div>
                        <p className={`mt-1 text-xs text-red-600 ${!usernameError && 'hidden'}`}>Veuillez saisir un identifiant valide</p>
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i data-feather="key" className="h-5 w-5 text-gray-400"></i>
                            </div>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" 
                                placeholder="Votre mot de passe"
                            />
                        </div>
                        <p className={`mt-1 text-xs text-red-600 ${!passwordError && 'hidden'}`}>Le mot de passe est requis</p>
                    </div>
                    
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                        Se connecter
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
