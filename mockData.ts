import { Patient } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'patient_1',
    name: 'John Doe',
    consultations: [
      {
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        messages: [],
        files: [],
        reportHighlights: `- Chief Complaint: Persistent headaches for 2 weeks.
- Key Symptoms: 6/10 headache severity, dizziness, worse in the morning.
- Critical History: Hypertension, managed with Lisinopril.`, report: `### 1. Patient Summary
A brief overview of the patient's chief complaint and background. John Doe, a 45-year-old male, presents with a chief complaint of persistent headaches.

### 2. Symptom Analysis
- **Primary Symptoms:** Headaches, dizziness.
- **Onset & Duration:** Started 2 weeks ago.
- **Severity:** 6/10 pain.
- **Context:** Worse in the morning.

### 3. Relevant Medical History
- **Chronic Conditions:** Hypertension, managed with medication.
- **Past Surgeries:** Appendectomy (2010).
- **Allergies:** Penicillin.

### 4. Current Medications
- Lisinopril 10mg daily.
- Ibuprofen as needed for pain.

### 6. Suggested Differential Diagnosis
**This is a preliminary analysis...**
1.  **Tension Headache:** Common, fits general description.
2.  **Migraine:** Possible, given severity.
3.  **Hypertension-related headache:** Important to rule out given history.

### 7. Recommended Next Steps
- Physical examination focusing on neurological assessment.
- Blood pressure check.
- Consider MRI if symptoms worsen.`
      }
    ]
  },
  {
    id: 'patient_2',
    name: 'Jane Smith',
    consultations: [
      {
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        messages: [],
        files: [],
        reportHighlights: `- Chief Complaint: Cold and cough symptoms.
- Key Symptoms: Cough, sore throat, runny nose for 3 days.
- Critical History: No chronic conditions or known allergies.`, report: `### 1. Patient Summary
Jane Smith, a 32-year-old female, presents with symptoms of a common cold and cough.

### 2. Symptom Analysis
- **Primary Symptoms:** Cough, sore throat, runny nose.
- **Onset & Duration:** 3 days.
- **Severity:** Mild.
- **Context:** No significant factors.

### 3. Relevant Medical History
- **Chronic Conditions:** None.
- **Past Surgeries:** None.
- **Allergies:** None known.

### 4. Current Medications
- None.

### 6. Suggested Differential Diagnosis
**This is a preliminary analysis...**
1.  **Viral Upper Respiratory Infection (Common Cold):** Most likely diagnosis.
2.  **Influenza:** Possible, check for fever and body aches.
3.  **Allergic Rhinitis:** Less likely given acute onset.

### 7. Recommended Next Steps
- Recommend rest and fluids.
- Symptomatic treatment with over-the-counter medication.
- Advise to return if symptoms worsen or fever develops.`
      }
    ]
  },
];
