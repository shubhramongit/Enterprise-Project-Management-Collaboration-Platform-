const { pool, redisClient } = require('../config/db');

const getIssues = async (req, res) => {
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const cacheKey = `project:${projectId}:issues:page:${page}:limit:${limit}`;

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log(`⚡ CACHE HIT: Serving page ${page} from Redis`);
            return res.json(JSON.parse(cachedData));
        }

        console.log(`🐘 CACHE MISS: Querying PostgreSQL for page ${page}`);
        const result = await pool.query(
            'SELECT * FROM issues WHERE project_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [projectId, limit, offset]
        );

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(result.rows));
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const createIssue = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, status, priority } = req.body;
    const io = req.app.get('io'); 
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        const issueRes = await client.query(
            'INSERT INTO issues (project_id, title, description, status, priority, assignee_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [projectId, title, description, status, priority, req.user.id]
        );
        const newIssue = issueRes.rows[0];

        await client.query(
            'INSERT INTO comments (issue_id, user_id, content) VALUES ($1, $2, $3)',
            [newIssue.id, req.user.id, 'Issue automatically created via API']
        );

        await client.query('COMMIT'); 

        const keys = await redisClient.keys(`project:${projectId}:issues:*`);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`🧹 CACHE CLEARED: Invalidated ${keys.length} keys for project ${projectId}`);
        }

        if (io) {
            io.emit(`project_${projectId}_updated`, { type: 'NEW_ISSUE', issue: newIssue });
        }

        res.status(201).json(newIssue);
    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error('Transaction Failed:', err.message);
        res.status(500).json({ error: 'Transaction failed, rolled back.' });
    } finally {
        client.release();
    }
};

module.exports = { getIssues, createIssue };