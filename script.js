const STORAGE_KEY = "office-survival-save-v1";
const MORNING_START = 7 * 60 + 30;
const WORK_START = 8 * 60 + 30;
const NIGHT_START = 23 * 60 + 30;
const NEXT_MORNING = MORNING_START;
const MAX_MONEY = 30000;
const DOZE_TICK_MS = 250;
const BASE_DOZE_MINUTES_PER_TICK = 1.2;
const PHONE_TIME_COST = 3;
const BGM_TRACKS = [
  "./Lo-Fi Blue Morning Loop-1.mp3",
  "./Lo-Fi Blue Morning Loop-2.mp3",
];
const WORK_EVENT_SOURCE = "./随机事件表-工作阶段.md";
const WORK_EVENT_RARITY_PROFILES = [
  { 普通: 55, 少见: 28, 稀有: 12, 极稀有: 5 },
  { 普通: 45, 少见: 30, 稀有: 18, 极稀有: 7 },
  { 普通: 35, 少见: 32, 稀有: 23, 极稀有: 10 },
];
const WORK_TARGET_START = 60;
const WORK_HAND_SIZE = 5;
const WORK_PLAYS_PER_DAY = 4;
const WORK_REROLL_COSTS = [50, 100, 200];
const BASE_WORK_REROLL_LIMIT = 3;
const WORK_TARGET_GROWTH_MULTIPLIER = 1.2;
const WORK_EXTRA_INCOME_PER_POINT = 10;
const BONUS_COMMISSION_EXTRA_INCOME_PER_POINT = 14;
const SKILLS = {
  pairTraining: {
    id: "pairTraining",
    name: "对子培训",
    price: 1200,
    maxPurchases: 1,
    type: "unique",
    effect: "对子额外 +5",
    summary: "稳定保底",
  },
  burnoutExpertise: {
    id: "burnoutExpertise",
    name: "爆肝专精",
    price: 2000,
    maxPurchases: 1,
    type: "unique",
    effect: "三条最终分数 x1.3",
    summary: "高爆发路线",
  },
  processMastery: {
    id: "processMastery",
    name: "流程熟练",
    price: 1600,
    maxPurchases: 1,
    type: "unique",
    effect: "顺子倍率提升为 x3",
    summary: "凑牌路线",
  },
  soloOperator: {
    id: "soloOperator",
    name: "单兵作战",
    price: 1400,
    maxPurchases: 1,
    type: "unique",
    effect: "单张最终分数 x2，对子最终分数 x0.8",
    summary: "快速保底流",
  },
  basicTraining: {
    id: "basicTraining",
    name: "基础培训",
    price: 1800,
    maxPurchases: 1,
    type: "unique",
    effect: "所有牌型最终分数 x1.05",
    summary: "泛用成长",
  },
  performanceSprint: {
    id: "performanceSprint",
    name: "绩效冲刺",
    price: 2200,
    maxPurchases: 1,
    type: "unique",
    effect: "每天第 4 次出牌最终分数 x1.5",
    summary: "收尾爆发",
  },
  quickReshuffle: {
    id: "quickReshuffle",
    name: "快速重组",
    price: 1000,
    maxPurchases: 1,
    type: "unique",
    effect: "每天第一次换牌免费",
    summary: "降低经济压力",
  },
  rerollMastery: {
    id: "rerollMastery",
    name: "熟练摸牌",
    price: 1800,
    maxPurchases: 1,
    type: "unique",
    effect: "每天最大换牌次数 +1",
    summary: "提高成型率",
  },
  carefulSelection: {
    id: "carefulSelection",
    name: "精挑细选",
    price: 1600,
    maxPurchases: 1,
    type: "unique",
    effect: "换牌时若本次弃掉 3 张及以上，则下一次出牌最终分数额外 +8",
    summary: "鼓励大换牌",
  },
  safetyPlan: {
    id: "safetyPlan",
    name: "保底方案",
    price: 2000,
    maxPurchases: 1,
    type: "unique",
    effect: "若当天未达标，则最终得分 x1.1",
    summary: "降低卡线风险",
  },
  bonusCommission: {
    id: "bonusCommission",
    name: "冲刺奖金",
    price: 2400,
    maxPurchases: 1,
    type: "unique",
    effect: "超额达标时，超出部分额外收益由每分 10 提升到 14",
    summary: "高分回报路线",
  },
  practiceMakesPerfect: {
    id: "practiceMakesPerfect",
    name: "熟能生巧",
    price: 1500,
    maxPurchases: 3,
    type: "stackable",
    effect: "每次出牌额外 +3",
    summary: "稳定补分",
  },
  pairDrill: {
    id: "pairDrill",
    name: "对子加练",
    price: 1000,
    maxPurchases: 3,
    type: "stackable",
    effect: "对子额外 +2",
    summary: "强化对子流",
  },
  tripleDrill: {
    id: "tripleDrill",
    name: "三条加练",
    price: 1400,
    maxPurchases: 3,
    type: "stackable",
    effect: "三条最终分数额外 x1.1",
    summary: "强化三条流",
  },
  straightDrill: {
    id: "straightDrill",
    name: "顺子加练",
    price: 1200,
    maxPurchases: 3,
    type: "stackable",
    effect: "顺子额外 +4",
    summary: "强化顺子流",
  },
  singleTraining: {
    id: "singleTraining",
    name: "单张训练",
    price: 900,
    maxPurchases: 3,
    type: "stackable",
    effect: "单张额外 +2",
    summary: "强化单张保底",
  },
  clutchFinish: {
    id: "clutchFinish",
    name: "临门一脚",
    price: 1300,
    maxPurchases: 2,
    type: "stackable",
    effect: "第 4 次出牌额外 +6",
    summary: "强化收尾",
  },
  rerollDiscount: {
    id: "rerollDiscount",
    name: "换牌补贴",
    price: 1000,
    maxPurchases: 2,
    type: "stackable",
    effect: "每天换牌价格总额减少 20",
    summary: "降低换牌成本",
  },
  handPlanning: {
    id: "handPlanning",
    name: "手牌规划",
    price: 1600,
    maxPurchases: 2,
    type: "stackable",
    effect: "每天最大换牌次数额外 +1",
    summary: "提高成型率",
  },
};
const STORE_SKILL_ORDER = [
  "pairTraining",
  "burnoutExpertise",
  "processMastery",
  "soloOperator",
  "basicTraining",
  "performanceSprint",
  "quickReshuffle",
  "rerollMastery",
  "carefulSelection",
  "safetyPlan",
  "bonusCommission",
  "practiceMakesPerfect",
  "pairDrill",
  "tripleDrill",
  "straightDrill",
  "singleTraining",
  "clutchFinish",
  "rerollDiscount",
  "handPlanning",
];

const BEDS = {
  wood: {
    id: "wood",
    name: "木板床",
    price: 0,
    nightEnergyPerHour: 1.75,
    nightStressPerHour: 1.5,
    morningEnergyPerMinute: 0.14,
    morningStressPerMinute: 0.08,
    summary: "前期够用，恢复一般。",
  },
  spring: {
    id: "spring",
    name: "弹簧床垫",
    price: 1000,
    nightEnergyPerHour: 1.875,
    nightStressPerHour: 1.625,
    morningEnergyPerMinute: 0.18,
    morningStressPerMinute: 0.12,
    summary: "第一阶段核心升级。",
  },
  memory: {
    id: "memory",
    name: "记忆棉床垫",
    price: 3000,
    nightEnergyPerHour: 2,
    nightStressPerHour: 1.75,
    morningEnergyPerMinute: 0.25,
    morningStressPerMinute: 0.17,
    summary: "中期稳定器，恢复明显。",
  },
  deluxe: {
    id: "deluxe",
    name: "豪华定制床",
    price: 8000,
    nightEnergyPerHour: 2.5,
    nightStressPerHour: 2.25,
    morningEnergyPerMinute: 0.34,
    morningStressPerMinute: 0.24,
    summary: "后期接近永动机，但前期很贵。",
  },
};

const JOBS = {
  normal: {
    id: "normal",
    name: "普通公司",
    energyDelta: -18,
    stressDelta: 16,
    moneyDelta: 550,
    description: "标准平衡路线。",
  },
  grind: {
    id: "grind",
    name: "跳槽（卷）",
    energyDelta: -22,
    stressDelta: 20,
    moneyDelta: 850,
    switchCost: 5000,
    description: "高风险高收益，适合冲刺财富自由。",
  },
  easy: {
    id: "easy",
    name: "跳槽（松）",
    energyDelta: -16,
    stressDelta: 14,
    moneyDelta: 420,
    switchCost: 5000,
    description: "低风险低收益，适合保命。",
  },
};

const ITEMS = {
  energyDrink: {
    id: "energyDrink",
    name: "能量饮料",
    price: 150,
    description: "精力 +12，压力 +1。",
    canUse: (state) => state.stage === "morning" || state.stage === "night",
    use(state) {
      state.inventory.energyDrink -= 1;
      const delta = applyDelta(state, { energy: 12, stress: 1 });
      addLog(state, `喝下一罐能量饮料，精力 ${formatSigned(delta.energy)}，压力 ${formatSigned(delta.stress)}。`);
    },
  },
  stressCube: {
    id: "stressCube",
    name: "解压魔方",
    price: 100,
    description: "压力 -12。",
    canUse: (state) => state.stage === "morning" || state.stage === "night",
    use(state) {
      state.inventory.stressCube -= 1;
      const delta = applyDelta(state, { stress: -12 });
      addLog(state, `捏了会儿解压魔方，压力 ${formatSigned(delta.stress)}。`);
    },
  },
  sleepPill: {
    id: "sleepPill",
    name: "安眠药",
    price: 200,
    description: "下一次夜间睡眠恢复效果提升 20%。",
    canUse: (state) => state.stage === "morning" || state.stage === "night",
    use(state) {
      state.inventory.sleepPill -= 1;
      state.sleepBuff = 1.2;
      addLog(state, "你吞下安眠药，准备下一觉狠狠干回点状态。");
    },
  },
};

