
import { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: "supermarket_queue",
    name: "超市排队",
    icon: "🛒",
    description: "学习在超市结账时遵守排队规则",
    steps: [
      { id: 1, text: "站黄线后", img_prompt_suffix: "a child standing quietly behind a clear thick yellow line on the floor, back view, clear spatial markers" },
      { id: 2, text: "等前人走", img_prompt_suffix: "two children waiting in line, the front child moving away, simple floor footprints markings" },
      { id: 3, text: "拿物品", img_prompt_suffix: "a single hand placing a milk carton on a clean white checkout counter, high contrast" }
    ],
    next_recommendation: "classroom_greeting"
  },
  {
    id: "classroom_greeting",
    name: "课堂打招呼",
    icon: "👋",
    description: "学习在课堂上主动打招呼",
    steps: [
      { id: 1, text: "眼神轻对视", img_prompt_suffix: "a child making gentle eye contact with a teacher, simple classroom background, friendly expression" },
      { id: 2, text: "嘴角微微笑", img_prompt_suffix: "a child with a gentle smile, warm and friendly facial expression, simple illustration" },
      { id: 3, text: "说'你好'", img_prompt_suffix: "a child saying hello with hand gesture, speech bubble with '你好', simple classroom setting" }
    ],
    next_recommendation: "classroom_hand_raise"
  },
  {
    id: "classroom_hand_raise",
    name: "课堂举手",
    icon: "✋",
    description: "学习在课堂上正确举手",
    steps: [
      { id: 1, text: "举单手", img_prompt_suffix: "a child raising one hand up to shoulder height, simple classroom background, clear gesture" },
      { id: 2, text: "等老师叫", img_prompt_suffix: "a child with hand raised waiting patiently, teacher figure in background, calm expression" },
      { id: 3, text: "轻轻放手", img_prompt_suffix: "a child gently lowering hand, smooth motion, peaceful classroom atmosphere" }
    ],
    next_recommendation: "borrow_item"
  },
  {
    id: "borrow_item",
    name: "借东西",
    icon: "🤝",
    description: "学习礼貌地向他人借东西",
    steps: [
      { id: 1, text: "轻拍手臂", img_prompt_suffix: "a child gently tapping another child's arm, friendly gesture, simple illustration" },
      { id: 2, text: "说'借一下'", img_prompt_suffix: "a child saying '借一下' with polite gesture, speech bubble, friendly interaction" },
      { id: 3, text: "用完归还", img_prompt_suffix: "a child returning an item to another child, both hands visible, grateful expression" }
    ],
    next_recommendation: "tidy_toys"
  },
  {
    id: "tidy_toys",
    name: "收拾玩具",
    icon: "🧸",
    description: "学习整理和收拾玩具",
    steps: [
      { id: 1, text: "拿起玩具", img_prompt_suffix: "a child picking up one toy from the floor, focused action, simple room background" },
      { id: 2, text: "放进收纳盒", img_prompt_suffix: "a child placing a toy into a storage box, organized action, clear container" },
      { id: 3, text: "盖盒盖", img_prompt_suffix: "a child closing the lid of a storage box, completing the task, satisfied expression" }
    ],
    next_recommendation: "supermarket_queue"
  }
];

export const PROMPT_BASE_STYLE = "minimalist black line art, white background, low saturation colors only if needed, no shading, no gradients, no textures, no clutter";
export const PROMPT_VISUAL_ANCHOR = "one child or objects only, one action, neutral expression, simple shapes, no decorative elements, no background people, no text, no symbols";

export const VOICE_OPTIONS = [
  { id: 'Kore', name: '温柔大姐姐', description: '亲切且富有耐心' },
  { id: 'Zephyr', name: '阳光大哥哥', description: '充满活力与鼓励' },
  { id: 'Puck', name: '可爱小伙伴', description: '像同龄人一样亲近' },
  { id: 'Charon', name: '智慧老师', description: '从容而清晰' }
];

export const MUSIC_OPTIONS = [
  { id: 'none', name: '无背景音乐', url: '' },
  { id: 'piano', name: '柔和钢琴', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'nature', name: '宁静自然', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'lullaby', name: '温馨摇篮曲', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

export const SFX = {
  STEP_SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  FINAL_SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'
};
