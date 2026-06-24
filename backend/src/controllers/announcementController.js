// src/controllers/announcementController.js
const AnnouncementModel = require('../models/announcementModel');
const { asyncHandler } = require('../middleware/errorHandler');

const getAnnouncements = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const announcements = await AnnouncementModel.findAll({ category });
  res.json({ success: true, data: announcements });
});

const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await AnnouncementModel.findById(req.params.id);
  if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found.' });
  res.json({ success: true, data: announcement });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, body, category, postedBy } = req.body;
  const id = await AnnouncementModel.create({
    title,
    body,
    category,
    postedBy: postedBy || req.user.email,
    authorId: req.user.id,
  });
  const created = await AnnouncementModel.findById(id);
  res.status(201).json({ success: true, message: 'Announcement published.', data: created });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const existing = await AnnouncementModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Announcement not found.' });

  const { title, body, category, postedBy } = req.body;
  await AnnouncementModel.update(req.params.id, {
    title: title ?? existing.title,
    body: body ?? existing.body,
    category: category ?? existing.category,
    postedBy: postedBy ?? existing.posted_by,
  });
  const updated = await AnnouncementModel.findById(req.params.id);
  res.json({ success: true, message: 'Announcement updated.', data: updated });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const existing = await AnnouncementModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Announcement not found.' });
  await AnnouncementModel.remove(req.params.id);
  res.json({ success: true, message: 'Announcement deleted.' });
});

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