const FALLBACK_WORK_EVENTS = [
  {
    id: "01",
    title: "早会点名",
    rarity: "普通",
    description: "主管拿着名单扫视全场，问谁来汇报昨天的进度。",
    options: [
      { label: "主动发言", energy: -4, stress: 6, money: 60 },
      { label: "低头装忙", energy: 0, stress: 4, money: 0 },
      { label: "把锅甩给同事", energy: 1, stress: 9, money: -30 },
    ],
  },
  {
    id: "06",
    title: "紧急需求插队",
    rarity: "普通",
    description: "领导说这个需求真的很急，于是你今天的安排全废了。",
    options: [
      { label: "立刻接", energy: -9, stress: 11, money: 90 },
      { label: "拖半小时再说", energy: -3, stress: 6, money: 0 },
    ],
  },
  {
    id: "15",
    title: "摸鱼被抓包",
    rarity: "少见",
    description: "你刚切回工作界面，领导刚好站在你背后。",
    options: [
      { label: "假装在查资料", energy: -1, stress: 9, money: 0 },
      { label: "主动认错", energy: 0, stress: 6, money: -60 },
    ],
  },
  {
    id: "32",
    title: "服务器报警",
    rarity: "少见",
    description: "系统突然报警，所有人开始装作自己知道发生了什么。",
    options: [
      { label: "冲上去排查", energy: -9, stress: 13, money: 120 },
      { label: "等别人先说", energy: 0, stress: 8, money: 0 },
    ],
  },
  {
    id: "48",
    title: "老板请下午茶",
    rarity: "稀有",
    description: "老板罕见地请全员喝下午茶，大家表情复杂。",
    options: [
      { label: "接受并感谢", energy: 5, stress: -4, money: 0 },
      { label: "怀疑有坑", energy: 1, stress: -1, money: 0 },
    ],
  },
  {
    id: "80",
    title: "公司传出裁员风声",
    rarity: "极稀有",
    description: "办公室里开始流传裁员名单的消息，所有人都突然坐得比平时更直。",
    options: [
      { label: "疯狂证明自己", energy: -10, stress: 15, money: 120 },
      { label: "悄悄更新简历", energy: -3, stress: 6, money: -40 },
      { label: "装作不知道", energy: 0, stress: 11, money: 0 },
    ],
  },
];

const ui = {
  dayValue: document.querySelector("#day-value"),
  timeValue: document.querySelector("#time-value"),
  stageValue: document.querySelector("#stage-value"),
  moneyValue: document.querySelector("#money-value"),
  energyText: document.querySelector("#energy-text"),
  energyFill: document.querySelector("#energy-fill"),
  stressText: document.querySelector("#stress-text"),
  stressFill: document.querySelector("#stress-fill"),
  bedValue: document.querySelector("#bed-value"),
  jobValue: document.querySelector("#job-value"),
  sleepBuffValue: document.querySelector("#sleep-buff-value"),
  sceneTitle: document.querySelector("#scene-title"),
  sceneTag: document.querySelector("#scene-tag"),
  sceneVisual: document.querySelector("#scene-visual"),
  sceneDescription: document.querySelector("#scene-description"),
  actionBar: document.querySelector("#action-bar"),
  inventoryList: document.querySelector("#inventory-list"),
  tipCopy: document.querySelector("#tip-copy"),
  logList: document.querySelector("#log-list"),
  modalRoot: document.querySelector("#modal-root"),
  musicToggleBtn: document.querySelector("#music-toggle-btn"),
  resetBtn: document.querySelector("#reset-btn"),
};

let state = loadState() ?? createInitialState();
let dozeTimer = null;
let bgmAudio = null;
let bgmTrackIndex = 0;
let bgmEnabled = true;
let bgmUnlockBound = false;
let workEventCatalog = [...FALLBACK_WORK_EVENTS];
let activeStoreTab = "goods";

bindEvents();
setupBackgroundMusic();
render();

function bindEvents() {
  ui.musicToggleBtn.addEventListener("click", toggleBackgroundMusic);
  ui.resetBtn.addEventListener("click", () => {
    if (!window.confirm("重新开局会清掉当前进度，确定继续吗？")) {
      return;
    }
    stopDozing();
    closeModal();
    state = createInitialState();
    saveState();
    render();
  });
}

function setupBackgroundMusic() {
  bgmAudio = new Audio(BGM_TRACKS[0]);
  bgmAudio.preload = "auto";
  bgmAudio.volume = 0.45;
  bgmAudio.addEventListener("ended", () => {
    bgmTrackIndex = (bgmTrackIndex + 1) % BGM_TRACKS.length;
    playCurrentTrack();
  });
  updateMusicButton();
  tryStartBackgroundMusic();
}

function tryStartBackgroundMusic() {
  if (!bgmEnabled || !bgmAudio) {
    updateMusicButton();
    return;
  }

  playCurrentTrack().catch(() => {
    bindMusicUnlock();
    updateMusicButton("点击任意处开始音乐");
  });
}

function playCurrentTrack() {
  bgmAudio.src = BGM_TRACKS[bgmTrackIndex];
  bgmAudio.load();
  updateMusicButton();
  return bgmAudio
    .play()
    .then(() => {
      updateMusicButton();
      unbindMusicUnlock();
    })
    .catch((error) => {
      bindMusicUnlock();
      throw error;
    });
}

