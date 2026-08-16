import os
import json
import sqlite3
import uuid
import sys
from urllib.parse import parse_qs, urlparse
from wsgiref.simple_server import make_server, WSGIServer
from socketserver import ThreadingMixIn

DB_FILE = os.path.join(os.path.dirname(__file__), 'quiz.db')
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
SUPABASE_URL = os.environ.get('SUPABASE_URL', '').rstrip('/')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

def supabase_request(endpoint, method='GET', payload=None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    data = json.dumps(payload).encode('utf-8') if payload else None
    try:
        import urllib.request
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            return json.loads(res_data) if res_data else []
    except Exception as e:
        print(f"Supabase Error ({endpoint}):", e)
        return None

class ThreadedWSGIServer(ThreadingMixIn, WSGIServer):
    daemon_threads = True

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quizzes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id TEXT NOT NULL,
            question_text TEXT NOT NULL,
            image_url TEXT,
            options TEXT NOT NULL,
            correct_option INTEGER NOT NULL,
            explanation TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id TEXT PRIMARY KEY,
            quiz_id TEXT NOT NULL,
            participant_name TEXT NOT NULL,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            percentage REAL NOT NULL,
            time_taken_seconds INTEGER DEFAULT 0,
            mode TEXT DEFAULT 'untimed',
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
        )
    ''')

    # Migration for existing database files
    try:
        cursor.execute("ALTER TABLE submissions ADD COLUMN time_taken_seconds INTEGER DEFAULT 0")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE submissions ADD COLUMN mode TEXT DEFAULT 'untimed'")
    except Exception:
        pass
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_id TEXT NOT NULL,
            question_id INTEGER NOT NULL,
            selected_option INTEGER NOT NULL,
            is_correct INTEGER NOT NULL,
            FOREIGN KEY (submission_id) REFERENCES submissions (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()

def seed_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) as cnt FROM quizzes')
    if cursor.fetchone()['cnt'] > 0:
        conn.close()
        return

    print("Seeding initial high-yield quizzes and 35 MCQs...")
    
    quizzes = [
        {
            "id": "cardiology-ecg",
            "title": "High-Yield Cardiology & ECGs",
            "description": "De Winter T waves, Wellens Syndrome Type A & B, LAFB/LPFB fascicular blocks, and Infective Endocarditis ESC 2023 guidelines.",
            "category": "Cardiology",
            "questions": [
                {
                    "question_text": "A 52-year-old male presents to the ED with acute retrosternal chest pain. The ECG displays 1.5mm upsloping ST-segment depression in V2-V5 with tall, symmetrical peaked T waves, and 0.8mm ST elevation in lead aVR. What is the diagnosis?",
                    "image_url": "/static/images/De Winter T waves_image1.png",
                    "options": ["Normal variant (early repolarization)", "De Winter T wave pattern (Acute LAD occlusion / STEMI equivalent)", "Acute Pericarditis", "Subendocardial ischemia due to stable angina"],
                    "correct_option": 1,
                    "explanation": "De Winter T waves consist of upsloping ST depression >1mm at the J-point in V1-V6 with tall, symmetrical T waves and ST elevation >0.5mm in aVR. It represents acute proximal LAD occlusion (seen in ~2% of acute LAD occlusions) and is an indication for immediate emergency reperfusion therapy."
                },
                {
                    "question_text": "A resident reviews an ECG showing De Winter T waves in a patient with ongoing severe chest pain. Standard convex ST-segment elevation is absent. What is the appropriate immediate clinical action?",
                    "image_url": None,
                    "options": ["Discharge home with outpatient stress test", "Activate cardiac catheterization lab immediately for emergency reperfusion", "Administer IV diltiazem and reassess ECG in 6 hours", "Treat as low-risk unstable angina with oral beta-blockers only"],
                    "correct_option": 1,
                    "explanation": "De Winter pattern is an acute anterior STEMI equivalent. Standard STEMI criteria (ST elevation) may be absent, but the patient has critical LAD occlusion requiring immediate emergent catheterization/reperfusion."
                },
                {
                    "question_text": "A 58-year-old female presents following an episode of severe chest pain 2 hours ago. She is currently completely pain-free. Her ECG shows deeply inverted, symmetrical T waves in leads V2-V6 with normal R-wave progression and no Q waves. What pattern is represented?",
                    "image_url": "/static/images/Wellens Syndrome_image4.png",
                    "options": ["Type A Wellens Syndrome", "Type B Wellens Syndrome", "Brugada Syndrome Type 1", "Takotsubo Cardiomyopathy"],
                    "correct_option": 1,
                    "explanation": "Wellens Syndrome is highly specific for critical proximal LAD stenosis. Type B (75% of cases) presents with deeply and symmetrically inverted T waves in V2-V3 (often V1-V6). Type A (25% of cases) presents with biphasic T waves (initial positivity, terminal negativity)."
                },
                {
                    "question_text": "A patient with suspected Wellens Syndrome develops recurrence of severe chest pain. A repeat ECG during active pain shows that the previously inverted T waves in V2-V4 have now become upright and prominent. What does this 'pseudo-normalization' signify?",
                    "image_url": None,
                    "options": ["Reperfusion of the artery and resolution of ischemia", "Hyperacute STEMI (complete LAD re-occlusion) requiring urgent catheterization", "Normalization of cardiac conduction system", "Electrolyte imbalance (hyperkalemia)"],
                    "correct_option": 1,
                    "explanation": "During pain-free periods, Wellens pattern (inverted or biphasic T waves) is seen. During active ischemic pain episodes, T waves may switch back to upright and prominent ('pseudo-normalization'), which is a hallmark of hyperacute STEMI due to total LAD re-occlusion."
                },
                {
                    "question_text": "Which of the following ECG criteria is characteristic of Left Anterior Fascicular Block (LAFB)?",
                    "image_url": "/static/images/Left Anterior Fascicular Block and Left Posterior Fascicular Block_image4.png",
                    "options": ["Right axis deviation (+90° to +180°) with qR in II, III, aVF", "Left axis deviation (-45° to -90°) with qR in I, aVL and rS in II, III, aVF", "QRS duration >140ms with broad R waves in V1", "PR interval >220ms with delta waves in V1-V3"],
                    "correct_option": 1,
                    "explanation": "LAFB diagnostic criteria include: 1) Left axis deviation (-45° to -90°), 2) qR complexes in leads I and aVL, 3) rS complexes in leads II, III, and aVF, and 4) Prolonged R wave peak time in aVL >45 ms."
                },
                {
                    "question_text": "An ECG displays Right Axis Deviation (+90° to +180°), rS complexes in I & aVL, qR complexes in II, III & aVF, with R wave peak time >45ms in aVF. Other causes of RAD are excluded. What is the diagnosis?",
                    "image_url": "/static/images/Left Anterior Fascicular Block and Left Posterior Fascicular Block_image2.png",
                    "options": ["Left Anterior Fascicular Block", "Left Posterior Fascicular Block", "Complete Right Bundle Branch Block", "WPW Syndrome"],
                    "correct_option": 1,
                    "explanation": "LPFB is characterized by Right Axis Deviation, rS in I & aVL, qR in II, III & aVF, and R-wave peak time >45ms in aVF. Other causes of right axis deviation (RVH, lateral MI) must be excluded before diagnosing LPFB."
                },
                {
                    "question_text": "What is the recommended ideal number of blood culture sets to obtain in a patient with suspected Infective Endocarditis (IE) who has not received prior antimicrobial therapy?",
                    "image_url": None,
                    "options": ["1 set from a single venipuncture", "2 sets obtained 5 minutes apart", "3 or more blood culture sets obtained from separate venipunctures", "6 sets drawn over 48 hours while withholding all diagnostic workup"],
                    "correct_option": 2,
                    "explanation": "While a minimum of 2 sets may detect bacteremia, 3 or more blood culture sets are ideally recommended in suspected IE. This distinguishes continuous bacteremia characteristic of IE from transient bacteremia or skin contamination."
                },
                {
                    "question_text": "How should blood cultures be drawn in a hemodynamically stable patient with suspected subacute Infective Endocarditis before starting empirical antibiotics?",
                    "image_url": None,
                    "options": ["Draw all sets simultaneously from an existing indwelling central line", "Draw 3 sets from separate venipuncture sites with at least 30-60 minutes between sets", "Draw 1 set every 24 hours for 5 days", "Start broad-spectrum antibiotics first and draw cultures 24 hours later"],
                    "correct_option": 1,
                    "explanation": "Drawing 3 blood culture sets from separate peripheral venipuncture sites spaced at least 30-60 minutes apart demonstrates continuous bacteremia and minimizes contamination risk without delaying necessary antimicrobial therapy."
                },
                {
                    "question_text": "According to 2023 ESC Guidelines, which of the following is an emergency or urgent indication for cardiac surgery in native valve Infective Endocarditis?",
                    "image_url": None,
                    "options": ["Asymptomatic small vegetation (<5mm) without regurgitation", "Severe aortic or mitral regurgitation causing acute pulmonary edema or cardiogenic shock", "Completely resolved fever after 2 days of IV ampicillin", "Isolated positive blood culture for Staphylococcus epidermidis without echocardiographic abnormalities"],
                    "correct_option": 1,
                    "explanation": "Acute severe aortic or mitral regurgitation leading to heart failure, pulmonary edema, or cardiogenic shock is the leading primary indication for emergency/urgent surgical intervention in IE."
                },
                {
                    "question_text": "A 45-year-old patient on IV antibiotics for aortic valve IE develops persistent fever and new-onset complete heart block on ECG. Echocardiogram reveals a perivalvular root abscess. What is the recommended management?",
                    "image_url": None,
                    "options": ["Increase dose of IV antibiotics and recheck ECG in 2 weeks", "Urgent surgical intervention (valve repair/replacement and abscess debridement)", "Insert a permanent pacemaker and continue medical therapy alone", "Switch to oral antibiotics and discharge"],
                    "correct_option": 1,
                    "explanation": "Paravalvular extension of infection (annular or root abscess, fistula, or new conduction defect/heart block) indicates uncontrolled local infection and is a strong indication for urgent surgical repair."
                },
                {
                    "question_text": "Which vegetation size criteria combined with clinical factors represents an indication for surgery to prevent systemic embolism in IE?",
                    "image_url": None,
                    "options": ["Persistent vegetation size >10 mm after one or more embolic episodes despite appropriate antibiotic therapy", "Vegetation size <2 mm on tricuspid valve", "Calcified healed nodule <4 mm", "Any vegetation regardless of size after 24 hours of antibiotics"],
                    "correct_option": 0,
                    "explanation": "2023 ESC Guidelines recommend surgery to prevent embolism when vegetation size is >10 mm following one or more embolic events, or very large isolated vegetations (>30 mm)."
                },
                {
                    "question_text": "A 36-year-old IV drug user presents with fever, a new holosystolic murmur at the apex, and Janeway lesions. Blood cultures grow S. aureus. On day 3 of IV vancomycin, the patient complains of dyspnea and ECG shows new PR interval prolongation and left anterior fascicular block. What complication should be suspected?",
                    "image_url": None,
                    "options": ["Acute pulmonary embolism", "Aortic root / perivalvular extension of abscess involving the conduction system", "Vancomycin toxicity", "Normal evolution of endocarditis"],
                    "correct_option": 1,
                    "explanation": "New conduction defects (such as PR prolongation, LAFB, or heart block) in a patient with endocarditis strongly suggest perivalvular extension and aortic root abscess formation, requiring urgent surgical consultation."
                }
            ]
        },
        {
            "id": "nephro-rheum-endocrine",
            "title": "Nephrology, Rheumatology & Endocrine",
            "description": "CKD Proteinuria (SGLT2i & Finerenone), Antiphospholipid Syndrome (Warfarin vs DOACs), Gout/Hyperuricemia management, and Inpatient Hyperglycemia Protocols.",
            "category": "Internal Medicine",
            "questions": [
                {
                    "question_text": "In a non-dialysis CKD patient with significant proteinuria, what is the recommended target blood pressure and initial antihypertensive class?",
                    "image_url": None,
                    "options": ["Target BP <140/90 mmHg; Calcium Channel Blockers", "Target BP <130/80 mmHg; ACE Inhibitor or ARB", "Target BP <120/70 mmHg; Beta Blockers only", "Target BP <150/90 mmHg; Thiazide diuretics only"],
                    "correct_option": 1,
                    "explanation": "KDIGO guidelines recommend targeting BP <130/80 mmHg in CKD patients with proteinuria. ACEi or ARBs are first-line to reduce intraglomerular pressure and slow CKD progression."
                },
                {
                    "question_text": "Based on Dapa-CKD and Empa-Kidney trial evidence, what is the minimum eGFR threshold for initiating SGLT2 inhibitors (e.g., Dapagliflozin 10mg OD) in non-dialysis CKD patients with proteinuria?",
                    "image_url": None,
                    "options": ["eGFR ≥60 mL/min/1.73 m²", "eGFR ≥45 mL/min/1.73 m²", "eGFR ≥20 mL/min/1.73 m²", "eGFR ≥5 mL/min/1.73 m²"],
                    "correct_option": 2,
                    "explanation": "SGLT2 inhibitors (Dapagliflozin 10mg OD / Empagliflozin 10mg OD) are indicated to slow CKD progression and can be initiated down to an eGFR ≥20 mL/min/1.73 m² in patients with or without Type 2 Diabetes."
                },
                {
                    "question_text": "Finerenone (a non-steroidal mineralocorticoid receptor antagonist) is specifically indicated in which patient group to reduce CKD progression and cardiovascular events?",
                    "image_url": None,
                    "options": ["Type 2 Diabetes with persistent Albumin-to-Creatinine Ratio (ACR) ≥200 mg/g despite maximum tolerated ACEi/ARB and SGLT2i", "End-stage renal disease on hemodialysis with hyperkalemia", "Acute tubular necrosis due to aminoglycosides", "Minimal change disease in children"],
                    "correct_option": 0,
                    "explanation": "Finerenone is approved for patients with Type 2 Diabetes and CKD who have persistent proteinuria (ACR ≥200 mg/g) despite optimal background therapy with ACEi/ARB and SGLT2 inhibitors."
                },
                {
                    "question_text": "Primary thromboprophylaxis with low-dose Aspirin (81-100 mg daily) is recommended in non-pregnant individuals with which of the following antibody profiles?",
                    "image_url": None,
                    "options": ["Low-titre isolated IgM anti-cardiolipin antibodies on a single test", "High-risk aPL profile (Lupus Anticoagulant positivity, double/triple APLA positivity, or persistently high titers)", "Positive ANA with normal antiphospholipid panel", "Asymptomatic patients with negative antiphospholipid panel"],
                    "correct_option": 1,
                    "explanation": "Low-dose Aspirin for primary thromboprophylaxis is recommended for individuals with a high-risk antiphospholipid profile (Lupus Anticoagulant, double or triple APLA positivity, or high titers) with or without SLE."
                },
                {
                    "question_text": "A 38-year-old male with confirmed thrombotic Antiphospholipid Syndrome (triple APLA positive) suffers a deep vein thrombosis. Which oral anticoagulant regimen is strongly recommended?",
                    "image_url": None,
                    "options": ["Rivaroxaban 20mg once daily", "Apixaban 5mg twice daily", "Warfarin (target INR 2.0 - 3.0)", "Dabigatran 150mg twice daily"],
                    "correct_option": 2,
                    "explanation": "Warfarin MUST be used instead of Direct Oral Anticoagulants (DOACs) in thrombotic APS (especially triple-positive APS), as clinical trials demonstrated higher rates of arterial and venous thrombosis with DOACs compared to Warfarin."
                },
                {
                    "question_text": "A 50-year-old asymptomatic male has a serum uric acid level of 9.2 mg/dL on routine labs. Dual-energy CT shows subclinical monosodium urate crystal deposition. He has no history of gouty arthritis or kidney stones. What is the management?",
                    "image_url": None,
                    "options": ["Initiate Allopurinol 300mg daily immediately", "General measures only (dietary purine restriction, weight loss, exercise) without urate-lowering therapy", "Start Febuxostat 40mg daily and Colchicine", "Initiate intra-articular steroid injections"],
                    "correct_option": 1,
                    "explanation": "Asymptomatic hyperuricemia should NOT be treated with urate-lowering therapy (Allopurinol/Febuxostat), even if MSU crystal deposition is seen on imaging. Exceptions are conditions with high cell turnover (lymphoma/leukemia chemotherapy) or recurrent urate nephrolithiasis."
                },
                {
                    "question_text": "In a patient with recurrent gout flares, which medication class should ideally be avoided or adjusted if possible due to its propensity to increase serum uric acid levels?",
                    "image_url": None,
                    "options": ["ACE inhibitors (Enalapril)", "Thiazide and Loop diuretics (e.g., Hydrochlorothiazide, Furosemide)", "SGLT2 inhibitors (Dapagliflozin)", "Calcium channel blockers (Amlodipine)"],
                    "correct_option": 1,
                    "explanation": "Thiazide and loop diuretics decrease renal uric acid excretion and promote hyperuricemia/gout flares. Switching to alternative antihypertensives (such as Losartan or Amlodipine, which have uricosuric properties) is recommended when feasible."
                },
                {
                    "question_text": "According to the non-critical care hyperglycemia protocol, at what Point-of-Care Testing (POCT) blood sugar level should Basal insulin (0.2 units/kg/day) be initiated?",
                    "image_url": None,
                    "options": ["POCT > 110 mg/dL", "POCT > 140 mg/dL", "POCT > 180 mg/dL", "POCT > 300 mg/dL"],
                    "correct_option": 2,
                    "explanation": "POCT > 180 mg/dL triggers initiation of Basal / Long-acting insulin (e.g., Lantus Solostar 0.2 u/kg/day once daily). POCT > 140 mg/dL triggers ordering an HbA1c if not performed in the preceding 3 months."
                },
                {
                    "question_text": "A non-critical care patient weighing 68 kg (<75 kg body weight) has a pre-meal blood sugar reading of 280 mg/dL. According to the weight-based correctional sliding scale protocol, how many units of rapid/regular insulin should be administered?",
                    "image_url": None,
                    "options": ["1 unit", "3 units", "6 units", "10 units"],
                    "correct_option": 1,
                    "explanation": "For Blood Sugar 250-300 mg/dL: Insulin Sensitive Dose (<75 kg body weight) is 3 units of Humulin R/Novorapid. (For >75 kg standard dose, it would be 6 units)."
                },
                {
                    "question_text": "When administering correctional or mealtime insulin in the non-critical care unit, what is the correct administration timing relative to meals for Humulin R versus Novorapid?",
                    "image_url": None,
                    "options": ["Humulin R 5 mins before meal; Novorapid 60 mins after meal", "Humulin R 30 mins before meal; Novorapid 5 mins before meal", "Both must be given 2 hours after completing the meal", "Both must be given at bedtime only"],
                    "correct_option": 1,
                    "explanation": "Regular insulin (Humulin R) should be given 30 minutes before mealtime, while rapid-acting insulin (Novorapid / Insulin Aspart) should be given 5 minutes before mealtime."
                },
                {
                    "question_text": "A 65-year-old male with CKD Stage 3b (eGFR 28 mL/min) and Type 2 Diabetes is admitted with cellulitis. His pre-meal blood sugar is 320 mg/dL and weight is 82 kg (>75 kg). What is the appropriate correctional insulin dose according to the standard dose protocol?",
                    "image_url": None,
                    "options": ["4 units", "8 units", "12 units", "0 units (contraindicated in CKD)"],
                    "correct_option": 1,
                    "explanation": "For Blood Sugar 300-350 mg/dL: Standard dose (>75 kg body weight) requires 8 units of correctional insulin (compared to 4 units in sensitive dose <75 kg)."
                }
            ]
        },
        {
            "id": "id-hepatology",
            "title": "Infectious Diseases & Hepatology",
            "description": "Severe Malaria criteria & management, Hepatitis C DAA regimens (SVR12), and Typhoid Management Guidelines 2022 (Drug-sensitive, MDR, XDR, and Vaccines).",
            "category": "Infectious Diseases",
            "questions": [
                {
                    "question_text": "Which of the following clinical findings alone fulfills the definition of Severe Malaria according to treatment guidelines?",
                    "image_url": None,
                    "options": ["Low GCS < 11 or inability to swallow / prostration", "Mild headache with temperature of 38.0°C", "Isolated vomiting once in 24 hours", "Parasitemia of 500 parasites/µL in an asymptomatic adult"],
                    "correct_option": 0,
                    "explanation": "Severe malaria is defined by 1 or more of the following: GCS < 11, inability to sit/stand/walk (prostration), >2 seizures in 24h, metabolic acidosis (bicarb <15 or lactate >5), severe anemia (Hb <7 g/dL with parasitemia >10,000/µL), renal impairment (Cr >3 mg/dL), or jaundice (TBil >3 mg/dL)."
                },
                {
                    "question_text": "What are the specific laboratory criteria defining severe anemia and renal impairment in Severe Malaria?",
                    "image_url": None,
                    "options": ["Hb <10 g/dL and Creatinine >1.2 mg/dL", "Hb <7 g/dL (or HCT <20%) with parasite count >10,000/µL; Creatinine >3 mg/dL (or Urea >20 mmol/L)", "Hb <12 g/dL and Creatinine >2.0 mg/dL", "Platelets <150,000/µL and WBC >11,000/µL"],
                    "correct_option": 1,
                    "explanation": "Severe malaria hematologic and renal definitions require Hb <7 g/dL (or Hct <20%) with parasite count >10,000/µL, and Serum Creatinine >3 mg/dL (or Blood Urea >20 mmol/L)."
                },
                {
                    "question_text": "What is the drug of choice for the immediate initial parenteral treatment of Severe Malaria in adults and children?",
                    "image_url": None,
                    "options": ["IV Artesunate", "Oral Chloroquine", "Oral Mefloquine", "IV Metronidazole"],
                    "correct_option": 0,
                    "explanation": "Intravenous Artesunate is the first-line treatment of choice for severe P. falciparum malaria worldwide, superior to IV quinine in reducing mortality."
                },
                {
                    "question_text": "Which patient with Hepatitis C requires treatment, and what is the primary endpoint defining successful cure?",
                    "image_url": None,
                    "options": ["Only patients with cirrhosis; AST/ALT normalization at 4 weeks", "Anyone with detectable HCV PCR (Acute or Chronic); Sustained Viral Response (SVR12 = undetectable HCV RNA 12 weeks after completing treatment)", "Only patients with genotype 1; negative HCV antibody test", "Patients with elevated bilirubin only; negative HBsAg"],
                    "correct_option": 1,
                    "explanation": "ALL patients with detectable HCV RNA (PCR positive) are candidates for treatment. The treatment goal is Sustained Viral Response 12 (SVR12), defined as undetectable HCV RNA 12 weeks post-completion of Direct-Acting Antiviral (DAA) therapy."
                },
                {
                    "question_text": "What is the recommended dosing schedule and duration for the pan-genotypic DAA regimen Sofosbuvir (400mg) + Velpatasvir (100mg) (Viktana / Velpaget)?",
                    "image_url": None,
                    "options": ["1 tablet once daily with or without food for 12 weeks (no renal/hepatic adjustment needed)", "2 tablets twice daily with meals for 24 weeks", "1 tablet weekly for 4 weeks", "IV infusion daily for 14 days"],
                    "correct_option": 0,
                    "explanation": "Sofosbuvir 400mg + Velpatasvir 100mg is a pan-genotypic single tablet taken once daily for 12 weeks with or without food. It requires no routine renal or hepatic dose adjustments."
                },
                {
                    "question_text": "What is the treatment duration for non-cirrhotic treatment-naïve HCV patients using the pan-genotypic regimen Glecaprevir (300mg) + Pibrentasvir (120mg) (Maviret)?",
                    "image_url": None,
                    "options": ["4 weeks", "8 weeks (3 tablets once daily with food)", "16 weeks", "48 weeks"],
                    "correct_option": 1,
                    "explanation": "Maviret (Glecaprevir/Pibrentasvir) is administered as 3 tablets once daily WITH FOOD for an 8-week course in treatment-naïve non-cirrhotic patients."
                },
                {
                    "question_text": "According to the 2022 MMIDSP Typhoid Guidelines, what is the recommended adult dosage and treatment duration for Drug-Sensitive Typhoid fever using IV Ceftriaxone or Oral Cefixime?",
                    "image_url": None,
                    "options": ["Ceftriaxone 1g q12h IV (or 2g q24h) for 10-14 days; Cefixime 400mg PO q12h for 10-14 days", "Ceftriaxone 500mg single dose; Cefixime 200mg OD for 3 days", "Ciprofloxacin 250mg OD for 5 days", "Azithromycin 250mg OD for 3 days"],
                    "correct_option": 0,
                    "explanation": "Drug-sensitive S. Typhi guidelines specify IV Ceftriaxone (1g q12h or 2g q24h) or oral Cefixime (400mg q12h) for 10 to 14 days. Shorter courses increase relapse rates."
                },
                {
                    "question_text": "What is the definition of Multidrug-Resistant (MDR) Typhoid fever, and what is the appropriate oral step-down treatment?",
                    "image_url": None,
                    "options": ["Resistance to Penicillin only; step down to Amoxicillin", "Resistance to Ampicillin, Trimethoprim-Sulfamethoxazole, Chloramphenicol, and/or Fluoroquinolones; step down to Oral Cefixime for 14 days", "Resistance to Carbapenems; step down to Vancomycin", "Resistance to Azithromycin; step down to Colistin"],
                    "correct_option": 1,
                    "explanation": "MDR Typhoid strains are resistant to first-line agents (Ampicillin, Cotrimoxazole, Chloramphenicol) and fluoroquinolones, but remain sensitive to 3rd generation cephalosporins. Treatment can be de-escalated to oral Cefixime to complete 14 days."
                },
                {
                    "question_text": "Extensively Drug-Resistant (XDR) Typhoid is resistant to 1st line drugs, fluoroquinolones, and 3rd gen cephalosporins. For a clinically stable outpatient weighing 65 kg (>60 kg), what is the recommended oral antibiotic regimen?",
                    "image_url": None,
                    "options": ["Ciprofloxacin 750mg PO q12h for 7 days", "Oral Azithromycin 1 gram PO q24h for 7-10 days", "Oral Amoxicillin 500mg PO q8h for 14 days", "Oral Doxycycline 100mg PO q12h for 10 days"],
                    "correct_option": 1,
                    "explanation": "XDR Typhoid is sensitive to Azithromycin and Carbapenems. For stable patients weighing >60 kg, oral Azithromycin 1g PO q24h for 7-10 days is recommended. (For <60 kg, give 1g loading dose then 500mg PO q24h)."
                },
                {
                    "question_text": "An adult patient with XDR Typhoid fever presents hemodynamically unstable with severe abdominal pain and intestinal hemorrhage. What is the recommended IV antibiotic regimen?",
                    "image_url": None,
                    "options": ["IV Ceftriaxone 2g q24h", "IV Meropenem 1g q8h (or Imipenem 500mg q6h / Ertapenem 1g q24h) for 10-14 days", "IV Gentamicin 80mg q8h", "IV Vancomycin 1g q12h"],
                    "correct_option": 1,
                    "explanation": "Unstable or complicated XDR Typhoid cases require hospitalization and IV Carbapenem therapy (Meropenem 1g q8h, Imipenem 500mg q6h, or Ertapenem 1g q24h) for 10-14 days, with potential step-down to oral Azithromycin upon improvement."
                },
                {
                    "question_text": "According to 2022 guidelines, what is the key difference between the Vi Polysaccharide vaccine and the Typhoid Conjugate Vaccine (TCV) available in Pakistan?",
                    "image_url": None,
                    "options": ["Vi polysaccharide is given at birth; TCV is given at age 18", "Vi polysaccharide is approved for children >2 years (requires revaccination every 3 years); TCV is approved for infants ≥6 months (offers protection for at least 3 years)", "TCV requires monthly boosters; Vi vaccine provides 100% lifetime immunity", "Both vaccines are live oral vaccines contraindicated in healthcare workers"],
                    "correct_option": 1,
                    "explanation": "Vi Polysaccharide vaccine is injectable for children >2 years with 3-year revaccination intervals. Typhoid Conjugate Vaccine (TCV) is approved for infants ≥6 months, offering long-lasting immunity for children and adults."
                },
                {
                    "question_text": "Following completion of treatment for typhoid fever, for how long should patients be monitored for potential relapse or complications (such as intestinal perforation or bleeding)?",
                    "image_url": None,
                    "options": ["48 hours", "1 week", "3 months after treatment commencement", "5 years"],
                    "correct_option": 2,
                    "explanation": "Despite successful completion of therapy, guidelines recommend monitoring patients for relapse or complications for 3 months after treatment initiation."
                }
            ]
        },
        {
            "id": "stills-disease",
            "title": "Adult-Onset Still's Disease (AOSD) & MAS",
            "description": "Quotidian fevers, salmon-pink rash, hyperferritinemia, Yamaguchi criteria, negative ANA/RF, and Macrophage Activation Syndrome (MAS).",
            "category": "Rheumatology",
            "questions": [
                {
                    "question_text": "A 28-year-old female presents with a 3-week history of daily high-grade fevers spiking up to 39.5°C (103.1°F), typically occurring late in the evening. During the fever spikes, a faint, salmon-pink maculopapular rash appears on her trunk and thighs and fades when her temperature normalizes. She also complains of bilateral wrist and knee pain. What is the most likely diagnosis?",
                    "image_url": None,
                    "options": ["Systemic Lupus Erythematosus (SLE)", "Adult-Onset Still's Disease (AOSD)", "Acute Rheumatic Fever", "Disseminated Gonococcal Infection"],
                    "correct_option": 1,
                    "explanation": "Adult-Onset Still's Disease (AOSD) is characterized by the classic clinical triad of quotidian (daily) spiking fevers (≥39°C), an evanescent salmon-colored maculopapular rash that recurs during fever spikes, and polyarthritis/arthralgias."
                },
                {
                    "question_text": "Which of the following prodromal symptoms is reported in up to 70% of patients with Adult-Onset Still's Disease, frequently preceding the onset of fever, rash, and arthritis?",
                    "image_url": None,
                    "options": ["Severe painless hematuria", "Severe non-exudative pharyngitis / sore throat", "Bilateral parotid swelling", "Alopecia areata"],
                    "correct_option": 1,
                    "explanation": "Non-exudative aseptic pharyngitis (sore throat) is a prominent feature reported in up to 70% of patients with AOSD, often presenting early in the disease course prior to the full manifestation of fever and rash."
                },
                {
                    "question_text": "In a patient suspected of having Adult-Onset Still's Disease, which set of serological laboratory test results is characteristically required to support the diagnosis?",
                    "image_url": None,
                    "options": ["Positive ANA (1:640) and Positive Anti-dsDNA", "Negative ANA and Negative Rheumatoid Factor (RF)", "Positive Anti-CCP antibodies and Positive c-ANCA", "Positive Anti-Ro/SSA and Anti-La/SSB"],
                    "correct_option": 1,
                    "explanation": "A hallmark of Still's disease is that standard autoantibodies including Antinuclear Antibodies (ANA) and Rheumatoid Factor (RF) are persistently NEGATIVE (present in <10% of cases). Positivity for ANA/RF suggests alternative diagnoses such as SLE or Rheumatoid Arthritis."
                },
                {
                    "question_text": "A 32-year-old male evaluated for fever of unknown origin is found to have a serum ferritin level of 4,800 ng/mL (normal: 20-300 ng/mL). Further testing shows a low percentage of glycosylated ferritin (<20%). How does this finding assist in the diagnosis?",
                    "image_url": None,
                    "options": ["It rules out Still's disease and confirms Iron Overload Hemochromatosis", "Marked hyperferritinemia combined with low glycosylated ferritin (<20%) is highly characteristic of Still's disease", "It confirms acute Viral Hepatitis B", "It indicates severe Vitamin B12 deficiency"],
                    "correct_option": 1,
                    "explanation": "Extreme hyperferritinemia (often >1000 to >5000 ng/mL) combined with a low fraction of glycosylated ferritin (<20%) is a key biomarker for Still's disease (Fautrel criteria), reflecting intense macrophage and reticuloendothelial activation."
                },
                {
                    "question_text": "What characteristic complete blood count (CBC) abnormality is typically observed in active Adult-Onset Still's Disease?",
                    "image_url": None,
                    "options": ["Profound leukopenia with lymphopenia (WBC <2,000/µL)", "Marked leukocytosis (WBC ≥15,000/µL) with >80% granulocytes/neutrophils", "Isolated severe thrombocytopenia (platelets <20,000/µL)", "Pure red cell aplasia with reticulocyte count <0.1%"],
                    "correct_option": 1,
                    "explanation": "Leukocytosis (often WBC ≥15,000 to >30,000/µL) with striking granulocytosis (>80% PMNs) is a major Yamaguchi criterion for Still's disease, reflecting intense bone marrow granulopoiesis."
                },
                {
                    "question_text": "According to the widely used Yamaguchi Classification Criteria for Adult-Onset Still's Disease, diagnosis requires at least 5 total criteria, including AT LEAST how many Major Criteria?",
                    "image_url": None,
                    "options": ["At least 1 Major Criterion", "At least 2 Major Criteria", "At least 4 Major Criteria", "All 5 must be Major Criteria"],
                    "correct_option": 1,
                    "explanation": "Yamaguchi criteria require a total of at least 5 criteria, with AT LEAST 2 being Major Criteria (Major: Fever ≥39°C ≥1wk, Arthralgias ≥2wk, Typical salmon rash, Leukocytosis ≥10,000 with ≥80% PMNs), plus exclusion of infection, malignancy, and other rheumatic diseases."
                },
                {
                    "question_text": "Plain radiographs of the wrists in a patient with long-standing chronic articular Adult-Onset Still's Disease characteristically demonstrate which of the following pattern of joint involvement?",
                    "image_url": None,
                    "options": ["Complete destruction of the distal interphalangeal (DIP) joints only", "Intercarpal and carpometacarpal joint space narrowing progressing to pericarpal ankylosis", "Bilateral sacroiliitis with bamboo spine", "Punched-out periarticular erosions with overhanging sclerotic margins (Gouty tophi)"],
                    "correct_option": 1,
                    "explanation": "Characteristic radiographic changes in chronic articular AOSD include non-erosive intercarpal and carpometacarpal joint narrowing that rapidly leads to pericarpal ankylosis (fusion of wrist bones), which is relatively unique to Still's disease."
                },
                {
                    "question_text": "A 30-year-old female with AOSD on oral prednisone is admitted with high fever, delirium, jaundice, and purpura. Labs reveal: Hb 6.5 g/dL, Platelets 22,000/µL, WBC 2,100/µL, Ferritin 18,500 ng/mL, Fibrinogen 85 mg/dL (low), ESR 6 mm/hr (markedly decreased from 95 mm/hr). Bone marrow aspirate reveals macrophages engulfing erythrocytes and platelets. What is the diagnosis?",
                    "image_url": None,
                    "options": ["Acute Myeloid Leukemia", "Macrophage Activation Syndrome (MAS / Secondary HLH)", "Thrombotic Thrombocytopenic Purpura (TTP)", "Aplastic Anemia"],
                    "correct_option": 1,
                    "explanation": "Macrophage Activation Syndrome (MAS) is a life-threatening complication of Still's disease characterized by uncontrolled activation of macrophages and T-cells, leading to hyperferritinemia (>10,000), pancytopenia, hypofibrinogenemia (causing a sudden drop in ESR), liver dysfunction, and hemophagocytosis."
                },
                {
                    "question_text": "Which hyperinflammatory cytokine signaling pathway plays a dominant role in driving the excessive inflammasome activation and severe systemic manifestations in Still's Disease and MAS?",
                    "image_url": None,
                    "options": ["Interleukin-1 (IL-1β) and Interleukin-18 (IL-18) pathway", "Interleukin-4 (IL-4) pathway", "IgE-mediated histamine release", "Complement C5a activation pathway"],
                    "correct_option": 0,
                    "explanation": "Still's disease and MAS are autoinflammatory disorders driven by NLRP3 inflammasome activation resulting in massive overproduction of pro-inflammatory cytokines Interleukin-1 (IL-1β) and Interleukin-18 (IL-18), alongside IFN-gamma."
                },
                {
                    "question_text": "What is the recommended first-line biologic disease-modifying therapy (bDMARD) for severe active Adult-Onset Still's Disease or incipient Macrophage Activation Syndrome due to its rapid onset and short half-life?",
                    "image_url": None,
                    "options": ["Infliximab (TNF inhibitor)", "Anakinra (Short-acting IL-1 receptor antagonist)", "Rituximab (Anti-CD20 monoclonal antibody)", "Methotrexate monotherapy"],
                    "correct_option": 1,
                    "explanation": "Anakinra (a short-acting IL-1 receptor antagonist) is the first-line biologic of choice for severe AOSD and incipient/active MAS due to its rapid onset of action and short half-life, allowing safe titration in acute hyperinflammatory crises."
                }
            ]
        }
    ]

    for q_data in quizzes:
        cursor.execute('INSERT INTO quizzes (id, title, description, category) VALUES (?, ?, ?, ?)',
                       (q_data['id'], q_data['title'], q_data['description'], q_data['category']))
        for idx, question in enumerate(q_data['questions']):
            cursor.execute('''
                INSERT INTO questions (quiz_id, question_text, image_url, options, correct_option, explanation, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                q_data['id'],
                question['question_text'],
                question['image_url'],
                json.dumps(question['options']),
                question['correct_option'],
                question['explanation'],
                idx
            ))

    conn.commit()
    conn.close()
    print("Database successfully seeded with 3 master quizzes and 35 questions.")

