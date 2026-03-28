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

const BEDS = {
  wood: {
    id: "wood",
    name: "木板床",
    price: 0,
    nightEnergyPerHour: 5,
    nightStressPerHour: 2,
    morningEnergyPerMinute: 0.14,
    morningStressPerMinute: 0.08,
    summary: "前期够用，恢复一般。",
  },
  spring: {
    id: "spring",
    name: "弹簧床垫",
    price: 1000,
    nightEnergyPerHour: 7,
    nightStressPerHour: 2.3,
    morningEnergyPerMinute: 0.18,
    morningStressPerMinute: 0.12,
    summary: "第一阶段核心升级。",
  },
  memory: {
    id: "memory",
    name: "记忆棉床垫",
    price: 3000,
    nightEnergyPerHour: 10,
    nightStressPerHour: 2.6,
    morningEnergyPerMinute: 0.25,
    morningStressPerMinute: 0.17,
    summary: "中期稳定器，恢复明显。",
  },
  deluxe: {
    id: "deluxe",
    name: "豪华定制床",
    price: 8000,
    nightEnergyPerHour: 14,
    nightStressPerHour: 2.9,
    morningEnergyPerMinute: 0.34,
    morningStressPerMinute: 0.24,
    summary: "后期接近永动机，但前期很贵。",
  },
};

const JOBS = {
  normal: {
    id: "normal",
    name: "普通公司",
    energyDelta: -22,
    stressDelta: 24,
    moneyDelta: 300,
    description: "标准平衡路线。",
  },
  grind: {
    id: "grind",
    name: "跳槽（卷）",
    energyDelta: -30,
    stressDelta: 32,
    moneyDelta: 500,
    switchCost: 5000,
    description: "高风险高收益，适合冲刺财富自由。",
  },
  easy: {
    id: "easy",
    name: "跳槽（松）",
    energyDelta: -14,
    stressDelta: 12,
    moneyDelta: 220,
    switchCost: 5000,
    description: "低风险低收益，适合保命。",
  },
};

const ITEMS = {
  energyDrink: {
    id: "energyDrink",
    name: "能量饮料",
    price: 150,
    description: "精力 +18，压力 +5。",
    canUse: (state) => state.stage === "morning" || state.stage === "night",
    use(state) {
      state.inventory.energyDrink -= 1;
      const delta = applyDelta(state, { energy: 18, stress: 5 });
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
    return {
      title: state.working.busy ? "正在努力搬砖" : "准备上班",
      tag: "Working",
      visual: "working",
      description: state.working.busy
        ? "会议、日报、返工和临时需求正在往你脸上招呼。"
        : "一旦开始工作，就会直接结算今天的体力、压力和收入。",
      tip: "工作阶段无法打开商店，建议早晚提前买好道具。",
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
      label: state.working.busy ? "正在搬砖..." : "开始今天的工作",
      onClick: resolveWorkDay,
      disabled: state.working.busy,
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
      checkEndConditions();
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
  state.working.busy = false;
  addLog(state, "你挣扎着爬起来，准备去公司打卡。");
  render();
}

function resolveWorkDay() {
  if (state.working.busy) {
    return;
  }

  state.working.busy = true;
  render();

  window.setTimeout(() => {
    const job = JOBS[state.jobType];
    const delta = applyDelta(state, {
      energy: job.energyDelta,
      stress: job.stressDelta,
      money: job.moneyDelta,
    });
    state.currentTime = NIGHT_START;
    state.stage = "night";
    state.working.busy = false;
    state.night.stayedUpHours = 0;
    addLog(
      state,
      `今天的班终于结算了。精力 ${formatSigned(delta.energy)}，压力 ${formatSigned(delta.stress)}，资金 ${formatSigned(delta.money)}。`,
    );

    if (!checkEndConditions()) {
      render();
    }
  }, 1200);
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

  if (checkEndConditions()) {
    render();
    return;
  }

  state.stage = "working";
  state.working.busy = false;
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

  checkEndConditions();
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

  if (checkEndConditions()) {
    render();
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
    state.stage = "gameover";
    closeModal();
    addLog(state, "你倒下了。身体表示这班是真上不动了。");
    return true;
  }
  if (state.stress >= 100) {
    stopDozing();
    state.stage = "gameover";
    closeModal();
    addLog(state, "你绷不住了。精神率先在工位上宣布下班。");
    return true;
  }
  if (state.money >= MAX_MONEY) {
    stopDozing();
    state.stage = "victory";
    closeModal();
    addLog(state, "存款终于到了可以跑路的地步。财富自由达成。");
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

function round2(value) {
  return Math.round(value * 100) / 100;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
