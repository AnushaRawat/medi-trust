import express from 'express';
import {
  
  getKendrasByPincode
} from '../controllers/kendra.controller';
import { reverseGeocode } from '../controllers/ReverseGeocode.controller';

const router = express.Router();


router.get('/search', getKendrasByPincode);
router.get('/reverse-geocode', reverseGeocode); 

export default router;