import express from 'express';
import {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole
} from '../../controllers/roleController.js';

const router = express.Router();

router.post('/create', createRole);
router.get('/', getRoles);
router.get('/:id', getRoleById);
router.put('/update/:id', updateRole);
router.delete('/delete/:id', deleteRole);

export default router;
