import dotenv from "dotenv";
import mongoose from "mongoose";

import Department from "../models/departmentModel.js";
import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";
import { hashPassword } from "../utils/hashPassword.js";

dotenv.config();

// These are fictional demo profiles. The photos are generic stock portraits and
// must not be represented as photographs of real named clinicians.
const directoryProfiles = [
  {
    firstName: "Amara",
    lastName: "Okoye",
    email: "demo.amara.okoye@medcare.example",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=85",
    department: "Cardiology",
    description: "Heart health, prevention and specialist cardiac care.",
    location: "Specialist Care Wing",
    specialization: "Consultant Cardiologist",
    qualification: ["MBBS", "FWACP (Cardiology)"],
    experience: 12,
    bio: "Focused on preventive heart care and clear, compassionate consultations.",
  },
  {
    firstName: "Tunde",
    lastName: "Adeyemi",
    email: "demo.tunde.adeyemi@medcare.example",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=85",
    department: "Internal Medicine",
    description: "Adult primary and specialist care for complex health needs.",
    location: "Main Clinical Building",
    specialization: "Internal Medicine",
    qualification: ["MBBS", "FMCP"],
    experience: 10,
    bio: "Provides thorough, person-centred care for adults and families.",
  },
  {
    firstName: "Zainab",
    lastName: "Bello",
    email: "demo.zainab.bello@medcare.example",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=85",
    department: "Paediatrics",
    description: "Dedicated care for infants, children and adolescents.",
    location: "Family Care Centre",
    specialization: "Paediatrician",
    qualification: ["MBBS", "FWACP (Paediatrics)"],
    experience: 9,
    bio: "Supports children and parents through every stage of growing up.",
  },
  {
    firstName: "Chinwe",
    lastName: "Eze",
    email: "demo.chinwe.eze@medcare.example",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=85",
    department: "Women’s Health",
    description: "Respectful, comprehensive reproductive and maternal health care.",
    location: "Women’s Health Suite",
    specialization: "Obstetrics & Gynaecology",
    qualification: ["MBBS", "FWACS (O&G)"],
    experience: 11,
    bio: "Offers supportive care for reproductive, pregnancy and women’s health needs.",
  },
];

const seedPublicDirectory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    const password = await hashPassword("DemoDirectory2026!");

    for (const profile of directoryProfiles) {
      const department = await Department.findOneAndUpdate(
        { name: profile.department },
        {
          $set: {
            description: profile.description,
            location: profile.location,
            isActive: true,
            isDeleted: false,
            deletedAt: null,
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
      );

      const user = await User.findOneAndUpdate(
        { email: profile.email },
        {
          $set: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatar: profile.avatar,
            role: "doctor",
            isActive: true,
            isDeleted: false,
            deletedAt: null,
          },
          $setOnInsert: { password },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
      );

      await Doctor.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            licenseNumber: `DEMO-${profile.lastName.toUpperCase()}-2026`,
            specialization: profile.specialization,
            qualification: profile.qualification,
            experience: profile.experience,
            bio: profile.bio,
            department: department._id,
            isActive: true,
            isVerified: true,
            isDeleted: false,
            deletedAt: null,
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
      );
    }

    console.log("Public directory demo profiles are ready.");
  } catch (error) {
    console.error("Could not seed the public directory:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedPublicDirectory();
