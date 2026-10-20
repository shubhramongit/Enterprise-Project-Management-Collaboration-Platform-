import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return navigate('/');
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await axios.get('http://localhost:5000/api/projects', { headers: { Authorization: `Bearer ${token}` } });
    setProjects(res.data);
  };

  const createProject = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/projects', { name: projectName }, { headers: { Authorization: `Bearer ${token}` } });
    setProjectName('');
    fetchProjects();
  };

  return (
    <div className="container card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>My Workspaces</h2>
        <button className="secondary" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
      </div>

      <form onSubmit={createProject} style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
        <input placeholder="New Project Name" required value={projectName} onChange={e => setProjectName(e.target.value)} />
        <button type="submit" style={{ whiteSpace: 'nowrap' }}>+ Create Project</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {projects.map(p => (
          <div key={p.id} className="issue-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeft: 'none', border: '1px solid var(--border)' }}>
            <strong style={{ fontSize: '18px' }}>{p.name}</strong>
            <button className="secondary" onClick={() => navigate(`/project/${p.id}`)}>Open Board →</button>
          </div>
        ))}
      </div>
    </div>
  );
}