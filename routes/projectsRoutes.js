const express = require('express');
const router = express.Router();

const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
} = require('../controllers/projectController');

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/getById', getProjectById); // ✅ โครงการตาม ID จาก body

module.exports = router;
