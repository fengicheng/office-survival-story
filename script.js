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
const MINIGAMES = {
  mole: {
    id: "mole",
    name: "打地鼠",
    durationSeconds: 30,
    fullScore: 40,
    intro: "地鼠会给你加分，小猫会让你扣分。只打地鼠，别误伤小猫。",
    rule: "点击地鼠 +1，点击小猫 -2。",
    helper: "盯准再点，小猫会混在节奏里骗你出手。",
  },
  stack: {
    id: "stack",
    name: "叠箱子",
    durationSeconds: 30,
    fullScore: 12,
    intro: "正方形木箱会在上方左右移动。点击后木箱会受重力下落，落点不稳就会直接砸歪。",
    rule: "稳稳叠上 1 个 +1，近乎完美落点额外 +0.5。",
    helper: "这次木箱真的会往下坠，太偏就撑不住了。",
  },
  balloon: {
    id: "balloon",
    name: "打气球",
    durationSeconds: 30,
    fullScore: 35,
    intro: "普通气球和金色气球能得分，炸弹气球会扣分。",
    rule: "普通气球 +1，金色气球 +2，炸弹气球 -2。",
    helper: "别只顾着连点，炸弹气球就是专门坑手速怪的。",
  },
  memory: {
    id: "memory",
    name: "翻牌记忆",
    durationSeconds: 35,
    fullScore: 8,
    intro: "在倒计时内尽量配对更多卡牌，不匹配只会浪费时间。",
    rule: "每成功配对 1 组 +1。",
    helper: "先记位置，再贪连击，别让节奏被误翻带乱。",
  },
};
const MINIGAME_IDS = Object.keys(MINIGAMES);

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
    moneyDelta: 600,
    description: "标准平衡路线。",
  },
  grind: {
    id: "grind",
    name: "跳槽（卷）",
    energyDelta: -22,
    stressDelta: 20,
    moneyDelta: 900,
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
let activeMinigameIntervals = [];
let activeMinigameTimeouts = [];

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
    clearMinigameSchedulers();
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
      currentMinigameId: null,
      lastMinigameId: null,
      score: 0,
      fullScore: 0,
      incomeMultiplier: 1,
      finalIncome: 0,
      minigameStartedAt: 0,
      runtimeData: null,
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
      currentMinigameId: null,
      score: 0,
      fullScore: 0,
      incomeMultiplier: 1,
      finalIncome: 0,
      minigameStartedAt: 0,
      runtimeData: null,
      lastMinigameId: candidate.working?.lastMinigameId ?? null,
    },
    log: Array.isArray(candidate.log) ? candidate.log.slice(0, 18) : initial.log,
    morning: {
      ...initial.morning,
      ...(candidate.morning ?? {}),
      dozing: false,
    },
  };
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
    if (state.working.phase === "intro" || state.working.phase === "playing" || state.working.phase === "result") {
      const game = MINIGAMES[state.working.currentMinigameId] ?? { name: "小游戏" };
      return {
        title: `${game.name} 进行中`,
        tag: "Working Game",
        visual: "working",
        description: `今天的工作先被压缩成了一局【${game.name}】。结果会影响今日工资，打完才能继续结算。`,
        tip: "小游戏进行中时无法打开商店，也不能直接跳过结算。",
        visualCopy: "班没少上，只是先换了种更直接的折磨方式。",
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
      description: "点击开始工作后，会随机进入 1 个小游戏，结果将影响今日工资。",
      tip: "工作阶段无法打开商店。小游戏结束后才会进入正式结算。",
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
    actions.push({
      label:
        state.working.phase === "settling"
          ? "正在搬砖..."
          : state.working.phase === "idle"
            ? "开始今天的工作"
            : "小游戏进行中...",
      onClick: resolveWorkDay,
      disabled: state.working.busy || state.working.phase !== "idle",
    });
  } else if (state.stage === "night") {
    actions.push({ label: "睡觉", onClick: openSleepModal });
    actions.push({ label: "熬夜 1 小时", style: "warning", onClick: stayUpOneHour });
    actions.push({ label: "商店", style: "secondary", onClick: openStoreModal });
  } else {
    actions.push({
      label: "重新开局",
      onClick: () => {
        stopDozing();
        clearMinigameSchedulers();
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
  addLog(state, "今天的班开始了。");
  const minigameId = pickDailyMinigame(state.working.lastMinigameId);
  const game = MINIGAMES[minigameId];
  state.working.phase = "intro";
  state.working.currentMinigameId = minigameId;
  state.working.lastMinigameId = minigameId;
  state.working.score = 0;
  state.working.fullScore = game.fullScore;
  state.working.incomeMultiplier = 1;
  state.working.finalIncome = JOBS[state.jobType].moneyDelta;
  state.working.minigameStartedAt = 0;
  state.working.runtimeData = null;
  addLog(state, `今天的任务是小游戏【${game.name}】。`);
  render();
  openMinigameIntro(minigameId);
}

function pickDailyMinigame(lastMinigameId) {
  const first = randomPick(MINIGAME_IDS);
  if (first !== lastMinigameId) {
    return first;
  }
  return randomPick(MINIGAME_IDS);
}

function randomPick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function openMinigameIntro(minigameId) {
  const game = MINIGAMES[minigameId];
  if (!game) {
    resolveBaseWorkSettlement(JOBS[state.jobType].moneyDelta);
    return;
  }

  openModal(
    `
      <div class="modal-card minigame-card">
        <p class="eyebrow">Today's Work</p>
        <h3>${game.name}</h3>
        <p>${game.intro}</p>
        <div class="modal-grid">
          <div class="modal-section">
            <strong>时长</strong>
            <p>${game.durationSeconds} 秒</p>
          </div>
          <div class="modal-section">
            <strong>满分</strong>
            <p>${formatScore(game.fullScore)}</p>
          </div>
          <div class="modal-section">
            <strong>规则</strong>
            <p>${game.rule}</p>
          </div>
          <div class="modal-section">
            <strong>工资结算</strong>
            <p>满分 x1.3；低于 70% x0.8；其余 x1.0。</p>
          </div>
        </div>
        <div class="modal-actions">
          <button id="start-minigame" class="modal-btn">开始</button>
        </div>
      </div>
    `,
    () => {
      document.querySelector("#start-minigame")?.addEventListener("click", () => startMinigame(minigameId));
    },
  );
}

function startMinigame(minigameId) {
  const game = MINIGAMES[minigameId];
  if (!game) {
    return;
  }

  state.working.phase = "playing";
  state.working.minigameStartedAt = Date.now();
  state.working.score = 0;
  state.working.fullScore = game.fullScore;
  clearMinigameSchedulers();
  render();
  MINIGAME_RUNNERS[minigameId]?.();
}

function buildMinigameShell(game, extraClass = "", controlsHtml = "") {
  return `
    <div class="modal-card minigame-card">
      <div class="minigame-top">
        <div>
          <p class="eyebrow">Today's Work</p>
          <h3>${game.name}</h3>
          <p>${game.helper}</p>
        </div>
        <span class="scene-tag minigame-tag">小游戏</span>
      </div>
      <div class="minigame-stats">
        <div class="modal-section">
          <strong>倒计时</strong>
          <p id="minigame-timer">${game.durationSeconds.toFixed(1)} 秒</p>
        </div>
        <div class="modal-section">
          <strong>当前分数</strong>
          <p><span id="minigame-score">0</span> / <span id="minigame-full-score">${formatScore(game.fullScore)}</span></p>
        </div>
      </div>
      <div id="minigame-stage" class="minigame-stage ${extraClass}"></div>
      ${controlsHtml ? `<div class="modal-actions minigame-controls">${controlsHtml}</div>` : ""}
    </div>
  `;
}

function updateMinigameHud(score, timeLeftMs, fullScore) {
  const scoreNode = document.querySelector("#minigame-score");
  const timerNode = document.querySelector("#minigame-timer");
  const fullScoreNode = document.querySelector("#minigame-full-score");
  if (scoreNode) {
    scoreNode.textContent = formatScore(score);
  }
  if (timerNode) {
    timerNode.textContent = `${Math.max(0, timeLeftMs) / 1000 >= 10 ? "" : ""}${(Math.max(0, timeLeftMs) / 1000).toFixed(1)} 秒`;
  }
  if (fullScoreNode) {
    fullScoreNode.textContent = formatScore(fullScore);
  }
}

function finishMinigame({ score, fullScore }) {
  if (state.working.phase !== "playing") {
    return;
  }

  clearMinigameSchedulers();
  const cappedFullScore = Math.max(1, round2(fullScore ?? state.working.fullScore ?? 1));
  const normalizedScore = clamp(round2(score ?? 0), 0, cappedFullScore);
  const ratio = normalizedScore / cappedFullScore;
  const incomeMultiplier = getIncomeMultiplier(normalizedScore, cappedFullScore);
  const finalIncome = Math.round(JOBS[state.jobType].moneyDelta * incomeMultiplier);

  state.working.phase = "result";
  state.working.score = normalizedScore;
  state.working.fullScore = cappedFullScore;
  state.working.incomeMultiplier = incomeMultiplier;
  state.working.finalIncome = finalIncome;
  state.working.runtimeData = null;

  addLog(
    state,
    `小游戏结算：${formatScore(normalizedScore)}/${formatScore(cappedFullScore)}，达成率 ${Math.round(clamp(ratio, 0, 1) * 100)}%，工资倍率 x${incomeMultiplier.toFixed(1)}。`,
  );
  if (incomeMultiplier === 1.3) {
    addLog(state, "发挥出色，今日工资提升到 130%。");
  } else if (incomeMultiplier === 0.8) {
    addLog(state, "发挥失常，今日工资降为 80%。");
  }

  render();
  showMinigameResult();
}

function showMinigameResult() {
  const game = MINIGAMES[state.working.currentMinigameId];
  const job = JOBS[state.jobType];
  const ratio = state.working.fullScore <= 0 ? 0 : state.working.score / state.working.fullScore;
  openModal(
    `
      <div class="modal-card minigame-card">
        <p class="eyebrow">Work Result</p>
        <h3>${game?.name ?? "小游戏"} 结算</h3>
        <div class="modal-grid">
          <div class="modal-section">
            <strong>成绩</strong>
            <p>${formatScore(state.working.score)} / ${formatScore(state.working.fullScore)}</p>
          </div>
          <div class="modal-section">
            <strong>达成率</strong>
            <p>${Math.round(clamp(ratio, 0, 1) * 100)}%</p>
          </div>
          <div class="modal-section">
            <strong>基础工资</strong>
            <p>${job.moneyDelta}</p>
          </div>
          <div class="modal-section">
            <strong>最终工资</strong>
            <p>${state.working.finalIncome}（x${state.working.incomeMultiplier.toFixed(1)}）</p>
          </div>
        </div>
        <div class="modal-grid">
          <div class="modal-section">
            <strong>今日工作消耗</strong>
            <p>精力 ${formatSigned(job.energyDelta)}，压力 ${formatSigned(job.stressDelta)}。</p>
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
        ?.addEventListener("click", () => resolveBaseWorkSettlement(state.working.finalIncome));
    },
  );
}

function getIncomeMultiplier(score, fullScore) {
  const ratio = fullScore <= 0 ? 0 : score / fullScore;
  if (ratio >= 1) {
    return 1.3;
  }
  if (ratio < 0.7) {
    return 0.8;
  }
  return 1;
}

function clearMinigameSchedulers() {
  activeMinigameIntervals.forEach((id) => window.clearInterval(id));
  activeMinigameTimeouts.forEach((id) => window.clearTimeout(id));
  activeMinigameIntervals = [];
  activeMinigameTimeouts = [];
}

function scheduleMinigameInterval(callback, delay) {
  const id = window.setInterval(callback, delay);
  activeMinigameIntervals.push(id);
  return id;
}

function scheduleMinigameTimeout(callback, delay) {
  const id = window.setTimeout(callback, delay);
  activeMinigameTimeouts.push(id);
  return id;
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

function resolveBaseWorkSettlement(incomeOverride = JOBS[state.jobType].moneyDelta) {
  closeModal();
  clearMinigameSchedulers();
  state.working.phase = "settling";
  render();

  window.setTimeout(() => {
    const job = JOBS[state.jobType];
    const delta = applyDelta(state, {
      energy: job.energyDelta,
      stress: job.stressDelta,
      money: incomeOverride,
    });
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
  clearMinigameSchedulers();
  const lastMinigameId = state.working.lastMinigameId ?? null;
  state.working.busy = false;
  state.working.phase = "idle";
  state.working.currentMinigameId = null;
  state.working.lastMinigameId = lastMinigameId;
  state.working.score = 0;
  state.working.fullScore = 0;
  state.working.incomeMultiplier = 1;
  state.working.finalIncome = 0;
  state.working.minigameStartedAt = 0;
  state.working.runtimeData = null;
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

  const body = `
    <div class="modal-card">
      <h3>便利店 / 家居城 / 猎头群</h3>
      <p>钱不一定能让你幸福，但至少能让今天不要死得那么难看。</p>
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

const MINIGAME_RUNNERS = {
  mole: startMoleMinigame,
  stack: startStackMinigame,
  balloon: startBalloonMinigame,
  memory: startMemoryMinigame,
};

function startMoleMinigame() {
  const game = MINIGAMES.mole;
  state.working.runtimeData = {
    score: 0,
    timeLeftMs: game.durationSeconds * 1000,
    currentSlot: null,
    currentKind: null,
  };

  openModal(buildMinigameShell(game, "mole-stage"), () => {
    const stage = document.querySelector("#minigame-stage");
    if (!stage) {
      return;
    }

    stage.addEventListener("click", (event) => {
      const button = event.target.closest("[data-hole-index]");
      if (!button || state.working.phase !== "playing") {
        return;
      }
      const runtime = state.working.runtimeData;
      const index = Number(button.getAttribute("data-hole-index"));
      if (runtime.currentSlot !== index) {
        return;
      }

      runtime.score = round2(runtime.score + (runtime.currentKind === "mole" ? 1 : -2));
      runtime.currentSlot = null;
      runtime.currentKind = null;
      renderMoleStage();
      updateMinigameHud(runtime.score, runtime.timeLeftMs, game.fullScore);
    });

    const startedAt = Date.now();
    const tickTimer = scheduleMinigameInterval(() => {
      const runtime = state.working.runtimeData;
      if (!runtime || state.working.phase !== "playing") {
        return;
      }
      runtime.timeLeftMs = Math.max(0, game.durationSeconds * 1000 - (Date.now() - startedAt));
      updateMinigameHud(runtime.score, runtime.timeLeftMs, game.fullScore);
      if (runtime.timeLeftMs <= 0) {
        finishMinigame({ score: runtime.score, fullScore: game.fullScore });
      }
    }, 100);

    const spawnLoop = () => {
      const runtime = state.working.runtimeData;
      if (!runtime || state.working.phase !== "playing") {
        return;
      }
      const progress = 1 - runtime.timeLeftMs / (game.durationSeconds * 1000);
      runtime.currentSlot = Math.floor(Math.random() * 9);
      runtime.currentKind = Math.random() < 0.26 ? "cat" : "mole";
      renderMoleStage();

      const nextDelay = Math.max(280, 640 - progress * 280);
      scheduleMinigameTimeout(spawnLoop, nextDelay);
    };

    updateMinigameHud(0, game.durationSeconds * 1000, game.fullScore);
    renderMoleStage();
    scheduleMinigameTimeout(spawnLoop, 180);

    function renderMoleStage() {
      const runtime = state.working.runtimeData;
      if (!runtime || !stage) {
        return;
      }
      stage.innerHTML = `
        <div class="mole-grid">
          ${Array.from({ length: 9 }, (_, index) => {
            const isActive = runtime.currentSlot === index;
            const typeClass = isActive ? ` ${runtime.currentKind}` : "";
            const label = isActive ? (runtime.currentKind === "mole" ? "鼠" : "猫") : "";
            return `<button class="mole-hole${typeClass}" data-hole-index="${index}">${label}</button>`;
          }).join("")}
        </div>
      `;
    }
  });
}

function startBalloonMinigame() {
  const game = MINIGAMES.balloon;
  state.working.runtimeData = {
    score: 0,
    timeLeftMs: game.durationSeconds * 1000,
    nextId: 1,
    balloons: [],
  };

  openModal(buildMinigameShell(game, "balloon-stage"), () => {
    const stage = document.querySelector("#minigame-stage");
    if (!stage) {
      return;
    }

    stage.addEventListener("pointerdown", (event) => {
      const button = event.target.closest(".balloon");
      if (!button || state.working.phase !== "playing") {
        return;
      }
      event.preventDefault();
      const runtime = state.working.runtimeData;
      const balloonId = Number(button.getAttribute("data-balloon-id"));
      const index = runtime.balloons.findIndex((item) => item.id === balloonId);
      if (index < 0) {
        return;
      }
      const balloon = runtime.balloons[index];
      runtime.score = round2(runtime.score + balloon.score);
      runtime.balloons.splice(index, 1);
      renderBalloonStage();
      updateMinigameHud(runtime.score, runtime.timeLeftMs, game.fullScore);
    });

    const startedAt = Date.now();
    scheduleMinigameInterval(() => {
      const runtime = state.working.runtimeData;
      if (!runtime || state.working.phase !== "playing") {
        return;
      }
      runtime.timeLeftMs = Math.max(0, game.durationSeconds * 1000 - (Date.now() - startedAt));
      updateMinigameHud(runtime.score, runtime.timeLeftMs, game.fullScore);
      if (runtime.timeLeftMs <= 0) {
        finishMinigame({ score: runtime.score, fullScore: game.fullScore });
      }
    }, 100);

    scheduleMinigameInterval(() => {
      const runtime = state.working.runtimeData;
      if (!runtime || state.working.phase !== "playing") {
        return;
      }
      runtime.balloons = runtime.balloons
        .map((balloon) => ({ ...balloon, bottom: balloon.bottom + balloon.speed }))
        .filter((balloon) => balloon.bottom < 330);
      renderBalloonStage();
    }, 50);

    const spawnBalloon = () => {
      const runtime = state.working.runtimeData;
      if (!runtime || state.working.phase !== "playing") {
        return;
      }
      runtime.balloons.push(createBalloon(runtime.nextId));
      runtime.nextId += 1;
      renderBalloonStage();

      const progress = 1 - runtime.timeLeftMs / (game.durationSeconds * 1000);
      const nextDelay = Math.max(180, 520 - progress * 180);
      scheduleMinigameTimeout(spawnBalloon, nextDelay);
    };

    updateMinigameHud(0, game.durationSeconds * 1000, game.fullScore);
    renderBalloonStage();
    scheduleMinigameTimeout(spawnBalloon, 120);

    function renderBalloonStage() {
      const runtime = state.working.runtimeData;
      if (!runtime) {
        return;
      }
      stage.innerHTML = `
        <div class="balloon-field">
          ${runtime.balloons
            .map(
              (balloon) => `
                <button
                  class="balloon ${balloon.type}"
                  data-balloon-id="${balloon.id}"
                  style="left: ${balloon.left}%; bottom: ${balloon.bottom}px; width: ${balloon.size}px; height: ${balloon.size + 10}px;"
                >
                  <span>${balloon.label}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      `;
    }
  });
}

function createBalloon(id) {
  const roll = Math.random();
  if (roll < 0.18) {
    return {
      id,
      type: "bomb",
      label: "炸",
      score: -2,
      left: 5 + Math.random() * 82,
      bottom: -30,
      size: 56 + Math.random() * 12,
      speed: 2.1 + Math.random() * 1.2,
    };
  }
  if (roll < 0.35) {
    return {
      id,
      type: "gold",
      label: "金",
      score: 2,
      left: 5 + Math.random() * 82,
      bottom: -30,
      size: 54 + Math.random() * 10,
      speed: 1.7 + Math.random() * 1.1,
    };
  }
  return {
    id,
    type: "normal",
    label: "气",
    score: 1,
    left: 5 + Math.random() * 82,
    bottom: -30,
    size: 52 + Math.random() * 14,
    speed: 1.5 + Math.random() * 1,
  };
}

function startMemoryMinigame() {
  const game = MINIGAMES.memory;
  const symbols = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const cards = shuffle(symbols.flatMap((symbol) => [symbol, symbol])).map((symbol, index) => ({
    id: index,
    symbol,
    state: "closed",
  }));

  state.working.runtimeData = {
    score: 0,
    timeLeftMs: game.durationSeconds * 1000,
    cards,
    openIndexes: [],
    lock: false,
  };

  openModal(buildMinigameShell(game, "memory-stage"), () => {
    const stage = document.querySelector("#minigame-stage");
    if (!stage) {
      return;
    }

    stage.addEventListener("click", (event) => {
      const button = event.target.closest("[data-card-index]");
      const runtime = state.working.runtimeData;
      if (!button || !runtime || runtime.lock || state.working.phase !== "playing") {
        return;
      }

      const index = Number(button.getAttribute("data-card-index"));
      const card = runtime.cards[index];
      if (!card || card.state !== "closed") {
        return;
      }

      card.state = "open";
      runtime.openIndexes.push(index);
      renderMemoryStage();

      if (runtime.openIndexes.length < 2) {
        return;
      }

      runtime.lock = true;
      scheduleMinigameTimeout(() => {
        const [firstIndex, secondIndex] = runtime.openIndexes;
        const first = runtime.cards[firstIndex];
        const second = runtime.cards[secondIndex];
        if (first?.symbol === second?.symbol) {
          first.state = "matched";
          second.state = "matched";
          runtime.score = round2(runtime.score + 1);
        } else {
          first.state = "closed";
          second.state = "closed";
        }
        runtime.openIndexes = [];
        runtime.lock = false;
        updateMinigameHud(runtime.score, runtime.timeLeftMs, game.fullScore);
        renderMemoryStage();
        if (runtime.score >= game.fullScore) {
          finishMinigame({ score: game.fullScore, fullScore: game.fullScore });
        }
      }, 550);
    });

    const startedAt = Date.now();
    scheduleMinigameInterval(() => {
      const runtime = state.working.runtimeData;
      if (!runtime || state.working.phase !== "playing") {
        return;
      }
      runtime.timeLeftMs = Math.max(0, game.durationSeconds * 1000 - (Date.now() - startedAt));
      updateMinigameHud(runtime.score, runtime.timeLeftMs, game.fullScore);
      if (runtime.timeLeftMs <= 0) {
        finishMinigame({ score: runtime.score, fullScore: game.fullScore });
      }
    }, 100);

    updateMinigameHud(0, game.durationSeconds * 1000, game.fullScore);
    renderMemoryStage();

    function renderMemoryStage() {
      const runtime = state.working.runtimeData;
      if (!runtime) {
        return;
      }
      stage.innerHTML = `
        <div class="memory-grid">
          ${runtime.cards
            .map((card, index) => {
              const isOpen = card.state === "open" || card.state === "matched";
              const label = isOpen ? card.symbol : "?";
              return `
                <button class="memory-card ${card.state}" data-card-index="${index}">
                  <span>${label}</span>
                </button>
              `;
            })
            .join("")}
        </div>
      `;
    }
  });
}

function startStackMinigame() {
  const game = MINIGAMES.stack;
  const groundHeight = 28;
  const fieldHeight = 400;
  const boxSize = 28;
  state.working.runtimeData = {
    score: 0,
    timeLeftMs: game.durationSeconds * 1000,
    fieldHeight,
    groundHeight,
    boxSize,
    fieldWidth: 0,
    blocks: [],
    current: {
      left: 0,
      top: 24,
      size: boxSize,
      direction: 1,
      speed: 3.4,
      dropping: false,
      velocityY: 0,
    },
  };

  openModal(
    buildMinigameShell(
      game,
      "stack-stage",
      `<button id="stack-drop-btn" class="modal-btn">放下箱子</button>`,
    ),
    () => {
      const stage = document.querySelector("#minigame-stage");
      const dropBtn = document.querySelector("#stack-drop-btn");
      if (!stage || !dropBtn) {
        return;
      }

      initializeStackField();

      const drop = () => {
        const runtime = state.working.runtimeData;
        if (!runtime || state.working.phase !== "playing") {
          return;
        }
        const current = runtime.current;
        if (current.dropping) {
          return;
        }
        current.dropping = true;
        current.velocityY = 1.2;
      };

      dropBtn.addEventListener("click", drop);
      stage.addEventListener("click", drop);

      const startedAt = Date.now();
      scheduleMinigameInterval(() => {
        const runtime = state.working.runtimeData;
        if (!runtime || state.working.phase !== "playing") {
          return;
        }
        runtime.timeLeftMs = Math.max(0, game.durationSeconds * 1000 - (Date.now() - startedAt));
        updateMinigameHud(runtime.score, runtime.timeLeftMs, game.fullScore);
        if (runtime.timeLeftMs <= 0) {
          finishMinigame({ score: runtime.score, fullScore: game.fullScore });
        }
      }, 100);

      scheduleMinigameInterval(() => {
        const runtime = state.working.runtimeData;
        if (!runtime || state.working.phase !== "playing") {
          return;
        }
        const current = runtime.current;
        if (!current.dropping) {
          current.left = clamp(current.left + current.direction * current.speed, 0, runtime.fieldWidth - current.size);
          if (current.left <= 0 || current.left >= runtime.fieldWidth - current.size) {
            current.direction *= -1;
          }
        } else {
          current.top += current.velocityY;
          current.velocityY += 0.62;
          const landingTop = getCurrentLandingTop(runtime);
          if (current.top >= landingTop) {
            current.top = landingTop;
            settleCurrentBox();
            return;
          }
        }
        renderStackStage();
      }, 16);

      updateMinigameHud(0, game.durationSeconds * 1000, game.fullScore);
      renderStackStage();

      function initializeStackField() {
        const runtime = state.working.runtimeData;
        if (!runtime) {
          return;
        }
        runtime.fieldWidth = Math.max(280, stage.clientWidth || 640);
        const baseLeft = (runtime.fieldWidth - runtime.boxSize) / 2;
        const baseTop = runtime.fieldHeight - runtime.groundHeight - runtime.boxSize;
        runtime.blocks = [{ left: baseLeft, top: baseTop, size: runtime.boxSize }];
        runtime.current.left = 0;
        runtime.current.top = 24;
        runtime.current.size = runtime.boxSize;
        runtime.current.direction = 1;
        runtime.current.speed = 3.4;
        runtime.current.dropping = false;
        runtime.current.velocityY = 0;
      }

      function getCurrentLandingTop(runtime) {
        const topBlock = runtime.blocks[runtime.blocks.length - 1];
        return topBlock.top - runtime.current.size;
      }

      function settleCurrentBox() {
        const runtime = state.working.runtimeData;
        if (!runtime) {
          return;
        }

        const topBlock = runtime.blocks[runtime.blocks.length - 1];
        const current = runtime.current;
        const overlap =
          Math.min(current.left + current.size, topBlock.left + topBlock.size) - Math.max(current.left, topBlock.left);
        const requiredOverlap = current.size * 0.55;
        if (overlap < requiredOverlap) {
          renderStackStage();
          finishMinigame({ score: runtime.score, fullScore: game.fullScore });
          return;
        }

        const centerDelta = Math.abs(
          current.left + current.size / 2 - (topBlock.left + topBlock.size / 2),
        );
        const perfect = centerDelta <= 6;
        if (perfect) {
          current.left = topBlock.left;
        }
        runtime.score = round2(runtime.score + 1 + (perfect ? 0.5 : 0));
        runtime.blocks.push({
          left: current.left,
          top: getCurrentLandingTop(runtime),
          size: current.size,
        });

        if (runtime.score >= game.fullScore) {
          renderStackStage();
          finishMinigame({ score: game.fullScore, fullScore: game.fullScore });
          return;
        }

        runtime.current = {
          left: Math.random() > 0.5 ? 0 : runtime.fieldWidth - current.size,
          top: 24,
          size: current.size,
          direction: Math.random() > 0.5 ? 1 : -1,
          speed: Math.min(6.3, current.speed + 0.3),
          dropping: false,
          velocityY: 0,
        };
        updateMinigameHud(runtime.score, runtime.timeLeftMs, game.fullScore);
        renderStackStage();
      }

      function renderStackStage() {
        const runtime = state.working.runtimeData;
        if (!runtime) {
          return;
        }
        stage.innerHTML = `
          <div class="stack-field">
            ${runtime.blocks
              .map(
                (block) => `
                  <div
                    class="stack-block settled"
                    style="left: ${block.left}px; width: ${block.size}px; height: ${block.size}px; top: ${block.top}px;"
                  ></div>
                `,
              )
              .join("")}
            <div
              class="stack-block moving"
              style="left: ${runtime.current.left}px; width: ${runtime.current.size}px; height: ${runtime.current.size}px; top: ${runtime.current.top}px;"
            ></div>
          </div>
        `;
      }
    },
  );
}

function shuffle(items) {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
}

function renderStoreCards() {
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

function bindStoreEvents() {
  document.querySelector("#close-store")?.addEventListener("click", closeModal);

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
