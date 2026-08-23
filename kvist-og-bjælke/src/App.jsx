import { useState } from 'react';
import logoUrl from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (event) => {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value
        }));
    };

    const changeMode = (nextMode) => {
        setMode(nextMode);
        setMessage({ type: '', text: '' });
        setForm((current) => ({ ...current, email: '', password: '' }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        const endpoint = mode === 'login' ? '/login' : '/register';
        const payload = mode === 'login'
            ? { username: form.username, password: form.password }
            : form;

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) {
                const detail = Array.isArray(data.detail)
                    ? data.detail[0]?.msg
                    : data.detail;
                throw new Error(detail || 'Der opstod en fejl. Prøv igen.');
            }

            if (mode === 'register') {
                setMode('login');
                setForm({ username: data.username, email: '', password: '' });
                setMessage({
                    type: 'success',
                    text: 'Din bruger er oprettet. Du kan logge ind nu.'
                });
            } else {
                setUser(data);
                setForm((current) => ({ ...current, password: '' }));
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const logout = () => {
        setUser(null);
        setForm({ username: '', email: '', password: '' });
        setMessage({ type: '', text: '' });
    };

    return (
        <main className="page-shell">
            <section className="auth-card">
                <div className="brand-panel">
                    <img className="brand-logo" src={logoUrl} alt="Kvist og Byg ApS" />
                    <div className="brand-copy">
                        <p className="eyebrow">Kvist og Byg ApS</p>
                        <h1>Velkommen hjem</h1>
                        <p>Log ind for at fortsætte, eller opret en ny bruger.</p>
                    </div>
                </div>

                <div className="form-panel">
                    {user ? (
                        <div className="welcome-state">
                            <span className="success-icon" aria-hidden="true">✓</span>
                            <p className="eyebrow">Du er logget ind</p>
                            <h2>Hej, {user.username}</h2>
                            <p>{user.email}</p>
                            <button className="secondary-button" type="button" onClick={logout}>
                                Log ud
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mode-switch" aria-label="Vælg login eller oprettelse">
                                <button
                                    className={mode === 'login' ? 'active' : ''}
                                    type="button"
                                    onClick={() => changeMode('login')}
                                >
                                    Log ind
                                </button>
                                <button
                                    className={mode === 'register' ? 'active' : ''}
                                    type="button"
                                    onClick={() => changeMode('register')}
                                >
                                    Opret bruger
                                </button>
                            </div>

                            <div className="form-heading">
                                <p className="eyebrow">
                                    {mode === 'login' ? 'Velkommen tilbage' : 'Ny hos os?'}
                                </p>
                                <h2>{mode === 'login' ? 'Log ind på din konto' : 'Opret din konto'}</h2>
                            </div>

                            <form onSubmit={submit}>
                                <label htmlFor="username">Brugernavn</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    minLength={mode === 'register' ? 3 : 1}
                                    maxLength="50"
                                    required
                                    value={form.username}
                                    onChange={updateField}
                                />

                                {mode === 'register' && (
                                    <>
                                        <label htmlFor="email">E-mail</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={form.email}
                                            onChange={updateField}
                                        />
                                    </>
                                )}

                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                    minLength={mode === 'register' ? 8 : 1}
                                    maxLength="128"
                                    required
                                    value={form.password}
                                    onChange={updateField}
                                />

                                {message.text && (
                                    <p className={`message ${message.type}`} role="status">
                                        {message.text}
                                    </p>
                                )}

                                <button className="primary-button" type="submit" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? 'Vent et øjeblik…'
                                        : mode === 'login' ? 'Log ind' : 'Opret bruger'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}

export default App;
