import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed.', details: errors.array() });
  next();
};
const publicUser = ({ passwordHash, ...user }) => user;

router.post('/register',
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 10, max: 128 }),
  body('phone').optional({ values: 'falsy' }).matches(/^[6-9]\d{9}$/),
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, phone, state, district } = req.body;
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(409).json({ error: 'An account with this email already exists.' });
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({ data: { name, email, passwordHash, phone, state, district } });
      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
      return res.status(201).json({ token, user: publicUser(user) });
    } catch (error) { next(error); }
  }
);

router.post('/login',
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { email: req.body.email } });
      if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
      return res.json({ token, user: publicUser(user) });
    } catch (error) { next(error); }
  }
);

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.auth.sub }, select: { id: true, name: true, email: true, phone: true, state: true, district: true, role: true, createdAt: true } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (error) { next(error); }
});

export default router;
