const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Job = require('../models/Job');
const { auth, permit } = require('../middleware/auth');

// Multer setup for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Create job (recruiter or admin)
router.post('/', auth, permit('recruiter', 'admin'), async (req, res) => {
  try {
    const { title, company, description, location, salary } = req.body;
    const job = new Job({ title, company, description, location, salary, recruiter: req.user._id });
    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// // Get all jobs
// router.get('/', async (req, res) => {
//   try {
//     const jobs = await Job.find().populate('recruiter', 'name email');
//     res.json(jobs);
//   } catch (err) {
//     res.status(500).send('Server error');
//   }
// });

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('recruiter', 'name email')
      .populate('applicants.candidate', 'name email')

    res.json(jobs)
  } catch (err) {
    res.status(500).send('Server error')
  }
})



// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email').populate('applicants.candidate', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Apply to job (candidate) - upload resume
router.post('/:id/apply', auth, permit('candidate'), upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const existing = job.applicants.find(a => a.candidate?.toString() === req.user._id.toString());
    if (existing) return res.status(400).json({ message: 'Already applied' });
    job.applicants.push({ candidate: req.user._id, resumePath: req.file ? `/uploads/${req.file.filename}` : '' });
    await job.save();
    res.json({ message: 'Applied', jobId: job._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Recruiter: update job
router.put('/:id', auth, permit('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (req.user.role === 'recruiter' && job.recruiter.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not allowed' });
    const fields = ['title', 'company', 'description', 'location', 'salary'];
    fields.forEach(f => { if (req.body[f] !== undefined) job[f] = req.body[f]; });
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Admin: delete job
router.delete('/:id', auth, permit('admin'), async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
