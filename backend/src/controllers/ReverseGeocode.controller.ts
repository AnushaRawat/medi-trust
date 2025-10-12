// backend/controllers/reverseGeocode.controller.ts
import { Request, Response } from 'express';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY as string;

export const reverseGeocode = async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  console.log('reverseGeocode controller called', req.query);
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat or lng parameters' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data)
    
    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'No address found for coordinates' });
    }

    // Extract postal code from Google's response
    let pincode = '';
    for (const result of data.results) {
      for (const component of result.address_components) {
        if (component.types.includes('postal_code')) {
          pincode = component.long_name;
          break;
        }
      }
      if (pincode) break;
    }

    if (!pincode) {
      return res.status(404).json({ error: 'No postal code found for these coordinates' });
    }

    // Return the pincode to the frontend
    res.json({ pincode });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ error: 'Internal server error during reverse geocoding' });
  }
};