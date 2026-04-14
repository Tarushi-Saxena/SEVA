import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Fallback first aid tips for common symptoms
const fallbackTips: Record<string, string> = {
  'chest pain': `## ⚠️ Immediate Actions
1. **Call 108 immediately** - Get emergency help on the way.
2. **Sit and Rest** - Have the person sit down and stay calm.
3. **Loosen Clothing** - Loosen any tight clothes around the neck/chest.

## 🚑 Step-by-Step Guide
1. **Monitor Breathing** - Check if the person is breathing normally.
2. **Be Ready for CPR** - If they stop breathing, start chest compressions.
3. **Stay With Them** - Do not leave the person alone.

## 🛑 What NOT To Do
- Do not let the person walk around or exert themselves.
- Do not give them food or water.`,

  'difficulty breathing': `## ⚠️ Immediate Actions
1. **Call 108 immediately** - This is a high-priority emergency.
2. **Sit Upright** - Help the person sit straight up to open airways.
3. **Loosen Clothing** - Open buttons or ties around the neck.

## 🚑 Step-by-Step Guide
1. **Encourage Slow Breaths** - Help them stay calm and breathe slowly.
2. **Check for Inhaler** - If they have a prescribed inhaler, help them use it.
3. **Fresh Air** - Ensure the area is well-ventilated.

## 🛑 What NOT To Do
- Do not let them lie flat on their back.
- Do not force them to drink water.`,

  'unconsciousness': `## ⚠️ Immediate Actions
1. **Call 108 immediately** - Check for response by tapping shoulders.
2. **Check Breathing** - Look for chest rising or feel for breath.
3. **Clear Airway** - Gently tilt head back to open the airway.

## 🚑 Step-by-Step Guide
1. **Recovery Position** - If breathing, roll them onto their side.
2. **Monitor** - Keep checking their breathing every minute.
3. **Stay Close** - Stay until help arrives.

## 🛑 What NOT To Do
- Do not put anything in their mouth.
- Do not try to make them sit up or stand.`,

  'severe bleeding': `## ⚠️ Immediate Actions
1. **Call 108 immediately** - Life-threatening bleeding needs professional help.
2. **Find the Source** - Quickly locate where the blood is coming from.
3. **Protect Yourself** - Use gloves or a plastic bag if available.

## 🚑 Step-by-Step Guide
1. **Apply Direct Pressure** - Push hard on the wound with a clean cloth.
2. **Maintain Pressure** - Do not lift the cloth to check the wound.
3. **Add More Layers** - If blood soaks through, add more cloth on top.

## 🛑 What NOT To Do
- Do not remove the first cloth once applied.
- Do not try to clean the wound until bleeding stops.`,

  'heart attack': `## ⚠️ Immediate Actions
1. **Call 108 immediately** - Every minute counts.
2. **Rest** - Help them sit in a comfortable position.
3. **Keep Calm** - Stress makes the heart work harder.

## 🚑 Step-by-Step Guide
1. **Aspirin** - If they are not allergic, let them chew one adult aspirin.
2. **Loosen Clothes** - Loosen belts, ties, and collars.
3. **Ready for CPR** - Be prepared if they lose consciousness.

## 🛑 What NOT To Do
- Do not let them drive themselves to the hospital.
- Do not ignore the symptoms even if they "go away".`,

  'stroke': `## ⚠️ Immediate Actions
1. **Call 108 immediately** - Note the time symptoms started.
2. **Check FACE** - Ask them to smile (look for droop).
3. **Check ARMS** - Ask them to raise both arms (look for drift).

## 🚑 Step-by-Step Guide
1. **Check SPEECH** - Ask them to repeat a simple sentence.
2. **Keep Still** - Help them lie down on their side.
3. **Reassure** - Keep talking to them to keep them calm.

## 🛑 What NOT To Do
- Do not give them any food, drink, or medication.
- Do not wait to "see if it gets better".`,

  'seizure': `## 🛡️ Safety Steps
1. **Call 108 if** - Seizure lasts >5 mins or they are injured.
2. **Protect Head** - Place something soft (like a coat) under their head.
3. **Clear the Area** - Move sharp or hard objects away.

## 🚑 Step-by-Step Guide
1. **Turn on Side** - Gently roll them onto their side once shaking stops.
2. **Time It** - Note how long the seizure lasts.
3. **Stay With Them** - Talk calmly until they are fully awake.

## 🛑 What NOT To Do
- Do not hold them down or try to stop their movements.
- Do not put anything (including your fingers) in their mouth.`,

  'burns': `## 🧊 Cooling & Treatment
1. **Cool Water** - Run cool (not cold) tap water over the burn for 20 mins.
2. **Remove Jewelry** - Carefully take off rings/watches before swelling.
3. **Cover Loose** - Use plastic wrap or a clean bag to cover the burn.

## 🚑 Step-by-Step Guide
1. **Call 108 if** - The burn is large, deep, or on the face/hands.
2. **Keep Warm** - Only cool the burn, keep the rest of the person warm.
3. **Pain Relief** - Take standard pain medicine if needed.

## 🛑 What NOT To Do
- Do not use ice, butter, toothpaste, or ointments.
- Do not pop any blisters.`,

  'fracture': `## 🛠️ Stabilization
1. **Do Not Move** - Do not move the person unless they are in danger.
2. **Stop Bleeding** - Apply pressure to any bleeding wounds.
3. **Support** - Use a rolled-up towel or clothing to steady the limb.

## 🚑 Step-by-Step Guide
1. **Apply Ice** - Wrap ice in a cloth and apply to the area (10 mins).
2. **Call 108 if** - Bone is visible or the person is in extreme pain.
3. **Keep Still** - Keep the injured part in the position you found it.

## 🛑 What NOT To Do
- Do not try to "straighten" or realign the bone.
- Do not let the person eat or drink.`,

  'poisoning': `## ⚠️ Emergency Response
1. **Call Poison Control** - Or call 108 immediately.
2. **Identify Source** - Try to find out what was taken and how much.
3. **Stay Alert** - Watch for vomiting or sleepiness.

## 🚑 Step-by-Step Guide
1. **Clear Mouth** - Spit out any remaining bits of poison.
2. **Fresh Air** - If inhaled, move the person to fresh air.
3. **Save Container** - Keep the bottle or package for the doctors.

## 🛑 What NOT To Do
- Do not induce vomiting unless told to by a professional.
- Do not wait for symptoms to appear before calling for help.`
};

