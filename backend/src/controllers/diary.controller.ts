import { Request, Response } from 'express';
import {Medicine} from '../models/medicine.models';
import UserLog, { IUserLog } from '../models/diary.models';

export const getDiary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    console.log("🔐 Received userId in getDiary:", userId);
    
    const logs: IUserLog[] = await UserLog.find({ user_id: userId }).sort({ created_at: -1 });

    console.log('Diary entries found:', logs.length);
    logs.forEach((log) => {
      console.log(JSON.stringify(log, null, 2));
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching diary logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { medicineId } = req.body;

    console.log("📥 Received diary entry body:", req.body);
    console.log("🔐 userId from token:", userId);

    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      console.warn("⚠️ Medicine not found for ID:", medicineId);
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const medData = medicine.toObject();

    const log = new UserLog({
      user_id: userId,
      medicine_name: medData.name,
      medicine_data: medData,
      created_at: new Date()
    });

    await log.save();
    console.log("✅ Diary entry saved:", log);

    res.status(201).json({ message: 'Diary entry added successfully' });
  } catch (error) {
    console.error('Error adding diary entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addOcrEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { medicineId, medicineName, notes, tags } = req.body;

    console.log("📥 OCR diary entry body:", req.body);
    console.log("🔐 userId from token:", userId);

    const log = new UserLog({
      user_id: userId,
      medicine_name: medicineName || medicineId, // fallback if name not passed
      medicine_data: null, // No DB medicine data for OCR
      notes: notes || "",
      tags: tags || [],
      created_at: new Date()
    });

    await log.save();
    console.log("✅ OCR Diary entry saved:", log);

    res.status(201).json({ message: "OCR Diary entry added successfully" });
  } catch (error) {
    console.error("❌ Error adding OCR diary entry:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addSearchEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { medicineId, medicineName } = req.body;

    if (!medicineId || !medicineName) {
      return res.status(400).json({ message: "Missing medicineId or medicineName" });
    }

    const log = new UserLog({
      user_id: userId,
      medicine_name: medicineName,
      medicine_data: null, // You can fetch and attach full data if needed
      created_at: new Date(),
    });

    await log.save();
    res.status(201).json({ message: "Search diary entry saved successfully" });
  } catch (error) {
    console.error("❌ Error saving search diary entry:", error);
    res.status(500).json({ message: "Server error" });
  }
};
