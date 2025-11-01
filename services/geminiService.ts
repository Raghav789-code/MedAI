import { GoogleGenAI, LiveServerMessage, Modality, Blob, Content } from "@google/genai";
import { Message } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: The 'LiveSession' type is not exported from @google/genai. Use 'any' as a workaround.
let liveSession: any | null = null;

const getSystemInstruction = () => {
  return `You are 'Aida', a friendly and professional AI medical assistant from 'Verdant Health'. Your goal is to gather a patient's preliminary information before their consultation with a doctor. You must respond in English.

Follow these steps:
1. Greet the patient warmly and introduce yourself.
2. Ask for their full name and wait for their response.
3. Once you have their name, ask for their primary reason for the visit today.
4. Inquire about their symptoms in detail.
5. Ask about relevant medical history, allergies, and current medications.
6. Politely ask if they have any recent lab reports or images (JPG, PNG, PDF) they'd like to share.
7. Once you have a comprehensive overview, conclude the conversation by saying something like: "Thank you. I have everything I need to prepare a summary for your doctor. Please click the 'Generate Report' button."

Maintain an empathetic tone. Do not provide medical advice.`;
};

export const getAiResponse = async (history: Message[], newMessage: string): Promise<string> => {
    const contents: Content[] = history
        .filter(m => m.sender !== 'system')
        .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
        }));

    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    try {
        // Fix: The `systemInstruction` parameter must be nested within a `config` object.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction: getSystemInstruction(),
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
}

export const startLiveSession = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}) => {
    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: getSystemInstruction(),
        },
    });
    sessionPromise.then(session => liveSession = session);
    return sessionPromise;
};

export const sendLiveAudio = (audioData: Float32Array) => {
    if (liveSession) {
        const l = audioData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = audioData[i] * 32768;
        }
        const pcmBlob: Blob = {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
        liveSession.sendRealtimeInput({ media: pcmBlob });
    }
};

export const stopLiveSession = async () => {
    if (liveSession) {
        await liveSession.close();
        liveSession = null;
    }
};

export const extractPatientName = async (messages: Message[]): Promise<string> => {
  const conversation = messages
    .filter(msg => msg.sender !== 'system' && msg.text.length < 200) // Filter out long system messages
    .map(msg => `${msg.sender === 'user' ? 'Patient' : 'Assistant'}: ${msg.text}`)
    .join('\n');

  const prompt = `Analyze the following conversation and extract the patient's full name. Return only the name and nothing else. If a name cannot be found, return an empty string.\n\nConversation:\n${conversation}`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error extracting patient name:", error);
    return ""; // Return empty on error
  }
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type
    }
  };
};

export const generateReport = async (messages: Message[], files: File[]): Promise<string> => {
  const chatHistoryString = messages
    .filter(msg => msg.sender !== 'system')
    .map(msg => `${msg.sender === 'user' ? 'Patient' : 'Assistant'}: ${msg.text}`)
    .join('\n');

  const prompt = `
    Analyze the following patient-AI conversation and any attached files to generate a structured, professional medical report in Markdown.

    **Conversation History:**
    ---
    ${chatHistoryString}
    ---

    **Instructions:**
    Create the report with the following sections. Be concise and use medical terminology. Ensure all 7 sections are present in the final report, even if details are not available (use "N/A" or "Not discussed").

    ### 1. Patient Summary
    Brief overview of chief complaint.

    ### 2. Symptom Analysis
    - **Primary Symptoms:**
    - **Onset & Duration:**
    - **Severity:**
    - **Context & Modifying Factors:**

    ### 3. Relevant Medical History
    - **Chronic Conditions:**
    - **Past Surgeries:**
    - **Allergies:**

    ### 4. Current Medications
    List all medications.

    ### 5. Lab Report & Image Insights
    If files are attached, analyze them. For images (like X-rays or skin conditions), describe key visual findings. For lab reports, summarize key data points and flag any abnormalities. If no files, state "No files attached."

    ### 6. Suggested Differential Diagnosis
    Provide 3-4 potential diagnoses with brief rationales. **Start with this disclaimer: "This is a preliminary analysis based on patient-reported information and is not a definitive diagnosis. A full clinical evaluation is required."**

    ### 7. Recommended Next Steps
    Suggest an action plan for the physician (e.g., specific exams, tests, referrals).
  `;

  const contents = [prompt];
  for (const file of files) {
    if (file.type.startsWith('image/')) {
       const part = await fileToGenerativePart(file);
       contents.push(part as any);
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents as any,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    throw new Error("Failed to generate report.");
  }
};


export const generateReportHighlights = async (fullReport: string): Promise<string> => {
    const prompt = `
        Based on the following detailed medical report, generate a "Key Highlights" section for a doctor.
        This should be a very brief, bulleted list (3-4 points) summarizing the most critical information, such as the chief complaint, key symptoms, and critical medical history.
        The goal is to provide a quick, at-a-glance summary. Use a hyphen (-) for each point.

        **Full Report:**
        ---
        ${fullReport}
        ---

        **Output only the bullet points.**
    `;
    try {
        // Fix: Corrected typo in model name.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating report highlights:", error);
        return "Could not generate highlights.";
    }
}


export const checkMedicationInteractions = async (currentMedications: string, newMedication: string): Promise<string> => {
    if (!newMedication.trim()) {
        return "Please enter a medication to check.";
    }

    const prompt = `
        As a clinical pharmacologist AI, analyze potential drug-drug interactions.

        **Patient's Current Medications:**
        ${currentMedications.trim() || "None listed"}

        **New Medication to Check:**
        ${newMedication}

        **Instructions:**
        1. Identify significant potential interactions (mild, moderate, severe).
        2. For each, describe the potential effect and provide a brief, actionable recommendation.
        3. If no significant interactions are found, state that clearly.
        4. Format the output in clear Markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error checking medication interactions:", error);
        throw new Error("Failed to check medication interactions.");
    }
};
