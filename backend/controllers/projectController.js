const { pool } = require('../config/db');

const createProject = async (req, res) => {
    const { name } = req.body;
    try {
        let wsRes = await pool.query('SELECT id FROM workspaces WHERE owner_id = $1 LIMIT 1', [req.user.id]);
        if (wsRes.rows.length === 0) {
            wsRes = await pool.query(
                'INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING id', 
                ['Default Workspace', req.user.id]
            );
        }
        const pRes = await pool.query(
            'INSERT INTO projects (workspace_id, name, created_by) VALUES ($1, $2, $3) RETURNING *', 
            [wsRes.rows[0].id, name, req.user.id]
        );
        res.status(201).json(pRes.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create project' });
    }
};

const getProjects = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects WHERE created_by = $1', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

module.exports = { createProject, getProjects };