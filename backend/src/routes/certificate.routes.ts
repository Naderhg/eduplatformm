import { Router } from 'express';
import { getCertificateData } from '../controllers/certificate.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/assignment/:assignmentId', protect, getCertificateData);

export default router;
