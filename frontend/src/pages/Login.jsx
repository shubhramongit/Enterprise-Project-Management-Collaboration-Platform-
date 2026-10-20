import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert('Registration failed. Try a different email.');
    }
  };

  return (
    <div className="container card" style={{ maxWidth: '450px', marginTop: '10vh' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>Create Account</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} />
        <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" style={{ marginTop: '8px' }}>Register & Continue →</button>
      </form>
    </div>
  );
}