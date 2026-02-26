import mongoose from "mongoose";

const employeeCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        code: {
            type: String, // Short name / abbreviation e.g. FTC, PE
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },
        createdBy: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("EmployeeCategory", employeeCategorySchema);

