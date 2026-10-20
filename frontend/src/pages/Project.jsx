import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [title, setTitle] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return navigate('/');
    
    axios.get(`http://localhost:5000/api/projects/${id}/issues`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setIssues(res.data))
      .catch(err => console.error(err));

    const socket = io('http://localhost:5000');
    socket.on(`project_${id}_updated`, (data) => {
      if (data.type === 'NEW_ISSUE') {
        setIssues(prev => [data.issue, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [id, token, navigate]);

  const createIssue = async (e) => {
    e.preventDefault();
    await axios.post(`http://localhost:5000/api/projects/${id}/issues`, 
      { title, description: 'Created from UI', status: 'TODO', priority: 'HIGH' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTitle('');
  };

  return (
    <div className="container">
      <button className="secondary" onClick={() => navigate('/dashboard')} style={{ marginBottom: '24px' }}>
        ← Back to Dashboard
      </button>
      
      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>Project Board</h2>

        <form onSubmit={createIssue} style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          <input placeholder="Enter new task..." required value={title} onChange={e => setTitle(e.target.value)} />
          <button type="submit" style={{ whiteSpace: 'nowrap' }}>Add Task</button>
        </form>

        <div>
          {issues.map(issue => (
            <div key={issue.id} className="issue-card">
              <h4 style={{ fontSize: '18px', color: 'var(--text)' }}>{issue.title}</h4>
              <div>
                <span className="badge">{issue.status}</span>
                <span className="badge priority">Priority: {issue.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}