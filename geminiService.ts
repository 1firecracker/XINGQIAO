
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { PROMPT_BASE_STYLE, PROMPT_VISUAL_ANCHOR } from "./constants";
import { UserPreferences, TrainingStep } from "./types";

/**
 * AI 自动规划场景步骤
 */
export async function planScenarioSteps(topic: string, preferences: UserPreferences): Promise<TrainingStep[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `你是一位资深的特殊教育专家。你的任务是根据用户提供的主题，编写一个适合孤独症儿童的视觉社交故事（Social Story）。
规则：
1. 步骤数量：根据任务复杂度自动决定，范围 3-10 步。
2. 内容风格：语言简洁直白，无隐喻，强调正向行为。
3. 绘图描述：为每一步提供一个简短的英文绘图提示词后缀，描述核心动作。
4. 视觉一致性：保持主角是一个${preferences.interest || '穿着简单T恤的孩子'}。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `主题：${topic}。请编排训练步骤。` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  text: { type: Type.STRING, description: "给孩子看的指令文字" },
                  img_prompt_suffix: { type: Type.STRING, description: "英文绘图提示词，描述画面核心内容" }
                },
                required: ["id", "text", "img_prompt_suffix"]
              }
            }
          },
          required: ["steps"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data.steps as TrainingStep[];
  } catch (error) {
    console.error("Scenario planning failed:", error);
    throw error;
  }
}

/**
 * 核心生图函数
 */
export async function generateSpecialEdImage(promptSuffix: string, preferences?: UserPreferences): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const childDescriptor = preferences?.interest 
    ? `A small child with ${preferences.interest}`
    : `A small child with a simple light-colored t-shirt`;

  const fullPrompt = `${childDescriptor}, ${promptSuffix}, ${PROMPT_BASE_STYLE}, ${PROMPT_VISUAL_ANCHOR}, single subject, clear focus, high contrast, clean white background.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data");
  } catch (error) {
    console.error("Image generation failed:", error);
    return `https://placehold.co/600x600/ffffff/3b82f6?text=${encodeURIComponent(promptSuffix)}`;
  }
}

/**
 * 核心语音生成函数
 */
export async function generateTTSAudio(text: string, voiceName: string = 'Kore'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Please say this in a gentle, slow Chinese tone: "${text}"` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (data) return data;
    throw new Error("No audio data");
  } catch (error) {
    console.error("TTS failed:", error);
    throw error;
  }
}

export async function decodeAudioBuffer(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  const dataInt16 = new Int16Array(bytes.buffer, 0, Math.floor(bytes.byteLength / 2));
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}
