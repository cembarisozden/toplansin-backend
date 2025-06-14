import express from 'express';
import {createUser,getAllUsers} from '../controllers/userController'
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/users/add',createUser);
router.get('/users', authenticateToken,getAllUsers);

export default router;