const Project = require('../models/Project');

// GET all Project items
const getProjects = async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
};

// POST: Create new Project
const createProject = async (req, res) => {
  const newProject = new Project(req.body);
  const saved = await newProject.save();
  res.status(201).json(saved);
};

// PUT: Update
const updateProject = async (req, res) => {
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

// DELETE
const deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted' });
};

// POST: Get by ID (จาก body)
const getProjectById = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'กรุณาส่ง id ใน body' });
  }

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'ไม่พบโครงการ' });
    }
    return res.json(project);
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
};

// ✅ Export ทุกฟังก์ชันพร้อมกัน
module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
};
