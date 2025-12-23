
import { PROMPT_BASE_STYLE, PROMPT_VISUAL_ANCHOR } from "./constants";
import { UserPreferences, TrainingStep } from "./types";
import { aiApi } from "./api/ai";

/**
 * AI 自动规划场景步骤 - 通过后端API
 */
export async function planScenarioSteps(topic: string, preferences: UserPreferences): Promise<{ steps: TrainingStep[], totalImages: number }> {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'geminiService.ts:planScenarioSteps',message:'planScenarioSteps called',data:{topic},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  try {
    const response = await aiApi.planScenario(topic, preferences);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'geminiService.ts:planScenarioSteps',message:'planScenarioSteps response received',data:{success:response?.success,stepsCount:response?.data?.steps?.length,totalImages:response?.data?.total_images},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // aiApi返回的是API响应对象 {success, data, message}
    if (response && response.success && response.data && response.data.steps) {
      // 转换后端格式到前端格式
      const steps = response.data.steps.map((step: any, idx: number) => ({
        id: idx + 1,
        text: step.instruction || step.text,
        img_prompt_suffix: step.image_prompt || step.img_prompt_suffix || ''
      }));
      const totalImages = response.data.total_images || steps.length;

      return { steps, totalImages };
    }
    throw new Error(response?.message || '场景规划失败');
  } catch (error) {
    console.error("Scenario planning failed:", error);
    // 返回默认步骤作为fallback
    const defaultSteps = [
      { id: 1, text: `准备开始${topic}训练`, img_prompt_suffix: `preparing for ${topic}` },
      { id: 2, text: `执行${topic}的主要步骤`, img_prompt_suffix: `performing ${topic}` },
      { id: 3, text: `完成${topic}训练`, img_prompt_suffix: `completing ${topic}` }
    ];
    return { steps: defaultSteps, totalImages: defaultSteps.length };
  }
}

/**
 * 核心生图函数 - 通过后端API
 */
export async function generateSpecialEdImage(
  promptSuffix: string, 
  preferences?: UserPreferences,
  stepId?: number,
  scenarioId?: number
): Promise<string> {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'geminiService.ts:generateSpecialEdImage',message:'generateSpecialEdImage called',data:{stepId,scenarioId,promptSuffix:promptSuffix.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const childDescriptor = preferences?.interest 
    ? `A small child with ${preferences.interest}`
    : `A small child with a simple light-colored t-shirt`;

  const fullPrompt = `${promptSuffix}, ${PROMPT_BASE_STYLE}, ${PROMPT_VISUAL_ANCHOR}`;

  try {
    const response = await aiApi.generateImage(fullPrompt, stepId, scenarioId);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'geminiService.ts:generateSpecialEdImage',message:'generateSpecialEdImage response received',data:{stepId,scenarioId,success:response?.success,hasImageUrl:!!response?.data?.image_url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'geminiService.ts:generateSpecialEdImage',message:'Image API response received',data:{success:response?.success,hasImageUrl:!!response?.data?.image_url,imageUrl:response?.data?.image_url,urlType:typeof response?.data?.image_url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // aiApi返回的是API响应对象 {success, data, message}
    if (response && response.success && response.data && response.data.image_url) {
      const imageUrl = response.data.image_url;
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'geminiService.ts:generateSpecialEdImage',message:'Returning image URL',data:{imageUrl,isRelative:imageUrl.startsWith('/'),isAbsolute:imageUrl.startsWith('http'),currentOrigin:window.location.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return imageUrl;
    }
    throw new Error(response?.message || '图像生成失败');
  } catch (error) {
    console.error("Image generation failed:", error);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'geminiService.ts:generateSpecialEdImage',message:'Image generation error, using fallback',data:{error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return `https://placehold.co/600x600/ffffff/3b82f6?text=${encodeURIComponent(promptSuffix)}`;
  }
}

/**
 * 核心语音生成函数 - 通过后端API
 */
export async function generateTTSAudio(text: string, voiceName: string = 'Kore'): Promise<string> {
  try {
    const response = await aiApi.generateTTS(text, voiceName);
    // aiApi返回的是API响应对象 {success, data, message}
    if (response && response.success && response.data) {
      // 如果返回audio_url，需要获取音频数据
      if (response.data.audio_url) {
        // 从URL获取音频文件
        try {
          const audioResponse = await fetch(response.data.audio_url);
          if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob();
            // 转换为base64
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = reader.result as string;
                // 移除data URL前缀，只返回base64数据
                const base64 = base64data.split(',')[1] || base64data;
                resolve(base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(audioBlob);
            });
          }
        } catch (fetchError) {
          console.error("Failed to fetch audio from URL:", fetchError);
        }
      }
      // 如果直接返回audio_data
      if (response.data.audio_data) {
        return response.data.audio_data;
      }
    }
    // 如果TTS服务不可用，返回空字符串
    console.warn('TTS服务暂不可用');
    return '';
  } catch (error) {
    console.error("TTS failed:", error);
    return '';
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
