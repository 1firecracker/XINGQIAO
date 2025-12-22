
import { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: "supermarket_queue",
    name: "超市排队",
    icon: "🛒",
    description: "学习在超市结账时遵守排队规则",
    steps: [
      { id: 1, text: "站在黄线后面", img_prompt_suffix: "a child standing quietly behind a clear thick yellow line on the floor, back view, clear spatial markers" },
      { id: 2, text: "保持安全距离", img_prompt_suffix: "two children waiting in line with a 2-meter gap between them, simple floor footprints markings" },
      { id: 3, text: "把物品放在柜台", img_prompt_suffix: "a single hand placing a milk carton on a clean white checkout counter, high contrast" }
    ],
    next_recommendation: "crossing_road"
  },
  {
    id: "brushing_teeth",
    name: "洗漱刷牙",
    icon: "🪥",
    description: "每日晨间清洁习惯培养",
    steps: [
      { id: 1, text: "挤牙膏", img_prompt_suffix: "a hand squeezing a pea-sized amount of blue toothpaste onto a toothbrush, close up" },
      { id: 2, text: "刷刷牙", img_prompt_suffix: "a child with a happy expression brushing teeth, simplified bathroom mirror background" },
      { id: 3, text: "漱口杯洗嘴巴", img_prompt_suffix: "a child holding a simple light blue plastic cup to their mouth" }
    ],
    next_recommendation: "garbage_sorting"
  },
  {
    id: "crossing_road",
    name: "过马路",
    icon: "🚦",
    description: "交通安全与信号灯识别",
    steps: [
      { id: 1, text: "红灯停", img_prompt_suffix: "a large bright red traffic light symbol, high contrast, stop gesture" },
      { id: 2, text: "绿灯行", img_prompt_suffix: "a large bright green traffic light symbol, walking person figure" },
      { id: 3, text: "走斑马线", img_prompt_suffix: "a child walking straight across thick white zebra crossing lines, blue sky" }
    ],
    next_recommendation: "bus_riding"
  },
  {
    id: "garbage_sorting",
    name: "垃圾分类",
    icon: "♻️",
    description: "认识垃圾桶与分类投放",
    steps: [
      { id: 1, text: "认识蓝色垃圾桶", img_prompt_suffix: "a large bright blue recycling bin, centered, white recycling logo" },
      { id: 2, text: "纸箱压扁", img_prompt_suffix: "a flattened clean cardboard box on a white surface, clear edges" },
      { id: 3, text: "投入纸张", img_prompt_suffix: "a hand dropping a white paper into the blue bin opening" }
    ],
    next_recommendation: "supermarket_queue"
  },
  {
    id: "bus_riding",
    name: "乘坐公交",
    icon: "🚌",
    description: "公共交通礼仪与安全",
    steps: [
      { id: 1, text: "刷卡上车", img_prompt_suffix: "a hand holding a yellow card to a simple black card reader machine" },
      { id: 2, text: "扶好扶手", img_prompt_suffix: "a hand firmly holding a vertical yellow bus handle, focused view" },
      { id: 3, text: "到站下车", img_prompt_suffix: "a bus door wide open, view of a safe grey sidewalk" }
    ],
    next_recommendation: "brush_teeth"
  }
];

export const PROMPT_BASE_STYLE = "flat vector illustration, minimalist, thick clean black outlines, high contrast, pure white background, low saturation colors, pastel blue and green palette, no clutter, no shadows, no gradients, educational visual support style";
export const PROMPT_VISUAL_ANCHOR = "one main subject centered, occupying 70% of frame, visual anchor point focused, clear and distinct shapes, symbolic representation";

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
