import { Request, Response } from 'express';
import { Kendra } from '../models/kendra.model';


const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// GET /kendras
export const getKendrasByPincode = async (req: Request, res: Response) => {
  const pin = req.query.pin as string;

  if (!pin) {
    return res.status(400).json({ error: 'Missing pin query parameter' });
  }

  // Get the first 4 digits of the pincode
  const pinPrefix = pin.slice(0, 4);

  try {
    // Using aggregation to perform a more efficient and flexible query
    const result = await Kendra.aggregate([
      {
        $match: {
          // Match pincode starting with the first 4 digits
          Pin_code: { $regex: `^${pinPrefix}` }
        }
      },
      {
        $project: {
          Kendra_code: 1,
          Name: 1,
          State_name: 1,
          District_name: 1,
          Pin_code: 1,
          Address: 1,
          lat: 1,
          lng: 1
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'No kendras found for this pincode' });
    }

    // Log the results for debugging
    console.log(result);

    // Process and return the first result (you can modify this if you want all matching kendras)
    const kendra = result[0];
    const fullAddress = `${kendra.Address}, ${kendra.District_name}, ${kendra.State_name}, ${kendra.Pin_code}`;
    const coords = await geocodeAddress(fullAddress);

    const responseData = {
      Kendra_code: kendra.Kendra_code,
      Name: kendra.Name,
      State_name: kendra.State_name,
      District_name: kendra.District_name,
      Pin_code: kendra.Pin_code,
      Address: kendra.Address,
      lat: coords ? coords[0] : null,
      lng: coords ? coords[1] : null,
    };

    // Return the response data
    console.log(responseData);
    res.json(responseData);
  } catch (err) {
    console.error('Error fetching kendras by pincode:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const geocodeAddress = async (address: string) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return [location.lat, location.lng];
  }
  return null;
};