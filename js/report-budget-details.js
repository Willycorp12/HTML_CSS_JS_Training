// js/report-budget-details.js

const operatingData = [
    // Revenue Section
    { type: 'header', code: '', name: 'SOURCES OF REVENUE FOR THE INSTITUTION', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'subgroup', code: '7060000', name: 'INCOME FROM MEDICAL SERVICES', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '7061020', name: 'Pharmacy', budget: 75000000, actual: 166100, variance: -74833900, rate: 0 },
    { type: 'item', code: '7061030', name: 'Laboratory', budget: 65000000, actual: 21500, variance: -64978500, rate: 0 },
    { type: 'item', code: '7061040', name: 'Hospitalization', budget: 24230283, actual: 0, variance: -24230283, rate: 0 },
    { type: 'item', code: '7061050', name: 'Consultation', budget: 6500000, actual: 2500, variance: -6497500, rate: 0 },
    { type: 'item', code: '7061060', name: 'Operations, Theatre Charge and Anesthetic Dues', budget: 30000000, actual: 0, variance: -30000000, rate: 0 },
    { type: 'item', code: '7061070', name: 'Maternity', budget: 4000000, actual: 0, variance: -4000000, rate: 0 },
    { type: 'item', code: '7061080', name: 'Nursing Care', budget: 4500000, actual: 0, variance: -4500000, rate: 0 },
    { type: 'item', code: '7061100', name: 'Echography services/ECG', budget: 13000000, actual: 0, variance: -13000000, rate: 0 },
    { type: 'item', code: '7061110', name: 'Minor Operations', budget: 1000000, actual: 0, variance: -1000000, rate: 0 },
    { type: 'item', code: '7061130', name: 'Artificial Intelligence Laboratory Machine (A.I)', budget: 15000000, actual: 60000, variance: -14940000, rate: 0 },
    { type: 'item', code: '7061150', name: 'X-Ray', budget: 15000000, actual: 0, variance: -15000000, rate: 0 },
    { type: 'item', code: '7061200', name: 'Baby Incubator', budget: 7000000, actual: 0, variance: -7000000, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL INCOME FROM MEDICAL SERVICES', budget: 260230283, actual: 250100, variance: -259980183, rate: 0 },
    { type: 'subgroup', code: '7062000', name: 'INCOME FROM SPECIALIST SERVICES', budget: 12000000, actual: 0, variance: -12000000, rate: 0 },
    { type: 'item', code: '7062050', name: 'Indian Specialists', budget: 500000, actual: 0, variance: -500000, rate: 0 },
    { type: 'item', code: '7062100', name: 'Neurologist', budget: 5000000, actual: 0, variance: -5000000, rate: 0 },
    { type: 'item', code: '7062140', name: 'Pediatrician', budget: 1000000, actual: 0, variance: -1000000, rate: 0 },
    { type: 'item', code: '7062150', name: 'Cardiologist', budget: 1000000, actual: 0, variance: -1000000, rate: 0 },
    { type: 'item', code: '7062160', name: 'Dermatologist', budget: 500000, actual: 0, variance: -500000, rate: 0 },
    { type: 'item', code: '7062170', name: 'Gynaechologist', budget: 1500000, actual: 0, variance: -1500000, rate: 0 },
    { type: 'item', code: '7062180', name: 'Physiotherapist', budget: 1000000, actual: 0, variance: -1000000, rate: 0 },
    { type: 'item', code: '7062190', name: 'Dentist', budget: 1500000, actual: 0, variance: -1500000, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL INCOME FROM SPECIALIST SERVICES', budget: 12000000, actual: 0, variance: -12000000, rate: 0 },
    { type: 'subgroup', code: '7062100', name: 'OTHER INCOME', budget: 21200000, actual: 0, variance: -21200000, rate: 0 },
    { type: 'item', code: '7062120', name: 'Biaka Home Medical Services', budget: 5000000, actual: 0, variance: -5000000, rate: 0 },
    { type: 'item', code: '7062130', name: 'Other Operating Income', budget: 1000000, actual: 0, variance: -1000000, rate: 0 },
    { type: 'item', code: '7062140', name: 'File', budget: 1000000, actual: 0, variance: -1000000, rate: 0 },
    { type: 'item', code: '7062150', name: 'Consultation Booklets', budget: 1200000, actual: 0, variance: -1200000, rate: 0 },
    { type: 'item', code: '7062180', name: 'BUIB Students Medicals', budget: 10000000, actual: 0, variance: -10000000, rate: 0 },
    { type: 'item', code: '7181300', name: 'RENTALS (Hospital Restaurant)', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '7181400', name: 'BUIB Students Internship fees paid', budget: 3000000, actual: 0, variance: -3000000, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL OTHER INCOME', budget: 21200000, actual: 0, variance: -21200000, rate: 0 },
    { type: 'subgroup', code: '701300', name: 'RADIOLOGY', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '7062', name: 'Medical Imaging Revenue', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL RADIOLOGY', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'grand-revenue', code: '', name: 'TOTAL OPERATING REVENUE FOR THE YEAR', budget: 293430283, actual: 250100, variance: 293180183, rate: 0 },

    { type: 'header', code: '', name: 'LESS OPERATION EXPENDITURE FOR THE INSTITUTION', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'subgroup', code: '6020000', name: 'PURCHASE OF RAW MATERIALS AND STORES', budget: 62500000, actual: 62500000, variance: 0, rate: 0 },
    { type: 'item', code: '6021050', name: 'Pharmaceuticals', budget: 44000000, actual: 44000000, variance: 0, rate: 0 },
    { type: 'item', code: '6021100', name: 'Laboratory reagents', budget: 14000000, actual: 14000000, variance: 0, rate: 0 },
    { type: 'item', code: '6021150', name: 'Surgical materials (Theatre)', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'item', code: '6021200', name: 'Echography/X-Ray Films', budget: 2500000, actual: 2500000, variance: 0, rate: 0 },
    { type: 'item', code: '6022450', name: 'Purchase of Minor Equipment (IPD, OPD, Others)', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL PURCHASE OF RAW MATERIALS AND STORES', budget: 62500000, actual: 62500000, variance: 0, rate: 0 },
    { type: 'subgroup', code: '6040000', name: 'CONSUMABLE MATERIALS AND STORES', budget: 16900000, actual: 16900000, variance: 0, rate: 0 },
    { type: 'item', code: '6042000', name: 'Consumables', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'item', code: '6042050', name: 'Office Materials/ Stationeries', budget: 2000000, actual: 2000000, variance: 0, rate: 0 },
    { type: 'item', code: '6042100', name: 'Fuel', budget: 2500000, actual: 2500000, variance: 0, rate: 0 },
    { type: 'item', code: '6042200', name: 'Gas for generator set', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'item', code: '6042220', name: 'General Documentation', budget: 200000, actual: 200000, variance: 0, rate: 0 },
    { type: 'item', code: '6042350', name: 'Cable Bills', budget: 700000, actual: 700000, variance: 0, rate: 0 },
    { type: 'item', code: '6043000', name: 'Cleaning Materials', budget: 1500000, actual: 1500000, variance: 0, rate: 0 },
    { type: 'item', code: '6043100', name: 'Lubricants', budget: 500000, actual: 500000, variance: 0, rate: 0 },
    { type: 'item', code: '6050000', name: 'Sundry Expenses', budget: 2500000, actual: 2500000, variance: 0, rate: 0 },
    { type: 'item', code: '6052000', name: 'Electricity', budget: 5000000, actual: 5000000, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL CONSUMABLE MATERIALS AND STORES', budget: 16900000, actual: 16900000, variance: 0, rate: 0 },
    { type: 'subgroup', code: '6100000', name: 'TRANSPORT COST AND RELATED EXPENSES', budget: 4050000, actual: 4050000, variance: 0, rate: 0 },
    { type: 'item', code: '6111000', name: 'Transport of Personnel', budget: 500000, actual: 500000, variance: 0, rate: 0 },
    { type: 'item', code: '6160000', name: 'Transport of mails and parcels', budget: 50000, actual: 50000, variance: 0, rate: 0 },
    { type: 'item', code: '6181000', name: 'Mission and related Expenses', budget: 1500000, actual: 1500000, variance: 0, rate: 0 },
    { type: 'item', code: '6182000', name: 'Volunteer Transport Allowance', budget: 2000000, actual: 2000000, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL TRANSPORT COST AND RELATED EXPENSES', budget: 4050000, actual: 4050000, variance: 0, rate: 0 },
    { type: 'subgroup', code: '6200000', name: 'MAINTENANCE AND REPAIRS', budget: 8500000, actual: 8500000, variance: 0, rate: 0 },
    { type: 'item', code: '6243100', name: 'Repair and maintenance of electrical', budget: 1500000, actual: 1500000, variance: 0, rate: 0 },
    { type: 'item', code: '6243200', name: 'Repair and maintenance of buildings', budget: 2500000, actual: 2500000, variance: 0, rate: 0 },
    { type: 'item', code: '6243300', name: 'Repair and maintenance of equipment', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'item', code: '6243400', name: 'Repair and maintenance-vehicles', budget: 1500000, actual: 1500000, variance: 0, rate: 0 },
    { type: 'item', code: '6243500', name: 'Repair and maintenance-plumbing', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'item', code: '6243600', name: 'Repair and maintenance - Furniture', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL MAINTENANCE AND REPAIRS', budget: 8500000, actual: 8500000, variance: 0, rate: 0 },
    { type: 'subgroup', code: '6250000', name: 'HIRED SERVICES', budget: 17400000, actual: 17400000, variance: 0, rate: 0 },
    { type: 'item', code: '6251000', name: 'Surgical/Anesthetic Dues to doctors and Nurses', budget: 13000000, actual: 13000000, variance: 0, rate: 0 },
    { type: 'item', code: '6252000', name: 'Training & Development', budget: 800000, actual: 800000, variance: 0, rate: 0 },
    { type: 'item', code: '6253000', name: 'Commissions to Specialist', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'item', code: '6254000', name: 'Consultancy Fees', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'item', code: '6255000', name: 'Audit Fees', budget: 1600000, actual: 1600000, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL HIRED SERVICES', budget: 17400000, actual: 17400000, variance: 0, rate: 0 },
    { type: 'subgroup', code: '6260000', name: 'ENTERTAINMENT', budget: 4000000, actual: 0, variance: 4000000, rate: 0 },
    { type: 'item', code: '6261000', name: 'Entertainment for meetings', budget: 1000000, actual: 0, variance: 1000000, rate: 0 },
    { type: 'item', code: '6262000', name: 'Labour day Celebration', budget: 700000, actual: 0, variance: 700000, rate: 0 },
    { type: 'item', code: '6262100', name: 'Women\'s Celebration', budget: 500000, actual: 0, variance: 500000, rate: 0 },
    { type: 'item', code: '6262200', name: 'End of year Gifts to Staff.', budget: 1800000, actual: 0, variance: 1800000, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL ENTERTAINMENT', budget: 4000000, actual: 0, variance: 4000000, rate: 0 },
    { type: 'subgroup', code: '6270000', name: 'ADVERTISEMENT/PUBLIC RELATIONS', budget: 3500000, actual: 0, variance: 3500000, rate: 0 },
    { type: 'item', code: '6271000', name: 'Advertisement and Publicity', budget: 2000000, actual: 0, variance: 2000000, rate: 0 },
    { type: 'item', code: '6272000', name: 'Public Relations', budget: 1500000, actual: 0, variance: 1500000, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL ADVERTISEMENT/PUBLIC RELATIONS', budget: 3500000, actual: 0, variance: 3500000, rate: 0 },
    { type: 'subgroup', code: '6280000', name: 'TELEPHONE EXPENSES', budget: 600000, actual: 0, variance: 600000, rate: 0 },
    { type: 'item', code: '6281000', name: 'Communication Credit', budget: 600000, actual: 0, variance: 600000, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL TELEPHONE EXPENSES', budget: 600000, actual: 0, variance: 600000, rate: 0 },
    { type: 'subgroup', code: '6300000', name: 'OTHER EXPENSES', budget: 4800000, actual: 0, variance: 4800000, rate: 0 },
    { type: 'item', code: '6310000', name: 'Banking Expense', budget: 800000, actual: 0, variance: 800000, rate: 0 },
    { type: 'item', code: '6324500', name: 'Biaka Home Medical Care Services', budget: 2000000, actual: 0, variance: 2000000, rate: 0 },
    { type: 'item', code: '6325000', name: 'Support to Dr BIAKA Memorial Foundation', budget: 2000000, actual: 0, variance: 2000000, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL OTHER EXPENSES', budget: 4800000, actual: 0, variance: 4800000, rate: 0 },
    { type: 'subgroup', code: '6400000', name: 'TAXES AND SOCIAL INSURANCE', budget: 11550000, actual: 11550000, variance: 0, rate: 0 },
    { type: 'item', code: '6325010', name: 'Fines and Penalties', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'item', code: '6412000', name: 'Business licence', budget: 400000, actual: 400000, variance: 0, rate: 0 },
    { type: 'item', code: '6413000', name: 'Taxes and Rates (AIT)', budget: 2000000, actual: 2000000, variance: 0, rate: 0 },
    { type: 'item', code: '6414000', name: 'Employer payroll Taxes', budget: 1800000, actual: 1800000, variance: 0, rate: 0 },
    { type: 'item', code: '6415000', name: 'Employer\'s CNPS expenses', budget: 6000000, actual: 6000000, variance: 0, rate: 0 },
    { type: 'item', code: '6416000', name: 'Visite Technique', budget: 50000, actual: 50000, variance: 0, rate: 0 },
    { type: 'item', code: '6417000', name: 'insurance and windscreen for service vehicles', budget: 200000, actual: 200000, variance: 0, rate: 0 },
    { type: 'item', code: '6418000', name: 'Toll Gate', budget: 50000, actual: 50000, variance: 0, rate: 0 },
    { type: 'item', code: '6418000', name: 'Stamp Duty/Fiscal Stamps', budget: 50000, actual: 50000, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL TAXES AND SOCIAL INSURANCE', budget: 11550000, actual: 11550000, variance: 0, rate: 0 },
    { type: 'subgroup', code: '6500000', name: 'MEETINGS AND SEMINAR', budget: 5000000, actual: 0, variance: 5000000, rate: 0 },
    { type: 'item', code: '6273400', name: 'Staff Meetings and Seminars', budget: 1000000, actual: 0, variance: 1000000, rate: 0 },
    { type: 'item', code: '6586000', name: 'Board meeting allowances', budget: 2000000, actual: 0, variance: 2000000, rate: 0 },
    { type: 'item', code: '6586100', name: 'Shareholders Allowances', budget: 2000000, actual: 0, variance: 2000000, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL MEETINGS AND SEMINAR', budget: 5000000, actual: 0, variance: 5000000, rate: 0 },
    { type: 'subgroup', code: '6600000', name: 'PERSONNEL EXPENSES', budget: 89750000, actual: 89750000, variance: 0, rate: 0 },
    { type: 'item', code: '6381000', name: 'Personnel Recruitment Exp.', budget: 750000, actual: 0, variance: 750000, rate: 0 },
    { type: 'item', code: '6611000', name: 'Gross salaries and wages expense', budget: 71000000, actual: 71000000, variance: 0, rate: 0 },
    { type: 'item', code: '6612100', name: 'Administrator\'s Allowance', budget: 6000000, actual: 6000000, variance: 0, rate: 0 },
    { type: 'item', code: '6613010', name: 'Suplementary Leave Pay', budget: 1500000, actual: 0, variance: 1500000, rate: 0 },
    { type: 'item', code: '6614010', name: 'Seperation and Termination Benefit', budget: 2000000, actual: 0, variance: 2000000, rate: 0 },
    { type: 'item', code: '6631000', name: 'Allowances to Accounting and Finance staff', budget: 2000000, actual: 0, variance: 2000000, rate: 0 },
    { type: 'item', code: '6641100', name: 'Staff Incentive', budget: 1000000, actual: 0, variance: 1000000, rate: 0 },
    { type: 'item', code: '6641200', name: 'Allowance to BIAKA GROUP Executives', budget: 5500000, actual: 0, variance: 5500000, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL PERSONNEL EXPENSES', budget: 89750000, actual: 89750000, variance: 0, rate: 0 },
    { type: 'grand-expense', code: '', name: 'TOTAL OPERATING EXPENDITURE FOR THE YEAR', budget: 228550000, actual: 228550000, variance: 0, rate: 0 },
    { type: 'grand-revenue', code: '', name: 'TOTAL OPERATING REVENUE FOR THE YEAR', budget: 293430283, actual: 250100, variance: 293180183, rate: 0 },
    { type: 'net-surplus', code: '', name: 'NET SURPLUS OR (DEFICIT) FOR THE YEAR', budget: 64880283, actual: 250100, variance: 64630183, rate: 0 }
];

const capitalData = [
    { type: 'header', code: '', name: 'FIXED ASSETS', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'subgroup', code: '2100000', name: 'MEDICAL EQUIPMENT', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2410100', name: '12 LEADS ECG MACHINE', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2410200', name: 'EXPENSES FOR THE INSTALLATION OF X-RAY MACHINE', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2410300', name: 'INSTALLATION OF SOLAR SYSTEM IN THE IPD', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2410400', name: 'MINDRAY M7 ULTRASOUND MACHINE WITH CARDIAC PROBE', budget: 5000000, actual: 5000000, variance: 0, rate: 0 },
    { type: 'item', code: '2410500', name: 'C-ARM', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL MEDICAL EQUIPMENT', budget: 5000000, actual: 5000000, variance: 0, rate: 0 },

    { type: 'subgroup', code: '2130000', name: 'INTANGIBLE FIXED ASSET', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2120000', name: 'Patents, licenses, software', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2131000', name: 'COMPUTER SERVER', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2132000', name: 'Building', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2140000', name: 'ADVANCES AND PAYMENTS ON ACCOUNTS FOR FIXED ASSETS ON ORDER', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2200000', name: 'LAND', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2340000', name: 'INSTALLATIONS ,FITTINGS & FIXTURES', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2450000', name: 'Transport Equipment', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2510000', name: 'Management Softwares', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2520000', name: 'Equipment', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL INTANGIBLE FIXED ASSET', budget: 0, actual: 0, variance: 0, rate: 0 },

    { type: 'subgroup', code: '2300000', name: 'BUILDINGS', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2312000', name: 'PAINTING OF THE ENTIRE IN PATIENTS\' DEPARTMENT', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2313000', name: 'CREATION OF A NEW WATER SUPPLY IN THE HOSPITAL', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2314000', name: 'REPAIRS OF TOILET WALLS AND FLOORS IN THE IPD', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2315000', name: 'CREATION OF ANEW MATERNITY DEPARTMENT', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2316000', name: 'BUILDING OF A WATER TANK FOR THE HOSPITAL', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2316010', name: 'INSTALLATION OF PARVET TILES IN THE HOSPITAL', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2316020', name: 'DIGGING OF BOREHOLE', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2316030', name: 'ELECTRICAL WORKS IN THE HOSPITAL', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2316040', name: 'ADDITIONAL EXPENSES FOR RENOVATION WORKS', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2316050', name: 'TILLING OF TOILET WALLS AND PAINTING OF WARDS', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2316060', name: 'REPAIRS, PLASTERING AND PAINTING OF WARDS', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2316070', name: 'REPAINTING OF SOME PART OF THE HOSPITAL', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'item', code: '2316080', name: 'RENOVATION OF THE PHARMACY', budget: 1000000, actual: 1000000, variance: 0, rate: 0 },
    { type: 'item', code: '2316090', name: 'CREATION OF A NEW LAUNDRY UNIT/ANC/MATERNITY UNIT', budget: 2500000, actual: 2500000, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL BUILDINGS', budget: 4500000, actual: 4500000, variance: 0, rate: 0 },

    { type: 'subgroup', code: '2412000', name: 'OFFICE EQUIPMENT AND FURNITURE', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2412230', name: 'TELEVISIONS FOR THE IN PATIENTS\' DEPARTMENT', budget: 1500000, actual: 1500000, variance: 0, rate: 0 },
    { type: 'item', code: '2412250', name: 'OFFICE FURNITURES (TABLES, CHAIRS AND SHELVES)', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2412260', name: 'CASH SAFE', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2412270', name: 'COMPUTERS,PRINTERS,CAMERAS AND VOLTAGE REGULATORS', budget: 1500000, actual: 1500000, variance: 0, rate: 0 },
    { type: 'item', code: '2412280', name: 'FRIDGES FOR OFFICES AND WARDS', budget: 1300000, actual: 1300000, variance: 0, rate: 0 },
    { type: 'item', code: '2412290', name: 'GENERATOR FOR THE HOSPITAL', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2412300', name: 'CUSTOMIZED PATIENT SLIPPERS', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2412350', name: 'INSTALLATION OF AC FOR X-RAY ROOM', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2412400', name: 'INSTALLATION OF NEW TV CABLE NETWORK', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2412450', name: 'COMPLETION OF CENTRAL OXYGEN SYSTEM', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2412500', name: 'HOSPITAL BED DUVETS AND WINDOW BLINDS', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2412550', name: 'INSTALLATION OF HOT/COLD WATER SYSTEM', budget: 0, actual: 0, variance: 0, rate: 0 },
    { type: 'item', code: '2412600', name: 'PURCHASE OF COUCHES FOR PRIVATE WARDS', budget: 2000000, actual: 2000000, variance: 0, rate: 0 },
    { type: 'item', code: '2412700', name: 'PHURCHASE OF PHOTOCOPY MACHINE', budget: 650000, actual: 650000, variance: 0, rate: 0 },
    { type: 'total-bar', code: '', name: 'TOTAL OFFICE EQUIPMENT AND FURNITURE', budget: 6950000, actual: 6950000, variance: 0, rate: 0 },

    { type: 'grand-revenue', code: '', name: 'TOTAL CAPITAL/INVESTMENT EXPENDITURES', budget: 16450000, actual: 16450000, variance: 0, rate: 0 },
    { type: 'net-surplus', code: '', name: 'Net Surplus After Capital Expenditures', budget: 48430283, actual: 61500, variance: 48368783, rate: 0 }
];

let currentReportMode = 'operating'; // 'operating' or 'capital'

function initReportBudgetDetails() {
    currentReportMode = 'operating';
    renderBudgetTable();
    startBudgetClock();
    
    const searchInput = document.getElementById('BD_Search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterBudgetTable(this.value);
        });
    }
}

/**
 * Switches the view to Capital Expenditure with a delay
 */
function getCapitalExpenditure() {
    const isSwitchingToCapital = (currentReportMode === 'operating');
    const msg = isSwitchingToCapital ? 'Fetching Capital Expenditure Data...' : 'Restoring Operating Report...';
    showAlert(msg, 'success');
    
    setTimeout(() => {
        currentReportMode = isSwitchingToCapital ? 'capital' : 'operating';
        const btn = document.getElementById('BTN_ToggleReportMode');
        
        if (isSwitchingToCapital) {
            document.getElementById('BD_MainTitle').textContent = 'Yearly Investment/Capital Expenditures Report';
            document.getElementById('BD_Subtitle').textContent = 'From 1/1/0002 to 9/30/2026';
            if (btn) btn.innerHTML = 'Get Operating Report <i class="fa-solid fa-chart-line"></i>';
        } else {
            document.getElementById('BD_MainTitle').textContent = 'Yearly Budgeted Operating Income and Expenditure Report';
            document.getElementById('BD_Subtitle').textContent = 'From 10/1/2025 to 9/30/2026';
            if (btn) btn.innerHTML = 'Get Capital Expenditure <i class="fa-solid fa-file-invoice-dollar"></i>';
        }

        renderBudgetTable();
        showAlert('Report view updated.', 'success');
    }, 800);
}

function startBudgetClock() {
    const update = () => {
        const now = new Date();
        const dateEl = document.getElementById('BD_CurrentDate');
        const timeEl = document.getElementById('BD_CurrentTime');
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB');
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };
    update();
    window.budgetClockInterval = setInterval(update, 1000);
}

function renderBudgetTable() {
    const tbody = document.querySelector('#BD_Table tbody');
    if (!tbody) return;

    let html = '';
    const fmt = (n) => n === 0 ? '' : n.toLocaleString('en-US');
    const currentData = currentReportMode === 'operating' ? operatingData : capitalData;

    currentData.forEach(row => {
        let rowClass = '';
        if (row.type === 'header') rowClass = 'row-group-header';
        else if (row.type === 'subgroup') rowClass = 'row-subgroup';
        else if (row.type === 'total-bar') rowClass = 'row-total-bar';
        else if (row.type === 'grand-revenue') rowClass = 'row-grand-revenue';
        else if (row.type === 'grand-expense') rowClass = 'row-grand-expense';
        else if (row.type === 'net-surplus') rowClass = 'row-net-surplus';

        const isCapitalItem = currentReportMode === 'capital' && row.type === 'item';
        const clickableAttr = isCapitalItem ? `ondblclick="handleCapitalRowClick('${row.code}', '${row.name}')" title="Double-click to view ledger" style="cursor:pointer;"` : '';

        html += `<tr class="${rowClass}" ${clickableAttr}>
            <td class="text-center">${row.code}</td>
            <td style="${row.type === 'item' ? 'padding-left:30px;' : ''}">${row.name}</td>
            <td class="text-right">${fmt(row.budget)}</td>
            <td class="text-right">${fmt(row.actual)}</td>
            <td class="text-right">${fmt(row.variance)}</td>
            <td class="text-center">${row.rate}%</td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

/**
 * Handles clicking on a capital expenditure item row to drill down into its ledger.
 * @param {string} itemCode The account code of the capital expenditure item.
 * @param {string} itemName The name/description of the capital expenditure item.
 */
function handleCapitalRowClick(itemCode, itemName) {
    sessionStorage.setItem('capitalLedgerItemCode', itemCode);
    sessionStorage.setItem('capitalLedgerItemName', itemName);
    loadScreen('report-capital-ledger.html', null, `${itemName} Ledger`);
}

function filterBudgetTable(val) {
    const filter = val.toLowerCase();
    const rows = document.querySelectorAll('#BD_Table tbody tr');
    rows.forEach(row => {
        const text = row.cells[1].textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

/**
 * Advanced Print Engine
 * - Multi-page support
 * - Page Header on first page only
 * - Sticky branding footer on all pages
 */
function printBudgetDetails() {
    const fmt = (n) => n === 0 ? '' : n.toLocaleString('en-US');
    const now = new Date();
    const printDate = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const printTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentData = currentReportMode === 'operating' ? operatingData : capitalData;
    const reportTitle = currentReportMode === 'operating' ? 'Yearly Budgeted Operating Income and Expenditure Report' : 'Yearly Investment/Capital Expenditures Report';
    const reportDates = currentReportMode === 'operating' ? 'From 10/1/2025 to 9/30/2026' : 'From 1/1/0002 to 9/30/2026';

    const ROWS_PER_PAGE = 32; // Adjusted based on PDF row count
    const totalPages = Math.ceil(currentData.length / ROWS_PER_PAGE);
    let allPagesHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const chunk = currentData.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE);
        
        // Page Header: Display ONLY on the first page
        const headerHTML = (i === 0) ? `
            <div class="doc-header">
                <h1 style="color: #2e3192; font-size: 28px; margin: 0; font-family: 'Times New Roman';">BIAKA HOSPITAL</h1>
                <h2 style="font-size: 18px; margin: 5px 0; font-weight: normal;">${reportTitle}</h2>
                <div style="color: #cd2027; font-weight: bold; font-size: 13px;">${reportDates}</div>
                <div style="font-size: 12px; margin-top: 5px; font-style: italic;">For all Budgeted Records</div>
                <div class="header-meta">
                    <span>Printed &nbsp; <b>${printDate} &nbsp; @ ${printTime}</b></span>
                    <span style="margin-right: 20px;">By: &nbsp; _______________</span>
                </div>
            </div>
        ` : '<div style="height: 20px;"></div>'; // Minimal spacer for subsequent pages

        const rowsHTML = chunk.map(row => {
            let rowClass = '';
            if (row.type === 'header') rowClass = 'print-row-header';
            else if (row.type === 'subgroup') rowClass = 'print-row-subgroup';
            else if (row.type === 'total-bar') rowClass = 'print-row-total-bar';
            else if (row.type === 'grand-revenue') rowClass = 'print-row-grand-revenue';
            else if (row.type === 'grand-expense') rowClass = 'print-row-grand-expense';
            else if (row.type === 'net-surplus') rowClass = 'print-row-net-surplus';
            
            return `<tr class="${rowClass}">
                <td class="col-code" style="text-align:center; font-weight:bold; ${row.type === 'grand-revenue' ? 'color:white;' : ''}">${row.code}</td>
                <td class="col-desc" style="${row.type === 'item' ? 'padding-left:25px;' : ''} ${row.type === 'grand-revenue' ? 'color:white;' : ''}">${row.name}</td>
                <td class="col-amt" style="${row.type === 'grand-revenue' ? 'color:white;' : ''}">${fmt(row.budget)}</td>
                <td class="col-amt" style="${row.type === 'grand-revenue' ? 'color:white;' : ''}">${fmt(row.actual)}</td>
                <td class="col-amt" style="${row.type === 'grand-revenue' ? 'color:white;' : ''}">${fmt(row.variance)}</td>
                <td class="col-rate" style="${row.type === 'grand-revenue' ? 'color:white;' : ''}">${row.rate}%</td>
            </tr>`;
        }).join('');

        allPagesHTML += `
            <div class="page">
                ${headerHTML}
                <table class="print-table">
                    <thead>
                        <tr style="border-bottom: 1.5px solid #000;">
                            <th class="col-code" style="border-top: 1.5px solid #000;">ACC. CODE</th>
                            <th class="col-desc" style="border-top: 1.5px solid #000;">DESCRIPTION</th>
                            <th class="col-amt" style="border-top: 1.5px solid #000;">BUDGETED AMOUNT</th>
                            <th class="col-amt" style="border-top: 1.5px solid #000;">ACTUAL AMOUNT</th>
                            <th class="col-amt" style="border-top: 1.5px solid #000;">VARIANCE</th>
                            <th class="col-rate" style="border-top: 1.5px solid #000;">RATE(%)</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
                <div class="doc-footer">
                    <span>Copyright(c)2022. Institute Pro ERP</span>
                    <span>Page ${i + 1} of ${totalPages}</span>
                    <span>Powered by AfricRenov Group Sarl</span>
                </div>
            </div>`;
    }

    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head>
            <title>Budget Detail Report</title>
            <style>
                @page { size: A4 portrait; margin: 1cm 1.5cm; } /* Adjusted margins */
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #525659; }
                .page { 
                    background: white; width: 21cm; height: 29.7cm; 
                    box-sizing: border-box; padding: 1cm 1.5cm; margin: 4px auto; /* Adjusted padding */
                    display: flex; flex-direction: column; position: relative; 
                }
                .doc-header { text-align: center; padding-bottom: 10px; }
                .header-meta { display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px; font-weight: bold; }
                
                .print-table { width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed; border: 1px solid #000; }
                .print-table th, .print-table td { border: 1px solid #000; padding: 4px 3px; word-wrap: break-word; }
                .print-table th { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; font-size: 9px; }
                
                /* Refined Column Widths */
                .col-code { width: 45px; } /* Smaller */
                .col-desc { width: auto; }
                .col-amt { width: 80px; text-align: right !important; } /* Adjusted */
                .col-rate { width: 25px; text-align: center !important; } /* Smaller */

                .print-row-header { background-color: #ffff00 !important; font-weight: bold; -webkit-print-color-adjust: exact; }
                .print-row-subgroup { background-color: #f0f0f0 !important; font-weight: bold; -webkit-print-color-adjust: exact; }
                .print-row-total-bar { background-color: #d3d3d3 !important; font-weight: bold; -webkit-print-color-adjust: exact; }
                .print-row-grand-revenue { background-color: #008000 !important; color: #ffffff !important; font-weight: bold; -webkit-print-color-adjust: exact; }
                .print-row-grand-expense { background-color: #ffa500 !important; color: #000000 !important; font-weight: bold; -webkit-print-color-adjust: exact; }
                .print-row-net-surplus { background-color: #9acd32 !important; font-weight: bold; -webkit-print-color-adjust: exact; }
                
                .doc-footer { /* Positioned absolutely within the page div */
                    position: absolute; bottom: 1cm; left: 1.5cm; right: 1.5cm; 
                    display: flex; justify-content: space-between; font-size: 10px; 
                    border-top: 1px solid #ccc; padding-top: 5px; font-style: italic;
                }
                @media print { 
                    body { background: none; } 
                    .page { margin: 0; page-break-after: always; } 
                    .page:last-child { page-break-after: auto; }
                }
            </style>
        </head>
        <body>${allPagesHTML}<script>window.onload = function() { window.print(); window.close(); }</script></body>
        </html>
    `);
    win.document.close();
}

window.initReportBudgetDetails = initReportBudgetDetails;
window.printBudgetDetails = printBudgetDetails;
window.getCapitalExpenditure = getCapitalExpenditure;
window.handleCapitalRowClick = handleCapitalRowClick;