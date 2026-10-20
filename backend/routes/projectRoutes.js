const express = require('express');
const { createProject, getProjects } = require('../controllers/projectController');
const { getIssues, createIssue } = require('../controllers/issueController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate); // Protect all routes in this file

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:projectId/issues', getIssues);
router.post('/:projectId/issues', createIssue);

module.exports = router;