function bindMusicUnlock() {
  if (bgmUnlockBound) {
    return;
  }
  bgmUnlockBound = true;
  const unlock = () => {
    unbindMusicUnlock();
    if (bgmEnabled) {
      playCurrentTrack().catch(() => {
        updateMusicButton("点击音乐按钮播放");
      });
    }
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

function unbindMusicUnlock() {
  bgmUnlockBound = false;
}

function toggleBackgroundMusic() {
  if (!bgmAudio) {
    return;
  }

  if (bgmEnabled) {
    bgmEnabled = false;
    bgmAudio.pause();
    updateMusicButton();
    return;
  }

  bgmEnabled = true;
  tryStartBackgroundMusic();
}

function updateMusicButton(overrideLabel) {
  if (overrideLabel) {
    ui.musicToggleBtn.textContent = overrideLabel;
    return;
  }

  if (!bgmEnabled) {
    ui.musicToggleBtn.textContent = "音乐已关闭";
    return;
  }

  if (bgmAudio && !bgmAudio.paused) {
    ui.musicToggleBtn.textContent = `音乐播放中 ${bgmTrackIndex + 1}/${BGM_TRACKS.length}`;
    return;
  }

  ui.musicToggleBtn.textContent = "音乐准备中";
}

function createInitialState() {
  const freshState = {
    day: 1,
    currentTime: MORNING_START,
    stage: "morning",
    energy: 70,
    stress: 20,
    money: 500,
    energyMax: 100,
    bedType: "wood",
    jobType: "normal",
    sleepBuff: 1,
    workTargetScore: WORK_TARGET_START,
    skillPurchases: {},
    inventory: {
      energyDrink: 0,
      stressCube: 0,
      sleepPill: 0,
    },
    morning: {
      dozing: false,
      recoveredEnergy: 0,
      reducedStress: 0,
      startTime: MORNING_START,
      lastCheckedTime: MORNING_START,
      lastCheckedEnergy: 70,
      lastCheckedStress: 20,
    },
    night: {
      stayedUpHours: 0,
    },
    working: {
      busy: false,
      phase: "idle",
      score: 0,
      targetScore: WORK_TARGET_START,
      playsUsed: 0,
      rerollsUsed: 0,
      selectedCardIds: [],
      hand: [],
      deck: [],
      lastPlayedLabel: "",
      lastPlayedScore: 0,
      resultLabel: "",
      nextTargetScore: WORK_TARGET_START,
      incomeDelta: 0,
      finalIncome: 0,
      settlementScore: 0,
      nextPlayBonus: 0,
      rerollDiscountRemaining: 0,
    },
    log: [],
  };

  addLog(freshState, "闹钟响了。今天也得想办法活下来。");
  return freshState;
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return withDefaults(parsed);
  } catch {
    return null;
  }
}

function withDefaults(candidate) {
  const initial = createInitialState();
  return {
    ...initial,
    ...candidate,
    workTargetScore: round2(candidate.workTargetScore ?? initial.workTargetScore),
    skillPurchases: {
      ...initial.skillPurchases,
      ...(candidate.skillPurchases ?? {}),
    },
    inventory: {
      ...initial.inventory,
      ...(candidate.inventory ?? {}),
    },
    night: {
      ...initial.night,
      ...(candidate.night ?? {}),
    },
    working: {
      ...initial.working,
      ...(candidate.working ?? {}),
      busy: false,
      phase: "idle",
      score: 0,
      targetScore: round2(candidate.workTargetScore ?? initial.workTargetScore),
      playsUsed: 0,
      rerollsUsed: 0,
      selectedCardIds: [],
      hand: [],
      deck: [],
      lastPlayedLabel: "",
      lastPlayedScore: 0,
      resultLabel: "",
      nextTargetScore: round2(candidate.workTargetScore ?? initial.workTargetScore),
      incomeDelta: 0,
      finalIncome: 0,
      settlementScore: 0,
      nextPlayBonus: 0,
      rerollDiscountRemaining: 0,
    },
    log: Array.isArray(candidate.log) ? candidate.log.slice(0, 18) : initial.log,
    morning: {
      ...initial.morning,
      ...(candidate.morning ?? {}),
      dozing: false,
    },
  };
}

function getSkillLevel(skillId) {
  return Number(state.skillPurchases?.[skillId] ?? 0);
}

function hasSkill(skillId) {
  return getSkillLevel(skillId) > 0;
}

function getWorkRerollLimit() {
  return BASE_WORK_REROLL_LIMIT + (hasSkill("rerollMastery") ? 1 : 0) + getSkillLevel("handPlanning");
}

function getBaseWorkRerollCost(rerollIndex) {
  if (rerollIndex < WORK_REROLL_COSTS.length) {
    return WORK_REROLL_COSTS[rerollIndex];
  }
  const lastKnown = WORK_REROLL_COSTS[WORK_REROLL_COSTS.length - 1];
  return lastKnown * 2 ** (rerollIndex - WORK_REROLL_COSTS.length + 1);
}

function getWorkRerollCost() {
  if (state.working.rerollsUsed >= getWorkRerollLimit()) {
    return null;
  }

  let cost = getBaseWorkRerollCost(state.working.rerollsUsed);
  if (hasSkill("quickReshuffle") && state.working.rerollsUsed === 0) {
    cost = 0;
  }

  const discount = Math.min(cost, state.working.rerollDiscountRemaining ?? 0);
  return Math.max(0, cost - discount);
}

function consumeWorkRerollDiscount() {
  let cost = getBaseWorkRerollCost(state.working.rerollsUsed);
  if (hasSkill("quickReshuffle") && state.working.rerollsUsed === 0) {
    cost = 0;
  }
  const discount = Math.min(cost, state.working.rerollDiscountRemaining ?? 0);
  state.working.rerollDiscountRemaining = Math.max(0, (state.working.rerollDiscountRemaining ?? 0) - discount);
}

function canPurchaseSkill(skillId) {
  const skill = SKILLS[skillId];
  if (!skill) {
    return false;
  }
  return state.money >= skill.price && getSkillLevel(skill.id) < skill.maxPurchases;
}

function getOwnedSkillSummary() {
  return STORE_SKILL_ORDER
    .map((skillId) => {
      const skill = SKILLS[skillId];
      const level = getSkillLevel(skillId);
      if (!level) {
        return null;
      }
      return skill.maxPurchases > 1 ? `${skill.name} ${level}/${skill.maxPurchases}` : skill.name;
    })
    .filter(Boolean);
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  saveState();

  const bed = BEDS[state.bedType];
  const job = JOBS[state.jobType];
  const displayedEnergy = getDisplayedEnergy();
  const displayedStress = getDisplayedStress();
  const energyPercent = (displayedEnergy / state.energyMax) * 100;
  const stressPercent = (displayedStress / 100) * 100;

  ui.dayValue.textContent = String(state.day);
  ui.timeValue.textContent = formatTime(getDisplayedTime());
  ui.stageValue.textContent = stageLabel(state.stage);
  ui.moneyValue.textContent = `${Math.round(state.money)} / ${MAX_MONEY}`;
  ui.energyText.textContent = `${Math.round(displayedEnergy)} / ${Math.round(state.energyMax)}`;
  ui.stressText.textContent = `${Math.round(displayedStress)} / 100`;
  ui.energyFill.style.width = `${Math.max(0, Math.min(100, energyPercent))}%`;
  ui.stressFill.style.width = `${Math.max(0, Math.min(100, stressPercent))}%`;
  ui.bedValue.textContent = bed.name;
  ui.jobValue.textContent = job.name;
  ui.sleepBuffValue.textContent = `x${state.sleepBuff.toFixed(1)}`;

  renderScene();
  renderActions();
  renderInventory();
  renderLogs();
}

function renderScene() {
  const scene = getSceneCopy();
  ui.sceneTitle.textContent = scene.title;
  ui.sceneTag.textContent = scene.tag;
  ui.sceneDescription.textContent = scene.description;
  ui.tipCopy.textContent = scene.tip;
  ui.sceneVisual.className = `scene-visual ${scene.visual}`;
  ui.sceneVisual.innerHTML = `<p class="visual-copy">${scene.visualCopy}</p>`;
}

function getDisplayedTime() {
  if (state.stage === "morning" && state.morning.dozing) {
    return state.morning.lastCheckedTime ?? MORNING_START;
  }
  return state.currentTime;
}

function getDisplayedEnergy() {
  if (state.stage === "morning" && state.morning.dozing) {
    return state.morning.lastCheckedEnergy ?? state.energy;
  }
  return state.energy;
}

function getDisplayedStress() {
  if (state.stage === "morning" && state.morning.dozing) {
    return state.morning.lastCheckedStress ?? state.stress;
  }
  return state.stress;
}

function getSceneCopy() {
  if (state.stage === "morning") {
    if (state.morning.dozing) {
      return {
        title: "回笼觉加载中",
        tag: "Morning Doze",
        visual: "morning",
        description: "你正躺在床上装死，时间却越跑越快。现在每一次看手机，都会把你离迟到再推近一点。",
        tip: "回笼觉会自动推进时间。随时点“查看手机”，可以选择继续睡或立刻起床。",
        visualCopy: "最危险的不是闹钟，而是那句“再睡五分钟”。",
      };
    }
    return {
      title: "闹钟响了",
      tag: "Morning",
      visual: "morning",
      description: "07:30，社畜的一天从痛苦中醒来。你可以立刻起床，也可以赌一把回笼觉的高收益。",
      tip: "早晨回笼觉的单位收益高于夜间睡觉，但会触发逐渐加速的迟到风险。",
      visualCopy: "太阳很温柔，班却一点也不温柔。",
    };
  }

  if (state.stage === "working") {
    if (state.working.phase === "playing") {
      const remaining = Math.max(0, state.working.targetScore - state.working.score);
      return {
        title: "今日搬砖牌局",
        tag: "Working Cards",
        visual: "working",
        description: `今天要在 4 次出牌内冲到 ${formatScore(state.working.targetScore)} 分。当前得分 ${formatScore(state.working.score)}，还差 ${formatScore(remaining)} 分。`,
        tip: "第 4 次出牌结束后会自动结算。换牌需要直接花钱购买。",
        visualCopy: "今天的活，被压缩成了四手牌。",
      };
    }

    if (state.working.phase === "result") {
      return {
        title: "今日工作结算",
        tag: "Work Result",
        visual: "working",
        description: `本日牌局已经结束，结果为【${state.working.resultLabel}】。查看结算后会进入夜晚阶段。`,
        tip: "达标后明日目标分数会乘 1.2，未达标则按完成度折算工资。",
        visualCopy: "班已经上完了，接下来轮到工资给你脸色看。",
      };
    }

    if (state.working.phase === "settling") {
      return {
        title: "正在努力搬砖",
        tag: "Working",
        visual: "working",
        description: "你正把今天的标准工作量硬生生扛完，等着下班结算。",
        tip: "工作阶段无法打开商店，结算完成后才会进入夜晚。",
        visualCopy: "班还没上完，但人已经先累了。",
      };
    }

    return {
      title: "准备上班",
      tag: "Working",
      visual: "working",
      description: `点击开始工作后，会进入 4 次出牌的卡牌工作局。今日目标分数为 ${formatScore(state.workTargetScore)}。`,
      tip: "工作阶段无法打开商店。第 4 次出牌后会自动结算工资。",
      visualCopy: "你看起来很忙，事实上也确实很忙。",
    };
  }

  if (state.stage === "night") {
    return {
      title: "夜深了，还睡吗",
      tag: "Night",
      visual: "night",
      description: "23:30 之后终于回到自己的时间。你可以去睡，也可以靠熬夜娱乐把压力甩掉一点。",
      tip: "熬夜能减压，但会持续透支精力。连续熬夜 3 小时后，每小时还会额外扣精力。",
      visualCopy: "白天的命是老板的，夜里的命好像也不是自己的。",
    };
  }

  if (state.stage === "gameover") {
    return {
      title: state.energy <= 0 ? "过劳死" : "精神崩溃",
      tag: "Game Over",
      visual: "ending",
      description: state.energy <= 0
        ? "身体终于抗议到底，你没能再撑过这个班。"
        : "压力把最后一根弦扯断了，你在工位上彻底爆掉。",
      tip: "重新开局后，可以优先升级床铺，或者少熬一点夜。",
      visualCopy: "活着上班，已经是一种顶级技术活。",
    };
  }

  return {
    title: "财富自由",
    tag: "Victory",
    visual: "ending",
    description: "你终于攒够了离开的底气。今天起，再也不用把生命按工时切成碎片。",
    tip: "想试试别的路线，可以重新开局走一把极限卷王流。",
    visualCopy: "不是爱上班，是终于可以不上班了。",
  };
}

function renderActions() {
  ui.actionBar.innerHTML = "";
  const actions = [];

  if (state.stage === "morning") {
    if (state.morning.dozing) {
      actions.push({
        label: "查看手机",
        style: "warning",
        onClick: openPhoneModal,
      });
    } else {
      actions.push({ label: "起床上班", onClick: transitionToWork });
      actions.push({ label: "再睡一会", style: "secondary", onClick: startDozing });
      actions.push({ label: "商店", style: "secondary", onClick: openStoreModal });
    }
  } else if (state.stage === "working") {
    if (state.working.phase === "idle") {
      actions.push({
        label: "开始今天的工作",
        onClick: resolveWorkDay,
        disabled: state.working.busy,
      });
    } else if (state.working.phase === "playing") {
      actions.push({
        label: "继续工作牌局",
        onClick: openWorkCardGameModal,
      });
    } else if (state.working.phase === "result") {
      actions.push({
        label: "查看工作结算",
        onClick: showWorkCardResult,
      });
    } else {
      actions.push({
        label: "正在搬砖...",
        onClick: () => {},
        disabled: true,
      });
    }
  } else if (state.stage === "night") {
    actions.push({ label: "睡觉", onClick: openSleepModal });
    actions.push({ label: "熬夜 1 小时", style: "warning", onClick: stayUpOneHour });
    actions.push({ label: "商店", style: "secondary", onClick: openStoreModal });
  } else {
    actions.push({
      label: "重新开局",
      onClick: () => {
        stopDozing();
        closeModal();
        state = createInitialState();
        render();
      },
    });
  }

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.className = `action-btn ${action.style ?? ""}`.trim();
    button.textContent = action.label;
    button.disabled = Boolean(action.disabled);
    button.addEventListener("click", action.onClick);
    ui.actionBar.appendChild(button);
  });
}

