import { AssistanceLevel, Milestone } from './types';

// 反馈话术配置
export const FEEDBACK_MESSAGES: Record<string, Record<AssistanceLevel, string>> = {
  supermarket_queue: {
    F: "我们跟着老师的手，站到黄线后啦！",
    P: "看到老师指的黄线，你站对啦！",
    I: "你自己完成了排队，太棒了！"
  },
  classroom_greeting: {
    F: "跟着老师看过来，我们打招呼啦！",
    P: "你看懂了提示，笑得真好看！",
    I: "你主动打招呼，太厉害啦！"
  },
  classroom_hand_raise: {
    F: "我们一起举手，等老师叫哦！",
    P: "你跟着手势举手，做得对！",
    I: "你主动举手，太乖啦！"
  },
  borrow_item: {
    F: "我们一起拍一拍，借东西啦！",
    P: "你看懂提示，借到东西啦！",
    I: "你自己借还东西，真有礼貌！"
  },
  tidy_toys: {
    F: "我们一起把玩具送回家啦！",
    P: "你跟着提示收拾玩具，真棒！",
    I: "你自己收拾好玩具，太能干啦！"
  }
};

// 辅助等级判断标准说明
export const ASSISTANCE_LEVEL_DESCRIPTIONS: Record<AssistanceLevel, { name: string; description: string }> = {
  F: {
    name: "全辅助",
    description: "需要老师/家长完全帮助完成"
  },
  P: {
    name: "半辅助",
    description: "看到提示后能自主完成"
  },
  I: {
    name: "独立完成",
    description: "完全自主完成，无需提示"
  }
};

// 能力里程碑判断规则
export function calculateMilestone(overallLevel: AssistanceLevel): Milestone {
  // F/P → Level1, I → Level2
  return overallLevel === 'I' ? 'Level2' : 'Level1';
}

// 计算场景总体辅助等级（取最低等级）
export function calculateOverallLevel(stepLevels: AssistanceLevel[]): AssistanceLevel {
  if (stepLevels.length === 0) return 'F';
  
  // 优先级：F > P > I（F需要最多帮助）
  if (stepLevels.includes('F')) return 'F';
  if (stepLevels.includes('P')) return 'P';
  return 'I';
}

// 获取反馈话术
export function getFeedbackMessage(scenarioId: string, level: AssistanceLevel): string {
  const messages = FEEDBACK_MESSAGES[scenarioId];
  if (!messages) {
    // 默认反馈话术
    return level === 'I' 
      ? "你完成得很好！" 
      : level === 'P' 
      ? "你做得不错，继续加油！" 
      : "我们一起努力完成！";
  }
  return messages[level];
}