def application(environ, start_response):
    path = environ.get('PATH_INFO', '')
    method = environ.get('REQUEST_METHOD', 'GET')
    
    def json_response(data, status='200 OK'):
        body = json.dumps(data).encode('utf-8')
        start_response(status, [
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(body))),
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Headers', 'Content-Type'),
            ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ])
        return [body]
        
    def serve_file(file_path, content_type):
        if not os.path.exists(file_path):
            start_response('404 Not Found', [('Content-Type', 'text/plain')])
            return [b'File Not Found']
        with open(file_path, 'rb') as f:
            content = f.read()
        start_response('200 OK', [
            ('Content-Type', content_type),
            ('Content-Length', str(len(content)))
        ])
        return [content]

    if method == 'OPTIONS':
        start_response('200 OK', [
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Headers', 'Content-Type'),
            ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ])
        return [b'']

    # API Endpoints
    if path == '/api/quizzes' and method == 'GET':
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT q.id, q.title, q.description, q.category, q.created_at,
                   COUNT(qst.id) as question_count
            FROM quizzes q
            LEFT JOIN questions qst ON q.id = qst.quiz_id
            GROUP BY q.id
            ORDER BY q.created_at ASC
        ''')
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return json_response({'quizzes': rows})

    if path.startswith('/api/quizzes/') and method == 'GET':
        quiz_id = path.replace('/api/quizzes/', '')
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM quizzes WHERE id = ?', (quiz_id,))
        quiz_row = cursor.fetchone()
        if not quiz_row:
            conn.close()
            return json_response({'error': 'Quiz not found'}, '404 Not Found')
        
        quiz = dict(quiz_row)
        cursor.execute('SELECT * FROM questions WHERE quiz_id = ? ORDER BY sort_order ASC, id ASC', (quiz_id,))
        questions = []
        for q_row in cursor.fetchall():
            q_dict = dict(q_row)
            q_dict['options'] = json.loads(q_dict['options'])
            # Don't leak correct answer in public quiz taking view
            del q_dict['correct_option']
            del q_dict['explanation']
            questions.append(q_dict)
            
        quiz['questions'] = questions
        conn.close()
        return json_response({'quiz': quiz})

    if path == '/api/submissions' and method == 'POST':
        try:
            length = int(environ.get('CONTENT_LENGTH', 0))
            body = environ['wsgi.input'].read(length)
            data = json.loads(body.decode('utf-8'))
        except Exception as e:
            return json_response({'error': 'Invalid JSON'}, '400 Bad Request')
            
        quiz_id = data.get('quiz_id')
        participant_name = data.get('participant_name', '').strip()
        answers_dict = data.get('answers', {})  # { question_id_str: selected_option_int }
        time_taken = int(data.get('time_taken_seconds', 0))
        quiz_mode = str(data.get('mode', 'untimed')).strip()
        
        if not quiz_id or not participant_name:
            return json_response({'error': 'Quiz ID and Participant Name are required'}, '400 Bad Request')

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM questions WHERE quiz_id = ?', (quiz_id,))
        questions = cursor.fetchall()
        
        if not questions:
            conn.close()
            return json_response({'error': 'No questions found for this quiz'}, '404 Not Found')

        total_questions = len(questions)
        score = 0
        submission_id = str(uuid.uuid4())
        
        answer_records = []
        for q in questions:
            q_id = q['id']
            correct_opt = q['correct_option']
            selected_opt = int(answers_dict.get(str(q_id), -1))
            is_correct = 1 if selected_opt == correct_opt else 0
            if is_correct:
                score += 1
            answer_records.append((submission_id, q_id, selected_opt, is_correct))

        percentage = round((score / total_questions) * 100, 1)

        try:
            cursor.execute('''
                INSERT INTO submissions (id, quiz_id, participant_name, score, total_questions, percentage, time_taken_seconds, mode)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (submission_id, quiz_id, participant_name, score, total_questions, percentage, time_taken, quiz_mode))
        except Exception:
            cursor.execute('''
                INSERT INTO submissions (id, quiz_id, participant_name, score, total_questions, percentage)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (submission_id, quiz_id, participant_name, score, total_questions, percentage))

        for rec in answer_records:
            cursor.execute('''
                INSERT INTO answers (submission_id, question_id, selected_option, is_correct)
                VALUES (?, ?, ?, ?)
            ''', rec)

        conn.commit()
        conn.close()
        
        # Save to Supabase Cloud DB if configured (fail-safe)
        if SUPABASE_URL and SUPABASE_KEY:
            try:
                supabase_request('submissions', 'POST', {
                    'id': submission_id,
                    'quiz_id': quiz_id,
                    'participant_name': participant_name,
                    'score': score,
                    'total_questions': total_questions,
                    'percentage': percentage,
                    'time_taken_seconds': time_taken,
                    'mode': quiz_mode
                })
            except Exception as e:
                print("Supabase non-blocking save error:", e)

        return json_response({
            'submission_id': submission_id,
            'score': score,
            'total_questions': total_questions,
            'percentage': percentage
        })

    if path.startswith('/api/leaderboard/') and method == 'GET':
        quiz_id = path.replace('/api/leaderboard/', '')
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT participant_name, score, total_questions, percentage, time_taken_seconds, mode, submitted_at
            FROM submissions
            WHERE quiz_id = ?
            ORDER BY percentage DESC, time_taken_seconds ASC, submitted_at ASC
            LIMIT 10
        ''', (quiz_id,))
        top_list = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return json_response({'leaderboard': top_list})

    if path.startswith('/api/submissions/') and method == 'GET':
        sub_id = path.replace('/api/submissions/', '')
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT s.*, q.title as quiz_title
            FROM submissions s
            JOIN quizzes q ON s.quiz_id = q.id
            WHERE s.id = ?
        ''', (sub_id,))
        sub_row = cursor.fetchone()
        if not sub_row:
            conn.close()
            return json_response({'error': 'Submission not found'}, '404 Not Found')
            
        submission = dict(sub_row)
        
        cursor.execute('''
            SELECT a.question_id, a.selected_option, a.is_correct,
                   q.question_text, q.image_url, q.options, q.correct_option, q.explanation
            FROM answers a
            JOIN questions q ON a.question_id = q.id
            WHERE a.submission_id = ?
            ORDER BY q.sort_order ASC, q.id ASC
        ''', (sub_id,))
        
        review_questions = []
        for row in cursor.fetchall():
            item = dict(row)
            item['options'] = json.loads(item['options'])
            review_questions.append(item)
            
        submission['review'] = review_questions
        conn.close()
        return json_response({'submission': submission})

    # Admin Endpoints
    if path.startswith('/api/admin'):
        auth_pass = environ.get('HTTP_X_ADMIN_PASSWORD', '')
        if auth_pass != ADMIN_PASSWORD:
            return json_response({'error': 'Unauthorized Admin Access'}, '401 Unauthorized')

    if path == '/api/admin/submissions' and method == 'GET':
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT s.id, s.participant_name, s.score, s.total_questions, s.percentage, s.submitted_at,
                   q.title as quiz_title, q.id as quiz_id
            FROM submissions s
            JOIN quizzes q ON s.quiz_id = q.id
            ORDER BY s.submitted_at DESC
        ''')
        local_subs = [dict(row) for row in cursor.fetchall()]
        conn.close()

        # If Supabase Cloud DB configured, fetch cloud records and merge
        cloud_subs = supabase_request('submissions?select=*,quizzes(title)&order=submitted_at.desc')
        if cloud_subs and isinstance(cloud_subs, list):
            formatted_cloud = []
            for item in cloud_subs:
                quiz_title = item.get('quizzes', {}).get('title', 'Medical Quiz') if isinstance(item.get('quizzes'), dict) else 'Medical Quiz'
                formatted_cloud.append({
                    'id': item.get('id'),
                    'participant_name': item.get('participant_name'),
                    'score': item.get('score'),
                    'total_questions': item.get('total_questions'),
                    'percentage': item.get('percentage'),
                    'submitted_at': item.get('submitted_at'),
                    'quiz_title': quiz_title,
                    'quiz_id': item.get('quiz_id')
                })
            return json_response({'submissions': formatted_cloud})

        return json_response({'submissions': local_subs})

    if path == '/api/admin/quizzes' and method == 'POST':
        try:
            length = int(environ.get('CONTENT_LENGTH', 0))
            body = environ['wsgi.input'].read(length)
            data = json.loads(body.decode('utf-8'))
        except Exception:
            return json_response({'error': 'Invalid JSON'}, '400 Bad Request')

        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        category = data.get('category', 'General Medical').strip()
        
        if not title:
            return json_response({'error': 'Title is required'}, '400 Bad Request')
            
        quiz_id = 'quiz-' + str(uuid.uuid4())[:8]
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO quizzes (id, title, description, category) VALUES (?, ?, ?, ?)',
                       (quiz_id, title, description, category))
        
        questions = data.get('questions', [])
        for idx, question in enumerate(questions):
            cursor.execute('''
                INSERT INTO questions (quiz_id, question_text, image_url, options, correct_option, explanation, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                quiz_id,
                question.get('question_text', ''),
                question.get('image_url', None),
                json.dumps(question.get('options', ['', '', '', ''])),
                int(question.get('correct_option', 0)),
                question.get('explanation', ''),
                idx
            ))
            
        conn.commit()
        conn.close()
        return json_response({'success': True, 'quiz_id': quiz_id})

    # Serve static frontend files
    if path == '/' or path == '/index.html':
        return serve_file(os.path.join(STATIC_DIR, 'index.html'), 'text/html')
        
    if path.startswith('/static/'):
        rel_path = path.replace('/static/', '')
        file_path = os.path.join(STATIC_DIR, rel_path)
        ext = os.path.splitext(file_path)[1].lower()
        mime_types = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.json': 'application/json'
        }
        content_type = mime_types.get(ext, 'application/octet-stream')
        return serve_file(file_path, content_type)

    # SPA routing fallback to index.html for client side routing
    return serve_file(os.path.join(STATIC_DIR, 'index.html'), 'text/html')

def main():
    init_db()
    seed_db()
    port = int(os.environ.get('PORT', 8080))
    print(f"==================================================")
    print(f"Medical MCQ Quiz App Server running at:")
    print(f"--> http://localhost:{port}")
    print(f"--> http://127.0.0.1:{port}")
    print(f"==================================================")
    
    server = make_server('0.0.0.0', port, application, server_class=ThreadedWSGIServer)
    server.serve_forever()

if __name__ == '__main__':
    main()