function renderInventory() {
  ui.inventoryList.innerHTML = "";

  Object.values(ITEMS).forEach((item) => {
    const count = state.inventory[item.id] ?? 0;
    const card = document.createElement("article");
    card.className = "inventory-item";
    card.innerHTML = `
      <strong>${item.name} x${count}</strong>
      <p>${item.description}</p>
    `;

    const actions = document.createElement("div");
    actions.className = "inventory-actions";

    const useBtn = document.createElement("button");
    useBtn.className = "store-btn";
    useBtn.textContent = "使用";
    useBtn.disabled = count <= 0 || !item.canUse(state) || state.morning.dozing;
    useBtn.addEventListener("click", () => {
      item.use(state);
      if (finalizeAfterEndCheck()) {
        return;
      }
      render();
    });
    actions.appendChild(useBtn);

    if (state.stage === "morning" || state.stage === "night") {
      const buyBtn = document.createElement("button");
      buyBtn.className = "store-btn";
      buyBtn.textContent = `购买 ${item.price}`;
      buyBtn.disabled = state.money < item.price || state.morning.dozing;
      buyBtn.addEventListener("click", () => purchaseItem(item.id));
      actions.appendChild(buyBtn);
    }

    card.appendChild(actions);
    ui.inventoryList.appendChild(card);
  });
}

function renderLogs() {
  ui.logList.innerHTML = "";
  state.log.slice(0, 12).forEach((entry) => {
    const item = document.createElement("article");
    item.className = "log-entry";
    item.innerHTML = `<time>${entry.stamp}</time><span>${entry.text}</span>`;
    ui.logList.appendChild(item);
  });
}

function purchaseItem(itemId) {
  const item = ITEMS[itemId];
  if (!item || state.money < item.price) {
    return;
  }
  state.money -= item.price;
  state.inventory[item.id] += 1;
  addLog(state, `买入 ${item.name}，资金 -${item.price}。`);
  render();
}

function transitionToWork() {
  stopDozing();
  closeModal();
  state.stage = "working";
  state.currentTime = WORK_START;
  state.morning.dozing = false;
  resetWorkingState();
  addLog(state, "你挣扎着爬起来，准备去公司打卡。");
  render();
}

function resolveWorkDay() {
  if (state.working.busy || state.working.phase !== "idle") {
    return;
  }

  state.working.busy = true;
  state.working.phase = "playing";
  state.working.targetScore = round2(state.workTargetScore);
  state.working.score = 0;
  state.working.playsUsed = 0;
  state.working.rerollsUsed = 0;
  state.working.selectedCardIds = [];
  state.working.deck = createShuffledWorkDeck();
  state.working.hand = drawWorkCards([], WORK_HAND_SIZE);
  state.working.lastPlayedLabel = "";
  state.working.lastPlayedScore = 0;
  state.working.resultLabel = "";
  state.working.nextTargetScore = round2(state.workTargetScore);
  state.working.incomeDelta = 0;
  state.working.finalIncome = JOBS[state.jobType].moneyDelta;
  state.working.settlementScore = 0;
  state.working.nextPlayBonus = 0;
  state.working.rerollDiscountRemaining = 20 * getSkillLevel("rerollDiscount");
  addLog(state, "今天的班开始了。");
  render();
  openWorkCardGameModal();
}

