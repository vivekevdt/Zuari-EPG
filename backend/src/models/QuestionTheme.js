import mongoose from 'mongoose';

const PREDEFINED_THEMES = [
    // Health Insurance questions
    'Health Insurance Coverage & Benefits',
    'Medical Claim & Reimbursement Process',
    'Cashless Treatment & Network Hospitals',
    'Dependent Coverage (Family Members)',

    // Travel questions
    'Business Travel Approval & Booking',
    'Travel Expense Reimbursement',
    'Per Diem & Daily Allowance',

    // Car Lease questions
    'Car Lease Eligibility & Entitlement',
    'Car Lease Application Process',

    // Departmental Get-together / Events
    'Team Events & Departmental Budget',

    // Working hours questions
    'Working Hours, Shifts & Attendance',
    'Work from Home & Flexi Policy',
    'Overtime & Compensatory Off',

    // Leave & Holiday questions
    'Leave Application & Approval',
    'Leave Balance & Entitlement',
    'Leave Carry Forward & Encashment',
    'Holiday Calendar & Optional Holidays',
    'Maternity, Paternity & Special Leaves',
];

const questionThemeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        isPredefined: {
            type: Boolean,
            default: false
        },
        // Running total of how many questions have been classified under this theme
        count: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export { PREDEFINED_THEMES };
export default mongoose.model('QuestionTheme', questionThemeSchema);