export const generateFirstAidTips = async (symptom: string): Promise<string> => {
  try {
    if (!genAI) {
      // Use fallback tips if API key is not available
      const normalizedSymptom = symptom.toLowerCase();
      const matchingTip = Object.keys(fallbackTips).find(key => 
        normalizedSymptom.includes(key) || key.includes(normalizedSymptom)
      );

      if (matchingTip) {
        return fallbackTips[matchingTip];
      }

      return `• Call emergency services immediately (108)
• Keep the person calm and comfortable
• Monitor vital signs (breathing, pulse)
• Don't give food or water unless instructed
• Stay with them until help arrives
• Provide basic first aid as appropriate for the situation`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `Provide immediate first aid instructions for ${symptom}. 
    CRITICAL: Use simple, layperson terms that anyone can follow. Avoid medical jargon. 
    Focus on "DO NOW" actions that an untrained person can perform.
    
    Use this exact markdown format:
    ## ⚠️ Immediate Actions
    (List 2-4 most critical actions)
    
    ## 🚑 Step-by-Step Guide
    1. **Action** - Simple explanation
    2. **Action** - Simple explanation
    
    ## 🛑 What NOT To Do
    (List 1-2 common mistakes to avoid)
    
    Keep it extremely concise.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating first aid tips:', error);

    // Fallback to basic tips if API fails
    return `• Call emergency services immediately (108)
• Keep the person calm and comfortable
• Monitor vital signs (breathing, pulse)
• Don't give food or water unless instructed
• Stay with them until help arrives
• Provide basic first aid as appropriate for the situation`;
  }
};

// Export alias for compatibility
export const getFirstAidResponse = generateFirstAidTips;