function createShuffledWorkDeck() {
  const deck = [];
  for (let value = 1; value <= 10; value += 1) {
    for (let copy = 0; copy < 3; copy += 1) {
      deck.push({
        id: `work-${state.day}-${value}-${copy}-${Math.random().toString(36).slice(2, 8)}`,
        value,
      });
    }
  }

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

function drawWorkCards(baseHand, count) {
  const hand = [...baseHand];
  while (hand.length < count && state.working.deck.length > 0) {
    hand.push(state.working.deck.pop());
  }
  return sortWorkHand(hand);
}

function sortWorkHand(hand) {
  return [...hand].sort((left, right) => left.value - right.value || left.id.localeCompare(right.id));
}

function getSelectedWorkCards() {
  const selected = new Set(state.working.selectedCardIds);
  return state.working.hand.filter((card) => selected.has(card.id));
}

function evaluateWorkCards(cards) {
  if (cards.length < 1 || cards.length > 3) {
    return null;
  }

  const values = cards
    .map((card) => card.value)
    .sort((left, right) => left - right);
  const sum = values.reduce((total, value) => total + value, 0);

  let label = "";
  let baseScore = 0;
  let flatBonus = 0;
  let multiplier = 1;
  const notes = [];

  if (cards.length === 1) {
    label = "单张";
    baseScore = sum;
    const singleTrainingBonus = getSkillLevel("singleTraining") * 2;
    flatBonus += singleTrainingBonus;
    if (singleTrainingBonus > 0) {
      notes.push("单张训练");
    }
    if (hasSkill("soloOperator")) {
      multiplier *= 2;
      notes.push("单兵作战");
    }
  } else if (cards.length === 2 && values[0] === values[1]) {
    label = "对子";
    baseScore = sum * 1.5;
    const pairDrillBonus = getSkillLevel("pairDrill") * 2;
    flatBonus += pairDrillBonus;
    if (pairDrillBonus > 0) {
      notes.push("对子加练");
    }
    if (hasSkill("pairTraining")) {
      flatBonus += 5;
      notes.push("对子培训");
    }
    if (hasSkill("soloOperator")) {
      multiplier *= 0.8;
      notes.push("单兵作战副作用");
    }
  } else if (cards.length === 3 && values[0] === values[1] && values[1] === values[2]) {
    label = "三条";
    baseScore = sum * 3;
    if (hasSkill("burnoutExpertise")) {
      multiplier *= 1.3;
      notes.push("爆肝专精");
    }
    const tripleDrillLevel = getSkillLevel("tripleDrill");
    multiplier *= 1.1 ** tripleDrillLevel;
    if (tripleDrillLevel > 0) {
      notes.push(`三条加练 x${(1.1 ** tripleDrillLevel).toFixed(2)}`);
    }
  } else if (cards.length === 3 && values[0] + 1 === values[1] && values[1] + 1 === values[2]) {
    label = "顺子";
    baseScore = sum * 2.5;
    const straightDrillBonus = getSkillLevel("straightDrill") * 4;
    flatBonus += straightDrillBonus;
    if (straightDrillBonus > 0) {
      notes.push("顺子加练");
    }
    if (hasSkill("processMastery")) {
      multiplier *= 3 / 2.5;
      notes.push("流程熟练");
    }
  } else {
    return null;
  }

  const practiceBonus = getSkillLevel("practiceMakesPerfect") * 3;
  flatBonus += practiceBonus;
  if (practiceBonus > 0) {
    notes.push("熟能生巧");
  }
  const currentPlayNumber = state.working.playsUsed + 1;
  if (currentPlayNumber === WORK_PLAYS_PER_DAY) {
    const clutchBonus = getSkillLevel("clutchFinish") * 6;
    flatBonus += clutchBonus;
    if (clutchBonus > 0) {
      notes.push("临门一脚");
    }
    if (hasSkill("performanceSprint")) {
      multiplier *= 1.5;
      notes.push("绩效冲刺");
    }
  }

  if (state.working.nextPlayBonus > 0) {
    flatBonus += state.working.nextPlayBonus;
    notes.push(`精挑细选 +${state.working.nextPlayBonus}`);
  }

  if (hasSkill("basicTraining")) {
    multiplier *= 1.05;
    notes.push("基础培训");
  }

  return {
    label,
    baseScore: Math.floor(baseScore),
    score: Math.floor((baseScore + flatBonus) * multiplier),
    flatBonus,
    multiplier,
    notes,
  };
}

function toggleWorkCardSelection(cardId) {
  if (state.stage !== "working" || state.working.phase !== "playing") {
    return;
  }

  const nextSelected = new Set(state.working.selectedCardIds);
  if (nextSelected.has(cardId)) {
    nextSelected.delete(cardId);
  } else {
    nextSelected.add(cardId);
  }

  state.working.selectedCardIds = [...nextSelected];
  openWorkCardGameModal();
}

function clearWorkCardSelection() {
  if (state.stage !== "working" || state.working.phase !== "playing") {
    return;
  }
  state.working.selectedCardIds = [];
  openWorkCardGameModal();
}

function removeSelectedCardsFromHand() {
  const selected = new Set(state.working.selectedCardIds);
  state.working.hand = state.working.hand.filter((card) => !selected.has(card.id));
}

function playWorkCardHand() {
  if (state.stage !== "working" || state.working.phase !== "playing") {
    return;
  }

  const selectedCards = getSelectedWorkCards();
  const result = evaluateWorkCards(selectedCards);
  if (!result) {
    return;
  }

  removeSelectedCardsFromHand();
  state.working.hand = drawWorkCards(state.working.hand, WORK_HAND_SIZE);
  state.working.selectedCardIds = [];
  state.working.playsUsed += 1;
  state.working.score += result.score;
  state.working.lastPlayedLabel = result.label;
  state.working.lastPlayedScore = result.score;
  state.working.nextPlayBonus = 0;
  addLog(
    state,
    `第 ${state.working.playsUsed} 手打出【${result.label}】，基础 ${result.baseScore}，最终 ${result.score}。`,
  );

  if (state.working.playsUsed >= WORK_PLAYS_PER_DAY) {
    finishWorkCardGame();
    return;
  }

  render();
  openWorkCardGameModal();
}

function rerollWorkCards() {
  if (state.stage !== "working" || state.working.phase !== "playing") {
    return;
  }

  const selectedCards = getSelectedWorkCards();
  const cost = getWorkRerollCost();
  if (!selectedCards.length || cost === null || state.money < cost) {
    return;
  }

  state.money -= cost;
  consumeWorkRerollDiscount();
  removeSelectedCardsFromHand();
  state.working.hand = drawWorkCards(state.working.hand, WORK_HAND_SIZE);
  state.working.selectedCardIds = [];
  if (hasSkill("carefulSelection") && selectedCards.length >= 3) {
    state.working.nextPlayBonus += 8;
  }
  state.working.rerollsUsed += 1;
  addLog(state, `花了 ${cost} 资金换掉 ${selectedCards.length} 张牌。`);
  render();
  openWorkCardGameModal();
}

function openWorkCardGameModal() {
  if (state.stage !== "working" || state.working.phase !== "playing") {
    return;
  }

  const selectedCards = getSelectedWorkCards();
  const preview = evaluateWorkCards(selectedCards);
  const rerollCost = getWorkRerollCost();
  const cardsLeft = state.working.deck.length;
  const canReroll = selectedCards.length > 0 && rerollCost !== null && state.money >= rerollCost;
  const ownedSkills = getOwnedSkillSummary();
  const selectionText = selectedCards.length === 0
    ? "选择 1-3 张牌出牌，或选中任意张牌花钱换牌。"
    : preview
      ? `当前组合：${preview.label}，本次出牌可得 ${preview.score} 分。`
      : "当前选择无法组成合法牌型，可以改为换牌。";
  const previewDetail = preview?.notes?.length
    ? `本次生效：${preview.notes.join("、")}。`
    : "本次没有额外技能修正。";

  const handHtml = state.working.hand
    .map((card) => {
      const active = state.working.selectedCardIds.includes(card.id) ? "active" : "";
      return `
        <button class="work-card ${active}" data-card-id="${card.id}" type="button">
          <span class="work-card-face">${card.value}</span>
        </button>
      `;
    })
    .join("");

  openModal(
    `
      <div class="modal-card minigame-card workgame-card">
        <div class="minigame-top">
          <div>
            <p class="eyebrow">Today's Work</p>
            <h3>今日搬砖牌局</h3>
            <p>4 次出牌全部打完后，会自动结算今天的工作收入。</p>
          </div>
          <span class="scene-tag minigame-tag">工作中</span>
        </div>
        <div class="minigame-stats workgame-stats">
          <div class="modal-section">
            <strong>目标分数</strong>
            <p>${formatScore(state.working.targetScore)}</p>
          </div>
          <div class="modal-section">
            <strong>当前得分</strong>
            <p>${formatScore(state.working.score)}</p>
          </div>
          <div class="modal-section">
            <strong>当前资金</strong>
            <p>${Math.round(state.money)}</p>
          </div>
          <div class="modal-section">
            <strong>当前工作收益</strong>
            <p>${JOBS[state.jobType].moneyDelta}</p>
          </div>
          <div class="modal-section">
            <strong>还差多少分</strong>
            <p>${formatScore(Math.max(0, state.working.targetScore - state.working.score))}</p>
          </div>
          <div class="modal-section">
            <strong>出牌进度</strong>
            <p>${state.working.playsUsed} / ${WORK_PLAYS_PER_DAY}</p>
          </div>
          <div class="modal-section">
            <strong>下次换牌价格</strong>
            <p>${rerollCost ?? "已用完"}</p>
          </div>
          <div class="modal-section">
            <strong>换牌上限</strong>
            <p>${state.working.rerollsUsed} / ${getWorkRerollLimit()}</p>
          </div>
          <div class="modal-section">
            <strong>牌堆余量</strong>
            <p>${cardsLeft}</p>
          </div>
        </div>
        <div class="minigame-stage workgame-stage">
          <div class="workgame-callout">
            <strong>${selectionText}</strong>
            <p>${state.working.lastPlayedLabel ? `上一手：${state.working.lastPlayedLabel} +${state.working.lastPlayedScore}` : "还没出牌。"}${state.working.score >= state.working.targetScore ? " 当前已达标。" : ""}${state.working.nextPlayBonus > 0 ? ` 下一手额外 +${state.working.nextPlayBonus}。` : ""}</p>
            <p>${preview ? previewDetail : ""}</p>
            <p>${ownedSkills.length ? `已购技能：${ownedSkills.slice(0, 5).join("、")}${ownedSkills.length > 5 ? " 等" : ""}` : "当前还没有永久技能。"}</p>
          </div>
          <div class="workgame-hand">${handHtml}</div>
        </div>
        <div class="modal-actions minigame-controls">
          <button id="play-work-hand" class="modal-btn" ${preview ? "" : "disabled"}>出牌</button>
          <button id="reroll-work-hand" class="modal-btn secondary" ${canReroll ? "" : "disabled"}>${rerollCost === null ? "换牌次数已满" : `换牌 -${rerollCost}`}</button>
          <button id="clear-work-selection" class="modal-btn secondary" ${selectedCards.length ? "" : "disabled"}>清空选择</button>
        </div>
      </div>
    `,
    () => {
      document.querySelectorAll("[data-card-id]").forEach((button) => {
        button.addEventListener("click", () => toggleWorkCardSelection(button.getAttribute("data-card-id")));
      });
      document.querySelector("#play-work-hand")?.addEventListener("click", playWorkCardHand);
      document.querySelector("#reroll-work-hand")?.addEventListener("click", rerollWorkCards);
      document.querySelector("#clear-work-selection")?.addEventListener("click", clearWorkCardSelection);
    },
  );
}

function finishWorkCardGame() {
  if (state.stage !== "working" || state.working.phase !== "playing") {
    return;
  }

  const job = JOBS[state.jobType];
  const targetScore = state.working.targetScore;
  const dayScore = state.working.score;
  const settlementScore = dayScore < targetScore && hasSkill("safetyPlan")
    ? Math.floor(dayScore * 1.1)
    : dayScore;
  const reachedTarget = settlementScore >= targetScore;
  const extraIncomePerPoint = hasSkill("bonusCommission")
    ? BONUS_COMMISSION_EXTRA_INCOME_PER_POINT
    : WORK_EXTRA_INCOME_PER_POINT;
  const extraIncome = reachedTarget ? round2((settlementScore - targetScore) * extraIncomePerPoint) : 0;
  const progressIncome = targetScore > 0 ? round2((settlementScore / targetScore) * job.moneyDelta) : 0;
  const finalIncome = reachedTarget ? round2(job.moneyDelta + extraIncome) : progressIncome;
  const nextTargetScore = reachedTarget ? round2(targetScore * WORK_TARGET_GROWTH_MULTIPLIER) : targetScore;
  const resultLabel = reachedTarget ? (settlementScore > targetScore ? "超额达标" : "达标") : "未达标";

  state.working.phase = "result";
  state.working.selectedCardIds = [];
  state.working.finalIncome = finalIncome;
  state.working.incomeDelta = round2(finalIncome - job.moneyDelta);
  state.working.nextTargetScore = nextTargetScore;
  state.working.resultLabel = resultLabel;
  state.working.settlementScore = settlementScore;

  addLog(
    state,
    `今日工作${resultLabel}，结算得分 ${formatScore(settlementScore)}/${formatScore(targetScore)}，今日收入 ${formatNumber(finalIncome)}。`,
  );

  render();
  showWorkCardResult();
}

function showWorkCardResult() {
  if (state.stage !== "working" || state.working.phase !== "result") {
    return;
  }

  const job = JOBS[state.jobType];
  const reachedTarget = state.working.settlementScore >= state.working.targetScore;
  const detailLabel = reachedTarget ? "额外收益" : "进度折算";
  openModal(
    `
      <div class="modal-card minigame-card workgame-card">
        <p class="eyebrow">Work Result</p>
        <h3>${state.working.resultLabel}</h3>
        <div class="modal-grid">
          <div class="modal-section">
            <strong>今日目标分数</strong>
            <p>${formatScore(state.working.targetScore)}</p>
          </div>
          <div class="modal-section">
            <strong>今日实际得分</strong>
            <p>${formatScore(state.working.score)}</p>
          </div>
          <div class="modal-section">
            <strong>最终结算得分</strong>
            <p>${formatScore(state.working.settlementScore)}</p>
          </div>
          <div class="modal-section">
            <strong>基础工资</strong>
            <p>${formatNumber(job.moneyDelta)}</p>
          </div>
          <div class="modal-section">
            <strong>${detailLabel}</strong>
            <p>${formatSigned(state.working.incomeDelta)}</p>
          </div>
        </div>
        <div class="modal-grid">
          <div class="modal-section">
            <strong>今日最终收入</strong>
            <p>${formatNumber(state.working.finalIncome)}</p>
          </div>
          <div class="modal-section">
            <strong>明日目标分数</strong>
            <p>${formatScore(state.working.nextTargetScore)}</p>
          </div>
        </div>
        <div class="modal-actions">
          <button id="continue-work-settlement" class="modal-btn">继续结算</button>
        </div>
      </div>
    `,
    () => {
      document
        .querySelector("#continue-work-settlement")
        ?.addEventListener("click", () => resolveBaseWorkSettlement(state.working.finalIncome, state.working.nextTargetScore));
    },
  );
}

function openCurrentWorkEvent() {
  const event = state.working.dailyEvents[state.working.currentEventIndex];
  if (!event) {
    resolveBaseWorkSettlement();
    return;
  }

  const optionsHtml = event.options
    .map((option, index) => {
      const deltaLine = `精力 ${formatSigned(option.energy)} / 压力 ${formatSigned(option.stress)} / 资金 ${formatSigned(option.money)}`;
      return `
        <div class="modal-section">
          <strong>${option.label}</strong>
          <p>${deltaLine}</p>
          <button class="modal-btn work-event-option" data-option-index="${index}">选择这个方案</button>
        </div>
      `;
    })
    .join("");

  openModal(
    `
      <div class="modal-card">
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <div class="modal-grid">
          <div class="modal-section">
            <strong>事件等级</strong>
            <p>${event.rarity}</p>
          </div>
          ${optionsHtml}
        </div>
      </div>
    `,
    () => {
      document.querySelectorAll(".work-event-option").forEach((button) => {
        button.addEventListener("click", () => {
          const optionIndex = Number(button.getAttribute("data-option-index"));
          chooseWorkEventOption(optionIndex);
        });
      });
    },
  );
}

function chooseWorkEventOption(optionIndex) {
  const event = state.working.dailyEvents[state.working.currentEventIndex];
  if (!event) {
    closeModal();
    resolveBaseWorkSettlement();
    return;
  }

  const option = event.options[optionIndex];
  if (!option) {
    return;
  }

  closeModal();
  const delta = applyDelta(state, {
    energy: option.energy,
    stress: option.stress,
    money: option.money,
  });
  addLog(
    state,
    `随机事件【${event.title}】你选择了“${option.label}”。精力 ${formatSigned(delta.energy)}，压力 ${formatSigned(delta.stress)}，资金 ${formatSigned(delta.money)}。`,
  );

  state.working.currentEventIndex += 1;
  if (finalizeAfterEndCheck()) {
    return;
  }

  render();
  openCurrentWorkEvent();
}

function resolveBaseWorkSettlement(
  incomeOverride = JOBS[state.jobType].moneyDelta,
  nextTargetScore = state.workTargetScore,
) {
  closeModal();
  state.working.phase = "settling";
  render();

  window.setTimeout(() => {
    const job = JOBS[state.jobType];
    const delta = applyDelta(state, {
      energy: job.energyDelta,
      stress: job.stressDelta,
      money: incomeOverride,
    });
    state.workTargetScore = round2(nextTargetScore);
    state.currentTime = NIGHT_START;
    state.stage = "night";
    resetWorkingState();
    state.night.stayedUpHours = 0;
    addLog(
      state,
      `今天的班终于结算了。精力 ${formatSigned(delta.energy)}，压力 ${formatSigned(delta.stress)}，资金 ${formatSigned(delta.money)}。`,
    );

    if (finalizeAfterEndCheck()) {
      return;
    }
    render();
  }, 1200);
}

function resetWorkingState() {
  state.working.busy = false;
  state.working.phase = "idle";
  state.working.score = 0;
  state.working.targetScore = round2(state.workTargetScore);
  state.working.playsUsed = 0;
  state.working.rerollsUsed = 0;
  state.working.selectedCardIds = [];
  state.working.hand = [];
  state.working.deck = [];
  state.working.lastPlayedLabel = "";
  state.working.lastPlayedScore = 0;
  state.working.resultLabel = "";
  state.working.nextTargetScore = round2(state.workTargetScore);
  state.working.incomeDelta = 0;
  state.working.finalIncome = 0;
  state.working.settlementScore = 0;
  state.working.nextPlayBonus = 0;
  state.working.rerollDiscountRemaining = 0;
}

function startDozing() {
  beginDozing(false);
}

function resumeDozing() {
  beginDozing(true);
}

function beginDozing(isResume) {
  if (dozeTimer) {
    return;
  }
  closeModal();
  state.morning.dozing = true;
  if (!isResume) {
    state.morning.recoveredEnergy = 0;
    state.morning.reducedStress = 0;
    state.morning.startTime = state.currentTime;
    addLog(state, "你把闹钟往旁边一丢，决定偷一点高收益回笼觉。");
  }
  state.morning.lastCheckedTime = state.currentTime;
  state.morning.lastCheckedEnergy = state.energy;
  state.morning.lastCheckedStress = state.stress;
  render();

  dozeTimer = window.setInterval(() => {
    const speed = getMorningSpeed(state.currentTime);
    const requestedMinutes = BASE_DOZE_MINUTES_PER_TICK * speed;
    const remaining = Math.max(0, WORK_START - state.currentTime);
    const deltaMinutes = Math.min(requestedMinutes, remaining);

    if (deltaMinutes <= 0) {
      forceWake();
      return;
    }

    const bed = BEDS[state.bedType];
    const beforeEnergy = state.energy;
    const beforeStress = state.stress;

    state.currentTime += deltaMinutes;
    state.energy = clamp(state.energy + bed.morningEnergyPerMinute * deltaMinutes, 0, state.energyMax);
    state.stress = clamp(state.stress - bed.morningStressPerMinute * deltaMinutes, 0, 100);

    state.morning.recoveredEnergy += state.energy - beforeEnergy;
    state.morning.reducedStress += beforeStress - state.stress;

    if (state.currentTime >= WORK_START) {
      forceWake();
      return;
    }
  }, DOZE_TICK_MS);
}

function stopDozing() {
  if (dozeTimer) {
    window.clearInterval(dozeTimer);
    dozeTimer = null;
  }
}

function getMorningSpeed(currentTime) {
  if (currentTime < 7 * 60 + 50) {
    return 1;
  }
  if (currentTime < 8 * 60 + 10) {
    return 1.5;
  }
  if (currentTime < 8 * 60 + 25) {
    return 2;
  }
  return 3;
}

function openPhoneModal() {
  if (!state.morning.dozing) {
    return;
  }

  stopDozing();
  const delta = applyDelta(state, { stress: 2 });
  state.currentTime = Math.min(WORK_START, state.currentTime + PHONE_TIME_COST);
  state.morning.lastCheckedTime = state.currentTime;
  state.morning.lastCheckedEnergy = state.energy;
  state.morning.lastCheckedStress = state.stress;
  addLog(state, `你摸到手机看了一眼时间，压力 ${formatSigned(delta.stress)}。`);

  if (finalizeAfterEndCheck()) {
    return;
  }

  if (state.currentTime >= WORK_START) {
    forceWake();
    return;
  }

  const body = `
    <div class="modal-card">
      <h3>手机亮起来了</h3>
      <p>现在是 <strong>${formatTime(state.currentTime)}</strong>。你盯着时间犹豫了一下，决定是马上起床，还是继续赌后面的几分钟。</p>
      <div class="modal-grid">
        <div class="modal-section">
          <strong>查看手机代价</strong>
          <p>本次查看让你压力 +2，并顺手浪费了 3 分钟。</p>
        </div>
      </div>
      <div class="modal-actions">
        <button id="continue-dozing" class="modal-btn">继续睡觉</button>
        <button id="wake-up-now" class="modal-btn secondary">起床上班</button>
      </div>
    </div>
  `;

  openModal(body, () => {
    document.querySelector("#continue-dozing")?.addEventListener("click", () => {
      closeModal();
      resumeDozing();
    });
    document.querySelector("#wake-up-now")?.addEventListener("click", transitionToWork);
  });

  render();
}

function forceWake() {
  stopDozing();
  closeModal();
  state.currentTime = WORK_START;
  state.morning.dozing = false;
  state.morning.lastCheckedTime = WORK_START;
  const delta = applyDelta(state, { energy: -10, stress: 15, money: -100 });
  state.morning.lastCheckedEnergy = state.energy;
  state.morning.lastCheckedStress = state.stress;
  addLog(
    state,
    `你一睁眼发现已经迟到了。精力 ${formatSigned(delta.energy)}，压力 ${formatSigned(delta.stress)}，资金 ${formatSigned(delta.money)}。`,
  );

  if (finalizeAfterEndCheck()) {
    return;
  }

  state.stage = "working";
  resetWorkingState();
  openModal(
    `
      <div class="modal-card">
        <h3>睡过头了</h3>
        <p>时间已经到 <strong>08:30</strong>。你是被现实一把掀下床的，今天迟到已经板上钉钉。</p>
        <div class="modal-grid">
          <div class="modal-section">
            <strong>本次惩罚</strong>
            <p>精力 ${formatSigned(delta.energy)}，压力 ${formatSigned(delta.stress)}，资金 ${formatSigned(delta.money)}。</p>
          </div>
        </div>
        <div class="modal-actions">
          <button id="overslept-confirm" class="modal-btn">赶去上班</button>
        </div>
      </div>
    `,
    () => {
      document.querySelector("#overslept-confirm")?.addEventListener("click", closeModal);
    },
  );
  render();
}

function openSleepModal() {
  if (state.stage !== "night") {
    return;
  }

  const sleepHours = calculateSleepHoursUntilMorning(state.currentTime);
  const bed = BEDS[state.bedType];
  const predictedEnergy = bed.nightEnergyPerHour * sleepHours * state.sleepBuff;
  const predictedStress = bed.nightStressPerHour * sleepHours * state.sleepBuff;
  const debtHours = Math.max(0, 8 - sleepHours);

  const body = `
    <div class="modal-card">
      <h3>准备睡觉</h3>
      <p>如果现在躺下，你会一直睡到明天 07:30，共 <strong>${sleepHours}</strong> 小时。</p>
      <div class="modal-grid">
        <div class="modal-section">
          <strong>本次预计恢复</strong>
          <p>精力 +${formatNumber(predictedEnergy)}，压力 -${formatNumber(predictedStress)}，睡眠倍率 x${state.sleepBuff.toFixed(1)}。</p>
        </div>
        <div class="modal-section">
          <strong>睡眠债</strong>
          <p>${debtHours > 0 ? `本次少睡 ${debtHours} 小时，明天精力上限会下降，起始压力也会上升。` : "这是一觉标准的 8 小时睡眠，没有额外惩罚。"}</p>
        </div>
      </div>
      <div class="modal-actions">
        <button id="confirm-sleep" class="modal-btn">睡觉</button>
        <button id="cancel-sleep" class="modal-btn secondary">先等等</button>
      </div>
    </div>
  `;

  openModal(body, () => {
    document.querySelector("#confirm-sleep")?.addEventListener("click", sleepUntilMorning);
    document.querySelector("#cancel-sleep")?.addEventListener("click", closeModal);
  });
}

function sleepUntilMorning() {
  closeModal();
  const sleepHours = calculateSleepHoursUntilMorning(state.currentTime);
  const bed = BEDS[state.bedType];
  const energyGain = bed.nightEnergyPerHour * sleepHours * state.sleepBuff;
  const stressReduction = bed.nightStressPerHour * sleepHours * state.sleepBuff;
  const delta = applyDelta(state, { energy: energyGain, stress: -stressReduction });
  const sleepMinutes = calculateMinutesUntilMorning(state.currentTime);

  advanceClock(sleepMinutes);

  const debtHours = Math.max(0, 8 - sleepHours);
  applySleepDebt(debtHours);
  state.sleepBuff = 1;
  state.stage = "morning";
  state.morning.dozing = false;
  state.morning.recoveredEnergy = 0;
  state.morning.reducedStress = 0;
  state.morning.startTime = MORNING_START;
  state.morning.lastCheckedTime = MORNING_START;
  state.morning.lastCheckedEnergy = state.energy;
  state.morning.lastCheckedStress = state.stress;
  state.night.stayedUpHours = 0;

  addLog(
    state,
    `你睡到了天亮。精力 ${formatSigned(delta.energy)}，压力 ${formatSigned(delta.stress)}。${debtHours > 0 ? `睡眠不足 ${debtHours} 小时。` : "今天起床不算太惨。"}`
  );

  if (finalizeAfterEndCheck()) {
    return;
  }
  render();
}

function applySleepDebt(debtHours) {
  state.energyMax = 100;
  if (debtHours <= 0) {
    return;
  }

  state.energyMax = Math.max(60, 100 - debtHours * 4);
  state.energy = Math.min(state.energy, state.energyMax);
  const delta = applyDelta(state, { stress: debtHours * 3 });
  addLog(
    state,
    `睡眠债生效：今日精力上限降到 ${state.energyMax}，起始压力 ${formatSigned(delta.stress)}。`,
  );
}

function stayUpOneHour() {
  if (state.stage !== "night") {
    return;
  }

  state.night.stayedUpHours += 1;
  const extraEnergy = state.night.stayedUpHours > 3 ? -2 : 0;
  const delta = applyDelta(state, { energy: -6 + extraEnergy, stress: -10 });
  advanceClock(60);

  addLog(
    state,
    `你又熬了 1 小时夜。精力 ${formatSigned(delta.energy)}，压力 ${formatSigned(delta.stress)}。`,
  );

  if (finalizeAfterEndCheck()) {
    return;
  }

  if (isMorningAfterOvernight()) {
    state.currentTime = MORNING_START;
    applySleepDebt(8);
    state.stage = "morning";
    state.morning.dozing = false;
    state.morning.lastCheckedTime = MORNING_START;
    state.morning.lastCheckedEnergy = state.energy;
    state.morning.lastCheckedStress = state.stress;
    addLog(state, "天亮了，你干脆一夜没睡，带着满身疲惫直接迎接新一天。");
    if (finalizeAfterEndCheck()) {
      return;
    }
  }

  render();
}

function isMorningAfterOvernight() {
  return state.currentTime >= MORNING_START && state.currentTime < NIGHT_START;
}

function calculateSleepHoursUntilMorning(currentTime) {
  return calculateMinutesUntilMorning(currentTime) / 60;
}

function calculateMinutesUntilMorning(currentTime) {
  if (currentTime < MORNING_START) {
    return MORNING_START - currentTime;
  }
  return 1440 - currentTime + NEXT_MORNING;
}

function advanceClock(minutes) {
  let remaining = minutes;
  while (remaining > 0) {
    const step = Math.min(remaining, 1440 - state.currentTime);
    state.currentTime += step;
    remaining -= step;
    if (state.currentTime >= 1440) {
      state.currentTime -= 1440;
      state.day += 1;
    }
  }
}

function openStoreModal() {
  if (!(state.stage === "morning" || state.stage === "night") || state.morning.dozing) {
    return;
  }

  const tabButtons = `
    <div class="store-tabs">
      <button class="modal-btn ${activeStoreTab === "goods" ? "" : "secondary"}" data-store-tab="goods">常规商店</button>
      <button class="modal-btn ${activeStoreTab === "skills" ? "" : "secondary"}" data-store-tab="skills">技能购买</button>
    </div>
  `;
  const title = activeStoreTab === "skills" ? "工作技能商店" : "便利店 / 家居城 / 猎头群";
  const intro = activeStoreTab === "skills"
    ? "花钱给自己装点新本事，班还是那份班，但结算可以更像样一点。"
    : "钱不一定能让你幸福，但至少能让今天不要死得那么难看。";

  const body = `
    <div class="modal-card">
      <h3>${title}</h3>
      <p>${intro}</p>
      ${tabButtons}
      <div class="store-list">
        ${renderStoreCards()}
      </div>
      <div class="modal-actions">
        <button id="close-store" class="modal-btn secondary">离开商店</button>
      </div>
    </div>
  `;

  openModal(body, bindStoreEvents);
}

async function loadWorkEventCatalog() {
  try {
    const response = await fetch(WORK_EVENT_SOURCE);
    if (!response.ok) {
      throw new Error(`Failed to load work events: ${response.status}`);
    }
    const markdown = await response.text();
    const parsedEvents = parseWorkEventCatalog(markdown);
    if (parsedEvents.length >= 20) {
      workEventCatalog = parsedEvents;
    }
  } catch (error) {
    console.warn("Using fallback work events:", error);
  }
}

function parseWorkEventCatalog(markdown) {
  const blocks = markdown.match(/### \d{2}\.[\s\S]*?(?=\n### \d{2}\.|\n## 4\.|$)/g) ?? [];
  return blocks
    .map((block) => parseWorkEventBlock(block))
    .filter((event) => event && event.options.length >= 2);
}

function parseWorkEventBlock(block) {
  const headerMatch = block.match(/###\s+(\d{2})\.\s+([^\n]+)/);
  const rarityMatch = block.match(/- 稀有度：([^\n]+)/);
  const descriptionMatch = block.match(/- 描述：([^\n]+)/);
  if (!headerMatch || !rarityMatch || !descriptionMatch) {
    return null;
  }

  const id = headerMatch[1];
  const options = [];
  const optionRegex = /- 选项\s+([A-Z])：([^\n]+)\n\s+- 精力\s+`([^`]+)`\n\s+- 压力\s+`([^`]+)`\n\s+- 资金\s+`([^`]+)`/g;
  let optionMatch = optionRegex.exec(block);
  while (optionMatch) {
    options.push({
      label: optionMatch[2].trim(),
      energy: parseEventDelta(optionMatch[3], id, "energy"),
      stress: parseEventDelta(optionMatch[4], id, "stress"),
      money: parseEventDelta(optionMatch[5], id, "money"),
    });
    optionMatch = optionRegex.exec(block);
  }

  return {
    id,
    title: headerMatch[2].trim(),
    rarity: rarityMatch[1].trim(),
    description: descriptionMatch[1].trim(),
    options,
  };
}

function parseEventDelta(rawValue, eventId, kind) {
  const numeric = Number(String(rawValue).replace("+", "").trim());
  if (Number.isNaN(numeric)) {
    return 0;
  }
  if (Number(eventId) >= 60) {
    return numeric;
  }

  const factor = kind === "money" ? 1.5 : 1.25;
  const scaled = numeric * factor;
  if (kind === "money") {
    return roundMoneyToTens(scaled);
  }
  return Math.round(scaled);
}

function roundMoneyToTens(value) {
  return Math.sign(value) * Math.round(Math.abs(value) / 10) * 10;
}

function generateDailyWorkEvents() {
  const selected = [];
  const usedIds = new Set();

  for (let slot = 0; slot < 3; slot += 1) {
    const rarity = drawWorkEventRarity(slot, selected);
    const event = pickWorkEventByRarity(rarity, usedIds);
    if (!event) {
      break;
    }
    usedIds.add(event.id);
    selected.push(event);
  }

  while (selected.length < 3) {
    const fallback = pickWorkEventByRarity("普通", usedIds);
    if (!fallback) {
      break;
    }
    usedIds.add(fallback.id);
    selected.push(fallback);
  }

  return selected;
}

function drawWorkEventRarity(slotIndex, selectedEvents) {
  if (slotIndex === 2 && !selectedEvents.some((event) => event.rarity === "普通" || event.rarity === "少见")) {
    return weightedPick({ 普通: 60, 少见: 40, 稀有: 0, 极稀有: 0 });
  }

  const profile = { ...(WORK_EVENT_RARITY_PROFILES[slotIndex] ?? WORK_EVENT_RARITY_PROFILES[2]) };
  if (selectedEvents.some((event) => event.rarity === "极稀有")) {
    profile["极稀有"] = 0;
  }
  return weightedPick(profile);
}

function pickWorkEventByRarity(targetRarity, usedIds) {
  const downgradeMap = {
    极稀有: ["极稀有", "稀有", "少见", "普通"],
    稀有: ["稀有", "少见", "普通"],
    少见: ["少见", "普通"],
    普通: ["普通", "少见", "稀有", "极稀有"],
  };

  for (const rarity of downgradeMap[targetRarity] ?? ["普通"]) {
    const pool = workEventCatalog.filter((event) => event.rarity === rarity && !usedIds.has(event.id));
    if (pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return null;
}

function weightedPick(weightTable) {
  const entries = Object.entries(weightTable).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0) {
    return "普通";
  }

  let roll = Math.random() * total;
  for (const [label, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      return label;
    }
  }
  return entries[entries.length - 1][0];
}

function renderStoreCards() {
  if (activeStoreTab === "skills") {
    return renderSkillStoreCards();
  }

  return renderGoodsStoreCards();
}

function renderGoodsStoreCards() {
  const bedCards = Object.values(BEDS)
    .filter((bed) => bed.price > 0)
    .map((bed) => {
      const isCurrent = state.bedType === bed.id;
      return `
        <article class="store-card">
          <header>
            <strong>${bed.name}</strong>
            <span class="store-meta">${bed.price}</span>
          </header>
          <p>夜间：精力 +${bed.nightEnergyPerHour}/小时，压力 -${bed.nightStressPerHour}/小时。回笼觉：精力 +${bed.morningEnergyPerMinute}/分钟，压力 -${bed.morningStressPerMinute}/分钟。</p>
          <p>${bed.summary}</p>
          <button class="store-btn" data-action="bed" data-id="${bed.id}" ${state.money < bed.price || isCurrent ? "disabled" : ""}>${isCurrent ? "已装备" : "购买并装备"}</button>
        </article>
      `;
    })
    .join("");

  const jobCards = Object.values(JOBS)
    .filter((job) => job.switchCost)
    .map((job) => {
      const isCurrent = state.jobType === job.id;
      return `
        <article class="store-card">
          <header>
            <strong>${job.name}</strong>
            <span class="store-meta">${job.switchCost}</span>
          </header>
          <p>工作结算：精力 ${job.energyDelta}，压力 +${job.stressDelta}，资金 +${job.moneyDelta}。</p>
          <p>${job.description}</p>
          <button class="store-btn" data-action="job" data-id="${job.id}" ${state.money < job.switchCost || isCurrent ? "disabled" : ""}>${isCurrent ? "当前路线" : "支付并切换"}</button>
        </article>
      `;
    })
    .join("");

  const itemCards = Object.values(ITEMS)
    .map((item) => {
      return `
        <article class="store-card">
          <header>
            <strong>${item.name}</strong>
            <span class="store-meta">${item.price}</span>
          </header>
          <p>${item.description}</p>
          <button class="store-btn" data-action="item" data-id="${item.id}" ${state.money < item.price ? "disabled" : ""}>购买</button>
        </article>
      `;
    })
    .join("");

  return `${bedCards}${jobCards}${itemCards}`;
}

function renderSkillStoreCards() {
  return STORE_SKILL_ORDER
    .map((skillId) => {
      const skill = SKILLS[skillId];
      const level = getSkillLevel(skillId);
      const soldOut = level >= skill.maxPurchases;
      const progress = skill.maxPurchases > 1 ? `${level}/${skill.maxPurchases}` : level > 0 ? "已拥有" : "未拥有";
      return `
        <article class="store-card skill-card">
          <header>
            <strong>${skill.name}</strong>
            <span class="store-meta">${skill.price}</span>
          </header>
          <p>${skill.effect}</p>
          <p>${skill.summary}。当前进度：${progress}。</p>
          <button class="store-btn" data-action="skill" data-id="${skill.id}" ${!canPurchaseSkill(skill.id) ? "disabled" : ""}>${soldOut ? "已购满" : `购买 ${skill.price}`}</button>
        </article>
      `;
    })
    .join("");
}

function bindStoreEvents() {
  document.querySelector("#close-store")?.addEventListener("click", closeModal);

  document.querySelectorAll("[data-store-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeStoreTab = button.getAttribute("data-store-tab") ?? "goods";
      openStoreModal();
    });
  });

  document.querySelectorAll("[data-action='bed']").forEach((button) => {
    button.addEventListener("click", () => buyBed(button.getAttribute("data-id")));
  });

  document.querySelectorAll("[data-action='job']").forEach((button) => {
    button.addEventListener("click", () => switchJob(button.getAttribute("data-id")));
  });

  document.querySelectorAll("[data-action='item']").forEach((button) => {
    button.addEventListener("click", () => {
      purchaseItem(button.getAttribute("data-id"));
      openStoreModal();
    });
  });

  document.querySelectorAll("[data-action='skill']").forEach((button) => {
    button.addEventListener("click", () => purchaseSkill(button.getAttribute("data-id")));
  });

  render();
}

function buyBed(bedId) {
  const bed = BEDS[bedId];
  if (!bed || state.money < bed.price || state.bedType === bedId) {
    return;
  }
  state.money -= bed.price;
  state.bedType = bedId;
  addLog(state, `你把床升级成了${bed.name}，资金 -${bed.price}。`);
  openStoreModal();
}

function switchJob(jobId) {
  const job = JOBS[jobId];
  if (!job || !job.switchCost || state.money < job.switchCost || state.jobType === jobId) {
    return;
  }
  state.money -= job.switchCost;
  state.jobType = jobId;
  addLog(state, `你花 ${job.switchCost} 完成了路线切换，当前工作改为 ${job.name}。`);
  openStoreModal();
}

function purchaseSkill(skillId) {
  const skill = SKILLS[skillId];
  if (!skill || !canPurchaseSkill(skillId)) {
    return;
  }

  state.money -= skill.price;
  state.skillPurchases[skillId] = getSkillLevel(skillId) + 1;
  addLog(state, `你购买了技能【${skill.name}】，资金 -${skill.price}。`);
  activeStoreTab = "skills";
  openStoreModal();
}

function openModal(content, afterOpen) {
  ui.modalRoot.innerHTML = content;
  ui.modalRoot.classList.remove("hidden");
  afterOpen?.();
}

function closeModal() {
  ui.modalRoot.classList.add("hidden");
  ui.modalRoot.innerHTML = "";
}

function applyDelta(targetState, delta) {
  const beforeEnergy = targetState.energy;
  const beforeStress = targetState.stress;
  const beforeMoney = targetState.money;

  targetState.energy = clamp(targetState.energy + (delta.energy ?? 0), 0, targetState.energyMax);
  targetState.stress = clamp(targetState.stress + (delta.stress ?? 0), 0, 100);
  targetState.money = Math.max(0, targetState.money + (delta.money ?? 0));

  return {
    energy: round2(targetState.energy - beforeEnergy),
    stress: round2(targetState.stress - beforeStress),
    money: round2(targetState.money - beforeMoney),
  };
}

function addLog(targetState, text) {
  targetState.log.unshift({
    stamp: `Day ${targetState.day} ${formatTime(targetState.currentTime)}`,
    text,
  });
  targetState.log = targetState.log.slice(0, 18);
}

function checkEndConditions() {
  if (state.energy <= 0) {
    stopDozing();
    resetWorkingState();
    state.morning.dozing = false;
    state.stage = "gameover";
    closeModal();
    addLog(state, "你倒下了。身体表示这班是真上不动了。");
    return true;
  }
  if (state.stress >= 100) {
    stopDozing();
    resetWorkingState();
    state.morning.dozing = false;
    state.stage = "gameover";
    closeModal();
    addLog(state, "你绷不住了。精神率先在工位上宣布下班。");
    return true;
  }
  if (state.money >= MAX_MONEY) {
    stopDozing();
    resetWorkingState();
    state.morning.dozing = false;
    state.stage = "victory";
    closeModal();
    addLog(state, "存款终于到了可以跑路的地步。财富自由达成。");
    return true;
  }
  return false;
}

function finalizeAfterEndCheck() {
  if (checkEndConditions()) {
    render();
    return true;
  }
  return false;
}

function formatTime(rawMinutes) {
  const normalized = Math.floor(rawMinutes) % 1440;
  const hours = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor(normalized % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}`;
}

function stageLabel(stage) {
  const labels = {
    morning: "早晨阶段",
    working: "工作阶段",
    night: "夜晚阶段",
    gameover: "结局",
    victory: "结局",
  };
  return labels[stage] ?? stage;
}

function formatSigned(value) {
  const rounded = round2(value);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function formatNumber(value) {
  return round2(value).toFixed(2).replace(/\.00$/, "");
}

function formatScore(value) {
  return round2(value).toFixed(1).replace(/\.0$/, "");
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
