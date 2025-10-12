// backend/models/kendra.model.ts
import mongoose from 'mongoose';

export interface IKendra extends mongoose.Document {
  
  Kendra_code: string;
  Name: string;
  State_name: string;
  District_name: string;
  Pin_code: string;
  Address: string;
  lat?: number;
  lng?: number;
}

const KendraSchema = new mongoose.Schema<IKendra>({
  
  Kendra_code: String,
  Name: String,
  State_name: String,
  District_name: String,
  Pin_code: String,
  Address: String,
  lat: Number, // optional: populated later using Geocoding API
  lng: Number,
});

export const Kendra = mongoose.model<IKendra>(
  'Kendra', 
  KendraSchema, 
  'kendradetails'  // specifies the actual collection name in MongoDB
);