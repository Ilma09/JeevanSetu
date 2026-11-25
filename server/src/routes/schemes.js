import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed.', details: errors.array() });
  next();
};

router.get('/', async (req, res, next) => {
  try {
    const { q, category, state, verified } = req.query;
    const where = { isActive: true };
    if (q) where.OR = [{ name: { contains: String(q), mode: 'insensitive' } }, { summary: { contains: String(q), mode: 'insensitive' } }, { authority: { contains: String(q), mode: 'insensitive' } }];
    if (category) where.category = { equals: String(category), mode: 'insensitive' };
    if (state) where.OR = [...(where.OR || []), { state: { equals: String(state), mode: 'insensitive' } }, { state: null }];
    if (verified === 'true') where.isVerified = true;
    const schemes = await prisma.scheme.findMany({ where, orderBy: [{ isVerified: 'desc' }, { name: 'asc' }] });
    res.json({ schemes, count: schemes.length });
  } catch (error) { next(error); }
});

router.get('/user/saved', requireAuth, async (req, res, next) => {
  try {
    const saved = await prisma.savedScheme.findMany({ where: { userId: req.auth.sub }, include: { scheme: true }, orderBy: { createdAt: 'desc' } });
    res.json({ schemes: saved.map(item => item.scheme) });
  } catch (error) { next(error); }
});

router.get('/user/applications', requireAuth, async (req, res, next) => {
  try {
    const applications = await prisma.schemeApplication.findMany({ where: { userId: req.auth.sub }, include: { scheme: true }, orderBy: { updatedAt: 'desc' } });
    res.json({ applications });
  } catch (error) { next(error); }
});

router.get('/:id', param('id').trim().notEmpty(), validate, async (req, res, next) => {
  try {
    const scheme = await prisma.scheme.findFirst({ where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true } });
    if (!scheme) return res.status(404).json({ error: 'Scheme not found.' });
    res.json({ scheme });
  } catch (error) { next(error); }
});

router.post('/:id/save', requireAuth, async (req, res, next) => {
  try {
    const scheme = await prisma.scheme.findFirst({ where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true } });
    if (!scheme) return res.status(404).json({ error: 'Scheme not found.' });
    await prisma.savedScheme.upsert({ where: { userId_schemeId: { userId: req.auth.sub, schemeId: scheme.id } }, update: {}, create: { userId: req.auth.sub, schemeId: scheme.id } });
    res.status(201).json({ message: 'Scheme saved.', schemeId: scheme.id });
  } catch (error) { next(error); }
});

router.delete('/:id/save', requireAuth, async (req, res, next) => {
  try {
    const scheme = await prisma.scheme.findFirst({ where: { OR: [{ id: req.params.id }, { slug: req.params.id }] } });
    if (!scheme) return res.status(404).json({ error: 'Scheme not found.' });
    await prisma.savedScheme.deleteMany({ where: { userId: req.auth.sub, schemeId: scheme.id } });
    res.json({ message: 'Scheme removed from saved list.' });
  } catch (error) { next(error); }
});

router.post('/:id/applications', requireAuth, body('notes').optional().isString().isLength({ max: 1000 }), validate, async (req, res, next) => {
  try {
    const scheme = await prisma.scheme.findFirst({ where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true } });
    if (!scheme) return res.status(404).json({ error: 'Scheme not found.' });
    const application = await prisma.schemeApplication.create({ data: { userId: req.auth.sub, schemeId: scheme.id, notes: req.body.notes || null }, include: { scheme: true } });
    res.status(201).json({ application });
  } catch (error) { next(error); }
});

router.patch('/applications/:applicationId', requireAuth, param('applicationId').notEmpty(), body('status').isIn(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN']), validate, async (req, res, next) => {
  try {
    const application = await prisma.schemeApplication.findFirst({ where: { id: req.params.applicationId, userId: req.auth.sub } });
    if (!application) return res.status(404).json({ error: 'Application not found.' });
    const updated = await prisma.schemeApplication.update({ where: { id: application.id }, data: { status: req.body.status }, include: { scheme: true } });
    res.json({ application: updated });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireAdmin, [
  body('slug').trim().isSlug(),
  body('name').trim().notEmpty(),
  body('authority').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('summary').trim().notEmpty(),
  body('benefits').trim().notEmpty(),
  body('officialUrl').isURL({ protocols: ['https'] }),
  body('sourceUrl').isURL({ protocols: ['https'] })
], validate, async (req, res, next) => {
  try {
    const scheme = await prisma.scheme.create({ data: { ...req.body, verifiedAt: new Date(), isVerified: false } });
    res.status(201).json({ scheme });
  } catch (error) { next(error); }
});

router.patch('/:id/admin', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const allowed = ['name', 'authority', 'category', 'summary', 'benefits', 'eligibility', 'documents', 'officialUrl', 'sourceUrl', 'sourceName', 'state', 'isActive'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const scheme = await prisma.scheme.update({ where: { id: req.params.id }, data });
    res.json({ scheme });
  } catch (error) { next(error); }
});

router.post('/:id/verify', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const scheme = await prisma.scheme.update({ where: { id: req.params.id }, data: { isVerified: true, verifiedAt: new Date() } });
    res.json({ scheme });
  } catch (error) { next(error); }
});

export default router;
