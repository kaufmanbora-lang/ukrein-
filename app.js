/* global google */
"use strict";

const GAME_BOUNDS = {
  west: 21.8,
  east: 43.6,
  south: 43.8,
  north: 54.8
};

const THREAT_SPEED_SCALE = 0.21;
const PLAYER_MISSILE_SPEED_SCALE = 0.19;
const PLAYER_UNIT_SPEED_SCALE = 0.27;
const INTERCEPTOR_SPEED_SCALE = 0.48;
const PVO_RELOAD_SECONDS = 30;
const PVO_DEFAULT_HIT_CHANCE = 0.35;
const PVO_FIGHTER_HIT_CHANCE = 0.10;
const ENGINEER_REPAIR_SECONDS = 80;
const DAY_DURATION_SECONDS = 120;
const NATO_AID_INTERVAL_DAYS = 30;
const NATO_AID_AMOUNT = 10000000;
const ENEMY_AI_MIN_INTERVAL = 4.8;
const ENEMY_AI_MAX_INTERVAL = 8.8;
const ENEMY_MAX_ACTIVE_THREATS = 8;
const ENEMY_SPAWN_BUDGET_SCALE = 0.58;
const ENEMY_BASE_HP_MULTIPLIER = 2.25;
const ENEMY_SITE_GROUND_DAMAGE_MULTIPLIER = 0.48;
const ROCKET_STORAGE_CAPACITY_PER_FACTORY = 60;
const STARTING_MONEY = 5000000;
const ENEMY_STARTING_MONEY = 5000000;
const ENEMY_BUDGET_UNIT = 100000;
const ENEMY_STARTING_BUDGET = ENEMY_STARTING_MONEY / ENEMY_BUDGET_UNIT;
const FRONTLINE_FIREFIGHT_TYPES = new Set(["infantry", "armor", "specops"]);
const DIPLOMACY_FIRST_AI_DELAY = 210;
const DIPLOMACY_AI_COOLDOWN_MIN = 360;
const DIPLOMACY_AI_COOLDOWN_MAX = 540;

const WORLD_BOUNDS = {
  west: 19.0,
  east: 43.6,
  south: 40.0,
  north: 56.6
};

const GOOGLE_MAP_BOUNDS = {
  west: 19.0,
  east: 43.6,
  south: 40.0,
  north: 56.6
};

const CITY_LABELS = [
  { text: "Київ", lat: 50.45, lng: 30.52, kind: "ua" },
  { text: "Харків", lat: 49.99, lng: 36.23, kind: "ua" },
  { text: "Одеса", lat: 46.48, lng: 30.73, kind: "ua" },
  { text: "Москва", lat: 55.75, lng: 37.62, kind: "enemy" },
  { text: "Воронеж", lat: 51.66, lng: 39.20, kind: "enemy" },
  { text: "Ростов", lat: 47.24, lng: 39.71, kind: "enemy" }
];

const REGION_DATA = [
  { id: "volyn", name: "Волынь", lat: 51.05, lng: 24.85, rx: 1.15, ry: 0.75, color: "#a8d9ff", value: 11, infra: "западный коридор", towns: ["Луцк", "Ковель"] },
  { id: "lviv", name: "Львовщина", lat: 49.82, lng: 23.95, rx: 1.08, ry: 0.78, color: "#d8f5a7", value: 16, infra: "логистический узел", towns: ["Львов", "Стрый"] },
  { id: "rivne", name: "Ровенщина", lat: 50.75, lng: 26.15, rx: 1.05, ry: 0.72, color: "#b9e6ff", value: 12, infra: "энергетика", towns: ["Ровно"] },
  { id: "ternopil", name: "Тернопольщина", lat: 49.55, lng: 25.62, rx: 0.86, ry: 0.68, color: "#ffd6a7", value: 11, infra: "тыловой склад", towns: ["Тернополь"] },
  { id: "khmelnytskyi", name: "Хмельницкий", lat: 49.42, lng: 27.05, rx: 1.03, ry: 0.74, color: "#f7b5bc", value: 13, infra: "транспортный узел", towns: ["Хмельницкий"] },
  { id: "ivano", name: "Прикарпатье", lat: 48.78, lng: 24.72, rx: 0.95, ry: 0.68, color: "#bff4bf", value: 10, infra: "горный коридор", towns: ["Ивано-Франковск"] },
  { id: "chernivtsi", name: "Буковина", lat: 48.28, lng: 25.93, rx: 0.82, ry: 0.48, color: "#ffe89b", value: 9, infra: "юго-западный коридор", towns: ["Черновцы"] },
  { id: "zhytomyr", name: "Житомирщина", lat: 50.35, lng: 28.65, rx: 1.28, ry: 0.88, color: "#ffb4be", value: 15, infra: "северный щит", towns: ["Житомир", "Коростень"] },
  { id: "vinnytsia", name: "Винница", lat: 48.95, lng: 28.48, rx: 1.20, ry: 0.88, color: "#a8d9ff", value: 15, infra: "промышленность", towns: ["Винница"] },
  { id: "kyiv", name: "Киевщина", lat: 50.22, lng: 30.48, rx: 1.28, ry: 0.88, color: "#ffe6a3", value: 26, infra: "центр управления", towns: ["Киев", "Бровары"] },
  { id: "chernihiv", name: "Черниговщина", lat: 51.55, lng: 31.35, rx: 1.35, ry: 0.88, color: "#d8f5a7", value: 13, infra: "северный коридор", frontline: true, towns: ["Чернигов", "Нежин"] },
  { id: "sumy", name: "Сумщина", lat: 51.02, lng: 34.85, rx: 1.25, ry: 0.88, color: "#b9e6ff", value: 14, infra: "приграничный радар", frontline: true, towns: ["Сумы", "Шостка"] },
  { id: "cherkasy", name: "Черкассы", lat: 49.25, lng: 31.85, rx: 1.20, ry: 0.74, color: "#bff4bf", value: 14, infra: "переправы", towns: ["Черкассы"] },
  { id: "poltava", name: "Полтавщина", lat: 49.45, lng: 34.35, rx: 1.35, ry: 0.82, color: "#ffb4be", value: 16, infra: "топливный узел", towns: ["Полтава", "Кременчуг"] },
  { id: "kharkiv", name: "Харьковщина", lat: 49.68, lng: 36.58, rx: 1.12, ry: 0.82, color: "#ffe89b", value: 21, infra: "промышленность", frontline: true, towns: ["Харьков", "Изюм"] },
  { id: "kirovohrad", name: "Кировоград", lat: 48.53, lng: 32.18, rx: 1.20, ry: 0.78, color: "#ffe6a3", value: 13, infra: "центральный склад", towns: ["Кропивницкий"] },
  { id: "dnipro", name: "Днепр", lat: 48.35, lng: 35.00, rx: 1.20, ry: 0.82, color: "#bff4bf", value: 22, infra: "энергосистема", frontline: true, towns: ["Днепр", "Павлоград"] },
  { id: "donetsk", name: "Донетчина", lat: 48.05, lng: 37.85, rx: 1.05, ry: 0.78, color: "#f7b5bc", value: 18, infra: "линия фронта", frontline: true, towns: ["Краматорск", "Бахмут"] },
  { id: "luhansk", name: "Луганщина", lat: 48.82, lng: 39.25, rx: 1.00, ry: 0.72, color: "#a8d9ff", value: 14, infra: "восточная дуга", frontline: true, towns: ["Северодонецк"] },
  { id: "odesa", name: "Одесса", lat: 46.58, lng: 30.42, rx: 1.35, ry: 0.94, color: "#d8f5a7", value: 18, infra: "порт и энергетика", frontline: true, towns: ["Одесса", "Измаил"] },
  { id: "mykolaiv", name: "Николаев", lat: 47.03, lng: 32.18, rx: 0.98, ry: 0.68, color: "#ffe89b", value: 15, infra: "судостроение", frontline: true, towns: ["Николаев"] },
  { id: "kherson", name: "Херсонщина", lat: 46.65, lng: 33.25, rx: 1.12, ry: 0.62, color: "#b9e6ff", value: 15, infra: "речной узел", frontline: true, towns: ["Херсон"] },
  { id: "zaporizhzhia", name: "Запорожье", lat: 47.62, lng: 35.35, rx: 1.15, ry: 0.72, color: "#f7b5bc", value: 18, infra: "энергетический район", frontline: true, towns: ["Запорожье", "Мелитополь"] },
  { id: "crimea", name: "Крым", lat: 45.25, lng: 34.25, rx: 1.25, ry: 0.62, color: "#ffe6a3", value: 15, infra: "морской район", frontline: true, towns: ["Симферополь", "Севастополь"] }
];

const ENEMY_SITES = [
  { id: "moscowCommand", type: "Командный центр", name: "Московский командный узел", lat: 55.75, lng: 37.62, hp: 145, threat: 24, income: 5 },
  { id: "moscowFactory", type: "Военный завод", name: "Московский завод ракет", lat: 55.55, lng: 38.15, hp: 125, threat: 18, income: 9, factory: true },
  { id: "tulaFactory", type: "Танковый завод", name: "Тульский бронетанковый завод", lat: 54.20, lng: 37.62, hp: 115, threat: 16, income: 7, factory: true },
  { id: "lipetskFactory", type: "Авиационный завод", name: "Липецкий авиационный завод", lat: 52.60, lng: 39.58, hp: 118, threat: 17, income: 7, factory: true },
  { id: "bryanskCommand", type: "Командный узел", name: "Брянский командный узел", lat: 53.25, lng: 34.35, hp: 100, threat: 14, income: 3 },
  { id: "kurskLaunch", type: "Пусковой район", name: "Курский пусковой район", lat: 51.75, lng: 36.55, hp: 110, threat: 18, income: 4 },
  { id: "belgorodDepot", type: "Склад БПЛА", name: "Белгородский склад дронов", lat: 50.62, lng: 37.62, hp: 90, threat: 16, income: 5 },
  { id: "voronezhAir", type: "Аэродром", name: "Воронежский аэродром", lat: 51.35, lng: 39.20, hp: 120, threat: 20, income: 4 },
  { id: "rostovHub", type: "Топливный узел", name: "Ростовский топливный узел", lat: 47.35, lng: 39.75, hp: 110, threat: 17, income: 4 },
  { id: "blackSeaFleet", type: "Морская база", name: "Черноморский ударный узел", lat: 44.72, lng: 34.20, hp: 130, threat: 21, income: 4 },
  { id: "ewCenter", type: "РЭБ-центр", name: "Восточный центр РЭБ", lat: 49.85, lng: 41.25, hp: 95, threat: 16, income: 3 },
  { id: "krasnodarAir", type: "Авиагруппа", name: "Кубанская авиагруппа", lat: 45.25, lng: 39.05, hp: 115, threat: 19, income: 4 }
];

const THREAT_TYPES = {
  shahed: { name: "Шахед", hp: 18, speed: 0.041, damage: 8, reward: 45, enemyCost: 24, color: "#f97316", airborne: true, shape: "drone" },
  cruise: { name: "Крылатая ракета", hp: 24, speed: 0.071, damage: 18, reward: 95, enemyCost: 52, color: "#ef4444", airborne: true, shape: "missile" },
  helicopter: { name: "Вертолет", hp: 34, speed: 0.034, damage: 13, reward: 85, enemyCost: 46, color: "#eab308", airborne: true, shape: "heli" },
  fighter: { name: "Истребитель", hp: 44, speed: 0.061, damage: 20, reward: 130, enemyCost: 78, color: "#dc2626", airborne: true, shape: "fighter" },
  infantry: { name: "Пехота РФ", hp: 28, speed: 0.019, damage: 12, reward: 72, enemyCost: 34, color: "#7f1d1d", airborne: false, shape: "infantry" },
  specops: { name: "Группа спецназа", hp: 30, speed: 0.025, damage: 16, reward: 90, enemyCost: 50, color: "#a855f7", airborne: false, shape: "diamond" },
  armor: { name: "Бронеколонна", hp: 54, speed: 0.020, damage: 22, reward: 120, enemyCost: 70, color: "#b45309", airborne: false, shape: "square" },
  scout: { name: "Разведдрон РФ", hp: 14, speed: 0.046, damage: 4, reward: 35, enemyCost: 20, color: "#38bdf8", airborne: true, shape: "scout" }
};

const ACTIONS = {
  buyPvo: { cost: 250000, label: "ПВО" },
  buyRadar: { cost: 200000, label: "Радар" },
  buyFort: { cost: 100000, label: "Укрепления" },
  repair: { cost: 180000, label: "Инженеры" },
  buyFighters: { cost: 400000, label: "Истребители" },
  buyHelicopter: { cost: 320000, label: "Вертолет" },
  buyTank: { cost: 220000, label: "Танк" },
  buyFactory: { cost: 360000, label: "Завод" },
  manualIntercept: { cost: 70000, label: "Ручной пуск" },
  launchRecon: { cost: 120000, label: "Разведдрон" },
  launchAttackDrone: { cost: 160000, label: "Ударный дрон" },
  launchStrike: { cost: 500000, label: "Ракетный удар" },
  launchPiercingStrike: { cost: 5000000, label: "Несбиваемая ракета" },
  deploySpecOps: { cost: 150000, label: "Спецгруппа" }
};
ACTIONS.buyBtr = { cost: 180000, label: "БТР" };

const PLAYER_UNIT_TYPES = {
  recon: {
    name: "Разведдрон",
    action: "launchRecon",
    icon: "launchRecon",
    color: "#38bdf8",
    speed: 0.78,
    radius: 1.08,
    cooldown: 1.2,
    attackDamage: 36,
    pointRadius: 0.24,
    reconOnly: true
  },
  attackDrone: {
    name: "Ударный дрон",
    action: "launchAttackDrone",
    icon: "launchRecon",
    color: "#fb923c",
    speed: 0.88,
    radius: 0.72,
    cooldown: 0.95,
    attackDamage: 40,
    pointRadius: 0.32,
    oneShot: true
  },
  fighter: {
    name: "Истребитель",
    action: "buyFighters",
    icon: "buyFighters",
    color: "#60a5fa",
    speed: 1.25,
    radius: 1.24,
    cooldown: 0.85,
    attackDamage: 52,
    pointRadius: 0.52
  },
  helicopter: {
    name: "Вертолет",
    action: "buyHelicopter",
    icon: "buyHelicopter",
    color: "#facc15",
    speed: 0.74,
    radius: 0.96,
    cooldown: 0.95,
    attackDamage: 38,
    pointRadius: 0.42
  },
  tank: {
    name: "Танк",
    action: "buyTank",
    icon: "buyTank",
    color: "#22c55e",
    speed: 0.34,
    radius: 0.58,
    cooldown: 1.2,
    attackDamage: 42,
    pointRadius: 0.34
  },
  soldiers: {
    name: "Штурмовая группа",
    action: "deploySpecOps",
    icon: "deploySpecOps",
    color: "#b15cff",
    speed: 0.27,
    radius: 0.52,
    cooldown: 1.0,
    attackDamage: 30,
    pointRadius: 0.28
  },
  engineer: {
    name: "Инженеры",
    action: "repair",
    icon: "repair",
    color: "#fbbf24",
    speed: 0.11,
    radius: 0.36,
    cooldown: 0.4,
    attackDamage: 0,
    pointRadius: 0.13,
    repairOnly: true,
    repairSeconds: ENGINEER_REPAIR_SECONDS
  },
  natoCargo: {
    name: "Самолет НАТО",
    action: null,
    icon: "buyFighters",
    color: "#93c5fd",
    speed: 0.92,
    radius: 0.18,
    cooldown: 1.0,
    attackDamage: 0,
    pointRadius: 0.16,
    cargoOnly: true
  }
};
PLAYER_UNIT_TYPES.btr = {
  name: "БТР",
  action: "buyBtr",
  icon: "buyBtr",
  color: "#34d399",
  speed: 0.42,
  radius: 0.50,
  cooldown: 1.05,
  attackDamage: 32,
  pointRadius: 0.30
};

const SHOP_ICON_INDEX = {
  buyPvo: [0, 0],
  buyRadar: [1, 0],
  buyFort: [2, 0],
  repair: [3, 0],
  buyFighters: [0, 1],
  buyHelicopter: [0, 1],
  buyTank: [2, 0],
  buyFactory: [2, 0],
  launchRecon: [1, 1],
  launchAttackDrone: [1, 1],
  launchStrike: [2, 1],
  launchPiercingStrike: [2, 1],
  deploySpecOps: [3, 1]
};

const DEFENSE_ACTIONS = new Set(["buyPvo", "buyRadar", "buyFactory", "buyFort"]);
const DEFENSE_ACTION_LABELS = {
  buyPvo: "ППО",
  buyRadar: "РЛС",
  buyFactory: "Завод",
  buyFort: "Укрепления",
  repair: "Инженеры"
};

const FULL_MAP_TEXTURE = {
  width: 2800,
  height: 1500
};

const THREAT_SHORT_LABELS = {
  shahed: "Дрон",
  cruise: "Рак",
  helicopter: "Верт",
  fighter: "Истр",
  infantry: "Пех",
  specops: "Спец",
  armor: "Брон",
  scout: "Разв"
};

const UKRAINE_OUTLINE = [
  [22.15, 48.42], [22.38, 48.86], [22.62, 49.42], [23.10, 50.08], [23.66, 50.48],
  [23.72, 51.08], [24.18, 51.60], [25.12, 51.92], [26.25, 51.96], [27.20, 51.62],
  [28.35, 51.52], [29.36, 51.76], [30.36, 52.05], [31.35, 52.24], [32.25, 52.14],
  [33.08, 51.92], [34.02, 51.44], [34.88, 51.02], [35.72, 50.72], [36.62, 50.42],
  [37.58, 50.28], [38.40, 49.88], [39.12, 49.42], [40.02, 49.08], [39.88, 48.48],
  [39.34, 48.10], [39.88, 47.55], [39.18, 47.25], [38.38, 47.06], [37.68, 47.16],
  [37.15, 46.86], [36.45, 46.62], [35.72, 46.54], [35.18, 46.26], [34.62, 46.16],
  [33.95, 46.05], [33.70, 45.66], [33.82, 45.30], [33.20, 45.10], [32.58, 45.02],
  [32.35, 44.72], [33.05, 44.42], [33.86, 44.38], [34.70, 44.50], [35.44, 44.78],
  [36.16, 45.04], [36.66, 45.34], [36.28, 45.62], [35.35, 45.58], [34.52, 45.72],
  [33.82, 45.92], [33.12, 46.02], [32.20, 46.18], [31.55, 46.56], [30.72, 46.32],
  [30.12, 46.46], [29.56, 45.96], [28.92, 45.56], [28.36, 45.42], [28.16, 45.88],
  [28.68, 46.42], [28.02, 46.92], [27.20, 47.12], [26.48, 47.64], [25.68, 47.86],
  [24.96, 47.72], [24.12, 47.94], [23.34, 47.88], [22.74, 48.10]
];

const UKRAINE_PHOTO_OUTLINE = [
  [0.070, 0.198], [0.110, 0.178], [0.170, 0.178], [0.225, 0.188], [0.278, 0.220],
  [0.332, 0.235], [0.388, 0.214], [0.430, 0.170], [0.477, 0.203], [0.522, 0.212],
  [0.562, 0.245], [0.595, 0.283], [0.640, 0.300], [0.681, 0.332], [0.724, 0.368],
  [0.760, 0.418], [0.790, 0.470], [0.803, 0.520], [0.792, 0.566], [0.806, 0.620],
  [0.782, 0.662], [0.742, 0.698], [0.700, 0.720], [0.650, 0.742], [0.604, 0.780],
  [0.555, 0.805], [0.520, 0.835], [0.560, 0.870], [0.645, 0.865], [0.700, 0.900],
  [0.662, 0.940], [0.575, 0.925], [0.520, 0.892], [0.475, 0.845], [0.430, 0.810],
  [0.375, 0.782], [0.335, 0.720], [0.292, 0.690], [0.245, 0.655], [0.200, 0.646],
  [0.152, 0.662], [0.105, 0.640], [0.070, 0.590], [0.038, 0.535], [0.052, 0.475],
  [0.034, 0.430], [0.052, 0.360], [0.066, 0.292]
];

const RUSSIA_POLYGON = [
  [28.8, 56.55], [34.2, 56.15], [37.6, 55.75], [40.5, 55.25], [43.6, 54.2],
  [43.6, 46.2], [41.25, 49.85], [39.75, 47.35], [39.2, 51.35], [38.15, 55.55],
  [35.95, 51.25], [34.3, 53.15], [33.85, 56.15]
];

const ARCTIC_SEA_POLYGON = [
  [19.0, 56.6], [43.6, 56.6], [43.6, 55.2], [37.6, 55.75], [34.2, 56.15],
  [28.8, 56.55], [19.0, 56.55]
];

const BELARUS_POLYGON = [
  [23.25, 56.15], [34.20, 56.15], [33.90, 53.15], [31.25, 52.38], [28.80, 51.72],
  [26.15, 52.05], [23.30, 51.65]
];

const BLACK_SEA_POLYGON = [
  [27.5, 43.6], [41.0, 43.6], [41.0, 45.2], [38.0, 45.05], [36.0, 44.45],
  [33.2, 44.55], [31.0, 45.1], [29.0, 45.0], [27.5, 44.4]
];

const CONCEPT_MAP_CROP = {
  x: 306,
  y: 88,
  width: 1067,
  height: 701
};

const els = {};
let canvas;
let ctx;
let map;
let mapOverlay;
let unitSheet;
let vehicleCardsImage;
let btrCardImage;
let campaignCardsImage;
let cargoPlaneCardsImage;
let conceptImage;
let lastFrameTime = 0;
let resizeQueued = true;

const state = {
  day: 0,
  clock: 0,
  uiClock: 0,
  money: STARTING_MONEY,
  morale: 84,
  intel: 76,
  casualties: 0,
  enemyPower: 100,
  enemyBudget: ENEMY_STARTING_BUDGET,
  selectedRegionId: "kyiv",
  mode: "inspect",
  paused: false,
  gameOver: false,
  activeSection: "ops",
  activeTab: "targets",
  enemySupplyCut: false,
  nextNatoAidDay: NATO_AID_INTERVAL_DAYS,
  natoAidInterceptTimer: 0,
  regions: [],
  enemySites: [],
  threats: [],
  playerUnits: [],
  playerInstallations: [],
  playerMissiles: [],
  interceptors: [],
  effects: [],
  log: [],
  camera: {
    centerLat: (GAME_BOUNDS.north + GAME_BOUNDS.south) / 2,
    centerLng: (GAME_BOUNDS.east + GAME_BOUNDS.west) / 2,
    zoom: 1
  },
  pendingUnitType: null,
  pendingStrike: false,
  pendingDefenseAction: null,
  selectedUnitId: null,
  aiMemory: {
    weakRegionId: "kharkiv",
    lastDoctrine: "probe"
  },
  diplomacy: {
    status: "war",
    pending: false,
    aiInitiating: false,
    nextAiOfferAt: DIPLOMACY_FIRST_AI_DELAY,
    lastAiOfferDay: 0,
    aiSource: "checking",
    lastPlayerMessage: "",
    usedReplies: [],
    messages: []
  },
  aiTick: 0
};

if (typeof window !== "undefined") {
  window.__gameState = state;
}

const inputState = {
  pointerId: null,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  activeUnitId: null,
  previewGeo: null,
  moved: false,
  suppressNextClick: false
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  applyVisualMode();
  bindElements();
  loadUnitSheet();
  loadVehicleCardsImage();
  loadBtrCardImage();
  loadCampaignCardsImage();
  loadCargoPlaneCardsImage();
  loadConceptImage();
  resetGame();
  bindEvents();
  setupGoogleMaps();
  checkDiplomacyAiStatus();
  resizeCanvas();
  window.addEventListener("resize", () => {
    resizeQueued = true;
  });
  lastFrameTime = performance.now();
  requestAnimationFrame(loop);
}

function applyVisualMode() {
  const params = new URLSearchParams(window.location.search);
  document.body.classList.toggle("concept-fidelity", params.get("mode") === "concept");
}

function bindElements() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  els.googleMap = document.getElementById("googleMap");
  els.dayStat = document.getElementById("dayStat");
  els.moneyStat = document.getElementById("moneyStat");
  els.factoryIncomeStat = document.getElementById("factoryIncomeStat");
  els.moraleStat = document.getElementById("moraleStat");
  els.intelStat = document.getElementById("intelStat");
  els.casualtiesStat = document.getElementById("casualtiesStat");
  els.enemyStat = document.getElementById("enemyStat");
  els.selectedTitle = document.getElementById("selectedTitle");
  els.selectedStats = document.getElementById("selectedStats");
  els.modeHint = document.getElementById("modeHint");
  els.targetList = document.getElementById("targetList");
  els.incomingList = document.getElementById("incomingList");
  els.battleLog = document.getElementById("battleLog");
  els.overlayBanner = document.getElementById("overlayBanner");
  els.pauseBtn = document.getElementById("pauseBtn");
  els.railPauseBtn = document.getElementById("railPauseBtn");
  els.restartBtn = document.getElementById("restartBtn");
  els.mapsKeyInput = document.getElementById("mapsKeyInput");
  els.loadMapBtn = document.getElementById("loadMapBtn");
  els.fallbackMapBtn = document.getElementById("fallbackMapBtn");
  els.zoomInBtn = document.getElementById("zoomInBtn");
  els.zoomOutBtn = document.getElementById("zoomOutBtn");
  els.mapStatus = document.getElementById("mapStatus");
  els.threatCount = document.getElementById("threatCount");
  els.opsPanel = document.getElementById("opsPanel");
  els.diplomacyPanel = document.getElementById("diplomacyPanel");
  els.upgradesPanel = document.getElementById("upgradesPanel");
  els.diplomacyStatus = document.getElementById("diplomacyStatus");
  els.diplomacyAiStatus = document.getElementById("diplomacyAiStatus");
  els.diplomacyMessages = document.getElementById("diplomacyMessages");
  els.diplomacyForm = document.getElementById("diplomacyForm");
  els.diplomacyInput = document.getElementById("diplomacyInput");
  els.diplomacySendBtn = document.getElementById("diplomacySendBtn");
}

function loadUnitSheet() {
  unitSheet = new Image();
  unitSheet.onload = () => render();
  unitSheet.src = "assets/unit-icons-lite.jpg";
}

function loadVehicleCardsImage() {
  vehicleCardsImage = new Image();
  vehicleCardsImage.onload = () => render();
  vehicleCardsImage.src = "assets/vehicle-cards-lite.jpg";
}

function loadBtrCardImage() {
  btrCardImage = new Image();
  btrCardImage.onload = () => render();
  btrCardImage.src = "assets/btr-card-generated-lite.jpg";
}

function loadCampaignCardsImage() {
  campaignCardsImage = new Image();
  campaignCardsImage.onload = () => render();
  campaignCardsImage.src = "assets/campaign-cards-lite.jpg";
}

function loadCargoPlaneCardsImage() {
  cargoPlaneCardsImage = new Image();
  cargoPlaneCardsImage.onload = () => render();
  cargoPlaneCardsImage.src = "assets/cargo-plane-cards-lite.jpg";
}

function loadConceptImage() {
  conceptImage = new Image();
  conceptImage.onload = () => render();
  conceptImage.src = "assets/concept-reference-lite.jpg";
}

function resetGame() {
  state.day = 0;
  state.clock = 0;
  state.uiClock = 0;
  state.money = STARTING_MONEY;
  state.morale = 84;
  state.intel = 76;
  state.casualties = 0;
  state.enemyPower = 100;
  state.enemyBudget = ENEMY_STARTING_BUDGET;
  state.selectedRegionId = "kyiv";
  state.mode = "inspect";
  state.paused = false;
  state.gameOver = false;
  state.activeSection = "ops";
  state.enemySupplyCut = false;
  state.nextNatoAidDay = NATO_AID_INTERVAL_DAYS;
  state.natoAidInterceptTimer = 0;
  state.threats = [];
  state.playerUnits = [];
  state.playerInstallations = [];
  state.playerMissiles = [];
  state.interceptors = [];
  state.effects = [];
  state.log = [];
  state.camera = {
    centerLat: (GAME_BOUNDS.north + GAME_BOUNDS.south) / 2,
    centerLng: (GAME_BOUNDS.east + GAME_BOUNDS.west) / 2,
    zoom: 1
  };
  state.pendingUnitType = null;
  state.pendingStrike = false;
  state.pendingPiercingStrike = false;
  state.pendingDefenseAction = null;
  state.selectedUnitId = null;
  state.aiTick = 0;
  state.aiMemory = { weakRegionId: "kharkiv", lastDoctrine: "probe" };
  state.diplomacy = {
    status: "war",
    pending: false,
    aiInitiating: false,
    nextAiOfferAt: state.clock + DIPLOMACY_FIRST_AI_DELAY + randomRange(20, 70),
    lastAiOfferDay: 0,
    aiSource: state.diplomacy?.aiSource || "checking",
    lastPlayerMessage: "",
    usedReplies: [],
    messages: [
      {
        role: "ai",
        text: "Вы правда хотите закончить войну? Тогда скажите прямо, что вы готовы предложить. Я могу обсуждать паузу огня, обмен и гарантии, но без конкретики давление не остановлю."
      }
    ]
  };
  state.diplomacy.messages = [];
  state.regions = REGION_DATA.map((region, index) => ({
    ...region,
    seed: index * 17 + 9,
    hp: 100,
    pvo: region.frontline ? 1 : 0,
    radar: region.id === "kyiv" ? 1 : 0,
    fort: region.frontline ? 1 : 0,
    fighters: 0,
    repairs: 0,
    pressure: 0,
    pvoCooldown: 0,
    captured: false
  }));
  state.enemySites = ENEMY_SITES.map((site) => ({
    ...site,
    maxHp: site.hp,
    found: false,
    destroyed: false,
    revealPulse: 0,
    pvo: /Аэродром|Авиа|Авиагруппа|Команд/i.test(site.type) ? 2 : 1,
    radar: /РЭБ|Команд|Пуск|РЛС/i.test(site.type) ? 2 : 1,
    pvoCooldown: randomRange(0, PVO_RELOAD_SECONDS * 0.35)
  }));
  addLog("Кампания началась. Сбивайте цели, зарабатывайте деньги и отправляйте разведдроны к российским объектам.", "warn");
  seedInitialThreats();
  updateHud();
}

function seedInitialThreats() {
  const wave = [
    ["infantry", "belgorodDepot", "kharkiv"],
    ["armor", "rostovHub", "donetsk"],
    ["cruise", "kurskLaunch", "dnipro"],
    ["helicopter", "rostovHub", "kharkiv"]
  ];
  for (const [typeId, siteId, regionId] of wave) {
    const origin = state.enemySites.find((site) => site.id === siteId) || state.enemySites[0];
    const target = getRegion(regionId) || getRegion("kyiv");
    if (origin && target) {
      spawnThreat(typeId, origin, target, 0.12);
    }
  }
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action));
  });
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      updateHud();
    });
  });
  document.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSection = button.dataset.section;
      updateHud();
    });
  });
  if (els.diplomacyForm) {
    els.diplomacyForm.addEventListener("submit", handleDiplomacySubmit);
  }
  canvas.addEventListener("pointerdown", handleCanvasPointerDown);
  canvas.addEventListener("pointermove", handleCanvasPointerMove);
  canvas.addEventListener("pointerup", handleCanvasPointerUp);
  canvas.addEventListener("pointercancel", handleCanvasPointerCancel);
  canvas.addEventListener("wheel", handleCanvasWheel, { passive: false });
  canvas.addEventListener("click", handleCanvasClick);
  if (els.zoomInBtn) {
    els.zoomInBtn.addEventListener("click", () => zoomCamera(0.18));
  }
  if (els.zoomOutBtn) {
    els.zoomOutBtn.addEventListener("click", () => zoomCamera(-0.18));
  }
  const togglePause = () => {
    state.paused = !state.paused;
    els.pauseBtn.textContent = state.paused ? ">" : "II";
    addLog(state.paused ? "Пауза." : "Игра продолжена.", "warn");
    updateHud();
  };
  els.pauseBtn.addEventListener("click", togglePause);
  if (els.railPauseBtn) {
    els.railPauseBtn.addEventListener("click", togglePause);
  }
  els.restartBtn.addEventListener("click", () => resetGame());
  els.loadMapBtn.addEventListener("click", () => {
    const key = els.mapsKeyInput.value.trim();
    if (!key) {
      setModeHint("Введите Google Maps API key или задайте его в config.js.");
      setMapStatus("Нужен Google Maps API key");
      return;
    }
    localStorage.setItem("ukraineDefenseMapsKey", key);
    loadGoogleMap(key);
  });
  els.fallbackMapBtn.addEventListener("click", () => {
    map = null;
    mapOverlay = null;
    localStorage.removeItem("ukraineDefenseMapsKey");
    els.googleMap.classList.remove("is-active");
    els.googleMap.innerHTML = "";
    setMapStatus("Локальная карта: Украина + запад России");
  });
}

function setupGoogleMaps() {
  const params = new URLSearchParams(window.location.search);
  const queryKey = params.get("mapsKey");
  const configKey = window.GAME_CONFIG && window.GAME_CONFIG.googleMapsApiKey;
  const savedKey = localStorage.getItem("ukraineDefenseMapsKey");
  const key = queryKey || configKey || savedKey || "";
  if (key) {
    els.mapsKeyInput.value = key;
    loadGoogleMap(key);
  }
}

async function checkDiplomacyAiStatus() {
  if (!els.diplomacyAiStatus) return;
  try {
    const response = await fetch("/api/ai-status", { cache: "no-store" });
    if (!response.ok) throw new Error(`AI status ${response.status}`);
    const result = await response.json();
    state.diplomacy.aiSource = result.live ? "live" : "fallback";
  } catch (error) {
    state.diplomacy.aiSource = "fallback";
  }
  updateHud();
}

function loadGoogleMap(apiKey) {
  setMapStatus("Загрузка Google Maps...");
  if (window.google && window.google.maps) {
    createGoogleMap();
    return;
  }
  window.__ukraineDefenseMapReady = () => createGoogleMap();
  const oldScript = document.querySelector("script[data-google-maps-game]");
  if (oldScript) {
    oldScript.remove();
  }
  const script = document.createElement("script");
  script.dataset.googleMapsGame = "true";
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    setMapStatus("Google Maps не загрузился. Проверьте ключ и домен.");
  };
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=__ukraineDefenseMapReady&language=ru&region=UA`;
  document.head.appendChild(script);
}

function createGoogleMap() {
  if (!window.google || !window.google.maps) {
    setMapStatus("Google Maps API недоступен");
    return;
  }
  map = new google.maps.Map(els.googleMap, {
    center: { lat: state.camera.centerLat, lng: state.camera.centerLng },
    zoom: 5,
    minZoom: 4,
    maxZoom: 8,
    mapTypeId: "terrain",
    clickableIcons: false,
    disableDefaultUI: true,
    gestureHandling: "none",
    keyboardShortcuts: false,
    restriction: {
      latLngBounds: {
        north: GOOGLE_MAP_BOUNDS.north,
        south: GOOGLE_MAP_BOUNDS.south,
        east: GOOGLE_MAP_BOUNDS.east,
        west: GOOGLE_MAP_BOUNDS.west
      },
      strictBounds: false
    },
    styles: [
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
      { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "on" }] },
      { featureType: "landscape", stylers: [{ saturation: -20 }, { lightness: 16 }] },
      { featureType: "water", stylers: [{ color: "#b8ceda" }] }
    ]
  });
  mapOverlay = new google.maps.OverlayView();
  mapOverlay.onAdd = function noop() {};
  mapOverlay.draw = function redraw() {
    render();
  };
  mapOverlay.onRemove = function noop() {};
  mapOverlay.setMap(map);
  els.googleMap.classList.add("is-active");
  setMapStatus("Google Maps фон включен: Украина + запад России");
  google.maps.event.addListener(map, "bounds_changed", () => render());
  setTimeout(() => render(), 150);
}

function loop(now) {
  const dt = Math.min(0.06, (now - lastFrameTime) / 1000 || 0);
  lastFrameTime = now;
  if (resizeQueued) {
    resizeCanvas();
    resizeQueued = false;
  }
  if (!state.paused && !state.gameOver) {
    updateSimulation(dt);
  }
  render();
  requestAnimationFrame(loop);
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function updateSimulation(dt) {
  state.clock += dt;
  state.uiClock += dt;
  if (state.clock >= (state.day + 1) * DAY_DURATION_SECONDS) {
    state.day += 1;
    collectDailyIncome();
  }
  if (isEnemySupplyCut()) {
    state.enemyBudget = 0;
  } else {
    state.enemyBudget += dt * enemyIncomeRate();
  }
  updateFactoryEconomy(dt);
  updateAirDefenseCooldowns(dt);
  updateInterceptors(dt);
  runEnemyAirDefense(dt);
  updatePlayerMissiles(dt);
  updatePlayerUnits(dt);
  updateNatoAidInterception(dt);
  updateThreats(dt);
  updateEffects(dt);
  updateEnemyAi(dt);
  updateDiplomacyInitiative(dt);
  updateRepairs(dt);
  checkEndState();
  if (state.uiClock > 0.25) {
    state.uiClock = 0;
    updateHud();
  }
}

function collectDailyIncome() {
  checkNatoAidSchedule();
  const income = Math.round(
    state.regions.reduce((sum, region) => {
      const hpFactor = Math.max(0.1, region.hp / 100);
      return sum + region.value * hpFactor * (region.captured ? 0.18 : 1) * 350;
    }, 0)
  );
  const intelGain = 5 + countPlayerRadars() * 2;
  state.money += income;
  state.intel += intelGain;
  addLog(`День ${state.day}: экономика дала ${formatMoney(income)} денег, разведка +${intelGain}.`, "good");
}

function checkNatoAidSchedule() {
  if (state.day < state.nextNatoAidDay) return;
  if (!state.playerUnits.some((unit) => unit.type === "natoCargo" && !unit.supplyAction && !unit.destroyed)) {
    spawnNatoAidPlane();
  }
  while (state.nextNatoAidDay <= state.day) {
    state.nextNatoAidDay += NATO_AID_INTERVAL_DAYS;
  }
}

function spawnNatoAidPlane() {
  const target = getRegion("kyiv") || state.regions[0];
  if (!target) return;
  const origin = { lat: 50.1, lng: WORLD_BOUNDS.west + 0.45 };
  const unitType = PLAYER_UNIT_TYPES.natoCargo;
  const unit = {
    id: cryptoId(),
    type: "natoCargo",
    lat: origin.lat,
    lng: origin.lng,
    target: { lat: target.lat, lng: target.lng },
    targetKind: "region",
    targetId: target.id,
    hp: 100,
    cooldown: 0,
    trail: [],
    cargoAmount: NATO_AID_AMOUNT,
    invulnerableUntil: state.clock + 8
  };
  state.playerUnits.push(unit);
  state.natoAidInterceptTimer = randomRange(10, 16);
  addEffect("pop", unit.lat, unit.lng, unitType.color);
  addLog(`НАТО отправило самолет с помощью: ${formatMoney(NATO_AID_AMOUNT)}. Если его собьют, деньги не придут.`, "good");
}

function updateNatoAidInterception(dt) {
  const cargo = state.playerUnits.find((unit) => unit.type === "natoCargo" && !unit.supplyAction && !unit.destroyed);
  if (!cargo || isEnemySupplyCut()) {
    state.natoAidInterceptTimer = 0;
    return;
  }
  if (cargo.invulnerableUntil && state.clock < cargo.invulnerableUntil) return;
  const site = pickNatoAidInterceptionSite(cargo);
  if (!site) return;
  state.natoAidInterceptTimer -= dt;
  if (state.natoAidInterceptTimer > 0) return;
  state.natoAidInterceptTimer = randomRange(18, 30) / natoAidDifficultyMultiplier();
  const hitChance = natoAidInterceptChance(site, cargo);
  launchInterceptor(site, cargo, Math.random() < hitChance, true);
  addLog(`РФ пытается перехватить самолет помощи НАТО. Шанс попадания: ${Math.round(hitChance * 100)}%.`, "bad");
}

function pickNatoAidInterceptionSite(cargo) {
  const candidates = state.enemySites
    .filter((site) => !site.destroyed && (site.pvo > 0 || site.radar > 0 || /Аэродром|Авиа|Команд/i.test(site.type)))
    .sort((a, b) => {
      const aScore = geoDistance(a, cargo) - (a.pvo || 0) * 0.42 - (a.radar || 0) * 0.24 - (a.threat || 0) * 0.015;
      const bScore = geoDistance(b, cargo) - (b.pvo || 0) * 0.42 - (b.radar || 0) * 0.24 - (b.threat || 0) * 0.015;
      return aScore - bScore;
    });
  return candidates[0] || null;
}

function natoAidInterceptChance(site, cargo) {
  const distancePenalty = Math.min(0.16, geoDistance(site, cargo) * 0.012);
  const defense = (site.pvo || 0) * 0.055 + (site.radar || 0) * 0.035;
  return clamp((0.20 + defense - distancePenalty) * natoAidDifficultyMultiplier(), 0.12, 0.44);
}

function natoAidDifficultyMultiplier() {
  if (state.ext?.difficulty === "hardcore") return 1.22;
  if (state.ext?.difficulty === "easy") return 0.72;
  return 1;
}

function updateThreats(dt) {
  const removed = [];
  for (const threat of state.threats) {
    const type = THREAT_TYPES[threat.type];
    const target = getRegion(threat.targetId);
    if (!target || target.captured) {
      removed.push(threat);
      continue;
    }

    threat.progress += type.speed * THREAT_SPEED_SCALE * dt * threat.speedMul;
    const routeTarget = getThreatRoutePoint(threat, target);
    const pos = interpolate(threat.origin, routeTarget, Math.min(1, threat.progress));
    threat.lat = pos.lat;
    threat.lng = pos.lng;

    runAirDefense(threat, dt);
    runGroundDefense(threat, dt);
    runFrontlineFirefight(threat, target, dt);

    threat.trail.push({ lat: threat.lat, lng: threat.lng, life: 1 });
    if (threat.trail.length > 22) {
      threat.trail.shift();
    }
    threat.trail.forEach((point) => {
      point.life -= dt * 1.6;
    });
    threat.trail = threat.trail.filter((point) => point.life > 0);

    if (threat.hp <= 0) {
      removed.push(threat);
      state.money += type.reward * 1000;
      state.intel += threat.type === "scout" ? 2 : 1;
      countThreatCasualties(threat, `Сбита цель ${type.name}`);
      addEffect("pop", threat.lat, threat.lng, type.color);
      addLog(`${type.name} сбит. +${formatMoney(type.reward * 1000)} денег.`, "good");
      continue;
    }

    if (threat.progress >= 1) {
      removed.push(threat);
      applyThreatDamage(threat, target);
    }
  }
  if (removed.length) {
    state.threats = state.threats.filter((threat) => !removed.includes(threat));
  }
}

function updatePlayerMissiles(dt) {
  const detonated = [];
  for (const missile of state.playerMissiles) {
    const liveTarget = getLiveTarget(missile.targetKind, missile.targetId);
    if (liveTarget) {
      missile.target = { lat: liveTarget.lat, lng: liveTarget.lng };
    }
    const distance = Math.max(0.18, geoDistance(missile.origin, missile.target));
    missile.progress = Math.min(1, missile.progress + (missile.speed * PLAYER_MISSILE_SPEED_SCALE * dt) / distance);
    const pos = interpolate(missile.origin, missile.target, missile.progress);
    missile.lat = pos.lat;
    missile.lng = pos.lng;
    missile.trail.push({ lat: missile.lat, lng: missile.lng, life: 1 });
    if (missile.trail.length > 18) missile.trail.shift();
    missile.trail.forEach((point) => {
      point.life -= dt * 2.1;
    });
    missile.trail = missile.trail.filter((point) => point.life > 0);
    if (missile.progress >= 1) {
      detonated.push(missile);
      detonatePlayerMissile(missile);
    }
  }
  if (detonated.length) {
    state.playerMissiles = state.playerMissiles.filter((missile) => !detonated.includes(missile));
  }
}

function updateInterceptorsLegacyLine986(dt) {
  const finished = [];
  for (const interceptor of state.interceptors) {
    const target = state.threats.find((threat) => threat.id === interceptor.targetId);
    if (!target) {
      finished.push(interceptor);
      continue;
    }
    interceptor.target = { lat: target.lat, lng: target.lng };
    const distance = Math.max(0.001, geoDistance(interceptor, interceptor.target));
    const step = Math.min(1, (interceptor.speed * INTERCEPTOR_SPEED_SCALE * dt) / distance);
    interceptor.lat += (interceptor.target.lat - interceptor.lat) * step;
    interceptor.lng += (interceptor.target.lng - interceptor.lng) * step;
    interceptor.trail.push({ lat: interceptor.lat, lng: interceptor.lng, life: 1 });
    if (interceptor.trail.length > 12) interceptor.trail.shift();
    interceptor.trail.forEach((point) => {
      point.life -= dt * 3;
    });
    interceptor.trail = interceptor.trail.filter((point) => point.life > 0);

    if (geoDistance(interceptor, target) < 0.07) {
      finished.push(interceptor);
      if (interceptor.hit) {
        target.hp = 0;
        addEffect("airburst", target.lat, target.lng, THREAT_TYPES[target.type].color);
        addLog(`ПВО сработало: ${THREAT_TYPES[target.type].name} сбит.`, "good");
      } else {
        addEffect("miss", target.lat, target.lng, "#facc15");
      }
    }
  }
  if (finished.length) {
    state.interceptors = state.interceptors.filter((interceptor) => !finished.includes(interceptor));
  }
}

function updatePlayerUnits(dt) {
  for (const unit of state.playerUnits) {
    movePlayerUnit(unit, dt);
    unit.cooldown = Math.max(0, unit.cooldown - dt);
    unit.trail.forEach((point) => {
      point.life -= dt * 1.4;
    });
    unit.trail = unit.trail.filter((point) => point.life > 0);

    if (unit.type === "recon") {
      runReconUnit(unit);
    } else if (unit.type === "fighter") {
      runFighterUnit(unit);
    } else if (unit.type === "helicopter") {
      runHelicopterUnit(unit);
    } else if (unit.type === "tank") {
      runTankUnit(unit, dt);
    } else if (unit.type === "btr") {
      runBtrUnit(unit, dt);
    } else if (unit.type === "soldiers") {
      runSoldierUnit(unit, dt);
    } else if (unit.type === "engineer") {
      runEngineerUnit(unit, dt);
    }
  }
  state.playerUnits = state.playerUnits.filter((unit) => !unit.destroyed);
}

function movePlayerUnitLegacyLine1050(unit, dt) {
  if (unit.type === "engineer" && unit.repairing) return;
  if (!unit.target) return;
  const type = PLAYER_UNIT_TYPES[unit.type];
  const liveTarget = getLiveTarget(unit.targetKind, unit.targetId);
  if (liveTarget) {
    unit.target = { lat: liveTarget.lat, lng: liveTarget.lng };
  }
  const distance = geoDistance(unit, unit.target);
  const impactDistance = type.pointRadius || 0.05;
  if (distance < impactDistance) {
    unit.lat = unit.target.lat;
    unit.lng = unit.target.lng;
    resolveUnitImpact(unit);
    unit.target = null;
    return;
  }
  const step = Math.min(1, (type.speed * PLAYER_UNIT_SPEED_SCALE * dt) / Math.max(0.001, distance));
  unit.lat += (unit.target.lat - unit.lat) * step;
  unit.lng += (unit.target.lng - unit.lng) * step;
  unit.trail.push({ lat: unit.lat, lng: unit.lng, life: 1 });
  if (unit.trail.length > 26) unit.trail.shift();
}

function getLiveTarget(kind, id) {
  if (!kind || !id) return null;
  if (kind === "threat") return state.threats.find((item) => item.id === id) || null;
  if (kind === "site") return state.enemySites.find((item) => item.id === id && !item.destroyed) || null;
  if (kind === "friendlyUnit") return state.playerUnits.find((item) => item.id === id && !item.destroyed) || null;
  if (kind === "installation") return state.playerInstallations.find((item) => item.id === id) || null;
  if (kind === "region") return getRegion(id) || null;
  return null;
}

function resolveUnitImpactLegacyLine1084(unit) {
  const type = PLAYER_UNIT_TYPES[unit.type];
  const amount = type.attackDamage || 30;
  const label = type.name;
  const impact = { lat: unit.lat, lng: unit.lng };
  if (unit.type === "recon") {
    addEffect("strike", impact.lat, impact.lng, type.color);
    applyTargetDamage(unit.targetKind, unit.targetId, amount, type.color, label, unit.id, impact);
    unit.destroyed = true;
    return;
  }
  if (unit.type === "fighter") {
    addEffect("airburst", impact.lat, impact.lng, type.color);
    applyTargetDamage(unit.targetKind, unit.targetId, amount, type.color, label, unit.id, impact);
    return;
  }
  if (unit.type === "helicopter") {
    addEffect("gunrun", impact.lat, impact.lng, type.color);
    applyTargetDamage(unit.targetKind, unit.targetId, amount, type.color, label, unit.id, impact);
    return;
  }
  if (unit.type === "tank") {
    addEffect("shell", impact.lat, impact.lng, type.color);
    applyTargetDamage(unit.targetKind, unit.targetId, amount, type.color, label, unit.id, impact);
    return;
  }
  addEffect("strike", impact.lat, impact.lng, type.color);
  applyTargetDamage(unit.targetKind, unit.targetId, amount, type.color, label, unit.id, impact);
}

function applyTargetDamageLegacyLine1114(kind, id, amount, color, sourceName, attackerId, impact) {
  if (kind === "threat") {
    const threat = state.threats.find((item) => item.id === id);
    if (threat) {
      threat.hp = 0;
      addEffect("airburst", threat.lat, threat.lng, THREAT_TYPES[threat.type].color);
      addLog(`${sourceName}: техника уничтожена (${THREAT_TYPES[threat.type].name}).`, "good");
      return true;
    }
  }
  if (kind === "site") {
    const site = state.enemySites.find((item) => item.id === id && !item.destroyed);
    if (site) {
      if (!site.found) revealSite(site);
      site.hp = clamp(site.hp - amount * 1.35, 0, site.maxHp);
      addLog(`${sourceName}: удар по объекту ${site.name}, урон ${Math.round(amount * 1.35)}.`, "good");
      finishSiteIfDestroyed(site);
      return true;
    }
  }
  if (kind === "friendlyUnit") {
    const friendly = state.playerUnits.find((item) => item.id === id && item.id !== attackerId);
    if (friendly) {
      friendly.hp = 0;
      friendly.destroyed = true;
      countPlayerUnitCasualties(friendly, `Friendly fire: уничтожен ${PLAYER_UNIT_TYPES[friendly.type].name}`);
      addEffect("strike", friendly.lat, friendly.lng, "#ef4444");
      addLog(`Friendly fire: ${sourceName} уничтожил свой юнит (${PLAYER_UNIT_TYPES[friendly.type].name}).`, "bad");
      return true;
    }
  }
  if (kind === "region") {
    const region = getRegion(id);
    if (region) {
      const damage = Math.max(10, amount * 0.72);
      region.hp = clamp(region.hp - damage, 0, 100);
      region.pressure += damage;
      state.morale = clamp(state.morale - damage * 0.10, 0, 100);
      addLog(`Friendly fire: ${sourceName} ударил по региону ${region.name}, урон ${Math.round(damage)}.`, "bad");
      return true;
    }
  }
  damageAtPoint(impact, amount, color, sourceName, attackerId);
  return false;
}

function damageAtPointLegacyLine1160(point, amount, color, sourceName, attackerId) {
  const threat = findNearestThreat(point, 0.72, false);
  if (threat) {
    threat.hp = Math.min(0, threat.hp - amount);
    addEffect("airburst", threat.lat, threat.lng, THREAT_TYPES[threat.type].color);
    addLog(`${sourceName}: удар по площади уничтожил ${THREAT_TYPES[threat.type].name}.`, "good");
    return;
  }
  const site = findNearestEnemySite(point, 0.95, true);
  if (site) {
    if (!site.found) revealSite(site);
    site.hp = clamp(site.hp - amount, 0, site.maxHp);
    addLog(`${sourceName}: удар по площади задел объект ${site.name}.`, "good");
    finishSiteIfDestroyed(site);
    return;
  }
  const friendly = findNearestFriendlyUnit(point, 0.56, attackerId);
  if (friendly) {
    friendly.hp = 0;
    friendly.destroyed = true;
    addLog(`Friendly fire: ${sourceName} уничтожил свой юнит в зоне удара.`, "bad");
    return;
  }
  const region = findNearestRegionGeo(point, 0.46);
  if (region) {
    const damage = Math.max(8, amount * 0.45);
    region.hp = clamp(region.hp - damage, 0, 100);
    region.pressure += damage;
    addLog(`Friendly fire: зона удара задела ${region.name}, урон ${Math.round(damage)}.`, "bad");
  }
}

function runReconUnitLegacyLine1192(unit) {
  if (unit.cooldown > 0) return;
  const type = PLAYER_UNIT_TYPES.recon;
  const target = findNearestEnemySite(unit, type.radius, true);
  if (!target || target.destroyed || target.found) return;
  revealSite(target);
  unit.cooldown = type.cooldown;
}

function runFighterUnitLegacyLine1201(unit) {
  if (unit.cooldown > 0) return;
  const type = PLAYER_UNIT_TYPES.fighter;
  const target = findNearestThreat(unit, type.radius, true);
  if (!target) return;
  unit.cooldown = type.cooldown;
  if (Math.random() < 0.58) {
    target.hp -= randomRange(18, 36);
    addEffect("pop", target.lat, target.lng, "#60a5fa");
    addLog(`${type.name} атаковал цель: ${THREAT_TYPES[target.type].name}.`, "good");
  } else {
    addEffect("miss", target.lat, target.lng, "#facc15");
  }
}

function runHelicopterUnitLegacyLine1216(unit) {
  if (unit.cooldown > 0) return;
  const type = PLAYER_UNIT_TYPES.helicopter;
  const target = findNearestThreat(unit, type.radius, false);
  if (!target) return;
  unit.cooldown = type.cooldown;
  target.hp -= randomRange(16, 30);
  addEffect("gunrun", target.lat, target.lng, type.color);
  addLog(`${type.name} отработал очередью по цели: ${THREAT_TYPES[target.type].name}.`, "good");
}

function runTankUnitLegacyLine1227(unit, dt) {
  if (unit.cooldown > 0) return;
  const type = PLAYER_UNIT_TYPES.tank;
  const target = findNearestThreat(unit, type.radius, false);
  if (target && !THREAT_TYPES[target.type].airborne) {
    unit.cooldown = type.cooldown;
    target.hp -= randomRange(18, 34);
    addEffect("shell", target.lat, target.lng, type.color);
    addLog(`${type.name} открыл огонь по цели: ${THREAT_TYPES[target.type].name}.`, "good");
    return;
  }
  const site = findNearestEnemySite(unit, type.radius, true);
  if (site && !site.destroyed) {
    if (!site.found) revealSite(site);
    unit.cooldown = type.cooldown;
    site.hp = clamp(site.hp - dt * randomRange(20, 32), 0, site.maxHp);
    addEffect("shell", site.lat, site.lng, type.color);
    finishSiteIfDestroyed(site);
  }
}

function runSoldierUnit(unit, dt) {
  const type = PLAYER_UNIT_TYPES.soldiers;
  const target = findNearestEnemySite(unit, type.radius, true);
  if (!target || target.destroyed) return;
  if (!target.found) {
    revealSite(target);
  }
  const damage = dt * randomRange(8, 14);
  target.hp = clamp(target.hp - damage, 0, target.maxHp);
  if (unit.cooldown <= 0) {
    unit.cooldown = type.cooldown;
    addEffect("strike", target.lat, target.lng, type.color);
    addLog(`${type.name} ведет наступление на объект: ${target.name}.`, "good");
  }
  finishSiteIfDestroyed(target);
}

function runAirDefenseLegacyLine1265(threat, dt) {
  const type = THREAT_TYPES[threat.type];
  if (!type.airborne) {
    return;
  }
  let fighterPressure = 0;
  let pvoStrength = 0;
  for (const region of state.regions) {
    if (region.captured) {
      continue;
    }
    const dist = geoDistance(threat, region);
    if (dist < 1.22 + region.radar * 0.28 && region.pvo > 0) {
      pvoStrength += region.pvo + region.radar * 0.35;
    }
    if (dist < 1.72 && region.fighters > 0 && (threat.type === "fighter" || threat.type === "helicopter" || threat.type === "cruise")) {
      fighterPressure += region.fighters * 0.38 * dt;
    }
  }

  if (pvoStrength > 0) {
    threat.pvoCooldown -= dt * Math.max(1, pvoStrength * 0.72);
    if (threat.pvoCooldown <= 0) {
      threat.pvoCooldown = randomRange(0.65, 1.15);
      if (Math.random() < 0.5) {
        threat.hp = 0;
        addLog(`ПВО сработало: ${type.name} сбит.`, "good");
      } else {
        addEffect("miss", threat.lat, threat.lng, "#facc15");
      }
    }
  }

  if (fighterPressure > 0) {
    const evasion = threat.type === "fighter" ? 0.58 : threat.type === "cruise" ? 0.70 : 1;
    threat.hp -= fighterPressure * 30 * evasion * randomRange(0.76, 1.20);
  }
}

function runGroundDefense(threat, dt) {
  const type = THREAT_TYPES[threat.type];
  if (type.airborne) {
    return;
  }
  const target = getRegion(threat.targetId);
  if (!target || threat.progress < 0.62) {
    return;
  }
  const defense = target.fort * 0.54 + target.fighters * 0.15 + (target.frontline ? 0.22 : 0.08);
  threat.hp -= defense * dt * 34 * randomRange(0.82, 1.12);
}

function runFrontlineFirefight(threat, region, dt) {
  if (!region || !region.frontline || !FRONTLINE_FIREFIGHT_TYPES.has(threat.type) || threat.progress < 0.48) return;
  const type = THREAT_TYPES[threat.type];
  const defense = 0.16 + region.fort * 0.28 + region.fighters * 0.04;
  const pressure = threat.type === "armor" ? 0.30 : threat.type === "infantry" ? 0.22 : 0.18;
  threat.hp -= defense * dt * 16 * randomRange(0.7, 1.25);
  region.pressure += pressure * dt;
  if (Math.random() < dt * 0.10) {
    region.hp = clamp(region.hp - randomRange(0.05, 0.18), 0, 100);
  }

  threat.firefightCooldown = (threat.firefightCooldown || randomRange(0.1, 0.55)) - dt;
  if (threat.firefightCooldown <= 0) {
    threat.firefightCooldown = randomRange(0.34, 0.85);
    const linePoint = interpolate(threat, region, randomRange(0.18, 0.42));
    addEffect("firefight", linePoint.lat + randomRange(-0.06, 0.06), linePoint.lng + randomRange(-0.08, 0.08), type.color);
    if (Math.random() < 0.34) {
      addCasualties(randomRange(threat.type === "armor" ? 2 : 4, threat.type === "armor" ? 7 : 13), `Перестрелка на фронте ${region.name}`);
    }
  }

  if (!threat.frontlineLogged && threat.progress > 0.60) {
    threat.frontlineLogged = true;
    addLog(`${type.name} вошла в огневой контакт на фронте: ${region.name}.`, "bad");
  }
}

function applyThreatDamageLegacyLine1344(threat, region) {
  const type = THREAT_TYPES[threat.type];
  if (threat.type === "scout") {
    state.aiMemory.weakRegionId = pickWeakRegion().id;
    state.enemyBudget += 14;
    addLog(`Разведдрон РФ нашел слабое место: ${getRegion(state.aiMemory.weakRegionId).name}.`, "bad");
    return;
  }
  let damage = type.damage * Math.max(0.35, 1 - region.fort * 0.14);
  region.hp = clamp(region.hp - damage, 0, 100);
  region.pressure += damage;
  state.morale = clamp(state.morale - damage * 0.15, 0, 100);
  addEffect("hit", region.lat, region.lng, type.color);
  addLog(`${type.name} ударил по региону ${region.name}. Инфраструктура -${Math.round(damage)}.`, "bad");
  if (region.hp <= 0 && !region.captured) {
    region.captured = true;
    state.morale = clamp(state.morale - 10, 0, 100);
    addLog(`${region.name}: инфраструктура выведена из строя. Нужен ремонт.`, "bad");
  }
}

function updateEffects(dt) {
  for (const effect of state.effects) {
    effect.life -= dt;
    effect.radius += effect.growth * dt;
  }
  state.effects = state.effects.filter((effect) => effect.life > 0);
  state.enemySites.forEach((site) => {
    if (site.revealPulse > 0) {
      site.revealPulse -= dt;
    }
  });
}

function updateEnemyAi(dt) {
  if (isEnemySupplyCut()) {
    state.enemyBudget = 0;
    return;
  }
  state.aiTick -= dt;
  if (state.aiTick > 0 || state.enemyBudget < 22 || state.threats.length >= ENEMY_MAX_ACTIVE_THREATS) {
    return;
  }
  state.aiTick = randomRange(ENEMY_AI_MIN_INTERVAL, ENEMY_AI_MAX_INTERVAL);
  const doctrine = chooseEnemyDoctrine();
  const target = chooseEnemyTarget(doctrine);
  const origin = chooseEnemyOrigin(doctrine);
  const wave = buildEnemyWave(doctrine);
  state.aiMemory.lastDoctrine = doctrine;
  for (const typeId of wave.types) {
    if (state.threats.length >= ENEMY_MAX_ACTIVE_THREATS) break;
    const cost = THREAT_TYPES[typeId].enemyCost;
    if (state.enemyBudget >= cost) {
      state.enemyBudget -= cost;
      spawnThreat(typeId, origin, target, wave.spread);
    }
  }
}

function chooseEnemyDoctrine() {
  const weak = pickWeakRegion();
  const defense = weak.pvo + weak.radar + weak.fighters + weak.fort;
  const strongAirDefense = state.regions.some((region) => !region.captured && (region.pvo + region.radar) >= 3);
  const discovered = state.enemySites.filter((site) => site.found && !site.destroyed).length;
  const destroyed = state.enemySites.filter((site) => site.destroyed).length;
  const roll = Math.random();
  if (strongAirDefense && roll < 0.24) return "sead";
  if (discovered >= 3 && roll < 0.22) return "retaliation";
  if (defense > 4 && roll < 0.36) return "sabotage";
  if (destroyed >= 4 && roll < 0.34) return "desperate_air";
  if (roll < 0.18) return "recon";
  if (roll < 0.43) return "saturation";
  if (roll < 0.66) return "ground_push";
  if (roll < 0.84) return "airstrike";
  return "ground_push";
}

function chooseEnemyTargetLegacyLine1421(doctrine) {
  const candidates = state.regions.filter((region) => !region.captured);
  let best = candidates[0] || state.regions[0];
  let bestScore = -Infinity;
  for (const region of candidates) {
    const defense = region.pvo * 9 + region.radar * 5 + region.fort * 6 + region.fighters * 8;
    let score = region.value * 2 + (100 - region.hp) * 0.45 - defense + randomRange(-7, 7);
    if (doctrine === "sead") score += region.pvo * 32 + region.radar * 18 + region.fighters * 12;
    if (region.id === state.aiMemory.weakRegionId) score += 20;
    if (region.frontline) score += doctrine === "ground_push" || doctrine === "sabotage" ? 16 : 5;
    if (doctrine === "saturation" && region.radar === 0) score += 12;
    if (score > bestScore) {
      bestScore = score;
      best = region;
    }
  }
  return best;
}

function chooseEnemyOrigin(doctrine) {
  const active = state.enemySites.filter((site) => !site.destroyed);
  if (!active.length) {
    return { lat: 50.3, lng: 40.5, name: "резервный район" };
  }
  return active.slice().sort((a, b) => {
    let scoreA = a.threat + Math.random() * 8;
    let scoreB = b.threat + Math.random() * 8;
    if (doctrine === "airstrike") {
      scoreA += /Аэродром|Авиагруппа|Морская/.test(a.type) ? 12 : 0;
      scoreB += /Аэродром|Авиагруппа|Морская/.test(b.type) ? 12 : 0;
    }
    if (doctrine === "saturation") {
      scoreA += /Склад|Пусковой/.test(a.type) ? 11 : 0;
      scoreB += /Склад|Пусковой/.test(b.type) ? 11 : 0;
    }
    if (doctrine === "sabotage") {
      scoreA += /Командный|РЭБ/.test(a.type) ? 9 : 0;
      scoreB += /Командный|РЭБ/.test(b.type) ? 9 : 0;
    }
    return scoreB - scoreA;
  })[0];
}

function buildEnemyWave(doctrine) {
  if (doctrine === "sead") return { types: ["cruise", Math.random() > 0.55 ? "shahed" : "fighter"], spread: 0.34 };
  if (doctrine === "recon") return { types: ["scout"], spread: 0.24 };
  if (doctrine === "saturation") return { types: ["shahed", Math.random() > 0.50 ? "infantry" : "cruise"], spread: 0.38 };
  if (doctrine === "airstrike") return { types: ["fighter", Math.random() > 0.52 ? "helicopter" : "infantry"], spread: 0.32 };
  if (doctrine === "sabotage") return { types: ["specops", Math.random() > 0.58 ? "infantry" : "shahed"], spread: 0.22 };
  if (doctrine === "desperate_air") return { types: ["fighter", Math.random() > 0.50 ? "cruise" : "shahed"], spread: 0.40 };
  if (doctrine === "retaliation") return { types: ["cruise", Math.random() > 0.60 ? "shahed" : "cruise"], spread: 0.32 };
  return { types: ["infantry", Math.random() > 0.46 ? "armor" : "infantry"], spread: 0.20 };
}

function spawnThreat(typeId, originSite, target, spread) {
  const type = THREAT_TYPES[typeId];
  const origin = {
    lat: originSite.lat + randomRange(-spread, spread),
    lng: originSite.lng + randomRange(-spread, spread)
  };
  const route = planThreatRoute(origin, target, typeId);
  const start = interpolate(origin, target, 0.02);
  state.threats.push({
    id: cryptoId(),
    type: typeId,
    targetId: target.id,
    origin,
    route,
    hp: type.hp,
    maxHp: type.hp,
    progress: 0,
    lat: start.lat,
    lng: start.lng,
    speedMul: randomRange(0.86, 1.22),
    pvoCooldown: randomRange(0.35, 0.9),
    trail: []
  });
  addLog(`ИИ РФ запустил: ${type.name} -> ${target.name}.`, typeId === "scout" ? "warn" : "bad");
}

function updateRepairs(dt) {
  for (const region of state.regions) {
    if (region.captured) {
      region.hp += (region.fort + region.repairs) * dt * 0.24;
      if (region.hp >= 32) {
        region.captured = false;
        addLog(`${region.name}: регион возвращен в строй.`, "good");
      }
    } else if (region.repairs > 0 && region.hp < 100) {
      region.hp = clamp(region.hp + region.repairs * dt * 0.42, 0, 100);
    }
    region.pressure = Math.max(0, region.pressure - dt * 0.35);
  }
}

function checkEndState() {
  const totalThreat = ENEMY_SITES.reduce((sum, site) => sum + site.threat, 0);
  const activeThreat = state.enemySites.filter((site) => !site.destroyed).reduce((sum, site) => sum + site.threat, 0);
  state.enemyPower = clamp(Math.round((activeThreat / totalThreat) * 100), 0, 100);
  const allEnemySitesDestroyed = state.enemySites.every((site) => site.destroyed);
  if (allEnemySitesDestroyed && !state.enemySupplyCut) {
    state.enemySupplyCut = true;
    state.enemyBudget = 0;
    addLog("Снабжение РФ отрезано: новые ракеты, танки, вертолеты и самолеты больше не выходят.", "good");
  }
  const noActiveEnemyWeapons = state.threats.length === 0 && !state.interceptors.some((item) => item.enemyOwned);
  if (allEnemySitesDestroyed && noActiveEnemyWeapons && !state.gameOver) {
    state.gameOver = true;
    state.paused = true;
    addLog("Победа: все объекты РФ уничтожены, активные атаки добиты.", "good");
    els.overlayBanner.innerHTML = "<strong>Победа:</strong> инфраструктура РФ уничтожена, новых поставок техники больше нет.";
  }
  if ((state.morale <= 0 || state.regions.every((region) => region.captured)) && !state.gameOver) {
    state.gameOver = true;
    state.paused = true;
    addLog("Поражение: инфраструктура страны не выдержала давления.", "bad");
    els.overlayBanner.innerHTML = "<strong>Поражение:</strong> слишком много регионов потеряли работоспособность.";
  }
}

function handleActionLegacyLine1541(action) {
  if (state.gameOver) return;
  state.pendingStrike = false;
  state.pendingPiercingStrike = false;
  state.pendingUnitType = null;
  state.pendingDefenseAction = null;
  if (DEFENSE_ACTIONS.has(action)) {
    queueDefensePlacement(action);
    return;
  }
  if (action === "launchRecon") {
    queueUnitPlacement("recon", action);
    return;
  }
  if (action === "launchStrike") {
    queueMissileStrike();
    return;
  }
  if (action === "buyFighters") {
    queueUnitPlacement("fighter", action);
    return;
  }
  if (action === "buyHelicopter") {
    queueUnitPlacement("helicopter", action);
    return;
  }
  if (action === "buyTank") {
    queueUnitPlacement("tank", action);
    return;
  }
  if (action === "buyBtr") {
    queueUnitPlacement("btr", action);
    return;
  }
  if (action === "deploySpecOps") {
    queueUnitPlacement("soldiers", action);
    return;
  }
  if (action === "manualIntercept") {
    state.mode = "intercept";
    setModeHint("Ручной пуск: кликните по летящей угрозе. Стоимость 70.");
    updateHud();
    return;
  }
  if (action === "launchRecon") {
    state.mode = "recon";
    setModeHint("Разведдрон: кликните район в России или у фронта. Стоимость 90.");
    updateHud();
    return;
  }
  if (action === "launchStrike") {
    state.mode = "strike";
    setModeHint("Ракетный удар: кликните найденную цель РФ. Стоимость 300.");
    updateHud();
    return;
  }
  if (action === "deploySpecOps") {
    state.mode = "specops";
    setModeHint("Спецгруппа: кликните найденную цель РФ. Стоимость 220.");
    updateHud();
    return;
  }

  const region = getSelectedRegion();
  if (!region) return;
  if (!spend(ACTIONS[action].cost)) {
    addLog("Недостаточно денег.", "warn");
    updateHud();
    return;
  }
  if (action === "buyPvo") {
    region.pvo += 1;
    addLog(`${region.name}: развернута батарея ПВО.`, "good");
  }
  if (action === "buyRadar") {
    region.radar += 1;
    state.intel += 10;
    addLog(`${region.name}: включен радар. Разведка +10.`, "good");
  }
  if (action === "buyFort") {
    region.fort += 1;
    addLog(`${region.name}: укрепления усилены.`, "good");
  }
  if (action === "repair") {
    region.repairs += 1;
    region.hp = clamp(region.hp + 20, 0, 100);
    if (region.hp > 30) region.captured = false;
    addLog(`${region.name}: ремонтные бригады восстановили инфраструктуру.`, "good");
  }
  if (action === "buyFighters") {
    region.fighters += 1;
    addLog(`${region.name}: поднята истребительная группа.`, "good");
  }
  state.mode = "inspect";
  updateHud();
}

function queueDefensePlacementLegacyLine1638(action) {
  if (!ACTIONS[action]) return;
  state.mode = "placeDefense";
  state.pendingDefenseAction = action;
  state.pendingUnitType = null;
  state.pendingStrike = false;
  setModeHint(`${DEFENSE_ACTION_LABELS[action] || ACTIONS[action].label}: кликните область Украины, где поставить.`);
  addLog(`${DEFENSE_ACTION_LABELS[action] || ACTIONS[action].label}: выберите область на карте.`, "warn");
  updateHud();
}

function applyDefenseActionLegacyLine1649(action, region) {
  if (!region || !ACTIONS[action]) return false;
  if (!spend(ACTIONS[action].cost)) {
    addLog("Недостаточно денег.", "warn");
    updateHud();
    return false;
  }
  state.selectedRegionId = region.id;
  if (action === "buyPvo") {
    region.pvo += 1;
    addLog(`${region.name}: развернута батарея ПВО.`, "good");
  } else if (action === "buyRadar") {
    region.radar += 1;
    state.intel += 10;
    addLog(`${region.name}: включен радар. Разведка +10.`, "good");
  } else if (action === "buyFort") {
    region.fort += 1;
    addLog(`${region.name}: укрепления усилены.`, "good");
  } else if (action === "repair") {
    region.repairs += 1;
    region.hp = clamp(region.hp + 20, 0, 100);
    if (region.hp > 30) region.captured = false;
    addLog(`${region.name}: ремонтные бригады восстановили инфраструктуру.`, "good");
  }
  state.mode = "inspect";
  state.pendingDefenseAction = null;
  updateHud();
  return true;
}

function queueUnitPlacement(typeId, action) {
  const unitType = PLAYER_UNIT_TYPES[typeId];
  if (!unitType) return;
  if (!spend(ACTIONS[action].cost)) {
    addLog("Недостаточно денег.", "warn");
    updateHud();
    return;
  }
  state.mode = "placeUnit";
  state.pendingUnitType = typeId;
  state.pendingStrike = false;
  state.pendingDefenseAction = null;
  const placeOnly = typeId === "tank" || typeId === "btr" || typeId === "soldiers" || isNavalUnitType(typeId);
  const repairOnly = typeId === "engineer";
  setModeHint(placeOnly
    ? `${unitType.name} куплен. Кликните точку карты, где его поставить. Потом зажмите и протяните, чтобы задать маршрут.`
    : repairOnly
      ? `${unitType.name} куплены. Кликните поврежденный регион или разрушенную точку, куда они должны дойти и ремонтировать 80 секунд.`
      : `${unitType.name} куплен. Кликните по цели или любой точке карты, куда его отправить.`);
  addLog(placeOnly
    ? `${unitType.name} готов к развертыванию. Поставьте его на карту.`
    : repairOnly
      ? `${unitType.name} готовы. Выберите поврежденную точку ремонта на карте.`
      : `${unitType.name} готов к вылету/выдвижению. Выберите цель или точку удара.`, "good");
  updateHud();
}

function queueMissileStrikeLegacyLine1706() {
  if (!spend(ACTIONS.launchStrike.cost)) {
    addLog("Недостаточно денег для ракетного удара.", "warn");
    updateHud();
    return;
  }
  state.mode = "strike";
  state.pendingStrike = true;
  state.pendingUnitType = null;
  state.pendingDefenseAction = null;
  setModeHint("Ракета куплена. Кликните по технике, объекту, своему юниту/региону или любой точке карты.");
  addLog("Ракета готова. Выберите цель или точку удара на карте.", "good");
  updateHud();
}

function placePendingUnit(geo) {
  const typeId = state.pendingUnitType;
  const unitType = PLAYER_UNIT_TYPES[typeId];
  if (!unitType) return;
  const unit = {
    id: cryptoId(),
    type: typeId,
    lat: geo.lat,
    lng: geo.lng,
    target: null,
    hp: 100,
    cooldown: randomRange(0.15, unitType.cooldown),
    trail: []
  };
  state.playerUnits.push(unit);
  state.selectedUnitId = unit.id;
  state.pendingUnitType = null;
  state.mode = "inspect";
  addEffect(typeId === "recon" ? "scan" : "pop", geo.lat, geo.lng, unitType.color);
  addLog(`${unitType.name} поставлен. Зажмите его и протяните, чтобы задать маршрут.`, "good");
  updateHud();
}

function selectMapTarget(point) {
  const threat = findThreatAt(point.x, point.y);
  if (threat) {
    return {
      kind: "threat",
      id: threat.id,
      lat: threat.lat,
      lng: threat.lng,
      label: THREAT_TYPES[threat.type].name
    };
  }
  const site = findSiteAt(point.x, point.y, true);
  if (site) {
    return {
      kind: "site",
      id: site.id,
      lat: site.lat,
      lng: site.lng,
      label: site.name
    };
  }
  const friendly = findPlayerUnitAt(point.x, point.y);
  if (friendly) {
    return {
      kind: "friendlyUnit",
      id: friendly.id,
      lat: friendly.lat,
      lng: friendly.lng,
      label: PLAYER_UNIT_TYPES[friendly.type].name
    };
  }
  const installation = findPlayerInstallationAt(point.x, point.y, true);
  if (installation) {
    return {
      kind: "installation",
      id: installation.id,
      lat: installation.lat,
      lng: installation.lng,
      label: repairTargetLabel(installation, "installation")
    };
  }
  const region = findRegionAt(point.x, point.y);
  if (region) {
    return {
      kind: "region",
      id: region.id,
      lat: region.lat,
      lng: region.lng,
      label: region.name
    };
  }
  const geo = screenToGeo(point.x, point.y);
  return {
    kind: "point",
    lat: clamp(geo.lat, WORLD_BOUNDS.south, WORLD_BOUNDS.north),
    lng: clamp(geo.lng, WORLD_BOUNDS.west, WORLD_BOUNDS.east),
    label: "точка карты"
  };
}

function selectMissileGroundTarget(point) {
  const threat = findThreatAt(point.x, point.y);
  if (threat) {
    if (THREAT_TYPES[threat.type].airborne) {
      setModeHint("Ракеты работают только по земле. Для воздушных целей используйте ПВО, авиацию или ручной пуск.");
      addLog("Ракета не может быть наведена на воздушную цель.", "warn");
      updateHud();
      return null;
    }
    return {
      kind: "threat",
      id: threat.id,
      lat: threat.lat,
      lng: threat.lng,
      label: THREAT_TYPES[threat.type].name
    };
  }

  const site = findSiteAt(point.x, point.y, true);
  if (site) {
    return {
      kind: "site",
      id: site.id,
      lat: site.lat,
      lng: site.lng,
      label: site.name
    };
  }

  const friendly = findPlayerUnitAt(point.x, point.y);
  if (friendly) {
    if (isAirbornePlayerUnit(friendly)) {
      setModeHint("Ракеты нельзя наводить по воздушным целям.");
      addLog("Ракета земля-земля: воздушная цель не выбрана.", "warn");
      updateHud();
      return null;
    }
    return {
      kind: "friendlyUnit",
      id: friendly.id,
      lat: friendly.lat,
      lng: friendly.lng,
      label: PLAYER_UNIT_TYPES[friendly.type].name
    };
  }

  const region = findRegionAt(point.x, point.y);
  if (region) {
    return {
      kind: "region",
      id: region.id,
      lat: region.lat,
      lng: region.lng,
      label: region.name
    };
  }

  const geo = screenToGeo(point.x, point.y);
  return {
    kind: "point",
    lat: clamp(geo.lat, WORLD_BOUNDS.south, WORLD_BOUNDS.north),
    lng: clamp(geo.lng, WORLD_BOUNDS.west, WORLD_BOUNDS.east),
    label: "точка земли"
  };
}

function isAirbornePlayerUnit(unit) {
  return unit && (unit.type === "recon" || unit.type === "attackDrone" || unit.type === "fighter" || unit.type === "helicopter");
}

function isAirborneTargetSpec(targetSpec) {
  if (!targetSpec) return false;
  if (targetSpec.kind === "threat") {
    const threat = state.threats.find((item) => item.id === targetSpec.id);
    return threat ? THREAT_TYPES[threat.type].airborne : false;
  }
  if (targetSpec.kind === "friendlyUnit") {
    const unit = state.playerUnits.find((item) => item.id === targetSpec.id);
    return isAirbornePlayerUnit(unit);
  }
  return false;
}

function deployPendingUnit(targetSpec) {
  const typeId = state.pendingUnitType;
  const unitType = PLAYER_UNIT_TYPES[typeId];
  if (!unitType) return;
  if (typeId === "engineer") {
    const repairTarget = normalizeRepairTarget(targetSpec);
    if (!repairTarget) {
      setModeHint("Инженерам нужна поврежденная цель: регион, завод, ПВО или РЛС.");
      addLog("Инженеры ждут точку ремонта: выберите поврежденный объект.", "warn");
      updateHud();
      return;
    }
    targetSpec = repairTarget;
  }
  const navalOnly = isNavalUnitType(typeId);
  if (navalOnly && !isSeaTargetSpec(targetSpec)) {
    rejectNavalLandTarget(unitType.name);
    return;
  }
  const originRegion = getSelectedRegion() || getRegion("kyiv") || state.regions[0];
  const placeOnly = typeId === "tank" || typeId === "btr" || typeId === "soldiers" || navalOnly;
  const spawnPoint = placeOnly ? targetSpec : originRegion;
  const unit = {
    id: cryptoId(),
    type: typeId,
    lat: clamp(spawnPoint.lat, WORLD_BOUNDS.south, WORLD_BOUNDS.north),
    lng: clamp(spawnPoint.lng, WORLD_BOUNDS.west, WORLD_BOUNDS.east),
    target: placeOnly ? null : { lat: targetSpec.lat, lng: targetSpec.lng },
    targetKind: placeOnly ? null : targetSpec.kind,
    targetId: placeOnly ? null : targetSpec.id || null,
    hp: 100,
    cooldown: randomRange(0.15, unitType.cooldown),
    trail: []
  };
  state.playerUnits.push(unit);
  state.selectedUnitId = unit.id;
  state.pendingUnitType = null;
  state.mode = "inspect";
  addEffect(typeId === "recon" ? "scan" : "pop", unit.lat, unit.lng, unitType.color);
  addLog(placeOnly
    ? `${unitType.name}: поставлен на карту. Зажмите и протяните для маршрута.`
    : typeId === "engineer"
      ? `${unitType.name}: идут к цели ремонта (${targetSpec.label}).`
    : `${unitType.name}: цель выбрана (${targetSpec.label}).`, "good");
  updateHud();
}

function normalizeRepairTarget(targetSpec) {
  if (!targetSpec) return null;
  if (targetSpec.kind === "installation") {
    const installation = state.playerInstallations.find((item) => item.id === targetSpec.id);
    if (isRepairableInstallation(installation)) {
      return {
        kind: "installation",
        id: installation.id,
        lat: installation.lat,
        lng: installation.lng,
        label: repairTargetLabel(installation, "installation")
      };
    }
  }
  if (targetSpec.kind === "region") {
    const region = getRegion(targetSpec.id);
    if (region && (region.captured || region.hp < 99.5)) {
      return {
        kind: "region",
        id: region.id,
        lat: region.lat,
        lng: region.lng,
        label: region.name
      };
    }
  }
  const point = {
    lat: targetSpec.lat,
    lng: targetSpec.lng
  };
  const installation = findNearestRepairableInstallation(point, 1.25);
  if (installation) {
    return {
      kind: "installation",
      id: installation.id,
      lat: installation.lat,
      lng: installation.lng,
      label: repairTargetLabel(installation, "installation")
    };
  }
  const region = findNearestRegionGeo(point, 1.8);
  if (region && (region.captured || region.hp < 99.5)) {
    return {
      kind: "region",
      id: region.id,
      lat: region.lat,
      lng: region.lng,
      label: region.name
    };
  }
  return null;
}

function isRepairableInstallation(installation) {
  return Boolean(installation && (installation.destroyed || installation.hp < installation.maxHp - 0.5));
}

function findNearestRepairableInstallation(point, radius) {
  let best = null;
  let bestDist = Infinity;
  for (const installation of state.playerInstallations) {
    if (!isRepairableInstallation(installation)) continue;
    const dist = geoDistance(point, installation);
    if (dist < radius && dist < bestDist) {
      best = installation;
      bestDist = dist;
    }
  }
  return best;
}

function handleCanvasClickLegacyLine2000(event) {
  if (inputState.suppressNextClick) {
    inputState.suppressNextClick = false;
    return;
  }
  const point = getCanvasPoint(event);
  if (state.mode === "placeDefense") {
    const region = findRegionAt(point.x, point.y);
    if (!region) {
      setModeHint("Кликните именно по области Украины, чтобы поставить оборону.");
      return;
    }
    applyDefenseAction(state.pendingDefenseAction, region);
    return;
  }
  if (state.mode === "placeUnit") {
    deployPendingUnit(selectMapTarget(point));
    return;
  }
  if (state.mode === "strike" && state.pendingStrike) {
    launchPlayerMissileAtTarget(selectMapTarget(point));
    state.pendingStrike = false;
    state.mode = "inspect";
    setModeHint("Ракета летит к выбранной цели.");
    updateHud();
    return;
  }
  if (state.mode === "intercept") {
    const threat = findThreatAt(point.x, point.y);
    if (threat) {
      manualIntercept(threat);
    } else {
      setModeHint("Кликните ближе к значку летящей угрозы.");
    }
    return;
  }
  if (state.mode === "recon") {
    launchReconDrone(screenToGeo(point.x, point.y));
    return;
  }
  if (state.mode === "strike" || state.mode === "specops") {
    const site = findSiteAt(point.x, point.y);
    if (!site) {
      setModeHint("Сначала найдите объект разведкой, затем кликните красную метку.");
      return;
    }
    if (state.mode === "strike") {
      strikeEnemySite(site);
    } else {
      specOpsRaid(site);
    }
    return;
  }
  const unit = findPlayerUnitAt(point.x, point.y);
  if (unit) {
    state.selectedUnitId = unit.id;
    const type = PLAYER_UNIT_TYPES[unit.type];
    setModeHint(`${type.name}: зажмите и протяните по карте, чтобы задать маршрут.`);
    updateHud();
    return;
  }
  const region = findRegionAt(point.x, point.y);
  if (region) {
    state.selectedRegionId = region.id;
    setModeHint(`${region.name}: покупайте оборону или запускайте разведку.`);
    updateHud();
  }
}

function handleCanvasPointerDown(event) {
  const point = getCanvasPoint(event);
  inputState.pointerId = event.pointerId;
  inputState.startX = point.x;
  inputState.startY = point.y;
  inputState.lastX = point.x;
  inputState.lastY = point.y;
  inputState.moved = false;
  inputState.previewGeo = null;
  inputState.activeUnitId = null;

  const unitInputBlocked =
    (state.mode === "placeDefense" && state.pendingDefenseAction) ||
    (state.mode === "placeUnit" && state.pendingUnitType) ||
    (state.mode === "strike" && state.pendingStrike) ||
    state.mode === "intercept";
  const unit = unitInputBlocked ? null : findPlayerUnitAt(point.x, point.y);
  if (unit) {
    inputState.activeUnitId = unit.id;
    state.selectedUnitId = unit.id;
  }

  if (canvas.setPointerCapture) {
    canvas.setPointerCapture(event.pointerId);
  }
}

function handleCanvasPointerMove(event) {
  if (inputState.pointerId !== event.pointerId) return;
  const point = getCanvasPoint(event);
  const total = Math.hypot(point.x - inputState.startX, point.y - inputState.startY);
  const dx = point.x - inputState.lastX;
  const dy = point.y - inputState.lastY;
  inputState.lastX = point.x;
  inputState.lastY = point.y;
  if (total < 4) return;
  inputState.moved = true;

  if (inputState.activeUnitId) {
    inputState.previewGeo = screenToGeo(point.x, point.y);
    render();
    return;
  }

  panCameraByPixels(dx, dy);
  inputState.suppressNextClick = true;
}

function handleCanvasPointerUp(event) {
  if (inputState.pointerId !== event.pointerId) return;
  if (inputState.activeUnitId && inputState.moved && inputState.previewGeo) {
    const unit = state.playerUnits.find((item) => item.id === inputState.activeUnitId);
    if (unit) {
      issueUnitCommand(unit, {
        kind: "point",
        lat: inputState.previewGeo.lat,
        lng: inputState.previewGeo.lng,
        label: "маршрут"
      });
    }
    inputState.suppressNextClick = true;
  }
  resetPointerInput(event.pointerId);
}

function handleCanvasPointerCancel(event) {
  resetPointerInput(event.pointerId);
}

function resetPointerInput(pointerId) {
  if (canvas.releasePointerCapture && pointerId !== null) {
    try {
      canvas.releasePointerCapture(pointerId);
    } catch (error) {
      // Pointer capture may already be released by the browser.
    }
  }
  inputState.pointerId = null;
  inputState.activeUnitId = null;
  inputState.previewGeo = null;
  inputState.moved = false;
}

function handleCanvasWheel(event) {
  event.preventDefault();
  zoomCamera(event.deltaY < 0 ? 0.14 : -0.14, getCanvasPoint(event));
}

function manualIntercept(threat) {
  if (!spend(ACTIONS.manualIntercept.cost)) {
    addLog("Недостаточно денег для ручного пуска.", "warn");
    return;
  }
  if (Math.random() < 0.35) {
    threat.hp = 0;
    addLog(`Ручной пуск успешен: ${THREAT_TYPES[threat.type].name} поражен.`, "good");
  } else {
    addEffect("miss", threat.lat, threat.lng, "#facc15");
    addLog(`Ручной пуск промахнулся: ${THREAT_TYPES[threat.type].name}.`, "warn");
  }
  state.mode = "inspect";
  updateHud();
}

function launchReconDrone(geo) {
  if (!spend(ACTIONS.launchRecon.cost)) {
    addLog("Недостаточно денег для разведдрона.", "warn");
    return;
  }
  state.intel += 8;
  addEffect("scan", geo.lat, geo.lng, "#38bdf8");
  const hidden = state.enemySites.filter((site) => !site.found && !site.destroyed);
  if (!hidden.length) {
    addLog("Разведка: новых скрытых целей не осталось.", "warn");
    state.mode = "inspect";
    updateHud();
    return;
  }
  const nearest = hidden.map((site) => ({ site, dist: geoDistance(site, geo) })).sort((a, b) => a.dist - b.dist)[0];
  const chance = clamp(0.62 + countPlayerRadars() * 0.10 - Math.min(0.22, nearest.dist * 0.04), 0.28, 0.95);
  if (Math.random() < chance) {
    revealSite(nearest.site);
  } else {
    addLog("Разведдрон район проверил, но цель не подтвердил. Попробуйте ближе к России или Черному морю.", "warn");
  }
  state.mode = "inspect";
  updateHud();
}

function revealSite(site) {
  site.found = true;
  site.revealPulse = 1.8;
  state.intel += 18;
  addEffect("scan", site.lat, site.lng, "#fb923c");
  addLog(`Разведка нашла цель РФ: ${site.name} (${site.type}).`, "good");
  state.activeTab = "targets";
}

function launchPlayerMissileAt(geo, siteId = null) {
  const originRegion = getSelectedRegion() || getRegion("kyiv") || state.regions[0];
  const target = {
    lat: clamp(geo.lat, WORLD_BOUNDS.south, WORLD_BOUNDS.north),
    lng: clamp(geo.lng, WORLD_BOUNDS.west, WORLD_BOUNDS.east)
  };
  state.playerMissiles.push({
    id: cryptoId(),
    origin: { lat: originRegion.lat, lng: originRegion.lng },
    target,
    siteId,
    lat: originRegion.lat,
    lng: originRegion.lng,
    progress: 0,
    speed: 1.32,
    trail: []
  });
  addEffect("pop", originRegion.lat, originRegion.lng, "#ef4444");
  addLog(`Ракета запущена: точка удара ${target.lat.toFixed(2)}, ${target.lng.toFixed(2)}.`, "good");
}

function launchPlayerMissileAtTargetLegacyLine2228(targetSpec) {
  const originRegion = getSelectedRegion() || getRegion("kyiv") || state.regions[0];
  const target = {
    lat: clamp(targetSpec.lat, WORLD_BOUNDS.south, WORLD_BOUNDS.north),
    lng: clamp(targetSpec.lng, WORLD_BOUNDS.west, WORLD_BOUNDS.east)
  };
  state.playerMissiles.push({
    id: cryptoId(),
    origin: { lat: originRegion.lat, lng: originRegion.lng },
    target,
    targetKind: targetSpec.kind,
    targetId: targetSpec.id || null,
    siteId: targetSpec.kind === "site" ? targetSpec.id : null,
    lat: originRegion.lat,
    lng: originRegion.lng,
    progress: 0,
    speed: 1.32,
    trail: []
  });
  addEffect("pop", originRegion.lat, originRegion.lng, "#ef4444");
  addLog(`Ракета запущена: цель ${targetSpec.label}.`, "good");
}

function detonatePlayerMissile(missile) {
  addEffect("strike", missile.target.lat, missile.target.lng, "#ef4444");
  if (missile.targetKind === "threat") {
    const threat = state.threats.find((item) => item.id === missile.targetId);
    if (threat) {
      if (THREAT_TYPES[threat.type].airborne) {
        addLog("Ракета ударила по земле: воздушная цель не поражена.", "warn");
        updateHud();
        return;
      }
      threat.hp = 0;
      addEffect("airburst", threat.lat, threat.lng, THREAT_TYPES[threat.type].color);
      addLog(`Ракета поразила технику: ${THREAT_TYPES[threat.type].name}.`, "good");
      updateHud();
      return;
    }
  }
  if (missile.targetKind === "friendlyUnit") {
    const friendly = state.playerUnits.find((item) => item.id === missile.targetId);
    if (friendly) {
      friendly.hp = 0;
      friendly.destroyed = true;
      countPlayerUnitCasualties(friendly, `Friendly fire: уничтожен ${PLAYER_UNIT_TYPES[friendly.type].name}`);
      addEffect("strike", friendly.lat, friendly.lng, "#ef4444");
      addLog(`Friendly fire: свой юнит уничтожен (${PLAYER_UNIT_TYPES[friendly.type].name}).`, "bad");
      state.playerUnits = state.playerUnits.filter((item) => !item.destroyed);
      updateHud();
      return;
    }
  }
  if (missile.targetKind === "region") {
    const region = getRegion(missile.targetId);
    if (region) {
      const damage = randomRange(34, 58);
      region.hp = clamp(region.hp - damage, 0, 100);
      region.pressure += damage;
      state.morale = clamp(state.morale - damage * 0.12, 0, 100);
      addCasualties(civilianCasualtiesFromDamage(damage, 1.55), `Friendly fire по ${region.name}`);
      addLog(`Friendly fire: удар по региону ${region.name}, урон ${Math.round(damage)}.`, "bad");
      updateHud();
      return;
    }
  }
  const directSite = missile.siteId ? state.enemySites.find((site) => site.id === missile.siteId) : null;
  const site = directSite && !directSite.destroyed
    ? directSite
    : findNearestEnemySite(missile.target, 1.18, true);
  if (!site || site.destroyed) {
    addLog("Ракета ударила по пустому сектору. Разведка нужна точнее.", "warn");
    updateHud();
    return;
  }
  const distance = geoDistance(site, missile.target);
  if (!site.found && distance <= 0.9) {
    revealSite(site);
  }
  if (!site.found) {
    addLog("Удар прошел рядом со скрытым объектом, но цель не подтверждена.", "warn");
    updateHud();
    return;
  }
  const accuracy = clamp(1 - distance / 1.35, 0.25, 1);
  const missileUpgrade = 1 + (Number(state.ext?.upgrades?.missiles) || 0) * 0.07;
  const damage = (randomRange(missile.piercing ? 115 : 54, missile.piercing ? 155 : 82) + state.intel * 0.08) * accuracy * missileUpgrade;
  site.hp = clamp(site.hp - damage, 0, site.maxHp);
  addLog(`${missile.piercing ? "Несбиваемая ракета" : "Ракетный удар"} по цели "${site.name}": урон ${Math.round(damage)}.`, "good");
  finishSiteIfDestroyed(site);
  updateHud();
}

function strikeEnemySite(site) {
  if (!site.found || site.destroyed) {
    addLog("По этой цели нельзя нанести удар.", "warn");
    return;
  }
  if (!spend(ACTIONS.launchStrike.cost)) {
    addLog("Недостаточно денег для ракетного удара.", "warn");
    return;
  }
  launchPlayerMissileAt({ lat: site.lat, lng: site.lng }, site.id);
  state.mode = "inspect";
  updateHud();
  return;
  const damage = randomRange(54, 82) + state.intel * 0.08;
  site.hp = clamp(site.hp - damage, 0, site.maxHp);
  addEffect("strike", site.lat, site.lng, "#ef4444");
  addLog(`Ракетный удар по цели "${site.name}": урон ${Math.round(damage)}.`, "good");
  finishSiteIfDestroyed(site);
  state.mode = "inspect";
  updateHud();
}

function specOpsRaid(site) {
  if (!site.found || site.destroyed) {
    addLog("Спецгруппа может работать только по найденной цели.", "warn");
    return;
  }
  if (!spend(ACTIONS.deploySpecOps.cost)) {
    addLog("Недостаточно денег для операции спецгруппы.", "warn");
    return;
  }
  const success = Math.random() < clamp(0.62 + state.intel * 0.002, 0.45, 0.86);
  if (success) {
    const damage = randomRange(32, 55);
    site.hp = clamp(site.hp - damage, 0, site.maxHp);
    addEffect("strike", site.lat, site.lng, "#a855f7");
    addLog(`Спецгруппа нанесла урон цели "${site.name}": ${Math.round(damage)}.`, "good");
    finishSiteIfDestroyed(site);
  } else {
    state.morale = clamp(state.morale - 2, 0, 100);
    addLog(`Операция спецгруппы по цели "${site.name}" сорвалась.`, "warn");
  }
  state.mode = "inspect";
  updateHud();
}

function finishSiteIfDestroyed(site) {
  if (site.hp > 0 || site.destroyed) return;
  site.destroyed = true;
  state.money += 420000;
  state.intel += 20;
  state.enemyBudget = Math.max(0, state.enemyBudget - 35);
  addCasualties(enemySiteCasualties(site), `Объект РФ уничтожен: ${site.name}`);
  addLog(`Цель РФ уничтожена: ${site.name}. +${formatMoney(420000)} денег.`, "good");
}

function spend(cost) {
  if (state.money < cost) return false;
  state.money -= cost;
  return true;
}

function updateHud() {
  els.dayStat.textContent = String(state.day);
  els.moneyStat.textContent = formatMoney(state.money);
  if (els.factoryIncomeStat) {
    const factoryMultiplier = 1 + (Number(state.ext?.upgrades?.factory) || 0) * 0.07;
    const factoryIncome = state.playerInstallations.reduce((sum, factory) => {
      if (factory.kind !== "factory" || factory.destroyed) return sum;
      return sum + factory.incomeRate * Math.max(0.15, factory.hp / factory.maxHp) * factoryMultiplier;
    }, 0);
    els.factoryIncomeStat.textContent = `Заводы: +${formatMoney(factoryIncome)} / сек`;
  }
  els.moraleStat.textContent = `${Math.round(state.morale)}%`;
  els.intelStat.textContent = `${Math.round(state.intel)}%`;
  if (els.casualtiesStat) {
    els.casualtiesStat.textContent = formatCasualties(state.casualties);
  }
  els.enemyStat.textContent = enemyPressureLabel();
  const selected = getSelectedRegion();
  els.selectedTitle.textContent = selected ? selected.name : "Выберите регион";
  els.selectedStats.innerHTML = selected ? selectedRegionHtml(selected) : `<div class="region-note">Кликните область на карте.</div>`;
  updateActionButtons(selected);
  updateTabs();
  updateCommandSection();
  updateTargetList();
  updateIncomingList();
  updateLog();
  updateDiplomacyPanel();
}

function formatMoney(value) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatCasualties(value) {
  return String(Math.max(0, Math.floor(value))).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function stripDiplomacySpeaker(text) {
  return String(text || "")
    .replace(/^\s*(путин\s*\(ии\)|путин|зеленский)\s*[:\-]\s*/i, "")
    .trim();
}

function enemyPressureLabel() {
  if (state.enemyPower >= 72) return "Высокий";
  if (state.enemyPower >= 38) return "Средний";
  return "Низкий";
}

function selectedRegionHtml(region) {
  const hpColor = region.hp > 65 ? "#10b981" : region.hp > 35 ? "#facc15" : "#ef4444";
  return `
    ${meterHtml("Инфраструктура", region.hp, hpColor)}
    ${meterHtml("Давление", Math.min(100, region.pressure), "#f97316")}
    <div class="region-loadout">
      <div class="loadout-cell"><span>ПВО</span><strong>${region.pvo}</strong></div>
      <div class="loadout-cell"><span>Радар</span><strong>${region.radar}</strong></div>
      <div class="loadout-cell"><span>Форт</span><strong>${region.fort}</strong></div>
      <div class="loadout-cell"><span>Авиа</span><strong>${region.fighters}</strong></div>
    </div>
    <div class="region-note">
      <strong>${region.infra}</strong>
      <span>${region.captured ? "Регион требует ремонта." : "Регион работает и приносит доход."}</span>
    </div>
  `;
}

function meterHtml(label, value, color) {
  const pct = clamp(value, 0, 100);
  return `
    <div class="stat-row">
      <header><span>${label}</span><strong>${Math.round(pct)}%</strong></header>
      <div class="track"><span style="width:${pct}%;background:${color}"></span></div>
    </div>
  `;
}

function updateActionButtonsLegacyLine2458(selected) {
  document.querySelectorAll("[data-action]").forEach((button) => {
    const action = button.dataset.action;
    const strategic = action === "launchRecon" || action === "launchStrike" || action === "deploySpecOps" || action === "manualIntercept" || action === "buyFighters";
    button.disabled = state.gameOver || state.money < ACTIONS[action].cost || (!selected && !strategic);
    button.classList.toggle("is-mode", modeMatchesAction(action));
  });
  if (state.mode === "inspect") {
    setModeHint(selected ? `${selected.name}: выберите покупку снизу или режим разведки/удара.` : "Кликните область на карте.");
  }
}

function modeMatchesActionLegacyLine2470(action) {
  if (state.mode === "placeUnit" && state.pendingUnitType) {
    return PLAYER_UNIT_TYPES[state.pendingUnitType].action === action;
  }
  return (
    (state.mode === "intercept" && action === "manualIntercept") ||
    (state.mode === "recon" && action === "launchRecon") ||
    (state.mode === "strike" && action === "launchStrike") ||
    (state.mode === "specops" && action === "deploySpecOps")
  );
}

function updateTabs() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === state.activeTab);
  });
  document.querySelectorAll(".intel-card [data-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === state.activeTab);
  });
}

function updateCommandSection() {
  const section = state.activeSection || "ops";
  document.querySelectorAll("[data-section]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.section === section);
  });
  if (els.opsPanel) els.opsPanel.hidden = section !== "ops";
  if (els.diplomacyPanel) els.diplomacyPanel.hidden = section !== "diplomacy";
  if (els.upgradesPanel) els.upgradesPanel.hidden = section !== "upgrades";
}

function updateDiplomacyPanelLegacyLine2500() {
  if (!els.diplomacyMessages) return;
  const statusText = {
    war: "война",
    talks: "переговоры",
    tense: "эскалация",
    ceasefire: "перемирие"
  }[state.diplomacy.status] || "война";
  if (els.diplomacyStatus) {
    els.diplomacyStatus.textContent = isEnemySupplyCut() ? `${statusText} | снабжение отрезано` : statusText;
  }
  if (els.diplomacyAiStatus) {
    const live = state.diplomacy.aiSource === "live";
    els.diplomacyAiStatus.textContent = live ? "AI live" : state.diplomacy.aiSource === "checking" ? "AI: проверка..." : "AI offline";
    els.diplomacyAiStatus.classList.toggle("is-live", live);
  }
  const visibleMessages = state.diplomacy.messages.slice(-10);
  els.diplomacyMessages.innerHTML = visibleMessages.length
    ? visibleMessages.map((message) => {
      const isUser = message.role === "user";
      const name = isUser ? "Зеленский" : "Путин";
      const place = isUser ? "Киев" : "Москва";
      const initials = isUser ? "З" : "П";
      return `
        <div class="diplomacy-msg ${isUser ? "user" : "ai"}">
          <span class="diplomacy-avatar">${initials}</span>
          <div class="diplomacy-bubble">
            <header><strong>${name}</strong><em>${place}</em></header>
            <span>${escapeHtml(stripDiplomacySpeaker(message.text))}</span>
          </div>
        </div>
      `;
    }).join("")
    : `
      <div class="diplomacy-msg ai">
        <span class="diplomacy-avatar">П</span>
        <div class="diplomacy-bubble">
          <header><strong>Путин</strong><em>Москва</em></header>
          <span>Вы правда хотите закончить войну? Тогда скажите прямо, что вы готовы предложить. Я могу обсуждать паузу огня, обмен и гарантии, но без конкретики давление не остановлю.</span>
        </div>
      </div>
    `;
  if (els.diplomacySendBtn) {
    els.diplomacySendBtn.disabled = state.diplomacy.pending || state.gameOver;
    els.diplomacySendBtn.textContent = state.diplomacy.pending ? "Ожидание ответа..." : "Отправить Путину";
  }
}

function updateDiplomacyInitiative() {
  if (state.gameOver || state.diplomacy.status === "ceasefire" || state.diplomacy.pending || state.diplomacy.aiInitiating) return;
  const lastMessage = state.diplomacy.messages[state.diplomacy.messages.length - 1];
  if (lastMessage && lastMessage.role === "ai") {
    state.diplomacy.nextAiOfferAt = Math.max(
      state.diplomacy.nextAiOfferAt,
      state.clock + DIPLOMACY_AI_COOLDOWN_MIN
    );
    return;
  }
  if (state.clock < state.diplomacy.nextAiOfferAt) return;

  const snapshot = diplomacySnapshot();
  let reason = "opening";
  if (snapshot.supplyCut || snapshot.enemySitesLeft <= 2) {
    reason = "enemy_near_defeat";
  } else if (snapshot.enemySitesDestroyed >= 4) {
    reason = "pressure";
  } else if (snapshot.morale <= 42 || snapshot.capturedRegions >= 3) {
    reason = "ultimatum";
  }

  state.diplomacy.nextAiOfferAt = state.clock + randomRange(DIPLOMACY_AI_COOLDOWN_MIN, DIPLOMACY_AI_COOLDOWN_MAX);
  state.diplomacy.lastAiOfferDay = state.day;
  requestAiInitiatedDiplomacy(reason, snapshot);
}

async function requestAiInitiatedDiplomacy(reason, snapshot) {
  state.diplomacy.aiInitiating = true;
  state.diplomacy.pending = true;
  state.activeSection = "diplomacy";
  updateHud();

  try {
    const response = await fetch("/api/diplomacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initiatedBy: "ai",
        reason,
        playerRole: "Зеленский",
        opponentRole: "Путин",
        message: aiInitiativePrompt(reason, snapshot),
        snapshot,
        history: state.diplomacy.messages.slice(-8),
        avoidPhrases: diplomacyAvoidPhrases()
      })
    });
    if (!response.ok) throw new Error(`Diplomacy API ${response.status}`);
    const result = await response.json();
    applyDiplomacyResult(result.source !== "openai"
      ? localAiInitiativeFallback(reason, snapshot)
      : normalizeDiplomacyResult(result, aiInitiativePrompt(reason, snapshot), snapshot), { initiatedByAi: true });
  } catch (error) {
    applyDiplomacyResult(localAiInitiativeFallback(reason, snapshot), { initiatedByAi: true });
  } finally {
    state.diplomacy.pending = false;
    state.diplomacy.aiInitiating = false;
    updateHud();
  }
}

function aiInitiativePrompt(reason, snapshot) {
  return [
    "Игровой Путин сам начинает личную переписку с Зеленским.",
    `Причина: ${reason}. Состояние игры: ${JSON.stringify(snapshot)}.`,
    "Напиши от первого лица короткое сообщение в чате без имени говорящего.",
    "Не спрашивай общую фразу 'вы хотите закончить войну'.",
    "Начни с конкретного намерения: пауза огня, обмен, гарантии, контроль, ультиматум или снижение ударов.",
    "Сразу назови условие, например: 'Предлагаю паузу огня...' или 'У меня жесткое условие...'."
  ].join(" ");
}

async function handleDiplomacySubmit(event) {
  event.preventDefault();
  if (!els.diplomacyInput || state.diplomacy.pending || state.gameOver) return;
  const message = els.diplomacyInput.value.trim();
  if (!message) return;
  els.diplomacyInput.value = "";
  state.activeSection = "diplomacy";
  state.diplomacy.pending = true;
  state.diplomacy.messages.push({ role: "user", text: message });
  updateHud();

  const snapshot = diplomacySnapshot();
  try {
    const response = await fetch("/api/diplomacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        playerRole: "Зеленский",
        opponentRole: "Путин",
        snapshot,
        history: state.diplomacy.messages.slice(-8),
        avoidPhrases: diplomacyAvoidPhrases()
      })
    });
    if (!response.ok) throw new Error(`Diplomacy API ${response.status}`);
    const result = await response.json();
    applyDiplomacyResult(normalizeDiplomacyResult(result, message, snapshot));
  } catch (error) {
    applyDiplomacyResult(localDiplomacyFallback(message, snapshot));
  } finally {
    state.diplomacy.pending = false;
    updateHud();
  }
}

function diplomacySnapshot() {
  return {
    morale: Math.round(state.morale),
    enemyPower: state.enemyPower,
    activeThreats: state.threats.length,
    enemySitesLeft: state.enemySites.filter((site) => !site.destroyed).length,
    enemySitesDestroyed: state.enemySites.filter((site) => site.destroyed).length,
    capturedRegions: state.regions.filter((region) => region.captured).length,
    supplyCut: isEnemySupplyCut(),
    enemyBudget: Math.round(state.enemyBudget)
  };
}

function normalizeDiplomacyResultLegacyLine2662(result, message, snapshot) {
  const fallback = localDiplomacyFallback(message, snapshot);
  return {
    reply: typeof result?.reply === "string" && result.reply.trim() ? stripDiplomacySpeaker(result.reply.trim()) : fallback.reply,
    effect: ["ceasefire", "deescalate", "escalate", "aid", "none"].includes(result?.effect) ? result.effect : fallback.effect,
    intensity: clamp(Number(result?.intensity) || fallback.intensity || 1, 0.5, 3),
    source: result?.source === "openai" ? "live" : result?.source === "fallback" ? "fallback" : fallback.source || "fallback"
  };
}

function localDiplomacyFallbackLegacyLine2672(message, snapshot) {
  const text = message.toLowerCase();
  const ceasefire = /мир|перемир|останов|прекращ|огня|тишин/.test(text);
  const withdrawal = /вывод|уйд|выйд|границ|территор|оккупац/.test(text);
  const guarantees = /гарант|безопасн|наблюдател|контрол|оон|союзник|договор/.test(text);
  const exchange = /обмен|пленн|залож|гуманитар|коридор|детей|людей/.test(text);
  const pressureWords = /санкц|трибунал|ответствен|репарац|изол/.test(text);
  const threatWords = /угроз|удар|уничтож|ультимат|атака|разнес|снес|добь/.test(text);
  const question = /что|как|зачем|почему|сколько|какие|предлож|можете|даете|\?/.test(text);
  const profanity = /бля|сука|хуй|хуе|пизд|еба|ёба|муд[аи]к|нахуй|говн|дерьм|черт|твар/.test(text);
  const concreteTerms = [ceasefire, withdrawal, guarantees, exchange, pressureWords].filter(Boolean).length;
  const strongPosition = snapshot.supplyCut || snapshot.enemySitesLeft <= 2 || snapshot.enemySitesDestroyed >= 6;
  if (profanity) {
    const roughReplies = [
      "Ну вот это уже разговор без галстуков. Только мат сам по себе нихрена не решает: хотите остановить войну - кладите на стол прекращение огня, обмен и контроль линии.",
      "Можете орать сколько угодно, но я не подпишу пустую бумагу. Дайте конкретику: сколько часов тишины, кто проверяет, что с пленными, и что вы требуете по войскам.",
      "Если вы давите матом, я отвечу так же жестко: пустые понты меня не двигают. Нужна сделка, а не крик: огонь, обмен, гарантии, мониторинг."
    ];
    const reply = roughReplies[Math.floor(Math.random() * roughReplies.length)];
    return {
      effect: threatWords ? "escalate" : "none",
      intensity: threatWords ? 1.35 : 1.05,
      source: "fallback",
      reply: threatWords ? `${reply} Если дальше пойдут только угрозы, я усиливаю давление.` : reply
    };
  }
  if (question && !concreteTerms) {
    return {
      effect: "none",
      intensity: 1,
      source: "fallback",
      reply: "Что я могу предложить? Пауза огня на ограниченный срок, обмен пленными и гуманитарные коридоры. Но за это я хочу письменный механизм контроля и понятные гарантии, иначе это просто красивый текст."
    };
  }
  if ((ceasefire || withdrawal || guarantees || exchange) || snapshot.supplyCut) {
    if (strongPosition && (withdrawal || concreteTerms >= 3 || snapshot.supplyCut)) {
      return {
        effect: "ceasefire",
        intensity: 1.8,
        source: "fallback",
        reply: "Хорошо, я готов остановить новые пуски. Взамен вы фиксируете прекращение огня, обмен пленными и внешний контроль. По выводу войск я готов открыть отдельный протокол, но мне нужны гарантии, что это не будет использовано для новой атаки."
      };
    }
    if (concreteTerms >= 2) {
      return {
        effect: "deescalate",
        intensity: 1.45,
        source: "fallback",
        reply: `Это уже похоже на разговор. Я могу поставить часть ударов на паузу, если вы письменно фиксируете ${exchange ? "обмен и гуманитарные коридоры" : "режим тишины"} и ${guarantees ? "механизм гарантий" : "контроль выполнения"}. Что вы даете взамен, кроме слов?`
      };
    }
    return {
      effect: "none",
      intensity: 1,
      source: "fallback",
      reply: "Вы говорите о мире, но я не вижу условий. На сколько часов вы предлагаете тишину? Кто контролирует линию? Будет ли обмен пленными? Какие гарантии вы готовы дать?"
    };
  }
  if (threatWords) {
    return {
      effect: "escalate",
      intensity: 1.25,
      source: "fallback",
      reply: "Если вы пишете мне только угрозы, я отвечу давлением. Хотите закончить войну? Тогда предлагайте сделку: огонь, обмен, гарантии, контроль. Без этого я не останавливаюсь."
    };
  }
  return {
    effect: "none",
    intensity: 1,
    source: "fallback",
    reply: "Пока это не сделка, а заявление. Скажите прямо: что вы хотите от меня и что вы готовы дать взамен? Начнем с прекращения огня или с обмена?"
  };
}

function localAiInitiativeFallbackLegacyLine2746(reason, snapshot) {
  if (reason === "enemy_near_defeat" || snapshot.supplyCut) {
    return {
      effect: "deescalate",
      intensity: 1.5,
      reply: "Вы видите, что ситуация меняется. Я готов первым предложить паузу: прекращение огня на ограниченный срок, обмен пленными и гуманитарные коридоры. Вы готовы дать гарантии и контроль выполнения?"
    };
  }
  if (reason === "ultimatum") {
    return {
      effect: "escalate",
      intensity: 1.15,
      reply: "У вас проседают регионы. Я могу остановить часть ударов, но хочу встречный шаг: прекращение ударов по моим объектам и разговор о линии контроля. Если откажетесь без плана, я усилю давление."
    };
  }
  return {
    effect: "none",
    intensity: 1,
    reply: "Предлагаю короткую паузу огня и обмен пленными, но только с контролем выполнения. Назовите, кто следит за режимом тишины и какие гарантии вы ставите на стол."
  };
}

// Extended campaign systems: save, missions, technologies, resources, HQ, sea layer.
(function installExtendedCampaignSystems() {
  const EXT_SAVE_KEY = "ukraine-defense-campaign-save-v10-upgrades-stock";
  const EXT_VERSION = 10;
  let extResetCount = 0;
  let extUiBound = false;
  let extLastSavedText = "нет";

  ACTIONS.buyHQ = { cost: 650000, label: "Штаб" };
  ACTIONS.buySeaDrone = { cost: 240000, label: "Морской дрон" };
  ACTIONS.buyPatrolBoat = { cost: 520000, label: "Катер" };

  SHOP_ICON_INDEX.buyHQ = [1, 0];
  SHOP_ICON_INDEX.buySeaDrone = [1, 1];
  SHOP_ICON_INDEX.buyPatrolBoat = [2, 0];

  PLAYER_UNIT_TYPES.seaDrone = {
    name: "Морской дрон",
    action: "buySeaDrone",
    icon: "buySeaDrone",
    color: "#22d3ee",
    speed: 0.64,
    radius: 0.42,
    cooldown: 1.15,
    attackDamage: 70,
    pointRadius: 0.24,
    oneShot: true,
    naval: true
  };
  PLAYER_UNIT_TYPES.patrolBoat = {
    name: "Патрульный катер",
    action: "buyPatrolBoat",
    icon: "buyPatrolBoat",
    color: "#38bdf8",
    speed: 0.48,
    radius: 0.76,
    cooldown: 0.9,
    attackDamage: 34,
    pointRadius: 0.34,
    naval: true
  };
  THREAT_TYPES.seaDrone = {
    name: "Морской дрон РФ",
    hp: 26,
    speed: 0.023,
    damage: 16,
    reward: 90,
    enemyCost: 46,
    color: "#06b6d4",
    airborne: false,
    shape: "diamond",
    icon: "buySeaDrone"
  };

  const RESOURCE_COSTS = {};

  const DIFFICULTY_DEFS = {
    easy: { label: "Легкий", enemyIncome: 0.72, repair: 0.55, sea: 0.65, wave: 0.78 },
    normal: { label: "Нормальный", enemyIncome: 1, repair: 1, sea: 1, wave: 1 },
    hardcore: { label: "Хардкор", enemyIncome: 1.36, repair: 1.55, sea: 1.45, wave: 1.28 }
  };

  const UPGRADE_STEP = 0.07;
  const UPGRADE_COST = 5000000;
  const BASE_EQUIPMENT_STOCK = 15;
  const EQUIPMENT_SUPPLY_SECONDS = 120;
  const EQUIPMENT_SUPPLY_QTY = 15;

  const UPGRADE_DEFS = [
    { id: "pvo", title: "ПВО", desc: "+7% к шансу попадания по целям" },
    { id: "radar", title: "Радары", desc: "+7% к обнаружению и наведению" },
    { id: "factory", title: "Заводы", desc: "+7% к доходу заводов" },
    { id: "drones", title: "Дроны", desc: "+7% к урону ударных и морских дронов" },
    { id: "armor", title: "Бронетехника", desc: "+7% к эффективности танков и БТР" },
    { id: "aviation", title: "Авиация", desc: "+7% к эффективности вертолетов и истребителей" },
    { id: "missiles", title: "Ракеты", desc: "+7% к скорости и мощности ракет" },
    { id: "logistics", title: "Поставки", desc: "+7% к скорости поставки оружия и техники" }
  ];

  const EQUIPMENT_DEFS = {
    launchStrike: { label: "Обычные ракеты", icon: "launchStrike", cost: 2500000, qty: EQUIPMENT_SUPPLY_QTY },
    launchPiercingStrike: { label: "Несбиваемые ракеты", icon: "launchPiercingStrike", cost: 15000000, qty: EQUIPMENT_SUPPLY_QTY },
    launchRecon: { label: "Разведдроны", icon: "launchRecon", cost: 900000, qty: EQUIPMENT_SUPPLY_QTY },
    launchAttackDrone: { label: "Ударные дроны", icon: "launchAttackDrone", cost: 1200000, qty: EQUIPMENT_SUPPLY_QTY },
    buyFighters: { label: "Истребители", icon: "buyFighters", cost: 3200000, qty: EQUIPMENT_SUPPLY_QTY },
    buyHelicopter: { label: "Вертолеты", icon: "buyHelicopter", cost: 2600000, qty: EQUIPMENT_SUPPLY_QTY },
    buyTank: { label: "Танки", icon: "buyTank", cost: 2200000, qty: EQUIPMENT_SUPPLY_QTY },
    buyBtr: { label: "БТР", icon: "buyBtr", cost: 1800000, qty: EQUIPMENT_SUPPLY_QTY },
    deploySpecOps: { label: "Спецгруппы", icon: "deploySpecOps", cost: 1300000, qty: EQUIPMENT_SUPPLY_QTY },
    buySeaDrone: { label: "Морские дроны", icon: "buySeaDrone", cost: 1800000, qty: EQUIPMENT_SUPPLY_QTY },
    buyPatrolBoat: { label: "Катера", icon: "buyPatrolBoat", cost: 4000000, qty: EQUIPMENT_SUPPLY_QTY }
  };
  const EQUIPMENT_ACTIONS = new Set(Object.keys(EQUIPMENT_DEFS));
  const ROCKET_SUPPLY_ACTIONS = new Set(["launchStrike", "launchPiercingStrike"]);

  const TECH_DEFS = [
    { id: "pvoChance", title: "ПВО +10%", desc: "каждый уровень повышает шанс попадания", cost: 420000, intel: 8, max: 3 },
    { id: "radarRange", title: "Радары", desc: "больше зона обнаружения и наведения", cost: 340000, intel: 10, max: 3 },
    { id: "factoryOutput", title: "Заводы", desc: "больше денег от заводов", cost: 380000, intel: 6, max: 3 },
    { id: "droneStrike", title: "Дроны", desc: "ударные и морские дроны бьют сильнее", cost: 310000, intel: 7, max: 3 },
    { id: "armorDrill", title: "Броня", desc: "БТР и танки быстрее и сильнее", cost: 360000, intel: 6, max: 3 },
    { id: "missileSpeed", title: "Ракеты", desc: "ракеты быстрее доходят до цели", cost: 460000, intel: 12, max: 3 }
  ];

  const TECH_UI_LABELS = {
    pvoChance: { title: "ПВО +10%", desc: "каждый уровень повышает шанс попадания ПВО по целям" },
    radarRange: { title: "Радары", desc: "больше зона обнаружения и наведения" },
    factoryOutput: { title: "Заводы", desc: "заводы дают больше денег в секунду" },
    droneStrike: { title: "Дроны", desc: "ударные и морские дроны бьют сильнее" },
    armorDrill: { title: "Броня", desc: "БТР и танки быстрее и сильнее" },
    missileSpeed: { title: "Ракеты", desc: "ракеты быстрее доходят до цели" }
  };

  const COMMANDER_DEFS = [
    { id: "defense", name: "Командир ПВО", bonus: "лучше шанс ПВО" },
    { id: "logistics", name: "Логист", bonus: "техника дешевле в регионе" },
    { id: "engineer", name: "Инженерный штаб", bonus: "быстрее ремонт региона" },
    { id: "intel", name: "Разведштаб", bonus: "медленно дает разведку" }
  ];

  const MISSION_DEFS = [
    { id: "defendKyiv", title: "Защити Киев 5 минут", desc: "Киев должен оставаться рабочим", reward: { money: 650000, intel: 8 } },
    { id: "findMoscowFactory", title: "Найди завод под Москвой", desc: "разведкой подсвети московский завод", reward: { money: 500000, intel: 18 } },
    { id: "intercept10", title: "Перехвати 10 целей", desc: "сбивай ракеты, шахеды и авиацию", reward: { money: 720000 } },
    { id: "holdKharkiv", title: "Удержи Харьков 4 минуты", desc: "регион не должен быть выведен из строя", reward: { money: 580000 } }
  ];

  const BASE_UNIT_STATS = {};
  ["attackDrone", "seaDrone", "tank", "btr", "patrolBoat", "fighter", "helicopter"].forEach((typeId) => {
    if (PLAYER_UNIT_TYPES[typeId]) {
      BASE_UNIT_STATS[typeId] = {
        speed: PLAYER_UNIT_TYPES[typeId].speed,
        attackDamage: PLAYER_UNIT_TYPES[typeId].attackDamage
      };
    }
  });

  const baseBindElements = bindElements;
  const baseBindEvents = bindEvents;
  const baseResetGame = resetGame;
  const baseUpdateSimulation = updateSimulation;
  const baseUpdateHud = updateHud;
  const baseRender = render;
  const baseHandleAction = handleAction;
  const baseApplyDefenseActionAt = applyDefenseActionAt;
  const baseManualIntercept = manualIntercept;
  const baseSpend = spend;
  const basePvoHitChanceForTarget = pvoHitChanceForTarget;
  const baseNearbyRadarBoost = nearbyRadarBoost;
  const baseEnemyIncomeRate = enemyIncomeRate;
  const baseBuildEnemyWave = buildEnemyWave;
  const baseRoutePvoRisk = routePvoRisk;
  const baseResolveUnitImpact = resolveUnitImpact;
  const baseLaunchPlayerMissileAtTarget = launchPlayerMissileAtTarget;
  const baseFinishSiteIfDestroyed = finishSiteIfDestroyed;
  const baseCountThreatCasualties = countThreatCasualties;
  const baseCheckEndState = checkEndState;
  const baseDisableInstallation = disableInstallation;

  bindElements = function bindElementsWithExtendedSystems() {
    baseBindElements();
    installExtendedDom();
  };

  bindEvents = function bindEventsWithExtendedSystems() {
    baseBindEvents();
    bindExtendedEvents();
  };

  resetGame = function resetGameWithSaveLayer() {
    const shouldLoad = extResetCount === 0;
    extResetCount += 1;
    baseResetGame();
    ensureExtendedState(true);
    hideResultsOverlay();
    if (shouldLoad) {
      const loaded = loadGame();
      if (loaded) {
        addLog("Сохранение загружено: прогресс кампании восстановлен.", "good");
      }
    } else {
      clearSave();
      ensureExtendedState(true);
      addLog("Новая кампания: старое сохранение очищено.", "warn");
    }
    applyTechStats();
    updateExtendedHud();
  };

  updateSimulation = function updateSimulationWithExtendedSystems(dt) {
    baseUpdateSimulation(dt);
    updateExtendedSystems(dt);
  };

  updateHud = function updateHudWithExtendedSystems() {
    baseUpdateHud();
    updateExtendedHud();
  };

  render = function renderWithExtendedOverlays() {
    baseRender();
    drawExtendedOverlays();
  };

  handleAction = function handleActionWithExtendedSystems(action) {
    ensureExtendedState();
    if (action === "buyHQ") {
      return withSpendAction(action, () => buyHeadquarters());
    }
    if (action === "buySeaDrone") {
      return runEquipmentAction(action, () => queueUnitPlacement("seaDrone", action));
    }
    if (action === "buyPatrolBoat") {
      return runEquipmentAction(action, () => queueUnitPlacement("patrolBoat", action));
    }
    return runEquipmentAction(action, () => baseHandleAction(action));
  };

  applyDefenseActionAt = function applyDefenseActionAtWithResources(action, point) {
    return withSpendAction(action, () => baseApplyDefenseActionAt(action, point));
  };

  manualIntercept = function manualInterceptWithResources(threat) {
    return withSpendAction("manualIntercept", () => baseManualIntercept(threat));
  };

  spend = function spendWithResources(cost) {
    ensureExtendedState();
    const action = state.ext.pendingSpendAction;
    if (action && !hasActionResources(action)) {
      addLog(`Не хватает ресурсов: ${resourceShortageText(action)}.`, "warn");
      return false;
    }
    const adjustedCost = Math.round(cost * moneyCostMultiplier(action));
    const ok = baseSpend(adjustedCost);
    if (!ok) return false;
    if (action) {
      spendActionResources(action);
      state.ext.stats.moneySpent += adjustedCost;
    }
    return true;
  };

  pvoHitChanceForTarget = function pvoHitChanceWithTech(target) {
    ensureExtendedState();
    const techBonus = upgradeBonus("pvo");
    const commanderBonus = countCommanders("defense") * 0.025;
    return clamp(basePvoHitChanceForTarget(target) + techBonus + commanderBonus, 0.02, target?.type === "fighter" ? 0.45 : 0.82);
  };

  nearbyRadarBoost = function nearbyRadarBoostWithTech(point) {
    ensureExtendedState();
    return baseNearbyRadarBoost(point) + upgradeBonus("radar");
  };

  enemyIncomeRate = function enemyIncomeRateWithDifficulty() {
    ensureExtendedState();
    return baseEnemyIncomeRate() * difficultyDef().enemyIncome;
  };

  buildEnemyWave = function buildEnemyWaveWithDifficulty(doctrine) {
    ensureExtendedState();
    const wave = baseBuildEnemyWave(doctrine);
    if (state.ext.difficulty === "easy" && wave.types.length > 1 && Math.random() < 0.45) {
      return { types: [wave.types[0]], spread: wave.spread };
    }
    if (state.ext.difficulty === "hardcore" && Math.random() < 0.32) {
      const extra = Math.random() < 0.45 ? "fighter" : Math.random() < 0.65 ? "seaDrone" : "cruise";
      return { types: [...wave.types, extra], spread: wave.spread + 0.08 };
    }
    return wave;
  };

  routePvoRisk = function routePvoRiskWithDifficulty(a, b) {
    ensureExtendedState();
    const mult = state.ext.difficulty === "hardcore" ? 1.38 : state.ext.difficulty === "easy" ? 0.82 : 1;
    return baseRoutePvoRisk(a, b) * mult;
  };

  resolveUnitImpact = function resolveUnitImpactWithSeaLayer(unit) {
    if (unit && (unit.type === "seaDrone" || unit.type === "patrolBoat")) {
      const type = PLAYER_UNIT_TYPES[unit.type];
      const impact = unit.target ? { lat: unit.target.lat, lng: unit.target.lng } : { lat: unit.lat, lng: unit.lng };
      addEffect(unit.type === "seaDrone" ? "strike" : "gunrun", impact.lat, impact.lng, type.color);
      applyTargetDamage(unit.targetKind, unit.targetId, type.attackDamage, type.color, type.name, unit.id, impact);
      if (unit.type === "seaDrone") unit.destroyed = true;
      unit.cooldown = type.cooldown;
      return;
    }
    return baseResolveUnitImpact(unit);
  };

  launchPlayerMissileAtTarget = function launchPlayerMissileWithTech(targetSpec, options = {}) {
    const before = state.playerMissiles.length;
    const ok = baseLaunchPlayerMissileAtTarget(targetSpec, options);
    if (ok && state.playerMissiles.length > before) {
      const missile = state.playerMissiles[state.playerMissiles.length - 1];
      missile.speed *= upgradeFactor("missiles");
    }
    return ok;
  };

  finishSiteIfDestroyed = function finishSiteIfDestroyedWithStats(site) {
    const wasAlive = site && !site.destroyed;
    baseFinishSiteIfDestroyed(site);
    if (wasAlive && site.destroyed) {
      ensureExtendedState();
      state.ext.stats.destroyedSites += 1;
      state.ext.enemyRepairTimer = Math.min(state.ext.enemyRepairTimer, 18);
    }
  };

  countThreatCasualties = function countThreatCasualtiesWithMissions(threat, reason) {
    const counted = threat?.casualtiesCounted;
    baseCountThreatCasualties(threat, reason);
    if (threat && !counted && threat.casualtiesCounted) {
      ensureExtendedState();
      state.ext.stats.intercepts += 1;
    }
  };

  checkEndState = function checkEndStateWithResults() {
    const before = state.gameOver;
    baseCheckEndState();
    if (!before && state.gameOver) {
      showResultsOverlay(state.morale <= 0 || state.regions.every((region) => region.captured) ? "defeat" : "victory");
      saveGame(false);
    }
  };

  disableInstallation = function disableInstallationWithFactoryStock(installation, sourceName = "Удар") {
    const wasFactory = installation?.kind === "factory" && !installation.destroyed;
    const result = baseDisableInstallation(installation, sourceName);
    if (wasFactory && installation.destroyed) {
      ensureExtendedState();
      destroyFactoryStock(installation, sourceName);
    }
    return result;
  };

  window.addEventListener("beforeunload", () => saveGame(false));

  function ensureExtendedState(force = false) {
    if (!state.ext || force) {
      state.ext = {};
    }
    state.ext.resources = {};
    state.ext.tech = { ...(state.ext.tech || {}) };
    TECH_DEFS.forEach((tech) => {
      state.ext.tech[tech.id] = clamp(Number(state.ext.tech[tech.id]) || 0, 0, tech.max);
    });
    state.ext.commanders = { ...(state.ext.commanders || {}) };
    state.ext.hqRegions = { ...(state.ext.hqRegions || {}) };
    state.ext.missions = { ...(state.ext.missions || {}) };
    MISSION_DEFS.forEach((mission) => {
      state.ext.missions[mission.id] = state.ext.missions[mission.id] || { done: false, progress: 0 };
    });
    state.ext.stats = {
      intercepts: 0,
      destroyedSites: 0,
      moneySpent: 0,
      ...(state.ext.stats || {})
    };
    state.ext.difficulty = DIFFICULTY_DEFS[state.ext.difficulty] ? state.ext.difficulty : "normal";
    state.ext.enemyRepairTeams = Array.isArray(state.ext.enemyRepairTeams) ? state.ext.enemyRepairTeams : [];
    state.ext.enemyRepairTimer = Number.isFinite(state.ext.enemyRepairTimer) ? state.ext.enemyRepairTimer : 55;
    state.ext.seaThreatTimer = Number.isFinite(state.ext.seaThreatTimer) ? state.ext.seaThreatTimer : 42;
    state.ext.saveTimer = Number.isFinite(state.ext.saveTimer) ? state.ext.saveTimer : 0;
    if (!Object.prototype.hasOwnProperty.call(state.ext, "pendingSpendAction")) {
      state.ext.pendingSpendAction = null;
    }
    normalizeEquipmentState();
    hardenEnemySites();
    return state.ext;
  }

  function installExtendedDom() {
    if (document.getElementById("extendedSystemsPanel")) return;
    const opsPanel = document.getElementById("opsPanel");
    if (opsPanel) {
      opsPanel.insertAdjacentHTML("beforeend", `
        <button class="action-card" data-action="buyHQ">
          <span class="action-icon icon-hq"></span>
          <span><strong>Штаб</strong><small>открывает командиров для выбранного региона</small></span>
          <b>$ 650 000</b>
        </button>
        <button class="action-card" data-action="buySeaDrone">
          <span class="action-icon icon-sea-drone"></span>
          <span><strong>Морской дрон</strong><small>удар по кораблям, портам и объектам у моря</small></span>
          <b>$ 240 000</b>
        </button>
        <button class="action-card" data-action="buyPatrolBoat">
          <span class="action-icon icon-patrol-boat"></span>
          <span><strong>Катер</strong><small>морская поддержка и перехват дронов</small></span>
          <b>$ 520 000</b>
        </button>
      `);
    }

    const rightRail = document.querySelector(".right-rail");
    if (rightRail) {
      rightRail.insertAdjacentHTML("afterbegin", `
        <section class="extended-card" id="extendedSystemsPanel">
          <div class="panel-title">
            <h2>Кампания</h2>
            <span id="extendedSaveState">нет сохранения</span>
          </div>
          <div class="system-actions">
            <button type="button" data-save-now>Сохранить</button>
            <button type="button" data-clear-save>Сброс сейва</button>
          </div>
          <div class="nato-aid-status" id="natoAidStatus"></div>
          <div class="difficulty-row" id="difficultyRow"></div>
          <div class="system-block">
            <h3>Миссии</h3>
            <div class="mission-list" id="missionList"></div>
          </div>
          <div class="system-block">
            <h3>Командиры</h3>
            <div class="commander-list" id="commanderList"></div>
          </div>
        </section>
      `);
    }

    const mini = document.querySelector(".mini-map");
    if (mini) {
      mini.innerHTML = `
        <div class="mini-map-box extended-mini-map">
          <button type="button" data-jump-map="ua">UA</button>
          <button type="button" data-jump-map="moscow">Москва</button>
          <span class="mini-dot" id="miniCameraDot"></span>
        </div>
      `;
    }

    document.body.insertAdjacentHTML("beforeend", `
      <div class="result-overlay" id="resultOverlay" hidden>
        <div class="result-panel">
          <button type="button" class="result-close" data-close-results>×</button>
          <h2 id="resultTitle">Итоги</h2>
          <div class="result-grid" id="resultGrid"></div>
        </div>
      </div>
    `);
  }

  function bindExtendedEvents() {
    if (extUiBound) return;
    extUiBound = true;
    document.addEventListener("click", (event) => {
      const upgradeButton = event.target.closest("[data-upgrade]");
      if (upgradeButton) {
        buyUpgrade(upgradeButton.dataset.upgrade);
        return;
      }
      const supplyButton = event.target.closest("[data-supply-action]");
      if (supplyButton) {
        orderEquipmentSupply(supplyButton.dataset.supplyAction);
        return;
      }
      const techButton = event.target.closest("[data-tech]");
      if (techButton) {
        buyTechnology(techButton.dataset.tech);
        return;
      }
      const commanderButton = event.target.closest("[data-commander]");
      if (commanderButton) {
        assignCommander(commanderButton.dataset.commander);
        return;
      }
      const difficultyButton = event.target.closest("[data-difficulty]");
      if (difficultyButton) {
        setDifficulty(difficultyButton.dataset.difficulty);
        return;
      }
      const jumpButton = event.target.closest("[data-jump-map]");
      if (jumpButton) {
        jumpMiniMap(jumpButton.dataset.jumpMap);
        return;
      }
      if (event.target.closest("[data-save-now]")) {
        saveGame(true);
        updateHud();
        return;
      }
      if (event.target.closest("[data-clear-save]")) {
        clearSave();
        extResetCount = 1;
        baseResetGame();
        ensureExtendedState(true);
        applyTechStats();
        hideResultsOverlay();
        addLog("Сейв сброшен. Новая игра началась с 0 дня и стартовыми деньгами.", "warn");
        saveGame(false);
        updateHud();
        render();
        return;
        addLog("Сохранение удалено. Текущая игра продолжает идти.", "warn");
        updateHud();
        return;
      }
      if (event.target.closest("[data-close-results]")) {
        hideResultsOverlay();
      }
    });
  }

  function withSpendAction(action, callback) {
    ensureExtendedState();
    const previous = state.ext.pendingSpendAction;
    state.ext.pendingSpendAction = action || null;
    try {
      return callback();
    } finally {
      state.ext.pendingSpendAction = previous;
    }
  }

  function resourceCost(action) {
    return RESOURCE_COSTS[action] || null;
  }

  function hasActionResources(action) {
    const cost = resourceCost(action);
    if (!cost) return true;
    const resources = state.ext.resources;
    return Object.entries(cost).every(([key, value]) => (resources[key] || 0) >= value);
  }

  function spendActionResources(action) {
    const cost = resourceCost(action);
    if (!cost) return;
    Object.entries(cost).forEach(([key, value]) => {
      state.ext.resources[key] = Math.max(0, (state.ext.resources[key] || 0) - value);
    });
  }

  function resourceShortageText(action) {
    const names = { fuel: "топливо", ammo: "боеприпасы", rockets: "ракеты", naval: "морской ресурс" };
    const cost = resourceCost(action) || {};
    return Object.entries(cost)
      .filter(([key, value]) => (state.ext.resources[key] || 0) < value)
      .map(([key, value]) => `${names[key] || key} ${Math.ceil(state.ext.resources[key] || 0)}/${value}`)
      .join(", ");
  }

  function upgradeLevel(id) {
    return clamp(Number(state.ext?.upgrades?.[id]) || 0, 0, 99);
  }

  function upgradeBonus(id) {
    return upgradeLevel(id) * UPGRADE_STEP;
  }

  function upgradeFactor(id) {
    return 1 + upgradeBonus(id);
  }

  function activeFactories() {
    return state.playerInstallations.filter((item) => item.kind === "factory" && !item.destroyed);
  }

  function ensureFactoryStorage(factory) {
    if (!factory || factory.kind !== "factory") return null;
    factory.storage = factory.storage && typeof factory.storage === "object" ? factory.storage : {};
    EQUIPMENT_ACTIONS.forEach((action) => {
      factory.storage[action] = Math.max(0, Math.floor(Number(factory.storage[action]) || 0));
    });
    return factory.storage;
  }

  function factoryStorageTotal(factory) {
    const storage = ensureFactoryStorage(factory) || {};
    return Object.values(storage).reduce((sum, value) => sum + (Number(value) || 0), 0);
  }

  function factoryRocketStock(factory) {
    const storage = ensureFactoryStorage(factory) || {};
    return [...ROCKET_SUPPLY_ACTIONS].reduce((sum, action) => sum + (Number(storage[action]) || 0), 0);
  }

  function factoryRocketSpace(factory) {
    return Math.max(0, ROCKET_STORAGE_CAPACITY_PER_FACTORY - factoryRocketStock(factory));
  }

  function addEquipmentToFactory(factory, action, qty) {
    const storage = ensureFactoryStorage(factory);
    if (!storage) return 0;
    let amount = Math.max(0, Math.floor(Number(qty) || 0));
    if (ROCKET_SUPPLY_ACTIONS.has(action)) {
      amount = Math.min(amount, factoryRocketSpace(factory));
    }
    if (amount <= 0) return 0;
    storage[action] = (storage[action] || 0) + amount;
    return amount;
  }

  function normalizeEquipmentState() {
    state.ext.upgrades = state.ext.upgrades && typeof state.ext.upgrades === "object" ? state.ext.upgrades : {};
    UPGRADE_DEFS.forEach((upgrade) => {
      state.ext.upgrades[upgrade.id] = Math.max(0, Math.floor(Number(state.ext.upgrades[upgrade.id]) || 0));
    });

    state.ext.reserveStock = state.ext.reserveStock && typeof state.ext.reserveStock === "object" ? state.ext.reserveStock : {};
    if (!state.ext.equipmentInitialized) {
      EQUIPMENT_ACTIONS.forEach((action) => {
        if (!Number.isFinite(Number(state.ext.reserveStock[action]))) {
          state.ext.reserveStock[action] = BASE_EQUIPMENT_STOCK;
        }
      });
      state.ext.equipmentInitialized = true;
    }
    EQUIPMENT_ACTIONS.forEach((action) => {
      state.ext.reserveStock[action] = Math.max(0, Math.floor(Number(state.ext.reserveStock[action]) || 0));
    });

    state.ext.supplyOrders = Array.isArray(state.ext.supplyOrders) ? state.ext.supplyOrders : [];
    state.playerInstallations.forEach((installation) => {
      if (installation.kind === "factory") ensureFactoryStorage(installation);
    });
    distributeReserveStockToFactories();
  }

  function distributeReserveStockToFactories() {
    const factories = activeFactories();
    if (!factories.length) return;
    let cursor = 0;
    EQUIPMENT_ACTIONS.forEach((action) => {
      let amount = Math.max(0, Math.floor(Number(state.ext.reserveStock[action]) || 0));
      let guard = 0;
      while (amount > 0 && guard < factories.length * (ROCKET_STORAGE_CAPACITY_PER_FACTORY + 10)) {
        const factory = factories[cursor % factories.length];
        const added = addEquipmentToFactory(factory, action, 1);
        if (added > 0) amount -= added;
        cursor += 1;
        guard += 1;
        if (ROCKET_SUPPLY_ACTIONS.has(action) && factories.every((item) => factoryRocketSpace(item) <= 0)) break;
      }
      state.ext.reserveStock[action] = amount;
    });
  }

  function equipmentAvailable(action) {
    if (!EQUIPMENT_ACTIONS.has(action)) return Infinity;
    let total = Math.max(0, Math.floor(Number(state.ext.reserveStock?.[action]) || 0));
    for (const factory of activeFactories()) {
      const storage = ensureFactoryStorage(factory);
      total += Math.max(0, Math.floor(Number(storage[action]) || 0));
    }
    return total;
  }

  function consumeEquipmentStock(action) {
    if (!EQUIPMENT_ACTIONS.has(action)) return true;
    normalizeEquipmentState();
    const factories = activeFactories()
      .filter((factory) => (factory.storage?.[action] || 0) > 0)
      .sort((a, b) => (b.storage[action] || 0) - (a.storage[action] || 0));
    if (factories.length) {
      factories[0].storage[action] = Math.max(0, (factories[0].storage[action] || 0) - 1);
      return true;
    }
    if ((state.ext.reserveStock[action] || 0) > 0) {
      state.ext.reserveStock[action] -= 1;
      return true;
    }
    return false;
  }

  function ensureEquipmentAvailable(action) {
    if (!EQUIPMENT_ACTIONS.has(action)) return true;
    normalizeEquipmentState();
    if (equipmentAvailable(action) > 0) return true;
    const def = EQUIPMENT_DEFS[action];
    addLog(`${def.label}: склад пуст. Закажите поставку в меню улучшений.`, "warn");
    state.activeSection = "upgrades";
    updateHud();
    return false;
  }

  function runEquipmentAction(action, callback) {
    if (!ensureEquipmentAvailable(action)) return false;
    const moneyBefore = state.money;
    const result = withSpendAction(action, callback);
    if (EQUIPMENT_ACTIONS.has(action) && state.money < moneyBefore) {
      consumeEquipmentStock(action);
      updateHud();
    }
    return result;
  }

  function chooseStorageFactory(action = null) {
    const factories = activeFactories()
      .filter((factory) => !ROCKET_SUPPLY_ACTIONS.has(action) || factoryRocketSpace(factory) > 0);
    if (!factories.length) return null;
    return factories.slice().sort((a, b) => factoryStorageTotal(a) - factoryStorageTotal(b))[0];
  }

  function supplyDurationSeconds() {
    return clamp(EQUIPMENT_SUPPLY_SECONDS / upgradeFactor("logistics"), 35, EQUIPMENT_SUPPLY_SECONDS);
  }

  function pendingSupplyForAction(action) {
    const timerOrder = state.ext.supplyOrders.find((order) => order.action === action && !order.lost);
    if (timerOrder) return { kind: "timer", order: timerOrder };
    const plane = state.playerUnits.find((unit) => unit.type === "natoCargo" && unit.supplyAction === action && !unit.destroyed);
    if (!plane) return null;
    const dist = plane.target ? geoDistance(plane, plane.target) : 0;
    const total = Math.max(0.001, plane.supplyDistanceTotal || dist || 1);
    const remaining = Math.ceil(dist / Math.max(0.001, PLAYER_UNIT_TYPES.natoCargo.speed * PLAYER_UNIT_SPEED_SCALE));
    return {
      kind: "air",
      plane,
      remaining,
      progress: clamp(100 - (dist / total) * 100, 0, 100)
    };
  }

  function spawnRocketSupplyPlane(action, factory, def) {
    const origin = { lat: 50.1, lng: WORLD_BOUNDS.west + 0.45 };
    const target = { lat: factory.lat, lng: factory.lng };
    const unitType = PLAYER_UNIT_TYPES.natoCargo;
    const unit = {
      id: cryptoId(),
      type: "natoCargo",
      lat: origin.lat,
      lng: origin.lng,
      target,
      targetKind: "installation",
      targetId: factory.id,
      hp: 100,
      cooldown: 0,
      trail: [],
      supplyAction: action,
      supplyQty: def.qty,
      supplyFactoryId: factory.id,
      supplyLabel: def.label,
      supplyDistanceTotal: geoDistance(origin, target),
      invulnerableUntil: state.clock + 8
    };
    state.playerUnits.push(unit);
    addEffect("pop", unit.lat, unit.lng, unitType.color);
    addLog(`${def.label}: самолет снабжения вылетел к заводу. Если ПВО РФ собьет его, ракеты не придут.`, "good");
  }

  function orderEquipmentSupply(action) {
    ensureExtendedState();
    const def = EQUIPMENT_DEFS[action];
    if (!def) return;
    const factory = chooseStorageFactory(action);
    if (!factory) {
      addLog(ROCKET_SUPPLY_ACTIONS.has(action)
        ? `Для поставки ракет нужен работающий завод со свободным местом. Лимит: ${ROCKET_STORAGE_CAPACITY_PER_FACTORY} ракет на завод.`
        : "Для поставки нужен хотя бы один работающий завод. Постройте завод и повторите заказ.", "warn");
      return;
    }
    if (pendingSupplyForAction(action)) {
      addLog(`${def.label}: поставка уже в пути.`, "warn");
      return;
    }
    if (!baseSpend(def.cost)) {
      addLog(`${def.label}: не хватает денег на поставку ${formatMoney(def.cost)}.`, "warn");
      updateHud();
      return;
    }
    const duration = supplyDurationSeconds();
    state.ext.stats.moneySpent += def.cost;
    if (ROCKET_SUPPLY_ACTIONS.has(action)) {
      spawnRocketSupplyPlane(action, factory, def);
      updateHud();
      return;
    }
    state.ext.supplyOrders.push({
      id: cryptoId(),
      action,
      factoryId: factory.id,
      qty: def.qty,
      cost: def.cost,
      remaining: duration,
      total: duration,
      lost: false
    });
    addLog(`${def.label}: поставка заказана на завод, прибытие через ${Math.ceil(duration)} сек.`, "good");
    updateHud();
  }

  function updateSupplyOrders(dt) {
    const orders = state.ext.supplyOrders;
    for (const order of orders) {
      if (order.lost) continue;
      order.remaining -= dt;
      if (order.remaining > 0) continue;
      const factory = state.playerInstallations.find((item) => item.id === order.factoryId && item.kind === "factory" && !item.destroyed);
      const def = EQUIPMENT_DEFS[order.action];
      if (factory && def) {
        const added = addEquipmentToFactory(factory, order.action, order.qty);
        addLog(`${def.label}: поставка прибыла на завод, +${added} шт.`, "good");
      } else if (def) {
        addLog(`${def.label}: поставка потеряна, завод назначения уничтожен.`, "bad");
      }
      order.done = true;
    }
    state.ext.supplyOrders = orders.filter((order) => !order.done && !order.lost);
  }

  function destroyFactoryStock(factory, sourceName = "Удар") {
    if (!factory || factory.kind !== "factory") return;
    const storage = ensureFactoryStorage(factory) || {};
    const destroyed = Object.entries(storage)
      .filter(([, value]) => value > 0)
      .map(([action, value]) => `${EQUIPMENT_DEFS[action]?.label || action}: ${value}`)
      .join(", ");
    Object.keys(storage).forEach((action) => {
      storage[action] = 0;
    });
    let lostOrders = 0;
    for (const order of state.ext.supplyOrders || []) {
      if (order.factoryId === factory.id) {
        order.lost = true;
        lostOrders += 1;
      }
    }
    state.ext.supplyOrders = (state.ext.supplyOrders || []).filter((order) => !order.lost);
    let lostPlanes = 0;
    for (const unit of state.playerUnits || []) {
      if (unit.type === "natoCargo" && unit.supplyFactoryId === factory.id && !unit.destroyed) {
        unit.destroyed = true;
        lostPlanes += 1;
      }
    }
    if (destroyed || lostOrders || lostPlanes) {
      addLog(`${sourceName}: завод уничтожен, склад техники сгорел${destroyed ? ` (${destroyed})` : ""}${lostOrders ? `, поставки потеряны: ${lostOrders}` : ""}${lostPlanes ? `, самолеты снабжения отменены: ${lostPlanes}` : ""}.`, "bad");
    }
  }

  function buyUpgrade(id) {
    ensureExtendedState();
    const upgrade = UPGRADE_DEFS.find((item) => item.id === id);
    if (!upgrade) return;
    if (!baseSpend(UPGRADE_COST)) {
      addLog(`${upgrade.title}: нужно ${formatMoney(UPGRADE_COST)} на улучшение.`, "warn");
      updateHud();
      return;
    }
    state.ext.upgrades[id] = upgradeLevel(id) + 1;
    state.ext.stats.moneySpent += UPGRADE_COST;
    applyTechStats();
    addLog(`${upgrade.title}: улучшено на +7%. Текущий бонус +${Math.round(upgradeBonus(id) * 100)}%.`, "good");
    updateHud();
  }

  function hardenEnemySites() {
    for (const site of state.enemySites || []) {
      const base = ENEMY_SITES.find((item) => item.id === site.id);
      const targetMax = Math.round((base?.hp || site.maxHp || site.hp || 100) * ENEMY_BASE_HP_MULTIPLIER);
      if (site.hardenedV2 && site.maxHp >= targetMax) continue;
      const ratio = site.maxHp ? clamp(site.hp / site.maxHp, 0, 1) : 1;
      site.maxHp = Math.max(site.maxHp || 0, targetMax);
      site.hp = site.destroyed ? 0 : Math.max(1, Math.round(site.maxHp * ratio));
      site.hardenedV2 = true;
      site.pvo = Math.max(site.pvo || 0, base?.factory ? 2 : site.pvo || 1);
      site.radar = Math.max(site.radar || 0, /Команд|РЭБ|РЛС|Пуск/i.test(site.type) ? 2 : 1);
    }
  }

  function moneyCostMultiplier(action) {
    if (!action) return 1;
    const selected = getSelectedRegion();
    const commander = selected ? state.ext.commanders[selected.id] : null;
    let multiplier = commander === "logistics" ? 0.88 : 1;
    return clamp(multiplier, 0.72, 1);
  }

  function updateExtendedSystems(dt) {
    ensureExtendedState();
    updateResourceEconomy(dt);
    updateSupplyOrders(dt);
    updateMissionProgress(dt);
    updateEnemyRepairTeams(dt);
    updateSeaThreats(dt);
    applyCommanderPassives(dt);
    state.ext.saveTimer += dt;
    if (state.ext.saveTimer >= 5) {
      state.ext.saveTimer = 0;
      saveGame(false);
    }
  }

  function updateResourceEconomy(dt) {
    void dt;
  }

  function updateMissionProgress(dt) {
    const kyiv = getRegion("kyiv");
    const kharkiv = getRegion("kharkiv");
    progressTimedMission("defendKyiv", kyiv && !kyiv.captured && kyiv.hp > 0, dt, 300);
    progressTimedMission("holdKharkiv", kharkiv && !kharkiv.captured && kharkiv.hp > 20, dt, 240);
    const moscowFactory = state.enemySites.find((site) => site.id === "moscowFactory");
    if (moscowFactory?.found) completeMission("findMoscowFactory");
    if ((state.ext.stats.intercepts || 0) >= 10) completeMission("intercept10");
  }

  function progressTimedMission(id, active, dt, target) {
    const mission = state.ext.missions[id];
    if (!mission || mission.done) return;
    mission.progress = active ? clamp((mission.progress || 0) + dt, 0, target) : Math.max(0, (mission.progress || 0) - dt * 0.35);
    if (mission.progress >= target) completeMission(id);
  }

  function completeMission(id) {
    const mission = state.ext.missions[id];
    const def = MISSION_DEFS.find((item) => item.id === id);
    if (!mission || !def || mission.done) return;
    mission.done = true;
    mission.progress = mission.progress || 1;
    if (def.reward.money) {
      state.money += def.reward.money;
      state.ext.stats.moneyEarned = (state.ext.stats.moneyEarned || 0) + def.reward.money;
    }
    if (def.reward.intel) state.intel += def.reward.intel;
    addLog(`Миссия выполнена: ${def.title}. Награда получена.`, "good");
  }

  function updateEnemyRepairTeams(dt) {
    const teams = state.ext.enemyRepairTeams;
    state.ext.enemyRepairTimer -= dt;
    const destroyedTargets = state.enemySites.filter((site) => site.destroyed);
    if (state.ext.enemyRepairTimer <= 0 && destroyedTargets.length && !isEnemySupplyCut()) {
      spawnEnemyRepairTeam(destroyedTargets);
      state.ext.enemyRepairTimer = randomRange(54, 92) / difficultyDef().repair;
    }
    for (const team of teams) {
      const target = state.enemySites.find((site) => site.id === team.targetId);
      if (!target || (!target.destroyed && target.hp >= target.maxHp)) {
        team.destroyed = true;
        continue;
      }
      if (!team.repairing) {
        const dist = Math.max(0.001, geoDistance(team, target));
        const step = Math.min(1, (0.19 * dt) / dist);
        team.lat += (target.lat - team.lat) * step;
        team.lng += (target.lng - team.lng) * step;
        if (dist < 0.13) {
          team.repairing = true;
          team.repairProgress = 0;
          addLog(`Инженеры РФ начали ремонт: ${target.name}.`, "bad");
        }
      } else {
        team.repairProgress += dt * difficultyDef().repair;
        target.hp = clamp(target.hp + (target.maxHp / 80) * dt * difficultyDef().repair, 0, target.maxHp);
        if (team.repairProgress >= 80 || target.hp >= target.maxHp - 0.5) {
          target.destroyed = false;
          target.hp = Math.max(target.hp, target.maxHp * 0.55);
          state.enemySupplyCut = false;
          team.destroyed = true;
          addEffect("pop", target.lat, target.lng, "#ef4444");
          addLog(`РФ восстановила объект: ${target.name}. Он снова дает снабжение.`, "bad");
        }
      }
      interceptEnemyRepairTeam(team, dt);
    }
    state.ext.enemyRepairTeams = teams.filter((team) => !team.destroyed);
  }

  function spawnEnemyRepairTeam(targets) {
    const target = targets.slice().sort((a, b) => (b.factory ? 1 : 0) - (a.factory ? 1 : 0) || b.threat - a.threat)[0];
    const origin = state.enemySites.find((site) => !site.destroyed && site.id !== target.id) || { lat: 55.75, lng: 37.62, name: "резерв" };
    state.ext.enemyRepairTeams.push({
      id: cryptoId(),
      targetId: target.id,
      lat: origin.lat,
      lng: origin.lng,
      hp: 70,
      repairing: false,
      repairProgress: 0
    });
    addLog(`РФ отправила инженеров чинить объект: ${target.name}.`, "bad");
  }

  function interceptEnemyRepairTeam(team, dt) {
    for (const unit of state.playerUnits) {
      if (unit.destroyed || unit.cooldown > 0) continue;
      const type = PLAYER_UNIT_TYPES[unit.type];
      if (!type || type.repairOnly || type.cargoOnly || type.reconOnly) continue;
      const range = Math.max(0.38, type.radius || 0.4);
      if (geoDistance(unit, team) > range) continue;
      team.hp -= (type.attackDamage || 22) * randomRange(0.28, 0.52);
      unit.cooldown = type.cooldown || 1;
      addEffect("gunrun", team.lat, team.lng, type.color);
      if (team.hp <= 0) {
        team.destroyed = true;
        state.money += 90000;
        addLog("Инженеры РФ перехвачены. +90 000 денег.", "good");
        break;
      }
    }
  }

  function updateSeaThreats(dt) {
    state.ext.seaThreatTimer -= dt;
    if (state.ext.seaThreatTimer > 0 || isEnemySupplyCut()) return;
    const fleet = state.enemySites.find((site) => site.id === "blackSeaFleet" && !site.destroyed);
    const target = getRegion(Math.random() < 0.62 ? "odesa" : "mykolaiv") || getRegion("odesa");
    if (fleet && target && state.threats.length < ENEMY_MAX_ACTIVE_THREATS) {
      spawnThreat("seaDrone", fleet, target, 0.28);
      addLog("Черноморский флот РФ выпустил морской дрон.", "bad");
    }
    state.ext.seaThreatTimer = randomRange(62, 110) / difficultyDef().sea;
  }

  function applyCommanderPassives(dt) {
    Object.entries(state.ext.commanders).forEach(([regionId, commander]) => {
      const region = getRegion(regionId);
      if (!region) return;
      if (commander === "engineer") {
        region.hp = clamp(region.hp + dt * 0.055, 0, 100);
        region.pressure = Math.max(0, region.pressure - dt * 0.12);
      }
      if (commander === "intel") {
        state.intel = clamp(state.intel + dt * 0.012, 0, 200);
      }
    });
  }

  function runSeaUnit(unit) {
    if (unit.cooldown > 0) return;
    if (!isSeaPoint(unit)) return;
    const type = PLAYER_UNIT_TYPES[unit.type];
    const seaThreat = findNearestThreat(unit, type.radius, false);
    if (seaThreat && (seaThreat.type === "seaDrone" || (!THREAT_TYPES[seaThreat.type].airborne && isSeaPoint(seaThreat)))) {
      seaThreat.hp -= randomRange(type.attackDamage * 0.42, type.attackDamage * 0.72);
      unit.cooldown = type.cooldown;
      addEffect("gunrun", seaThreat.lat, seaThreat.lng, type.color);
      return;
    }
    const fleet = state.enemySites.find((site) => site.id === "blackSeaFleet" && site.found && !site.destroyed);
    if (fleet && geoDistance(unit, fleet) < type.radius) {
      fleet.hp = clamp(fleet.hp - randomRange(type.attackDamage * 0.22, type.attackDamage * 0.48), 0, fleet.maxHp);
      unit.cooldown = type.cooldown;
      addEffect("strike", fleet.lat, fleet.lng, type.color);
      finishSiteIfDestroyed(fleet);
    }
  }

  const baseUpdatePlayerUnits = updatePlayerUnits;
  updatePlayerUnits = function updatePlayerUnitsWithSeaLayer(dt) {
    baseUpdatePlayerUnits(dt);
    for (const unit of state.playerUnits) {
      if (unit.type === "seaDrone" || unit.type === "patrolBoat") {
        runSeaUnit(unit, dt);
      }
    }
    state.playerUnits = state.playerUnits.filter((unit) => !unit.destroyed);
  };

  function buyHeadquarters() {
    const region = getSelectedRegion();
    if (!region) {
      addLog("Для штаба сначала выберите регион.", "warn");
      return false;
    }
    if (state.ext.hqRegions[region.id]) {
      addLog(`${region.name}: штаб уже работает.`, "warn");
      return false;
    }
    if (!spend(ACTIONS.buyHQ.cost)) {
      addLog("Недостаточно денег для штаба.", "warn");
      updateHud();
      return false;
    }
    state.ext.hqRegions[region.id] = true;
    state.playerInstallations.push({
      id: cryptoId(),
      kind: "hq",
      lat: region.lat,
      lng: region.lng,
      regionId: region.id,
      hp: 110,
      maxHp: 110,
      destroyed: false,
      bonusActive: false
    });
    addEffect("scan", region.lat, region.lng, "#ffd24c");
    addLog(`${region.name}: штаб развернут. Теперь можно назначать командира.`, "good");
    updateHud();
    return true;
  }

  function buyTechnology(id) {
    ensureExtendedState();
    const tech = TECH_DEFS.find((item) => item.id === id);
    if (!tech) return;
    const current = state.ext.tech[id] || 0;
    if (current >= tech.max) return;
    const moneyCost = Math.round(tech.cost * (1 + current * 0.55));
    const intelCost = tech.intel + current * 5;
    if (state.money < moneyCost || state.intel < intelCost) {
      addLog(`Технология "${tech.title}" недоступна: нужно ${formatMoney(moneyCost)} денег и ${intelCost} разведки.`, "warn");
      return;
    }
    state.money -= moneyCost;
    state.intel -= intelCost;
    state.ext.tech[id] = current + 1;
    applyTechStats();
    addLog(`Технология изучена: ${tech.title}, уровень ${state.ext.tech[id]}.`, "good");
    updateHud();
  }

  function applyTechStats() {
    ensureExtendedState();
    const drone = upgradeFactor("drones");
    const armor = upgradeFactor("armor");
    const aviation = upgradeFactor("aviation");
    if (BASE_UNIT_STATS.attackDrone) PLAYER_UNIT_TYPES.attackDrone.attackDamage = BASE_UNIT_STATS.attackDrone.attackDamage * drone;
    if (BASE_UNIT_STATS.seaDrone) PLAYER_UNIT_TYPES.seaDrone.attackDamage = BASE_UNIT_STATS.seaDrone.attackDamage * drone;
    ["tank", "btr", "patrolBoat"].forEach((typeId) => {
      if (!BASE_UNIT_STATS[typeId] || !PLAYER_UNIT_TYPES[typeId]) return;
      PLAYER_UNIT_TYPES[typeId].attackDamage = BASE_UNIT_STATS[typeId].attackDamage * armor;
      PLAYER_UNIT_TYPES[typeId].speed = BASE_UNIT_STATS[typeId].speed * (1 + upgradeBonus("armor") * 0.45);
    });
    ["fighter", "helicopter"].forEach((typeId) => {
      if (!BASE_UNIT_STATS[typeId] || !PLAYER_UNIT_TYPES[typeId]) return;
      PLAYER_UNIT_TYPES[typeId].attackDamage = BASE_UNIT_STATS[typeId].attackDamage * aviation;
      PLAYER_UNIT_TYPES[typeId].speed = BASE_UNIT_STATS[typeId].speed * (1 + upgradeBonus("aviation") * 0.35);
    });
  }

  function assignCommander(id) {
    ensureExtendedState();
    const def = COMMANDER_DEFS.find((item) => item.id === id);
    const region = getSelectedRegion();
    if (!def || !region) return;
    if (!state.ext.hqRegions[region.id]) {
      addLog(`Для командира нужен штаб в регионе ${region.name}.`, "warn");
      return;
    }
    state.ext.commanders[region.id] = id;
    addLog(`${region.name}: назначен ${def.name}.`, "good");
    updateHud();
  }

  function setDifficulty(id) {
    if (!DIFFICULTY_DEFS[id]) return;
    ensureExtendedState();
    state.ext.difficulty = id;
    addLog(`Сложность: ${DIFFICULTY_DEFS[id].label}.`, id === "hardcore" ? "bad" : "warn");
    updateHud();
  }

  function difficultyDef() {
    ensureExtendedState();
    return DIFFICULTY_DEFS[state.ext.difficulty] || DIFFICULTY_DEFS.normal;
  }

  function countCommanders(id) {
    return Object.values(state.ext?.commanders || {}).filter((value) => value === id).length;
  }

  function updateExtendedHud() {
    if (!state.ext) return;
    ensureExtendedState();
    const resources = document.getElementById("extendedResources");
    if (resources) {
      resources.remove();
    }
    const saveState = document.getElementById("extendedSaveState");
    if (saveState) saveState.textContent = `сейв: ${extLastSavedText}`;
    const natoAidStatus = document.getElementById("natoAidStatus");
    if (natoAidStatus) {
      const cargo = state.playerUnits.find((unit) => unit.type === "natoCargo" && !unit.supplyAction && !unit.destroyed);
      if (cargo) {
        natoAidStatus.innerHTML = `<strong>Помощь НАТО в пути</strong><span>${formatMoney(cargo.cargoAmount || NATO_AID_AMOUNT)} летит к Киеву. РФ может попытаться сбить самолёт.</span>`;
      } else {
        const daysLeft = Math.max(0, Math.ceil((state.nextNatoAidDay || NATO_AID_INTERVAL_DAYS) - state.day));
        natoAidStatus.innerHTML = `<strong>Помощь НАТО</strong><span>следующий самолёт через ${daysLeft} дн.; груз ${formatMoney(NATO_AID_AMOUNT)}</span>`;
      }
    }

    const difficultyRow = document.getElementById("difficultyRow");
    if (difficultyRow) {
      difficultyRow.innerHTML = Object.entries(DIFFICULTY_DEFS).map(([id, def]) =>
        `<button type="button" data-difficulty="${id}" class="${state.ext.difficulty === id ? "is-active" : ""}">${def.label}</button>`
      ).join("");
    }

    const missionList = document.getElementById("missionList");
    if (missionList) {
      missionList.innerHTML = MISSION_DEFS.map((def) => {
        const mission = state.ext.missions[def.id] || {};
        const pct = missionPercent(def.id);
        return `
          <div class="mission-row ${mission.done ? "is-done" : ""}">
            <header><strong>${def.title}</strong><span>${mission.done ? "готово" : `${Math.round(pct)}%`}</span></header>
            <p>${def.desc}</p>
            <div class="mini-track"><i style="width:${pct}%"></i></div>
          </div>
        `;
      }).join("");
    }

    const upgradeMenuList = document.getElementById("upgradeMenuList");
    if (upgradeMenuList) {
      upgradeMenuList.innerHTML = UPGRADE_DEFS.map((upgrade) => {
        const level = upgradeLevel(upgrade.id);
        const bonus = Math.round(level * UPGRADE_STEP * 100);
        const disabled = state.money < UPGRADE_COST || state.gameOver;
        return `
          <button type="button" class="upgrade-card" data-upgrade="${upgrade.id}" ${disabled ? "disabled" : ""}>
            <span class="upgrade-badge">+${bonus}%</span>
            <strong>${upgrade.title}</strong>
            <small>${upgrade.desc}</small>
            <b>${formatMoney(UPGRADE_COST)}</b>
          </button>
        `;
      }).join("");
    }

    const equipmentStockList = document.getElementById("equipmentStockList");
    if (equipmentStockList) {
      equipmentStockList.innerHTML = Object.entries(EQUIPMENT_DEFS).map(([action, def]) => {
        const available = equipmentAvailable(action);
        const pending = pendingSupplyForAction(action);
        const factories = activeFactories().length;
        const disabled = state.gameOver || Boolean(pending) || factories <= 0 || state.money < def.cost;
        const rocketSpace = ROCKET_SUPPLY_ACTIONS.has(action)
          ? activeFactories().reduce((sum, factory) => sum + factoryRocketSpace(factory), 0)
          : Infinity;
        const blockedByCapacity = ROCKET_SUPPLY_ACTIONS.has(action) && rocketSpace <= 0;
        const finalDisabled = disabled || blockedByCapacity;
        const progress = pending
          ? pending.kind === "air"
            ? pending.progress
            : clamp(100 - (pending.order.remaining / pending.order.total) * 100, 0, 100)
          : 0;
        const remainingText = pending
          ? pending.kind === "air"
            ? `самолет: ${pending.remaining} сек`
            : `поставка: ${Math.ceil(pending.order.remaining)} сек`
          : "";
        return `
          <div class="stock-card ${available <= 0 ? "is-empty" : ""}">
            <span class="stock-icon"><i class="action-icon ${actionIconClass(action)}"></i></span>
            <div class="stock-main">
              <strong>${def.label}</strong>
              <small>на складе: ${available} шт.${factories ? "" : " | нужен завод"}${blockedByCapacity ? ` | склад ракет заполнен (${ROCKET_STORAGE_CAPACITY_PER_FACTORY}/завод)` : ""}</small>
              ${pending ? `<div class="stock-progress"><i style="width:${progress}%"></i></div><em>${remainingText}</em>` : ""}
            </div>
            <button type="button" data-supply-action="${action}" ${finalDisabled ? "disabled" : ""}>Поставка ${def.qty}</button>
          </div>
        `;
      }).join("");
    }

    const commanderList = document.getElementById("commanderList");
    if (commanderList) {
      const selected = getSelectedRegion();
      const assigned = selected ? state.ext.commanders[selected.id] : null;
      commanderList.innerHTML = `
        <div class="commander-region">${selected ? `${selected.name}${state.ext.hqRegions[selected.id] ? " | штаб есть" : " | нужен штаб"}` : "выберите регион"}</div>
        ${COMMANDER_DEFS.map((cmd) => `
          <button type="button" data-commander="${cmd.id}" class="${assigned === cmd.id ? "is-active" : ""}">
            <strong>${cmd.name}</strong><span>${cmd.bonus}</span>
          </button>
        `).join("")}
      `;
    }

    document.querySelectorAll("[data-action]").forEach((button) => {
      const action = button.dataset.action;
      const lacks = !hasActionResources(action);
      button.classList.toggle("resource-blocked", lacks);
      if (lacks) button.disabled = true;
      button.title = lacks ? `Не хватает ресурсов: ${resourceShortageText(action)}` : "";
    });

    updateEquipmentActionBadges();
    updateMiniMapDot();
  }

  function actionIconClass(action) {
    if (action === "launchStrike" || action === "launchPiercingStrike") return "icon-strike";
    if (action === "launchRecon") return "icon-recon";
    if (action === "launchAttackDrone") return "icon-attack-drone";
    if (action === "buyFighters") return "icon-fighter";
    if (action === "buyHelicopter") return "icon-helicopter";
    if (action === "buyTank") return "icon-tank";
    if (action === "buyBtr") return "icon-btr";
    if (action === "deploySpecOps") return "icon-specops";
    if (action === "buySeaDrone") return "icon-sea-drone";
    if (action === "buyPatrolBoat") return "icon-patrol-boat";
    return "icon-factory";
  }

  function updateEquipmentActionBadges() {
    document.querySelectorAll("[data-action]").forEach((button) => {
      const action = button.dataset.action;
      if (!EQUIPMENT_ACTIONS.has(action)) {
        const old = button.querySelector(".stock-pill");
        if (old) old.remove();
        return;
      }
      const available = equipmentAvailable(action);
      let pill = button.querySelector(".stock-pill");
      if (!pill) {
        pill = document.createElement("em");
        pill.className = "stock-pill";
        button.appendChild(pill);
      }
      pill.textContent = `склад ${available}`;
      button.classList.toggle("stock-empty", available <= 0);
      if (available <= 0) {
        button.disabled = true;
        button.title = `${EQUIPMENT_DEFS[action].label}: склад пуст, закажите поставку в меню улучшений.`;
      }
    });
  }

  function missionPercent(id) {
    const mission = state.ext.missions[id] || {};
    if (mission.done) return 100;
    if (id === "defendKyiv") return clamp((mission.progress || 0) / 300 * 100, 0, 100);
    if (id === "holdKharkiv") return clamp((mission.progress || 0) / 240 * 100, 0, 100);
    if (id === "intercept10") return clamp((state.ext.stats.intercepts || 0) / 10 * 100, 0, 100);
    if (id === "findMoscowFactory") {
      return state.enemySites.find((site) => site.id === "moscowFactory")?.found ? 100 : 0;
    }
    return 0;
  }

  function jumpMiniMap(target) {
    const points = {
      ua: { lat: 49.3, lng: 31.2, zoom: 1.45 },
      moscow: { lat: 55.75, lng: 37.62, zoom: 2.05 }
    };
    const point = points[target] || points.ua;
    if (isGoogleMapActive() && map) {
      map.setCenter({ lat: point.lat, lng: clamp(point.lng, GOOGLE_MAP_BOUNDS.west, GOOGLE_MAP_BOUNDS.east) });
      map.setZoom(target === "ua" ? 5 : 4);
    }
    state.camera.centerLat = point.lat;
    state.camera.centerLng = point.lng;
    state.camera.zoom = point.zoom;
    clampCamera();
    render();
  }

  function updateMiniMapDot() {
    const dot = document.getElementById("miniCameraDot");
    if (!dot) return;
    const x = ((state.camera.centerLng - WORLD_BOUNDS.west) / (WORLD_BOUNDS.east - WORLD_BOUNDS.west)) * 100;
    const y = ((WORLD_BOUNDS.north - state.camera.centerLat) / (WORLD_BOUNDS.north - WORLD_BOUNDS.south)) * 100;
    dot.style.left = `${clamp(x, 4, 96)}%`;
    dot.style.top = `${clamp(y, 8, 92)}%`;
  }

  function drawExtendedOverlays() {
    if (!state.ext || !canvas || !ctx) return;
    drawEnemyRepairTeams();
    drawHqMarkers();
  }

  function drawEnemyRepairTeams() {
    for (const team of state.ext.enemyRepairTeams || []) {
      const p = project(team);
      drawGeneratedSquareMarker("repair", p.x, p.y, "#ef4444", 34, false, 0);
      const hp = clamp(team.hp / 70, 0, 1);
      ctx.save();
      ctx.fillStyle = "rgba(3, 10, 18, 0.82)";
      roundRect(ctx, p.x - 18, p.y + 20, 36, 5, 3);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      roundRect(ctx, p.x - 18, p.y + 20, 36 * hp, 5, 3);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawHqMarkers() {
    Object.keys(state.ext.hqRegions || {}).forEach((regionId) => {
      const region = getRegion(regionId);
      if (!region) return;
      const p = project({ lat: region.lat + 0.22, lng: region.lng - 0.22 });
      drawGeneratedSquareMarker("buyHQ", p.x, p.y, "#ffd24c", 30, false, 0);
    });
  }

  function saveGame(manual) {
    try {
      ensureExtendedState();
      const ext = JSON.parse(JSON.stringify(state.ext));
      ext.pendingSpendAction = null;
      const payload = {
        version: EXT_VERSION,
        savedAt: Date.now(),
        state: {
          day: state.day,
          clock: state.clock,
          uiClock: state.uiClock,
          money: state.money,
          morale: state.morale,
          intel: state.intel,
          casualties: state.casualties,
          enemyPower: state.enemyPower,
          enemyBudget: state.enemyBudget,
          selectedRegionId: state.selectedRegionId,
          enemySupplyCut: state.enemySupplyCut,
          nextNatoAidDay: state.nextNatoAidDay,
          natoAidInterceptTimer: state.natoAidInterceptTimer,
          regions: state.regions,
          enemySites: state.enemySites,
          threats: state.threats,
          playerUnits: state.playerUnits,
          playerInstallations: state.playerInstallations,
          playerMissiles: state.playerMissiles,
          interceptors: state.interceptors,
          diplomacy: state.diplomacy,
          camera: state.camera,
          ext
        }
      };
      localStorage.setItem(EXT_SAVE_KEY, JSON.stringify(payload));
      extLastSavedText = new Date(payload.savedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      if (manual) addLog("Игра сохранена.", "good");
      return true;
    } catch (error) {
      if (manual) addLog("Не удалось сохранить игру: localStorage недоступен.", "warn");
      return false;
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(EXT_SAVE_KEY);
      if (!raw) return false;
      const payload = JSON.parse(raw);
      if (!payload || !payload.state) return false;
      const saved = payload.state;
      [
        "day", "clock", "uiClock", "money", "morale", "intel", "casualties", "enemyPower",
        "enemyBudget", "selectedRegionId", "enemySupplyCut", "nextNatoAidDay", "natoAidInterceptTimer"
      ].forEach((key) => {
        if (saved[key] !== undefined) state[key] = saved[key];
      });
      [
        "regions", "enemySites", "threats", "playerUnits", "playerInstallations",
        "playerMissiles", "interceptors"
      ].forEach((key) => {
        if (Array.isArray(saved[key])) state[key] = saved[key];
      });
      if (saved.diplomacy) state.diplomacy = saved.diplomacy;
      if (saved.camera) state.camera = saved.camera;
      if (saved.ext) state.ext = saved.ext;
      extLastSavedText = payload.savedAt
        ? new Date(payload.savedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
        : "есть";
      ensureExtendedState();
      return true;
    } catch (error) {
      return false;
    }
  }

  function clearSave() {
    try {
      localStorage.removeItem(EXT_SAVE_KEY);
      localStorage.removeItem("ukraine-defense-campaign-save-v4");
      localStorage.removeItem("ukraine-defense-campaign-save-v5-start0-money5m");
      localStorage.removeItem("ukraine-defense-campaign-save-v6-start0-money5m-tech");
      localStorage.removeItem("ukraine-defense-campaign-save-v7-no-deep-russia");
      localStorage.removeItem("ukraine-defense-campaign-save-v8-no-new-russia-territories");
      localStorage.removeItem("ukraine-defense-campaign-save-v9-readable-text-clean");
      localStorage.removeItem("ukraine-defense-campaign-save-v10-upgrades-stock");
      extLastSavedText = "нет";
    } catch (error) {
      extLastSavedText = "ошибка";
    }
  }

  function showResultsOverlay(result) {
    const overlay = document.getElementById("resultOverlay");
    const title = document.getElementById("resultTitle");
    const grid = document.getElementById("resultGrid");
    if (!overlay || !title || !grid) return;
    title.textContent = result === "victory" ? "Победа" : "Поражение";
    const destroyed = state.enemySites.filter((site) => site.destroyed).length;
    const earned = Math.max(0, Math.round((state.ext.stats.moneyEarned || 0) + state.money + state.ext.stats.moneySpent - STARTING_MONEY));
    grid.innerHTML = `
      <div><span>День войны</span><strong>${state.day}</strong></div>
      <div><span>Потери</span><strong>${formatCasualties(state.casualties)}</strong></div>
      <div><span>Объекты РФ</span><strong>${destroyed}/${state.enemySites.length}</strong></div>
      <div><span>Сбито целей</span><strong>${state.ext.stats.intercepts || 0}</strong></div>
      <div><span>Заработано</span><strong>${formatMoney(earned)}</strong></div>
      <div><span>Потрачено</span><strong>${formatMoney(state.ext.stats.moneySpent || 0)}</strong></div>
      <div><span>Сложность</span><strong>${difficultyDef().label}</strong></div>
      <div><span>Миссии</span><strong>${Object.values(state.ext.missions).filter((mission) => mission.done).length}/${MISSION_DEFS.length}</strong></div>
    `;
    overlay.hidden = false;
  }

  function hideResultsOverlay() {
    const overlay = document.getElementById("resultOverlay");
    if (overlay) overlay.hidden = true;
  }
}());

function applyDiplomacyResult(result, options = {}) {
  if (result.source) {
    state.diplomacy.aiSource = result.source === "live" || result.source === "openai" ? "live" : "fallback";
  }
  rememberDiplomacyReply(result.reply);
  state.diplomacy.messages.push({ role: "ai", text: stripDiplomacySpeaker(result.reply) });
  if (options.initiatedByAi) {
    addLog("Дипломатия: Путин (ИИ) сам вышел на переговоры.", "warn");
  }
  if (result.effect === "ceasefire") {
    state.diplomacy.status = "ceasefire";
    state.enemySupplyCut = true;
    state.enemyBudget = 0;
    addLog("Дипломатия: достигнуто перемирие. Новые вражеские поставки остановлены.", "good");
    if (state.threats.length === 0 && !state.interceptors.some((item) => item.enemyOwned)) {
      state.gameOver = true;
      state.paused = true;
      els.overlayBanner.innerHTML = "<strong>Победа:</strong> война остановлена переговорами, активных атак нет.";
    }
    return;
  }
  if (result.effect === "deescalate") {
    state.diplomacy.status = "talks";
    state.enemyBudget = Math.max(0, state.enemyBudget - 34 * result.intensity);
    state.aiTick += 5 * result.intensity;
    addLog("Дипломатия: темп атак временно снижен.", "good");
    return;
  }
  if (result.effect === "escalate") {
    state.diplomacy.status = "tense";
    state.enemyBudget += 42 * result.intensity;
    state.aiTick = Math.min(state.aiTick, 0.45);
    addLog("Дипломатия: переговоры сорвались, противник ускоряет волну.", "bad");
    return;
  }
  if (result.effect === "aid") {
    state.diplomacy.status = "talks";
    state.money += 180000 * result.intensity;
    state.intel += 8 * result.intensity;
    addLog("Дипломатия: получена внешняя поддержка и разведданные.", "good");
  }
}

function updateTargetList() {
  const targets = state.enemySites.filter((site) => site.found);
  if (!targets.length) {
    els.targetList.innerHTML = `
      <div class="scan-card"><strong>Военный аэродром</strong><span>Курская область, РФ</span><em>нужна разведка</em></div>
      <div class="scan-card"><strong>Склад боеприпасов</strong><span>Воронежская обл., РФ</span><em>нужна разведка</em></div>
      <div class="scan-card"><strong>НПЗ</strong><span>Краснодарский край</span><em>нужна разведка</em></div>
      <div class="scan-card"><strong>Военная база</strong><span>Белгород, РФ</span><em>нужна разведка</em></div>
      <div class="scan-card"><strong>РЛС станция</strong><span>Ростовская обл., РФ</span><em>нужна разведка</em></div>
      <div class="scan-card"><strong>Командный пункт</strong><span>Луганск, ТОТ</span><em>нужна разведка</em></div>
    `;
    return;
  }
  els.targetList.innerHTML = targets.map((site) => {
    const hp = Math.max(0, Math.round((site.hp / site.maxHp) * 100));
    const disabled = site.destroyed ? "disabled" : "";
    return `
      <div class="mini-card">
        <strong>${site.name}</strong>
        <span>${site.type} | прочность ${hp}% | угроза ${site.threat}</span>
        <button ${disabled} data-target-strike="${site.id}">${site.destroyed ? "Уничтожено" : "Ударить"}</button>
      </div>
    `;
  }).join("");
  els.targetList.querySelectorAll("[data-target-strike]").forEach((button) => {
    button.addEventListener("click", () => {
      const site = state.enemySites.find((item) => item.id === button.dataset.targetStrike);
      if (site) strikeEnemySite(site);
    });
  });
}

function updateIncomingList() {
  els.incomingList.classList.add("is-active");
  if (els.threatCount) {
    els.threatCount.textContent = String(state.threats.length);
  }
  if (!state.threats.length) {
    els.incomingList.innerHTML = `<div class="empty-card"><strong>Угроз нет</strong><span>ИИ противника готовит следующую волну. Усильте ППО или запустите разведку.</span></div>`;
    return;
  }
  const groups = Array.from(state.threats.reduce((map, threat) => {
    const list = map.get(threat.type) || [];
    list.push(threat);
    map.set(threat.type, list);
    return map;
  }, new Map()).entries());

  els.incomingList.innerHTML = groups.slice(0, 4).map(([typeId, threats]) => {
    const type = THREAT_TYPES[typeId];
    const first = threats[0];
    const target = getRegion(first.targetId);
    const eta = Math.max(1, Math.round((1 - first.progress) / Math.max(0.001, type.speed * THREAT_SPEED_SCALE * first.speedMul)));
    return `
      <div class="mini-card">
        <strong>${type.name}</strong>
        <span>x${threats.length} | Курс: ${target ? shortRegionName(target.name) : "?"} | ${formatEta(eta)}</span>
      </div>
    `;
  }).join("");
}

function shortRegionName(name) {
  return String(name).replace(/щина|ская|ской|область|регион/gi, "").trim();
}

function formatEta(seconds) {
  const safe = Math.max(0, Math.round(seconds));
  const min = Math.floor(safe / 60);
  const sec = String(safe % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function updateLog() {
  els.battleLog.innerHTML = state.log.slice(0, 18).map((entry) => `<div class="log-entry ${entry.kind}">${entry.text}</div>`).join("");
  if (!state.gameOver) {
    els.overlayBanner.innerHTML = state.log.slice(0, 4).map((entry, index) => {
      const minute = String(28 - index).padStart(2, "0");
      return `<div class="ticker-row ${entry.kind}"><span>22:${minute}</span><p>${entry.text}</p></div>`;
    }).join("");
  }
}

function setModeHint(text) {
  els.modeHint.textContent = text;
}

function setMapStatus(text) {
  els.mapStatus.textContent = text;
}

function addLog(text, kind = "") {
  state.log.unshift({ text, kind, t: Date.now() });
  if (state.log.length > 90) state.log.pop();
}

function addCasualties(amount, reason = "") {
  const count = Math.max(0, Math.round(amount));
  if (!count) return;
  state.casualties += count;
  if (reason && count >= 25) {
    addLog(`${reason}: погибло ${formatCasualties(count)} людей.`, "bad");
  }
}

function civilianCasualtiesFromDamage(damage, multiplier = 1) {
  const base = Math.max(2, damage * randomRange(4.5, 10.5) * multiplier);
  return Math.round(base);
}

function unitCasualties(typeId) {
  const table = {
    helicopter: [2, 4],
    fighter: [1, 2],
    infantry: [8, 22],
    specops: [8, 18],
    armor: [6, 14],
    tank: [3, 4],
    btr: [4, 8],
    soldiers: [7, 16],
    engineer: [3, 8],
    natoCargo: [2, 5]
  };
  const range = table[typeId];
  return range ? Math.round(randomRange(range[0], range[1])) : 0;
}

function countThreatCasualties(threat, reason) {
  if (!threat || threat.casualtiesCounted) return;
  const amount = unitCasualties(threat.type);
  threat.casualtiesCounted = true;
  addCasualties(amount, reason);
}

function countPlayerUnitCasualties(unit, reason) {
  if (!unit || unit.casualtiesCounted) return;
  const amount = unitCasualties(unit.type);
  unit.casualtiesCounted = true;
  if (unit.type === "natoCargo") {
    addLog("Самолет НАТО сбит: поставка денег потеряна.", "bad");
  }
  addCasualties(amount, reason);
}

function enemySiteCasualties(site) {
  if (!site) return 0;
  const facilityScale = site.factory ? randomRange(45, 110) : randomRange(16, 54);
  return Math.round(facilityScale + site.threat * randomRange(0.7, 1.8));
}

function addEffect(kind, lat, lng, color) {
  state.effects.push({
    kind,
    lat,
    lng,
    color,
    radius: kind === "scan" ? 16 : kind === "strike" ? 24 : kind === "firefight" ? 7 : 10,
    growth: kind === "scan" ? 74 : kind === "strike" ? 106 : kind === "firefight" ? 30 : 44,
    life: kind === "strike" ? 1.0 : kind === "firefight" ? 0.42 : 0.78
  });
}

function render() {
  const rect = canvas.getBoundingClientRect();
  const conceptMap = isConceptMapActive();
  ctx.clearRect(0, 0, rect.width, rect.height);
  if (isGoogleMapActive()) {
    drawGoogleOverlay(rect.width, rect.height);
  } else {
    drawFallbackMap(rect.width, rect.height);
  }
  if (!conceptMap) {
    drawCountryLabels();
    drawCityLabels();
    drawRegionLayer();
    drawStrategicLines();
  drawRegions();
  }
  drawPlayerInstallations();
  drawEnemySites();
  drawUnitRoutes();
  drawPlayerMissiles();
  drawInterceptors();
  drawThreats();
  drawPlayerUnits();
  drawEffects();
  drawModeBadge();
}

function isGoogleMapActive() {
  return Boolean(map && mapOverlay && mapOverlay.getProjection());
}

function isConceptMapActiveLegacyLine4147() {
  if (isGoogleMapActive() || !conceptImage || !conceptImage.complete || !conceptImage.naturalWidth) {
    return false;
  }
  return Math.abs(state.camera.centerLat - ((GAME_BOUNDS.north + GAME_BOUNDS.south) / 2)) < 0.18
    && Math.abs(state.camera.centerLng - ((GAME_BOUNDS.east + GAME_BOUNDS.west) / 2)) < 0.18
    && Math.abs(state.camera.zoom - 1) < 0.04;
}

function drawFallbackMapLegacyLine4156(width, height) {
  if (isConceptMapActive()) {
    ctx.drawImage(
      conceptImage,
      CONCEPT_MAP_CROP.x,
      CONCEPT_MAP_CROP.y,
      CONCEPT_MAP_CROP.width,
      CONCEPT_MAP_CROP.height,
      0,
      0,
      width,
      height
    );
    ctx.save();
    ctx.fillStyle = "rgba(0, 7, 11, 0.10)";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }
  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#15261f");
  base.addColorStop(0.38, "#0c1c17");
  base.addColorStop(0.72, "#141a15");
  base.addColorStop(1, "#260f0f");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  drawNoise(width, height);
  drawGeoPolygon(BELARUS_POLYGON, "rgba(33, 48, 39, 0.64)", "rgba(159, 177, 180, 0.16)", 1);
  drawGeoPolygon(RUSSIA_POLYGON, "rgba(80, 22, 20, 0.56)", "rgba(255, 69, 58, 0.46)", 1.8);
  drawRedHatching(RUSSIA_POLYGON);
  drawGeoPolygon(BLACK_SEA_POLYGON, "rgba(0, 56, 88, 0.70)", "rgba(67, 172, 222, 0.32)", 1);

  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.strokeStyle = "#8fc9ff";
  ctx.lineWidth = 1;
  for (let x = -height * 0.2; x < width; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height * 0.18, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 46) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y - width * 0.08);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGoogleOverlay(width, height) {
  ctx.fillStyle = "rgba(3, 10, 16, 0.38)";
  ctx.fillRect(0, 0, width, height);
  drawSmoothGeoPolygon(RUSSIA_POLYGON, "rgba(100, 22, 20, 0.30)", "rgba(255, 69, 58, 0.50)", 1.9, "rgba(255, 69, 58, 0.18)");
  drawRedHatching(RUSSIA_POLYGON);
}

function drawRegionLayer() {
  for (const region of state.regions) {
    const alpha = isGoogleMapActive() ? 0.08 : 0.12;
    const fill = region.frontline ? "rgba(255, 69, 58, 0.36)" : "rgba(24, 116, 78, 0.46)";
    drawBlob(region, fill, alpha, "rgba(80, 210, 255, 0.22)");
  }
  drawUkraineOutline();
}

function drawCountryLabelsBase() {
  const labels = [
    { text: "УКРАИНА", lat: 48.95, lng: 31.55, color: "rgba(27, 44, 61, 0.30)", size: 32 },
    { text: "РОССИЯ", lat: 51.35, lng: 42.15, color: "rgba(150, 32, 32, 0.32)", size: 30 },
    { text: "БЕЛАРУСЬ", lat: 54.15, lng: 28.8, color: "rgba(45, 54, 64, 0.22)", size: 22 }
  ];
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const label of labels) {
    const p = project(label);
    ctx.fillStyle = label.color;
    ctx.font = `900 ${label.size}px Segoe UI, sans-serif`;
    ctx.fillText(label.text, p.x, p.y);
  }
  ctx.restore();
}

function drawCountryLabels() {
  const labels = [
    { text: "УКРАЇНА", lat: 48.95, lng: 31.55, color: "rgba(230, 244, 255, 0.42)", size: 34 },
    { text: "РОСІЯ", lat: 51.35, lng: 42.15, color: "rgba(255, 198, 198, 0.46)", size: 34 },
    { text: "БІЛОРУСЬ", lat: 54.15, lng: 28.8, color: "rgba(218, 230, 226, 0.25)", size: 23 }
  ];
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.72)";
  ctx.shadowBlur = 8;
  for (const label of labels) {
    const p = project(label);
    ctx.fillStyle = label.color;
    ctx.font = `900 ${label.size}px Segoe UI, sans-serif`;
    ctx.fillText(label.text, p.x, p.y);
  }
  ctx.restore();
}

function drawCityLabels() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "800 11px Segoe UI, sans-serif";
  for (const city of CITY_LABELS) {
    const p = project(city);
    if (p.x < -80 || p.x > canvas.getBoundingClientRect().width + 80 || p.y < -80 || p.y > canvas.getBoundingClientRect().height + 80) {
      continue;
    }
    ctx.fillStyle = city.kind === "enemy" ? "rgba(255, 198, 198, 0.86)" : "rgba(210, 238, 255, 0.86)";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 5;
    ctx.fillText(city.text, p.x, p.y);
    ctx.fillStyle = city.kind === "enemy" ? "#ff453a" : "#39a8ff";
    ctx.beginPath();
    ctx.arc(p.x, p.y + 12, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStrategicLines() {
  const links = [
    ["lviv", "kyiv"], ["kyiv", "chernihiv"], ["kyiv", "cherkasy"], ["cherkasy", "dnipro"],
    ["dnipro", "kharkiv"], ["dnipro", "zaporizhzhia"], ["zaporizhzhia", "donetsk"],
    ["odesa", "mykolaiv"], ["mykolaiv", "kherson"], ["mykolaiv", "dnipro"],
    ["poltava", "kharkiv"], ["poltava", "kyiv"], ["poltava", "dnipro"], ["sumy", "kharkiv"]
  ];
  ctx.save();
  ctx.strokeStyle = "rgba(120, 210, 255, 0.20)";
  ctx.lineWidth = 1.4;
  ctx.setLineDash([6, 9]);
  links.forEach(([aId, bId]) => {
    const a = project(getRegion(aId));
    const b = project(getRegion(bId));
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });
  ctx.restore();
}

function drawRegions() {
  const scale = markerScale();
  for (const region of state.regions) {
    const p = project(region);
    const selected = region.id === state.selectedRegionId;
    const hp = clamp(region.hp, 0, 100);
    const statusColor = region.captured ? "#6b7280" : hp > 65 ? "#10b981" : hp > 35 ? "#facc15" : "#ef4444";
    if (selected) drawDefenseRings(region, p);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.86)";
    ctx.shadowBlur = 5;
    ctx.fillStyle = selected ? "#f4fbff" : "rgba(224, 241, 249, 0.90)";
    ctx.font = selected ? `900 ${14 * scale}px Segoe UI, sans-serif` : `800 ${Math.max(9, 11 * scale)}px Segoe UI, sans-serif`;
    ctx.fillText(region.name, p.x, p.y - 6);
    if (!isGoogleMapActive() && region.towns && scale > 0.75) {
      ctx.fillStyle = "rgba(137, 198, 225, 0.80)";
      ctx.font = "700 9px Segoe UI, sans-serif";
      ctx.fillText(region.towns[0], p.x, p.y + 9);
    }
    ctx.restore();

    drawBaseMarker(region, p, statusColor, selected);
  }
}

function drawBaseMarkerBase(region, p, statusColor, selected) {
  const scale = markerScale();
  const yOffset = 22 * scale;
  const width = 38 * scale;
  const height = 38 * scale;
  const icon = 24 * scale;
  ctx.save();
  ctx.translate(p.x, p.y + yOffset);
  ctx.shadowColor = selected ? "rgba(57, 168, 255, 0.75)" : "rgba(0,0,0,0.70)";
  ctx.shadowBlur = selected ? 18 : 12;
  ctx.fillStyle = "rgba(8, 24, 38, 0.95)";
  roundRect(ctx, -width / 2, -width / 2, width, height, 8 * scale);
  ctx.fill();
  ctx.strokeStyle = selected ? "#ffd24c" : "rgba(80, 210, 255, 0.62)";
  ctx.lineWidth = selected ? 2 : 1;
  ctx.stroke();
  drawUnitIcon(region.pvo ? "buyPvo" : region.radar ? "buyRadar" : "buyFort", -icon / 2, -icon / 2, icon, icon);
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  roundRect(ctx, -20 * scale, 16 * scale, 40 * scale, 7 * scale, 4 * scale);
  ctx.fill();
  ctx.fillStyle = statusColor;
  roundRect(ctx, -20 * scale, 16 * scale, 40 * scale * (clamp(region.hp, 0, 100) / 100), 7 * scale, 4 * scale);
  ctx.fill();
  ctx.restore();

  if (scale < 0.8 && !selected) {
    return;
  }
  const tags = [];
  if (region.pvo) tags.push(`ПВО${region.pvo}`);
  if (region.radar) tags.push(`Р${region.radar}`);
  if (region.fighters) tags.push(`F${region.fighters}`);
  if (tags.length) {
    ctx.save();
    ctx.fillStyle = "rgba(17, 24, 39, 0.76)";
    roundRect(ctx, p.x - 34 * scale, p.y + 46 * scale, 68 * scale, 18 * scale, 7 * scale);
    ctx.fill();
    ctx.fillStyle = "#eaf2ff";
    ctx.font = `800 ${Math.max(8, 10 * scale)}px Segoe UI, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(tags.join(" "), p.x, p.y + 58 * scale);
    ctx.restore();
  }
}

function drawBaseMarker(region, p, statusColor, selected) {
  const scale = markerScale();
  const yOffset = 22 * scale;
  const width = 38 * scale;
  const icon = 24 * scale;

  ctx.save();
  ctx.translate(p.x, p.y + yOffset);
  ctx.shadowColor = selected ? "rgba(57, 168, 255, 0.75)" : "rgba(0,0,0,0.70)";
  ctx.shadowBlur = selected ? 18 : 12;
  ctx.fillStyle = "rgba(8, 24, 38, 0.95)";
  roundRect(ctx, -width / 2, -width / 2, width, width, 8 * scale);
  ctx.fill();
  ctx.strokeStyle = selected ? "#ffd24c" : "rgba(80, 210, 255, 0.62)";
  ctx.lineWidth = selected ? 2 : 1;
  ctx.stroke();
  drawUnitIcon(region.pvo ? "buyPvo" : region.radar ? "buyRadar" : "buyFort", -icon / 2, -icon / 2, icon, icon);
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  roundRect(ctx, -20 * scale, 16 * scale, 40 * scale, 7 * scale, 4 * scale);
  ctx.fill();
  ctx.fillStyle = statusColor;
  roundRect(ctx, -20 * scale, 16 * scale, 40 * scale * (clamp(region.hp, 0, 100) / 100), 7 * scale, 4 * scale);
  ctx.fill();
  ctx.restore();

  if (scale < 0.8 && !selected) return;
  const tags = [];
  if (region.pvo) tags.push(`ППО${region.pvo}`);
  if (region.radar) tags.push(`РЛС${region.radar}`);
  if (region.fighters) tags.push(`F${region.fighters}`);
  if (tags.length) {
    ctx.save();
    ctx.fillStyle = "rgba(4, 13, 22, 0.82)";
    roundRect(ctx, p.x - 35 * scale, p.y + 46 * scale, 70 * scale, 18 * scale, 6 * scale);
    ctx.fill();
    ctx.strokeStyle = "rgba(80, 210, 255, 0.32)";
    ctx.stroke();
    ctx.fillStyle = "#dff5ff";
    ctx.font = `800 ${Math.max(8, 10 * scale)}px Segoe UI, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(tags.join(" "), p.x, p.y + 58 * scale);
    ctx.restore();
  }
}

function drawDefenseRings(region, p) {
  ctx.save();
  if (region.pvo > 0) {
    ctx.strokeStyle = "rgba(57, 168, 255, 0.48)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 75 + region.pvo * 11, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (region.radar > 0) {
    ctx.strokeStyle = "rgba(66, 216, 121, 0.42)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 118 + region.radar * 15, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemySitesLegacyLine4443() {
  for (const site of state.enemySites) {
    if (!site.found) continue;
    const p = project(site);
    const hp = clamp(site.hp / site.maxHp, 0, 1);
    ctx.save();
    if (site.revealPulse > 0) {
      ctx.globalAlpha = clamp(site.revealPulse / 1.8, 0, 1);
      ctx.strokeStyle = "#fb923c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 30 + (1.8 - site.revealPulse) * 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = site.destroyed ? "rgba(107, 114, 128, 0.92)" : "rgba(220, 38, 38, 0.96)";
    ctx.strokeStyle = "#fff1f2";
    ctx.lineWidth = 2;
    ctx.fillRect(-13, -13, 26, 26);
    ctx.strokeRect(-13, -13, 26, 26);
    ctx.restore();

    ctx.fillStyle = "rgba(17, 24, 39, 0.72)";
    roundRect(ctx, p.x - 38, p.y + 18, 76, 8, 4);
    ctx.fill();
    ctx.fillStyle = site.destroyed ? "#9ca3af" : "#fb923c";
    roundRect(ctx, p.x - 38, p.y + 18, 76 * hp, 8, 4);
    ctx.fill();
    ctx.fillStyle = "#7f1d1d";
    ctx.font = "900 11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(site.destroyed ? "Уничтожено" : site.type, p.x, p.y - 22);
  }
}

function drawUnitRoutes() {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  for (const unit of state.playerUnits) {
    const type = PLAYER_UNIT_TYPES[unit.type];
    if (!unit.target) continue;
    const from = project(unit);
    const to = project(unit.target);
    ctx.strokeStyle = hexToRgba(type.color, unit.id === state.selectedUnitId ? 0.82 : 0.38);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.arc(to.x, to.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (inputState.activeUnitId && inputState.previewGeo) {
    const unit = state.playerUnits.find((item) => item.id === inputState.activeUnitId);
    if (unit) {
      const type = PLAYER_UNIT_TYPES[unit.type];
      const from = project(unit);
      const to = project(inputState.previewGeo);
      ctx.strokeStyle = hexToRgba(type.color, 0.92);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawPlayerMissiles() {
  for (const missile of state.playerMissiles) {
    const p = project(missile);
    const target = project(missile.target);
    ctx.save();
    ctx.strokeStyle = "rgba(255, 69, 58, 0.38)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    missile.trail.forEach((trail) => {
      const tp = project(trail);
      ctx.globalAlpha = trail.life * 0.6;
      ctx.fillStyle = "#ff453a";
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    drawThreatShape({ color: "#ff453a", shape: "missile" }, p.x, p.y, bearingToScreen(missile, missile.target));
    ctx.restore();
  }
}

function drawPlayerUnitsLegacyLine4541() {
  for (const unit of state.playerUnits) {
    const type = PLAYER_UNIT_TYPES[unit.type];
    const p = project(unit);
    const selected = unit.id === state.selectedUnitId;
    ctx.save();
    unit.trail.forEach((trail) => {
      const tp = project(trail);
      ctx.globalAlpha = trail.life * 0.36;
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (selected) {
      ctx.strokeStyle = hexToRgba(type.color, 0.42);
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 6]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 31, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    drawTacticalPlate(p.x, p.y, type.color, 42, selected);
    ctx.fillStyle = hexToRgba(type.color, 0.20);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
    ctx.fill();
    drawUnitIcon(type.icon, p.x - 14, p.y - 14, 28, 28);
    ctx.fillStyle = "rgba(3, 10, 18, 0.88)";
    roundRect(ctx, p.x - 28, p.y + 25, 56, 15, 5);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(type.color, 0.55);
    ctx.stroke();
    ctx.fillStyle = selected ? "#ffd24c" : "#dff5ff";
    ctx.font = "900 9px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 4;
    ctx.fillText(unit.type === "soldiers" ? "АТО" : unit.type === "fighter" ? "F" : "UAV", p.x, p.y + 30);
    ctx.restore();
  }
}

function drawThreats() {
  for (const threat of state.threats) {
    const type = THREAT_TYPES[threat.type];
    const p = project(threat);
    const target = getRegion(threat.targetId);
    const targetP = target ? project(target) : p;
    ctx.save();
    ctx.strokeStyle = hexToRgba(type.color, 0.34);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(targetP.x, targetP.y);
    ctx.stroke();
    threat.trail.forEach((trail) => {
      const tp = project(trail);
      ctx.globalAlpha = trail.life * 0.48;
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    drawThreatShape(type, p.x, p.y, bearingToScreen(threat, target || threat));
    ctx.restore();
  }
}

function drawTacticalPlate(x, y, color, size = 32, selected = false) {
  const half = size / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = hexToRgba(color, selected ? 0.85 : 0.55);
  ctx.shadowBlur = selected ? 20 : 14;
  ctx.fillStyle = "rgba(4, 13, 22, 0.82)";
  ctx.strokeStyle = hexToRgba(color, selected ? 0.96 : 0.68);
  ctx.lineWidth = selected ? 2.2 : 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -half);
  ctx.lineTo(half * 0.86, -half * 0.5);
  ctx.lineTo(half * 0.86, half * 0.5);
  ctx.lineTo(0, half);
  ctx.lineTo(-half * 0.86, half * 0.5);
  ctx.lineTo(-half * 0.86, -half * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 0.26;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, half * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const corner = half * 0.42;
  ctx.strokeStyle = selected ? "#ffd24c" : "rgba(230, 247, 255, 0.62)";
  ctx.beginPath();
  ctx.moveTo(-half - 3, -corner);
  ctx.lineTo(-half - 3, -half - 3);
  ctx.lineTo(-corner, -half - 3);
  ctx.moveTo(half + 3, -corner);
  ctx.lineTo(half + 3, -half - 3);
  ctx.lineTo(corner, -half - 3);
  ctx.moveTo(-half - 3, corner);
  ctx.lineTo(-half - 3, half + 3);
  ctx.lineTo(-corner, half + 3);
  ctx.moveTo(half + 3, corner);
  ctx.lineTo(half + 3, half + 3);
  ctx.lineTo(corner, half + 3);
  ctx.stroke();
  ctx.restore();
}

function drawThreatShapeLegacyLine4660(type, x, y, angle) {
  drawTacticalPlate(x, y, type.color, type.shape === "missile" ? 30 : 34);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = hexToRgba(type.color, 0.92);
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = 1.8;
  if (type.shape === "missile") {
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-11, -6);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-11, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = hexToRgba(type.color, 0.72);
    ctx.beginPath();
    ctx.moveTo(-14, -7);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-14, 7);
    ctx.stroke();
    ctx.restore();
    return;
  } else if (type.shape === "fighter") {
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-13, -11);
    ctx.lineTo(-6, -2);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-6, 2);
    ctx.lineTo(-13, 11);
    ctx.closePath();
  } else if (type.shape === "heli") {
    roundRect(ctx, -11, -6, 22, 12, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 14);
    ctx.moveTo(10, 0);
    ctx.lineTo(18, 7);
    ctx.stroke();
    ctx.restore();
    return;
  } else if (type.shape === "diamond") {
    ctx.beginPath();
    ctx.rotate(Math.PI / 4);
    ctx.rect(-9, -9, 18, 18);
  } else if (type.shape === "square") {
    ctx.beginPath();
    roundRect(ctx, -11, -8, 22, 16, 3);
  } else {
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, 8);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawEffectsLegacyLine4727() {
  for (const effect of state.effects) {
    const p = project(effect);
    const alpha = clamp(effect.life, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = effect.color;
    ctx.fillStyle = hexToRgba(effect.color, 0.16 * alpha);
    ctx.lineWidth = effect.kind === "strike" ? 4 : 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, effect.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (effect.kind === "strike") {
      ctx.beginPath();
      ctx.moveTo(p.x - effect.radius * 0.46, p.y);
      ctx.lineTo(p.x + effect.radius * 0.46, p.y);
      ctx.moveTo(p.x, p.y - effect.radius * 0.46);
      ctx.lineTo(p.x, p.y + effect.radius * 0.46);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawModeBadgeLegacyLine4752() {
  if (state.mode === "inspect") return;
  const rect = canvas.getBoundingClientRect();
  if (state.mode === "placeUnit" && state.pendingUnitType) {
    const label = `Поставка: ${PLAYER_UNIT_TYPES[state.pendingUnitType].name}`;
    ctx.save();
    ctx.fillStyle = "rgba(17, 24, 39, 0.86)";
    ctx.strokeStyle = "rgba(250, 204, 21, 0.70)";
    roundRect(ctx, rect.width / 2 - 128, 96, 256, 38, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "900 13px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, rect.width / 2, 119);
    ctx.restore();
    return;
  }
  const label = {
    recon: "Режим: разведка",
    strike: "Режим: ракетный удар",
    specops: "Режим: спецгруппа",
    intercept: "Режим: ручной пуск"
  }[state.mode];
  ctx.save();
  ctx.fillStyle = "rgba(17, 24, 39, 0.86)";
  ctx.strokeStyle = "rgba(250, 204, 21, 0.70)";
  roundRect(ctx, rect.width / 2 - 116, 96, 232, 38, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "900 13px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, rect.width / 2, 119);
  ctx.restore();
}

function drawBlob(region, color, alpha, stroke) {
  const points = blobPoints(region);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  points.forEach((point, index) => {
    const p = project(point);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.4;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function blobPoints(region) {
  const points = [];
  for (let i = 0; i < 14; i += 1) {
    const angle = (Math.PI * 2 * i) / 14;
    const n = 1 + Math.sin(region.seed + i * 1.9) * 0.12 + Math.cos(region.seed * 0.7 + i) * 0.08;
    points.push({
      lat: region.lat + Math.sin(angle) * region.ry * n,
      lng: region.lng + Math.cos(angle) * region.rx * n
    });
  }
  return points;
}

function drawNoise(width, height) {
  ctx.save();
  for (let i = 0; i < 900; i += 1) {
    const x = (Math.sin(i * 93.17) * 0.5 + 0.5) * width;
    const y = (Math.cos(i * 47.71) * 0.5 + 0.5) * height;
    const r = 0.5 + ((i * 13) % 7) * 0.18;
    ctx.fillStyle = i % 5 === 0 ? "rgba(112, 142, 89, 0.11)" : "rgba(255, 255, 255, 0.035)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRedHatching(points) {
  ctx.save();
  ctx.beginPath();
  traceSmoothGeoPolygon(points);
  ctx.clip();
  ctx.strokeStyle = "rgba(255, 69, 58, 0.24)";
  ctx.lineWidth = 1.5;
  const rect = canvas.getBoundingClientRect();
  for (let x = -rect.height; x < rect.width + rect.height; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, rect.height);
    ctx.lineTo(x + rect.height, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGeoPolygon(points, fill, stroke, lineWidth) {
  ctx.save();
  ctx.beginPath();
  points.forEach(([lng, lat], index) => {
    const p = project({ lat, lng });
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSmoothGeoPolygon(points, fill, stroke, lineWidth, glow = null) {
  ctx.save();
  ctx.beginPath();
  traceSmoothGeoPolygon(points);
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = Math.max(5, lineWidth * 2.5);
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function traceSmoothGeoPolygon(points) {
  if (!points.length) return;
  const projected = points.map(([lng, lat]) => project({ lat, lng }));
  if (projected.length < 3) {
    projected.forEach((p, index) => {
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    return;
  }
  const last = projected[projected.length - 1];
  const first = projected[0];
  ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
  for (let i = 0; i < projected.length; i += 1) {
    const current = projected[i];
    const next = projected[(i + 1) % projected.length];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
  }
  ctx.closePath();
}

function getConceptMapRect() {
  const northWest = project({ lat: GAME_BOUNDS.north, lng: GAME_BOUNDS.west });
  const southEast = project({ lat: GAME_BOUNDS.south, lng: GAME_BOUNDS.east });
  return {
    x: Math.min(northWest.x, southEast.x),
    y: Math.min(northWest.y, southEast.y),
    w: Math.abs(southEast.x - northWest.x),
    h: Math.abs(southEast.y - northWest.y)
  };
}

function traceSmoothPhotoPolygon(points, rect) {
  if (!points.length) return;
  const projected = points.map(([x, y]) => ({
    x: rect.x + x * rect.w,
    y: rect.y + y * rect.h
  }));
  const last = projected[projected.length - 1];
  const first = projected[0];
  ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
  for (let i = 0; i < projected.length; i += 1) {
    const current = projected[i];
    const next = projected[(i + 1) % projected.length];
    ctx.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
  }
  ctx.closePath();
}

function drawUkraineOutline() {
  if (isGoogleMapActive() || !conceptImage || !conceptImage.complete || !conceptImage.naturalWidth) {
    drawSmoothGeoPolygon(UKRAINE_OUTLINE, "rgba(16, 84, 70, 0.14)", "rgba(77, 188, 255, 0.98)", 3.1, "rgba(77, 188, 255, 0.24)");
    return;
  }
  const rect = getConceptMapRect();
  ctx.save();
  ctx.beginPath();
  traceSmoothPhotoPolygon(UKRAINE_PHOTO_OUTLINE, rect);
  ctx.fillStyle = "rgba(16, 84, 70, 0.08)";
  ctx.strokeStyle = "rgba(77, 188, 255, 1)";
  ctx.lineWidth = 3.2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(77, 188, 255, 0.30)";
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawBtrIconCard(x, y, size) {
  const pad = size * 0.10;
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "rgba(4, 13, 22, 0.94)";
  ctx.strokeStyle = "rgba(52, 211, 153, 0.92)";
  ctx.lineWidth = Math.max(1, size * 0.045);
  roundRect(ctx, -size / 2, -size / 2, size, size, Math.max(4, size * 0.12));
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(22, 101, 52, 0.96)";
  ctx.strokeStyle = "rgba(187, 247, 208, 0.72)";
  ctx.lineWidth = Math.max(1, size * 0.035);
  roundRect(ctx, -size / 2 + pad * 1.35, -size * 0.17, size - pad * 2.2, size * 0.34, size * 0.08);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(21, 128, 61, 0.95)";
  roundRect(ctx, -size * 0.22, -size * 0.25, size * 0.34, size * 0.20, size * 0.05);
  ctx.fill();
  ctx.strokeStyle = "rgba(3, 7, 18, 0.75)";
  ctx.lineWidth = Math.max(1, size * 0.026);
  ctx.beginPath();
  ctx.moveTo(size * 0.10, -size * 0.15);
  ctx.lineTo(size * 0.30, -size * 0.25);
  ctx.stroke();

  ctx.fillStyle = "#07120d";
  for (const side of [-1, 1]) {
    for (const px of [-0.28, 0, 0.28]) {
      ctx.beginPath();
      ctx.arc(size * px, side * size * 0.25, size * 0.065, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(-size * 0.24, size * 0.03, size * 0.22, size * 0.035);
  ctx.fillStyle = "#facc15";
  ctx.fillRect(-size * 0.02, size * 0.03, size * 0.22, size * 0.035);
  ctx.restore();
}

function drawUnitIcon(action, x, y, size) {
  if ((action === "natoCargo" || action === "supplyCargo") && cargoPlaneCardsImage && cargoPlaneCardsImage.complete && cargoPlaneCardsImage.naturalWidth) {
    const cardIndex = action === "natoCargo" ? 0 : 1;
    const cardW = cargoPlaneCardsImage.naturalWidth / 2;
    const cardH = cargoPlaneCardsImage.naturalHeight;
    ctx.drawImage(cargoPlaneCardsImage, cardIndex * cardW, 0, cardW, cardH, x, y, size, size);
    return;
  }
  if ((action === "buyHQ" || action === "buySeaDrone" || action === "buyPatrolBoat") && campaignCardsImage && campaignCardsImage.complete && campaignCardsImage.naturalWidth) {
    const cardIndex = action === "buyHQ" ? 0 : action === "buySeaDrone" ? 1 : 2;
    const cardW = campaignCardsImage.naturalWidth / 3;
    const cardH = campaignCardsImage.naturalHeight;
    ctx.drawImage(campaignCardsImage, cardIndex * cardW, 0, cardW, cardH, x, y, size, size);
    return;
  }
  if (action === "buyBtr") {
    if (btrCardImage && btrCardImage.complete && btrCardImage.naturalWidth) {
      ctx.drawImage(btrCardImage, x, y, size, size);
      return;
    }
    drawBtrIconCard(x, y, size);
    return;
  }
  if ((action === "buyTank" || action === "buyHelicopter") && vehicleCardsImage && vehicleCardsImage.complete && vehicleCardsImage.naturalWidth) {
    const cardIndex = action === "buyTank" ? 0 : 1;
    const cardW = vehicleCardsImage.naturalWidth / 2;
    const cardH = vehicleCardsImage.naturalHeight;
    ctx.drawImage(vehicleCardsImage, cardIndex * cardW, 0, cardW, cardH, x, y, size, size);
    return;
  }
  if (!unitSheet || !unitSheet.complete || !unitSheet.naturalWidth) {
    return;
  }
  const position = SHOP_ICON_INDEX[action] || [0, 0];
  const cellW = unitSheet.naturalWidth / 4;
  const cellH = unitSheet.naturalHeight / 2;
  ctx.drawImage(unitSheet, position[0] * cellW, position[1] * cellH, cellW, cellH, x, y, size, size);
}

function markerScale() {
  const width = canvas.getBoundingClientRect().width;
  if (width < 520) return 0.62;
  if (width < 820) return 0.78;
  return 1;
}

function getCameraView() {
  const baseLngSpan = GAME_BOUNDS.east - GAME_BOUNDS.west;
  const baseLatSpan = GAME_BOUNDS.north - GAME_BOUNDS.south;
  const lngSpan = baseLngSpan / state.camera.zoom;
  const latSpan = baseLatSpan / state.camera.zoom;
  clampCamera();
  return {
    west: state.camera.centerLng - lngSpan / 2,
    east: state.camera.centerLng + lngSpan / 2,
    south: state.camera.centerLat - latSpan / 2,
    north: state.camera.centerLat + latSpan / 2
  };
}

function clampCamera() {
  state.camera.zoom = clamp(state.camera.zoom, 1, 2.35);
  const lngSpan = (GAME_BOUNDS.east - GAME_BOUNDS.west) / state.camera.zoom;
  const latSpan = (GAME_BOUNDS.north - GAME_BOUNDS.south) / state.camera.zoom;
  const minLng = WORLD_BOUNDS.west + lngSpan / 2;
  const maxLng = WORLD_BOUNDS.east - lngSpan / 2;
  const minLat = WORLD_BOUNDS.south + latSpan / 2;
  const maxLat = WORLD_BOUNDS.north - latSpan / 2;
  state.camera.centerLng = minLng > maxLng
    ? (WORLD_BOUNDS.west + WORLD_BOUNDS.east) / 2
    : clamp(state.camera.centerLng, minLng, maxLng);
  state.camera.centerLat = minLat > maxLat
    ? (WORLD_BOUNDS.south + WORLD_BOUNDS.north) / 2
    : clamp(state.camera.centerLat, minLat, maxLat);
}

function panCameraByPixels(dx, dy) {
  if (isGoogleMapActive()) {
    map.panBy(-dx, -dy);
    render();
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const view = getCameraView();
  const lngPerPixel = (view.east - view.west) / Math.max(1, rect.width);
  const latPerPixel = (view.north - view.south) / Math.max(1, rect.height);
  state.camera.centerLng -= dx * lngPerPixel;
  state.camera.centerLat += dy * latPerPixel;
  clampCamera();
}

function zoomCamera(delta, anchorPoint = null) {
  if (isGoogleMapActive()) {
    const nextZoom = clamp((map.getZoom() || 5) + (delta > 0 ? 1 : -1), 4, 8);
    map.setZoom(nextZoom);
    setTimeout(() => render(), 80);
    return;
  }
  const anchorGeo = anchorPoint ? screenToGeoFallback(anchorPoint.x, anchorPoint.y) : null;
  const oldZoom = state.camera.zoom;
  state.camera.zoom = clamp(state.camera.zoom + delta, 1, 2.35);
  clampCamera();
  if (anchorGeo && state.camera.zoom !== oldZoom) {
    const afterGeo = screenToGeoFallback(anchorPoint.x, anchorPoint.y);
    state.camera.centerLng += anchorGeo.lng - afterGeo.lng;
    state.camera.centerLat += anchorGeo.lat - afterGeo.lat;
    clampCamera();
  }
}

function project(pos) {
  if (isGoogleMapActive()) {
    try {
      const projection = mapOverlay.getProjection();
      const latLng = new google.maps.LatLng(pos.lat, pos.lng);
      const point = projection.fromLatLngToContainerPixel
        ? projection.fromLatLngToContainerPixel(latLng)
        : projection.fromLatLngToDivPixel(latLng);
      if (point) return { x: point.x, y: point.y };
    } catch (error) {
      return projectFallback(pos);
    }
  }
  return projectFallback(pos);
}

function projectFallback(pos) {
  const rect = canvas.getBoundingClientRect();
  const view = getCameraView();
  const x = ((pos.lng - view.west) / (view.east - view.west)) * rect.width;
  const y = ((view.north - pos.lat) / (view.north - view.south)) * rect.height;
  return { x, y };
}

function screenToGeo(x, y) {
  if (isGoogleMapActive()) {
    try {
      const projection = mapOverlay.getProjection();
      const latLng = projection.fromContainerPixelToLatLng
        ? projection.fromContainerPixelToLatLng(new google.maps.Point(x, y))
        : null;
      if (latLng) return { lat: latLng.lat(), lng: latLng.lng() };
    } catch (error) {
      return screenToGeoFallback(x, y);
    }
  }
  return screenToGeoFallback(x, y);
}

function screenToGeoFallback(x, y) {
  const rect = canvas.getBoundingClientRect();
  const view = getCameraView();
  return {
    lng: view.west + (x / rect.width) * (view.east - view.west),
    lat: view.north - (y / rect.height) * (view.north - view.south)
  };
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

const SEA_ZONES = [
  { name: "Черное море", lat: 44.75, lng: 33.2, ry: 1.65, rx: 5.15 },
  { name: "Одесский залив", lat: 45.92, lng: 30.55, ry: 1.08, rx: 2.15 },
  { name: "Азовское море", lat: 46.15, lng: 36.55, ry: 0.82, rx: 2.45 },
  { name: "Крымское побережье", lat: 45.3, lng: 34.45, ry: 0.95, rx: 2.65 }
];

function isSeaPoint(point) {
  if (!point) return false;
  return SEA_ZONES.some((zone) => {
    const dx = (point.lng - zone.lng) / zone.rx;
    const dy = (point.lat - zone.lat) / zone.ry;
    return dx * dx + dy * dy <= 1;
  });
}

function isNavalUnitType(typeId) {
  return Boolean(PLAYER_UNIT_TYPES[typeId]?.naval);
}

function isSeaTargetSpec(targetSpec) {
  if (!targetSpec) return false;
  if (targetSpec.kind === "site") {
    const site = state.enemySites.find((item) => item.id === targetSpec.id);
    return Boolean(site && (site.id === "blackSeaFleet" || isSeaPoint(site)));
  }
  if (targetSpec.kind === "threat") {
    const threat = state.threats.find((item) => item.id === targetSpec.id);
    return Boolean(threat && (threat.type === "seaDrone" || isSeaPoint(threat)));
  }
  if (targetSpec.kind === "region" || targetSpec.kind === "installation" || targetSpec.kind === "friendlyUnit") {
    return false;
  }
  return isSeaPoint(targetSpec);
}

function rejectNavalLandTarget(typeName) {
  setModeHint(`${typeName}: выберите точку в Черном или Азовском море. По суше морская техника не ходит.`);
  addLog(`${typeName}: нельзя ставить или вести по суше. Выберите морскую точку.`, "warn");
  updateHud();
}

function findRegionAt(x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const region of state.regions) {
    const p = project(region);
    const dist = Math.hypot(p.x - x, p.y - y);
    if (dist < bestDist) {
      best = region;
      bestDist = dist;
    }
  }
  return bestDist < 58 ? best : null;
}

function findThreatAt(x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const threat of state.threats) {
    const p = project(threat);
    const dist = Math.hypot(p.x - x, p.y - y);
    if (dist < bestDist) {
      best = threat;
      bestDist = dist;
    }
  }
  return bestDist < 36 ? best : null;
}

function findSiteAtLegacyLine5182(x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const site of state.enemySites) {
    if (!site.found || site.destroyed) continue;
    const p = project(site);
    const dist = Math.hypot(p.x - x, p.y - y);
    if (dist < bestDist) {
      best = site;
      bestDist = dist;
    }
  }
  return bestDist < 46 ? best : null;
}

function findPlayerUnitAt(x, y) {
  let best = null;
  let bestDist = Infinity;
  let bestRadius = 0;
  for (const unit of state.playerUnits) {
    if (unit.destroyed) continue;
    const p = project(unit);
    const dist = Math.hypot(p.x - x, p.y - y);
    const radius =
      unit.type === "tank" || unit.type === "btr" ? 52 :
      unit.type === "fighter" || unit.type === "helicopter" ? 46 :
      unit.type === "engineer" ? 34 :
      unit.type === "soldiers" ? 38 : 42;
    if (dist < bestDist) {
      best = unit;
      bestDist = dist;
      bestRadius = radius;
    }
  }
  return bestDist < bestRadius ? best : null;
}

function findPlayerInstallationAt(x, y, includeDestroyed = false) {
  let best = null;
  let bestDist = Infinity;
  for (const installation of state.playerInstallations) {
    if (installation.destroyed && !includeDestroyed) continue;
    const p = project(installation);
    const dist = Math.hypot(p.x - x, p.y - y);
    if (dist < bestDist) {
      best = installation;
      bestDist = dist;
    }
  }
  return bestDist < 34 ? best : null;
}

function findNearestThreat(pos, radius, airborneOnly = false) {
  let best = null;
  let bestDist = Infinity;
  for (const threat of state.threats) {
    if (airborneOnly && !THREAT_TYPES[threat.type].airborne) continue;
    const dist = geoDistance(pos, threat);
    if (dist < radius && dist < bestDist) {
      best = threat;
      bestDist = dist;
    }
  }
  return best;
}

function findNearestEnemySite(pos, radius, includeHidden = false) {
  let best = null;
  let bestDist = Infinity;
  for (const site of state.enemySites) {
    if (site.destroyed) continue;
    if (!includeHidden && !site.found) continue;
    const dist = geoDistance(pos, site);
    if (dist < radius && dist < bestDist) {
      best = site;
      bestDist = dist;
    }
  }
  return best;
}

function getSelectedRegion() {
  return getRegion(state.selectedRegionId);
}

function getRegion(id) {
  return state.regions.find((region) => region.id === id);
}

function pickWeakRegion() {
  const candidates = state.regions.filter((region) => !region.captured);
  if (!candidates.length) return state.regions[0];
  return candidates.slice().sort((a, b) => {
    const aScore = a.hp - a.pressure - (a.pvo + a.radar + a.fort + a.fighters) * 7 + (a.frontline ? -10 : 0);
    const bScore = b.hp - b.pressure - (b.pvo + b.radar + b.fort + b.fighters) * 7 + (b.frontline ? -10 : 0);
    return aScore - bScore;
  })[0];
}

function countPlayerRadarsLegacyLine5281() {
  return state.regions.reduce((sum, region) => sum + region.radar, 0);
}

function enemyIncomeRateLegacyLine5285() {
  if (!state.enemySites.some((site) => !site.destroyed)) return 0;
  const base = 5.6 + state.day * 0.08;
  const siteIncome = state.enemySites.filter((site) => !site.destroyed).reduce((sum, site) => sum + site.income, 0);
  return base + siteIncome;
}

function interpolate(a, b, t) {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t
  };
}

function geoDistance(a, b) {
  return Math.hypot((a.lat - b.lat) * 1.12, a.lng - b.lng);
}

function bearingToScreen(a, b) {
  const pa = project(a);
  const pb = project(b);
  return Math.atan2(pb.y - pa.y, pb.x - pa.x);
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cryptoId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function launchInterceptor(origin, target, hit, enemyOwned = false) {
  const targetKind = state.threats.includes(target)
    ? "threat"
    : state.playerMissiles.includes(target)
      ? "missile"
      : "unit";
  state.interceptors.push({
    id: cryptoId(),
    enemyOwned,
    targetKind,
    targetId: target.id,
    lat: origin.lat,
    lng: origin.lng,
    target: { lat: target.lat, lng: target.lng },
    speed: enemyOwned ? 1.65 : 1.85,
    hit,
    trail: []
  });
  addEffect("pop", origin.lat, origin.lng, enemyOwned ? "#ff6b6b" : "#e0f2fe");
}

function planThreatRouteLegacyLine5345(origin, target, typeId) {
  if (!THREAT_TYPES[typeId].airborne) return null;
  const directRisk = routePvoRisk(origin, target);
  const candidates = [
    { lat: (origin.lat + target.lat) / 2 + 1.05, lng: (origin.lng + target.lng) / 2 - 1.15 },
    { lat: (origin.lat + target.lat) / 2 - 1.05, lng: (origin.lng + target.lng) / 2 + 1.15 },
    { lat: Math.max(WORLD_BOUNDS.south, target.lat - 1.25), lng: Math.min(WORLD_BOUNDS.east, origin.lng + 1.65) },
    { lat: Math.min(WORLD_BOUNDS.north, target.lat + 1.25), lng: Math.max(WORLD_BOUNDS.west, origin.lng - 1.65) }
  ];
  let best = null;
  let bestRisk = directRisk;
  for (const waypoint of candidates) {
    const risk = routePvoRisk(origin, waypoint) + routePvoRisk(waypoint, target) + geoDistance(origin, waypoint) * 0.06;
    if (risk < bestRisk) {
      bestRisk = risk;
      best = waypoint;
    }
  }
  return best && directRisk - bestRisk > 0.35 ? { waypoint: best } : null;
}

function getThreatRoutePoint(threat, target) {
  if (!threat.route || !threat.route.waypoint) return target;
  if (threat.progress < 0.56) {
    return threat.route.waypoint;
  }
  const t = (threat.progress - 0.56) / 0.44;
  return interpolate(threat.route.waypoint, target, clamp(t, 0, 1));
}

function routePvoRisk(a, b) {
  let risk = 0;
  for (const region of state.regions) {
    if (region.captured || (region.pvo <= 0 && region.radar <= 0)) continue;
    const dist = distancePointToSegment(region, a, b);
    const range = 1.12 + region.radar * 0.28;
    if (dist < range) {
      risk += (range - dist) * (region.pvo * 1.8 + region.radar * 0.55 + region.fighters * 0.8);
    }
  }
  return risk;
}

function distancePointToSegment(point, a, b) {
  const ax = a.lng;
  const ay = a.lat * 1.12;
  const bx = b.lng;
  const by = b.lat * 1.12;
  const px = point.lng;
  const py = point.lat * 1.12;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

function updateInterceptors(dt) {
  const finished = [];
  for (const interceptor of state.interceptors) {
    const target = interceptor.targetKind === "threat"
      ? state.threats.find((item) => item.id === interceptor.targetId)
      : interceptor.targetKind === "missile"
        ? state.playerMissiles.find((item) => item.id === interceptor.targetId)
        : state.playerUnits.find((item) => item.id === interceptor.targetId);
    if (!target) {
      finished.push(interceptor);
      continue;
    }
    interceptor.target = { lat: target.lat, lng: target.lng };
    const dist = Math.max(0.001, geoDistance(interceptor, target));
    const step = Math.min(1, (interceptor.speed * INTERCEPTOR_SPEED_SCALE * dt) / dist);
    interceptor.lat += (target.lat - interceptor.lat) * step;
    interceptor.lng += (target.lng - interceptor.lng) * step;
    interceptor.trail.push({ lat: interceptor.lat, lng: interceptor.lng, life: 1 });
    if (interceptor.trail.length > 14) interceptor.trail.shift();
    interceptor.trail.forEach((point) => {
      point.life -= dt * 3.2;
    });
    interceptor.trail = interceptor.trail.filter((point) => point.life > 0);

    if (geoDistance(interceptor, target) < 0.075) {
      finished.push(interceptor);
      if (!interceptor.hit) {
        addEffect("miss", target.lat, target.lng, "#facc15");
        continue;
      }
      if (interceptor.targetKind === "threat") {
        target.hp = 0;
        addEffect("airburst", target.lat, target.lng, THREAT_TYPES[target.type].color);
        addLog(`ПВО сработало: ${THREAT_TYPES[target.type].name} сбит.`, "good");
      } else if (interceptor.targetKind === "missile") {
        addEffect("airburst", target.lat, target.lng, "#ef4444");
        state.playerMissiles = state.playerMissiles.filter((missile) => missile.id !== target.id);
        addLog("ПВО РФ сбило нашу ракету.", "bad");
      } else {
        addEffect("airburst", target.lat, target.lng, PLAYER_UNIT_TYPES[target.type].color);
        countPlayerUnitCasualties(target, `ПВО РФ сбило ${PLAYER_UNIT_TYPES[target.type].name}`);
        target.destroyed = true;
        if (target.type === "natoCargo" && target.supplyAction) {
          addLog(`ПВО РФ сбило самолет снабжения: ${target.supplyLabel || "ракеты"} не прибудут на завод.`, "bad");
        } else {
          addLog(`ПВО РФ сбило наш юнит: ${PLAYER_UNIT_TYPES[target.type].name}.`, "bad");
        }
      }
    }
  }
  if (finished.length) {
    state.interceptors = state.interceptors.filter((interceptor) => !finished.includes(interceptor));
  }
}

function runAirDefenseLegacyLine5454(threat, dt) {
  const type = THREAT_TYPES[threat.type];
  if (!type.airborne) return;
  let fighterPressure = 0;
  let pvoStrength = 0;
  let bestRegion = null;
  let bestDist = Infinity;
  for (const region of state.regions) {
    if (region.captured || region.pvo <= 0) continue;
    const dist = geoDistance(threat, region);
    if (dist < 1.22 + region.radar * 0.28) {
      pvoStrength += region.pvo + region.radar * 0.35;
      if (dist < bestDist) {
        bestDist = dist;
        bestRegion = region;
      }
    }
    if (dist < 1.72 && region.fighters > 0 && (threat.type === "fighter" || threat.type === "helicopter" || threat.type === "cruise")) {
      fighterPressure += region.fighters * 0.38 * dt;
    }
  }
  if (pvoStrength > 0 && bestRegion) {
    threat.pvoCooldown -= dt * Math.max(1, pvoStrength * 0.72);
    if (threat.pvoCooldown <= 0) {
      threat.pvoCooldown = randomRange(0.75, 1.25);
      launchInterceptor(bestRegion, threat, Math.random() < 0.5, false);
    }
  }
  if (fighterPressure > 0) {
    const evasion = threat.type === "fighter" ? 0.58 : threat.type === "cruise" ? 0.70 : 1;
    threat.hp -= fighterPressure * 30 * evasion * randomRange(0.76, 1.20);
  }
}

function runEnemyAirDefenseLegacyLine5488(dt) {
  for (const site of state.enemySites) {
    if (site.destroyed || site.pvo <= 0) continue;
    const range = 1.28 + site.radar * 0.26;
    let best = null;
    let bestDist = Infinity;
    const candidates = [
      ...state.playerMissiles.filter((missile) => !missile.piercing),
      ...state.playerUnits.filter((unit) => unit.type === "recon" || unit.type === "fighter" || unit.type === "helicopter")
    ];
    for (const candidate of candidates) {
      const dist = geoDistance(site, candidate);
      if (dist < range && dist < bestDist) {
        best = candidate;
        bestDist = dist;
      }
    }
    if (!best) continue;
    site.pvoCooldown -= dt * (0.8 + site.pvo * 0.45 + site.radar * 0.18);
    if (site.pvoCooldown <= 0) {
      site.pvoCooldown = randomRange(0.8, 1.4);
      const hitChance = state.playerMissiles.includes(best) ? 0.35 : best.type === "recon" ? 0.52 : 0.42;
      launchInterceptor(site, best, Math.random() < hitChance, true);
    }
  }
}

function applyRegionalSystemDamage(region, amount, sourceName) {
  if (!region) return;
  const severity = clamp(amount / 42, 0.18, 0.98);
  const losses = [];
  if (region.pvo > 0 && Math.random() < severity) {
    region.pvo -= 1;
    losses.push("ПВО");
  }
  if (region.radar > 0 && Math.random() < severity * 0.85) {
    region.radar -= 1;
    losses.push("РЛС");
  }
  if (region.fort > 0 && Math.random() < severity * 0.75) {
    region.fort -= 1;
    losses.push("укрепления");
  }
  if (region.fighters > 0 && Math.random() < severity * 0.55) {
    region.fighters -= 1;
    losses.push("авиация");
  }
  if (losses.length) {
    addLog(`${sourceName}: выведено из строя ${losses.join(", ")} в регионе ${region.name}.`, "bad");
  }
}

function applyThreatDamageLegacyLine5540(threat, region) {
  const type = THREAT_TYPES[threat.type];
  if (threat.type === "scout") {
    state.aiMemory.weakRegionId = pickWeakRegion().id;
    state.enemyBudget += 14;
    addLog(`Разведдрон РФ нашел слабое место: ${getRegion(state.aiMemory.weakRegionId).name}.`, "bad");
    return;
  }
  const damage = type.damage * Math.max(0.35, 1 - region.fort * 0.14);
  region.hp = clamp(region.hp - damage, 0, 100);
  region.pressure += damage;
  state.morale = clamp(state.morale - damage * 0.15, 0, 100);
  applyRegionalSystemDamage(region, damage, type.name);
  addEffect("hit", region.lat, region.lng, type.color);
  addLog(`${type.name} ударил по региону ${region.name}. Инфраструктура -${Math.round(damage)}.`, "bad");
  if (region.hp <= 0 && !region.captured) {
    region.captured = true;
    state.morale = clamp(state.morale - 10, 0, 100);
    addLog(`${region.name}: инфраструктура выведена из строя. Нужен ремонт.`, "bad");
  }
}

function applyTargetDamage(kind, id, amount, color, sourceName, attackerId, impact) {
  if (kind === "threat") {
    const threat = state.threats.find((item) => item.id === id);
    if (threat) {
      threat.hp = 0;
      addEffect("airburst", threat.lat, threat.lng, THREAT_TYPES[threat.type].color);
      addLog(`${sourceName}: техника уничтожена (${THREAT_TYPES[threat.type].name}).`, "good");
      return true;
    }
  }
  if (kind === "site") {
    const site = state.enemySites.find((item) => item.id === id && !item.destroyed);
    if (site) {
      if (!site.found) revealSite(site);
      const attacker = state.playerUnits.find((item) => item.id === attackerId);
      const groundMultiplier = attacker && (attacker.type === "tank" || attacker.type === "btr" || attacker.type === "soldiers")
        ? ENEMY_SITE_GROUND_DAMAGE_MULTIPLIER
        : 1;
      const damage = amount * 1.35 * groundMultiplier;
      site.hp = clamp(site.hp - damage, 0, site.maxHp);
      if (site.pvo > 0 && Math.random() < 0.55) site.pvo -= 1;
      if (site.radar > 0 && Math.random() < 0.45) site.radar -= 1;
      addLog(`${sourceName}: удар по объекту ${site.name}, урон ${Math.round(damage)}.`, "good");
      finishSiteIfDestroyed(site);
      return true;
    }
  }
  if (kind === "friendlyUnit") {
    const friendly = state.playerUnits.find((item) => item.id === id && item.id !== attackerId);
    if (friendly) {
      friendly.hp = 0;
      friendly.destroyed = true;
      addEffect("strike", friendly.lat, friendly.lng, "#ef4444");
      addLog(`Friendly fire: ${sourceName} уничтожил свой юнит (${PLAYER_UNIT_TYPES[friendly.type].name}).`, "bad");
      return true;
    }
  }
  if (kind === "region") {
    const region = getRegion(id);
    if (region) {
      const damage = Math.max(10, amount * 0.72);
      region.hp = clamp(region.hp - damage, 0, 100);
      region.pressure += damage;
      state.morale = clamp(state.morale - damage * 0.10, 0, 100);
      applyRegionalSystemDamage(region, damage, sourceName);
      addCasualties(civilianCasualtiesFromDamage(damage, 1.45), `Friendly fire по ${region.name}`);
      addLog(`Friendly fire: ${sourceName} ударил по региону ${region.name}, урон ${Math.round(damage)}.`, "bad");
      return true;
    }
  }
  damageAtPoint(impact, amount, color, sourceName, attackerId);
  return false;
}

function damageAtPoint(point, amount, color, sourceName, attackerId) {
  const threat = findNearestThreat(point, 0.72, false);
  if (threat) {
    threat.hp = 0;
    addEffect("airburst", threat.lat, threat.lng, THREAT_TYPES[threat.type].color);
    addLog(`${sourceName}: удар по площади уничтожил ${THREAT_TYPES[threat.type].name}.`, "good");
    return;
  }
  const site = findNearestEnemySite(point, 0.95, true);
  if (site) {
    if (!site.found) revealSite(site);
    const attacker = state.playerUnits.find((item) => item.id === attackerId);
    const groundMultiplier = attacker && (attacker.type === "tank" || attacker.type === "btr" || attacker.type === "soldiers")
      ? ENEMY_SITE_GROUND_DAMAGE_MULTIPLIER
      : 1;
    const damage = amount * groundMultiplier;
    site.hp = clamp(site.hp - damage, 0, site.maxHp);
    if (site.pvo > 0 && Math.random() < 0.35) site.pvo -= 1;
    if (site.radar > 0 && Math.random() < 0.30) site.radar -= 1;
    addLog(`${sourceName}: удар по площади задел объект ${site.name}.`, "good");
    finishSiteIfDestroyed(site);
    return;
  }
  const friendly = findNearestFriendlyUnit(point, 0.56, attackerId);
  if (friendly) {
    friendly.hp = 0;
    friendly.destroyed = true;
    countPlayerUnitCasualties(friendly, `Friendly fire: уничтожен ${PLAYER_UNIT_TYPES[friendly.type].name}`);
    addLog(`Friendly fire: ${sourceName} уничтожил свой юнит в зоне удара.`, "bad");
    return;
  }
  const region = findNearestRegionGeo(point, 0.46);
  if (region) {
    const damage = Math.max(8, amount * 0.45);
    region.hp = clamp(region.hp - damage, 0, 100);
    region.pressure += damage;
    applyRegionalSystemDamage(region, damage, sourceName);
    addCasualties(civilianCasualtiesFromDamage(damage, 1.20), `Friendly fire задел ${region.name}`);
    addLog(`Friendly fire: зона удара задела ${region.name}, урон ${Math.round(damage)}.`, "bad");
  }
}

function drawInterceptors() {
  for (const interceptor of state.interceptors) {
    const p = project(interceptor);
    const target = project(interceptor.target);
    ctx.save();
    ctx.strokeStyle = interceptor.enemyOwned ? "rgba(255, 105, 97, 0.72)" : "rgba(224, 242, 254, 0.78)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);
    interceptor.trail.forEach((trail) => {
      const tp = project(trail);
      ctx.globalAlpha = trail.life * 0.75;
      ctx.fillStyle = interceptor.enemyOwned ? "#ff6b6b" : "#e0f2fe";
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(target.y - p.y, target.x - p.x));
    ctx.fillStyle = interceptor.enemyOwned ? "#ff453a" : "#f8fafc";
    ctx.strokeStyle = interceptor.enemyOwned ? "#fff1f2" : "#38bdf8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-7, -3.5);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-7, 3.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function findSiteAt(x, y, includeHidden = false) {
  let best = null;
  let bestDist = Infinity;
  for (const site of state.enemySites) {
    if ((!includeHidden && !site.found) || site.destroyed) continue;
    const p = project(site);
    const dist = Math.hypot(p.x - x, p.y - y);
    if (dist < bestDist) {
      best = site;
      bestDist = dist;
    }
  }
  return bestDist < 46 ? best : null;
}

function findNearestFriendlyUnit(pos, radius, ignoreId = null) {
  let best = null;
  let bestDist = Infinity;
  for (const unit of state.playerUnits) {
    if (unit.id === ignoreId || unit.destroyed) continue;
    const dist = geoDistance(pos, unit);
    if (dist < radius && dist < bestDist) {
      best = unit;
      bestDist = dist;
    }
  }
  return best;
}

function findNearestRegionGeo(pos, radius) {
  let best = null;
  let bestDist = Infinity;
  for (const region of state.regions) {
    const dist = geoDistance(pos, region);
    if (dist < radius && dist < bestDist) {
      best = region;
      bestDist = dist;
    }
  }
  return best;
}

function isEnemySupplyCut() {
  return Boolean(
    state.enemySupplyCut ||
    state.diplomacy.status === "ceasefire" ||
    state.enemySites.every((site) => site.destroyed)
  );
}

function updateActionButtonsLegacyLine5737(selected) {
  document.querySelectorAll("[data-action]").forEach((button) => {
    const action = button.dataset.action;
    const config = ACTIONS[action];
    if (!config) return;
    const strategic = DEFENSE_ACTIONS.has(action) ||
      action === "launchRecon" ||
      action === "launchStrike" ||
      action === "deploySpecOps" ||
      action === "manualIntercept" ||
      action === "buyFighters" ||
      action === "buyHelicopter" ||
      action === "buyTank" ||
      action === "buyBtr" ||
      action === "buySeaDrone" ||
      action === "buyPatrolBoat";
    button.disabled = state.gameOver || state.money < config.cost || (!selected && !strategic);
    button.classList.toggle("is-mode", modeMatchesAction(action));
  });
  if (state.mode === "inspect") {
    setModeHint(selected ? `${selected.name}: выберите покупку или боевое действие.` : "Кликните область на карте или выберите действие.");
  }
}

function modeMatchesActionLegacyLine5759(action) {
  if (state.mode === "placeDefense") {
    return state.pendingDefenseAction === action;
  }
  if (state.mode === "placeUnit" && state.pendingUnitType) {
    return PLAYER_UNIT_TYPES[state.pendingUnitType].action === action;
  }
  return (
    (state.mode === "intercept" && action === "manualIntercept") ||
    (state.mode === "recon" && action === "launchRecon") ||
    (state.mode === "strike" && action === "launchStrike") ||
    (state.mode === "specops" && action === "deploySpecOps")
  );
}

function isConceptMapActive() {
  return false;
}

function drawFallbackMap(width, height) {
  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#d9ded9");
  base.addColorStop(0.42, "#cfd9ce");
  base.addColorStop(1, "#d9d3cc");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  drawNoise(width, height);

  drawGeoPolygon(ARCTIC_SEA_POLYGON, "rgba(126, 183, 211, 0.40)", "rgba(69, 128, 158, 0.24)", 1.1);
  if (conceptImage && conceptImage.complete && conceptImage.naturalWidth) {
    const northWest = project({ lat: GAME_BOUNDS.north, lng: GAME_BOUNDS.west });
    const southEast = project({ lat: GAME_BOUNDS.south, lng: GAME_BOUNDS.east });
    const x = Math.min(northWest.x, southEast.x);
    const y = Math.min(northWest.y, southEast.y);
    const w = Math.abs(southEast.x - northWest.x);
    const h = Math.abs(southEast.y - northWest.y);
    ctx.save();
    ctx.globalAlpha = 0.74;
    ctx.drawImage(
      conceptImage,
      CONCEPT_MAP_CROP.x,
      CONCEPT_MAP_CROP.y,
      CONCEPT_MAP_CROP.width,
      CONCEPT_MAP_CROP.height,
      x,
      y,
      w,
      h
    );
    ctx.restore();
  }

  drawGeoPolygon(BELARUS_POLYGON, "rgba(178, 190, 177, 0.38)", "rgba(104, 119, 116, 0.28)", 1);
  drawSmoothGeoPolygon(RUSSIA_POLYGON, "rgba(196, 75, 74, 0.30)", "rgba(185, 28, 28, 0.72)", 2.4, "rgba(185, 28, 28, 0.18)");
  drawRedHatching(RUSSIA_POLYGON);
  drawGeoPolygon(BLACK_SEA_POLYGON, "rgba(92, 158, 190, 0.62)", "rgba(36, 108, 150, 0.42)", 1.2);
  drawRussiaMapDetailsNearLegacy();

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = "#496272";
  ctx.lineWidth = 1;
  for (let x = -height * 0.2; x < width; x += 54) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height * 0.15, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 54) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y - width * 0.07);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemySites() {
  const rect = canvas.getBoundingClientRect();
  for (const site of state.enemySites) {
    const p = project(site);
    if (p.x < -90 || p.x > rect.width + 90 || p.y < -90 || p.y > rect.height + 90) continue;
    const hp = clamp(site.hp / site.maxHp, 0, 1);
    const known = site.found || site.destroyed;
    const alpha = site.destroyed ? 0.58 : known ? 1 : 0.46;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (site.revealPulse > 0) {
      ctx.globalAlpha = clamp(site.revealPulse / 1.8, 0, 1);
      ctx.strokeStyle = "#fb923c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 30 + (1.8 - site.revealPulse) * 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }
    if (site.pvo > 0 && known && !site.destroyed) {
      ctx.strokeStyle = "rgba(255, 69, 58, 0.18)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 58 + site.pvo * 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    drawEnemySiteGlyph(site, p.x, p.y, known);
    ctx.fillStyle = "rgba(17, 24, 39, 0.72)";
    roundRect(ctx, p.x - 36, p.y + 17, 72, 7, 4);
    ctx.fill();
    ctx.fillStyle = site.destroyed ? "#9ca3af" : known ? "#fb923c" : "#ef4444";
    roundRect(ctx, p.x - 36, p.y + 17, 72 * hp, 7, 4);
    ctx.fill();
    ctx.fillStyle = site.destroyed ? "#4b5563" : known ? "#7f1d1d" : "#991b1b";
    ctx.font = known ? "900 10px Segoe UI, sans-serif" : "900 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255,255,255,0.42)";
    ctx.shadowBlur = known ? 0 : 8;
    ctx.fillText(site.destroyed ? "Уничтожено" : known ? site.type : "?", p.x, p.y - 22);
    if (known && !site.destroyed) {
      ctx.fillStyle = "rgba(3, 10, 18, 0.78)";
      roundRect(ctx, p.x - 30, p.y + 28, 60, 16, 5);
      ctx.fill();
      ctx.fillStyle = "#ffe4e6";
      ctx.font = "800 9px Segoe UI, sans-serif";
      ctx.fillText(`ПВО${site.pvo} РЛС${site.radar}`, p.x, p.y + 39);
    }
    ctx.restore();
  }
}

function drawEnemySiteGlyph(site, x, y, known) {
  const color = site.destroyed ? "#6b7280" : known ? "#dc2626" : "#991b1b";
  drawGeneratedSquareMarker(known ? enemySiteIcon(site) : "buyRadar", x, y, color, known ? 40 : 34, false, 0);
}

function drawThreatShape(type, x, y, angle) {
  drawGeneratedSquareMarker(type.icon || markerIconForShape(type), x, y, type.color, type.shape === "missile" ? 34 : 38, false, angle);
}

function drawGeneratedSquareMarker(icon, x, y, color, size = 38, selected = false, angle = 0) {
  const half = size / 2;
  const iconSize = size * 0.66;
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = hexToRgba(color, selected ? 0.9 : 0.64);
  ctx.shadowBlur = selected ? 18 : 11;
  ctx.fillStyle = "rgba(4, 13, 22, 0.92)";
  ctx.strokeStyle = selected ? "#ffd24c" : hexToRgba(color, 0.94);
  ctx.lineWidth = selected ? 2.4 : 1.8;
  roundRect(ctx, -half, -half, size, size, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = hexToRgba(color, 0.18);
  roundRect(ctx, -half + 4, -half + 4, size - 8, size - 8, 4);
  ctx.fill();

  drawUnitIcon(icon, -iconSize / 2, -iconSize / 2, iconSize, iconSize);

  if (Number.isFinite(angle)) {
    ctx.rotate(angle);
    ctx.fillStyle = selected ? "#ffd24c" : hexToRgba(color, 0.95);
    ctx.beginPath();
    ctx.moveTo(half + 5, 0);
    ctx.lineTo(half - 3, -4);
    ctx.lineTo(half - 3, 4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function markerIconForShape(type) {
  const shape = type.shape || "missile";
  if (shape === "natoCargo") return "natoCargo";
  if (shape === "supplyCargo") return "supplyCargo";
  if (shape === "fighter") return "buyFighters";
  if (shape === "heli") return "buyHelicopter";
  if (shape === "seaDrone") return "buySeaDrone";
  if (shape === "patrolBoat") return "buyPatrolBoat";
  if (shape === "btr") return "buyBtr";
  if (shape === "square") return "buyTank";
  if (shape === "infantry") return "deploySpecOps";
  if (shape === "diamond") return "deploySpecOps";
  if (shape === "scout" || shape === "drone") return "launchRecon";
  return "launchStrike";
}

function enemySiteIcon(site) {
  if (site.factory) return "buyFactory";
  if (/Аэродром|Авиа|Авиагруппа/i.test(site.type)) return "buyFighters";
  if (/Склад|Пуск|рак/i.test(site.type)) return "launchStrike";
  if (/Команд|РЭБ|РЛС/i.test(site.type)) return "buyRadar";
  return "buyFort";
}

function drawPlayerUnits() {
  for (const unit of state.playerUnits) {
    const type = PLAYER_UNIT_TYPES[unit.type];
    const p = project(unit);
    const selected = unit.id === state.selectedUnitId;
    const target = unit.target || { lat: unit.lat, lng: unit.lng + 0.1 };
    const shape = unit.type === "natoCargo" ? (unit.supplyAction ? "supplyCargo" : "natoCargo") :
      unit.type === "fighter" ? "fighter" :
      unit.type === "helicopter" ? "heli" :
        unit.type === "seaDrone" ? "seaDrone" :
          unit.type === "patrolBoat" ? "patrolBoat" :
        unit.type === "btr" ? "btr" :
          unit.type === "tank" ? "square" :
          unit.type === "soldiers" || unit.type === "engineer" ? "diamond" : "scout";
    ctx.save();
    unit.trail.forEach((trail) => {
      const tp = project(trail);
      ctx.globalAlpha = trail.life * 0.36;
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (unit.type === "soldiers" && state.camera.zoom < 1.35 && !selected) {
      ctx.fillStyle = type.color;
      ctx.shadowColor = hexToRgba(type.color, 0.55);
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }
    if (selected) {
      ctx.strokeStyle = hexToRgba(type.color, 0.48);
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 6]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, unit.type === "fighter" ? 34 : 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (unit.type === "engineer") {
      drawGeneratedSquareMarker(type.icon, p.x, p.y, type.color, selected ? 40 : 34, selected, bearingToScreen(unit, target));
      if (unit.repairing) {
        const progress = clamp((unit.repairProgress || 0) / ENGINEER_REPAIR_SECONDS, 0, 1);
        ctx.strokeStyle = "#fef3c7";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();
      }
    } else {
      drawThreatShape({ color: type.color, shape }, p.x, p.y, bearingToScreen(unit, target));
    }
    const showLabel = selected || state.camera.zoom > 1.18 || unit.type === "fighter" || unit.type === "helicopter" || unit.type === "natoCargo";
    if (showLabel) {
      const label = unit.type === "soldiers" ? "СП" : unit.type === "engineer" ? `${Math.round(((unit.repairProgress || 0) / ENGINEER_REPAIR_SECONDS) * 100)}%` : unit.type === "natoCargo" ? (unit.supplyAction ? "SUP" : "NATO") : unit.type === "fighter" ? "F-16" : unit.type === "helicopter" ? "H" : unit.type === "tank" ? "T" : unit.type === "btr" ? "BTR" : "UAV";
      ctx.fillStyle = "rgba(3, 10, 18, 0.82)";
      roundRect(ctx, p.x - 24, p.y + 19, 48, 14, 5);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(type.color, 0.50);
      ctx.stroke();
      ctx.fillStyle = selected ? "#ffd24c" : "#eaf6ff";
      ctx.font = "900 9px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, p.x, p.y + 29);
    }
    ctx.restore();
  }
}

function drawEffects() {
  for (const effect of state.effects) {
    const p = project(effect);
    const alpha = clamp(effect.life, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    const hot = effect.kind === "strike" || effect.kind === "airburst" || effect.kind === "shell" || effect.kind === "gunrun" || effect.kind === "firefight";
    if (hot) {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, effect.radius * 1.25);
      gradient.addColorStop(0, "rgba(255,255,255,0.92)");
      gradient.addColorStop(0.24, hexToRgba(effect.color, 0.62));
      gradient.addColorStop(1, hexToRgba(effect.color, 0));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, effect.radius * 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(effect.color, 0.84);
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 9; i += 1) {
        const a = i * 0.698 + effect.radius * 0.035;
        const inner = effect.radius * 0.28;
        const outer = effect.radius * (0.72 + (i % 3) * 0.12);
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(a) * inner, p.y + Math.sin(a) * inner);
        ctx.lineTo(p.x + Math.cos(a) * outer, p.y + Math.sin(a) * outer);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = effect.color;
    ctx.fillStyle = hexToRgba(effect.color, hot ? 0.08 * alpha : 0.16 * alpha);
    ctx.lineWidth = effect.kind === "scan" ? 2 : 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, effect.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (effect.kind === "scan") {
      ctx.setLineDash([6, 7]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, effect.radius * 1.45, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (effect.kind === "firefight") {
      ctx.strokeStyle = "rgba(255,255,255,0.88)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i += 1) {
        const a = effect.radius * 0.19 + i * 2.1;
        ctx.beginPath();
        ctx.moveTo(p.x - Math.cos(a) * 10, p.y - Math.sin(a) * 10);
        ctx.lineTo(p.x + Math.cos(a) * 10, p.y + Math.sin(a) * 10);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function drawModeBadge() {
  if (state.mode === "inspect") return;
  const rect = canvas.getBoundingClientRect();
  const label = state.mode === "placeUnit" && state.pendingUnitType
    ? `Поставка: ${PLAYER_UNIT_TYPES[state.pendingUnitType].name}`
    : state.mode === "placeDefense" && state.pendingDefenseAction
      ? `Размещение: ${DEFENSE_ACTION_LABELS[state.pendingDefenseAction] || ACTIONS[state.pendingDefenseAction].label}`
      : {
        recon: "Режим: разведка",
        strike: "Режим: ракетный удар",
        specops: "Режим: спецгруппа",
        intercept: "Режим: ручной пуск"
      }[state.mode] || "Режим";
  ctx.save();
  ctx.fillStyle = "rgba(17, 24, 39, 0.88)";
  ctx.strokeStyle = "rgba(250, 204, 21, 0.74)";
  roundRect(ctx, rect.width / 2 - 142, 96, 284, 38, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "900 13px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, rect.width / 2, 119);
  ctx.restore();
}

function planThreatRoute(origin, target, typeId) {
  if (!THREAT_TYPES[typeId].airborne) return null;
  const directRisk = routePvoRisk(origin, target);
  if (directRisk < 0.18) return null;
  const midLat = (origin.lat + target.lat) / 2;
  const midLng = (origin.lng + target.lng) / 2;
  const candidates = [
    { lat: midLat + 1.45, lng: midLng - 1.45 },
    { lat: midLat - 1.35, lng: midLng + 1.55 },
    { lat: clamp(target.lat + 1.75, WORLD_BOUNDS.south, WORLD_BOUNDS.north), lng: clamp(origin.lng + 2.2, WORLD_BOUNDS.west, WORLD_BOUNDS.east) },
    { lat: clamp(target.lat - 1.75, WORLD_BOUNDS.south, WORLD_BOUNDS.north), lng: clamp(origin.lng - 2.0, WORLD_BOUNDS.west, WORLD_BOUNDS.east) }
  ];
  let best = null;
  let bestRisk = directRisk;
  for (const waypoint of candidates) {
    const risk = routePvoRisk(origin, waypoint) + routePvoRisk(waypoint, target) + geoDistance(origin, waypoint) * 0.04;
    if (risk < bestRisk) {
      bestRisk = risk;
      best = waypoint;
    }
  }
  return best && directRisk - bestRisk > 0.08 ? { waypoint: best } : null;
}

function runEnemyAirDefenseLegacyLine6131(dt) {
  for (const site of state.enemySites) {
    if (site.destroyed || site.pvo <= 0) continue;
    const range = 1.28 + site.radar * 0.26;
    let best = null;
    let bestDist = Infinity;
    const candidates = [
      ...state.playerMissiles.filter((missile) => !missile.piercing),
      ...state.playerUnits.filter((unit) => unit.type === "recon" || unit.type === "fighter" || unit.type === "helicopter")
    ];
    for (const candidate of candidates) {
      const dist = geoDistance(site, candidate);
      if (dist < range && dist < bestDist) {
        best = candidate;
        bestDist = dist;
      }
    }
    if (!best) continue;
    site.pvoCooldown -= dt * (0.8 + site.pvo * 0.45 + site.radar * 0.18);
    if (site.pvoCooldown <= 0) {
      site.pvoCooldown = randomRange(0.8, 1.4);
      const hitChance = state.playerMissiles.includes(best) ? 0.35 : 0.42;
      launchInterceptor(site, best, Math.random() < hitChance, true);
    }
  }
}

function handleAction(action) {
  if (state.gameOver) return;
  state.pendingStrike = false;
  state.pendingUnitType = null;
  state.pendingDefenseAction = null;
  if (DEFENSE_ACTIONS.has(action)) {
    queueDefensePlacement(action);
    return;
  }
  if (action === "launchRecon") {
    queueUnitPlacement("recon", action);
    return;
  }
  if (action === "launchAttackDrone") {
    queueUnitPlacement("attackDrone", action);
    return;
  }
  if (action === "repair") {
    queueUnitPlacement("engineer", action);
    return;
  }
  if (action === "launchStrike") {
    queueMissileStrike(false);
    return;
  }
  if (action === "launchPiercingStrike") {
    queueMissileStrike(true);
    return;
  }
  if (action === "buyFighters") {
    queueUnitPlacement("fighter", action);
    return;
  }
  if (action === "buyHelicopter") {
    queueUnitPlacement("helicopter", action);
    return;
  }
  if (action === "buyTank") {
    queueUnitPlacement("tank", action);
    return;
  }
  if (action === "buyBtr") {
    queueUnitPlacement("btr", action);
    return;
  }
  if (action === "deploySpecOps") {
    queueUnitPlacement("soldiers", action);
    return;
  }
  if (action === "manualIntercept") {
    state.mode = "intercept";
    setModeHint("Ручной пуск: кликните по летящей угрозе. Шанс ниже, чем раньше.");
    updateHud();
  }
}

function queueDefensePlacement(action) {
  if (!ACTIONS[action]) return;
  state.mode = "placeDefense";
  state.pendingDefenseAction = action;
  state.pendingUnitType = null;
  state.pendingStrike = false;
  const anyPoint = action === "buyPvo" || action === "buyRadar" || action === "buyFactory";
  setModeHint(`${DEFENSE_ACTION_LABELS[action] || ACTIONS[action].label}: ${anyPoint ? "кликните любую точку карты для размещения." : "кликните область Украины."}`);
  addLog(`${DEFENSE_ACTION_LABELS[action] || ACTIONS[action].label}: выберите место на карте.`, "warn");
  updateHud();
}

function applyDefenseAction(action, region) {
  const point = region || getSelectedRegion() || getRegion("kyiv") || state.regions[0];
  return applyDefenseActionAt(action, point);
}

function applyDefenseActionAt(action, point) {
  if (!point || !ACTIONS[action]) return false;
  const geo = {
    lat: clamp(point.lat, WORLD_BOUNDS.south, WORLD_BOUNDS.north),
    lng: clamp(point.lng, WORLD_BOUNDS.west, WORLD_BOUNDS.east)
  };
  const region = getRegionForPoint(geo);
  if ((action === "buyFort" || action === "repair") && !region) {
    setModeHint("Для укреплений и ремонта кликните ближе к области Украины.");
    addLog("Место слишком далеко от украинского региона.", "warn");
    return false;
  }
  if (!spend(ACTIONS[action].cost)) {
    addLog("Недостаточно денег.", "warn");
    updateHud();
    return false;
  }
  if (region) state.selectedRegionId = region.id;
  if (action === "buyPvo" || action === "buyRadar" || action === "buyFactory") {
    createPlayerInstallation(action, geo, region);
  } else if (action === "buyFort" && region) {
    region.fort += 1;
    addLog(`${region.name}: укрепления усилены.`, "good");
  } else if (action === "repair" && region) {
    region.repairs += 1;
    region.hp = clamp(region.hp + 20, 0, 100);
    if (region.hp > 30) region.captured = false;
    repairNearbyFactories(region);
    addLog(`${region.name}: ремонтные бригады восстановили инфраструктуру.`, "good");
  }
  state.mode = "inspect";
  state.pendingDefenseAction = null;
  updateHud();
  return true;
}

function createPlayerInstallation(action, geo, region) {
  const kind = action === "buyPvo" ? "pvo" : action === "buyRadar" ? "radar" : "factory";
  const installation = {
    id: cryptoId(),
    kind,
    lat: geo.lat,
    lng: geo.lng,
    regionId: region ? region.id : null,
    hp: kind === "factory" ? 100 : 80,
    maxHp: kind === "factory" ? 100 : 80,
    pvoCooldown: 0,
    incomeRate: kind === "factory" ? 8400 : 0,
    bonusActive: kind === "pvo" || kind === "radar",
    storage: kind === "factory" ? {} : undefined
  };
  state.playerInstallations.push(installation);
  if (kind === "pvo" && region) region.pvo += 1;
  if (kind === "radar" && region) {
    region.radar += 1;
    state.intel += 8;
  }
  addEffect(kind === "factory" ? "pop" : "scan", geo.lat, geo.lng, kind === "factory" ? "#22c55e" : "#39a8ff");
  addLog(`${kind === "factory" ? "Завод" : kind === "pvo" ? "ПВО" : "РЛС"} размещено${region ? ` в секторе ${region.name}` : ""}.`, "good");
}

function updateFactoryEconomy(dt) {
  let income = 0;
  const factoryMultiplier = 1 + (Number(state.ext?.upgrades?.factory) || 0) * 0.07;
  for (const factory of state.playerInstallations) {
    if (factory.kind !== "factory" || factory.destroyed) continue;
    income += factory.incomeRate * Math.max(0.15, factory.hp / factory.maxHp) * factoryMultiplier * dt;
  }
  if (income > 0) {
    state.money += income;
  }
}

function updateAirDefenseCooldowns(dt) {
  for (const region of state.regions) {
    region.pvoCooldown = Math.max(0, (region.pvoCooldown || 0) - dt);
  }
  for (const installation of state.playerInstallations) {
    if (installation.kind === "pvo") {
      installation.pvoCooldown = Math.max(0, (installation.pvoCooldown || 0) - dt);
    }
  }
  for (const site of state.enemySites) {
    site.pvoCooldown = Math.max(0, (site.pvoCooldown || 0) - dt);
  }
}

function repairNearbyFactories(region) {
  for (const factory of state.playerInstallations) {
    if (factory.kind !== "factory" || factory.destroyed) continue;
    if (factory.regionId === region.id || geoDistance(factory, region) < 1.15) {
      factory.hp = clamp(factory.hp + 28, 0, factory.maxHp);
    }
  }
}

function getRegionForPoint(point) {
  return findNearestRegionGeo(point, 1.55) || findNearestRegionGeo(point, 3.2);
}

function queueMissileStrike(piercing = false) {
  const action = piercing ? "launchPiercingStrike" : "launchStrike";
  if (!spend(ACTIONS[action].cost)) {
    addLog("Недостаточно денег для ракетного удара.", "warn");
    updateHud();
    return;
  }
  state.mode = "strike";
  state.pendingStrike = true;
  state.pendingPiercingStrike = piercing;
  state.pendingUnitType = null;
  state.pendingDefenseAction = null;
  setModeHint(`${piercing ? "Несбиваемая ракета" : "Ракета"} куплена. Кликните цель или точку удара.`);
  addLog(`${piercing ? "Несбиваемая ракета" : "Ракета"} готова. Выберите цель на карте.`, "good");
  updateHud();
}

function launchPlayerMissileAtTarget(targetSpec, options = {}) {
  if (!targetSpec || isAirborneTargetSpec(targetSpec)) {
    setModeHint("Ракеты бьют только по земле. Выберите регион, завод, объект, танк или точку карты.");
    addLog("Воздушная цель не выбрана: ракета работает только по земле.", "warn");
    updateHud();
    return false;
  }
  const originRegion = getSelectedRegion() || getRegion("kyiv") || state.regions[0];
  const target = {
    lat: clamp(targetSpec.lat, WORLD_BOUNDS.south, WORLD_BOUNDS.north),
    lng: clamp(targetSpec.lng, WORLD_BOUNDS.west, WORLD_BOUNDS.east)
  };
  state.playerMissiles.push({
    id: cryptoId(),
    origin: { lat: originRegion.lat, lng: originRegion.lng },
    target,
    targetKind: targetSpec.kind,
    targetId: targetSpec.id || null,
    siteId: targetSpec.kind === "site" ? targetSpec.id : null,
    lat: originRegion.lat,
    lng: originRegion.lng,
    progress: 0,
    speed: options.piercing ? 1.52 : 1.32,
    piercing: Boolean(options.piercing),
    trail: []
  });
  addEffect("pop", originRegion.lat, originRegion.lng, options.piercing ? "#f8fafc" : "#ef4444");
  addLog(`${options.piercing ? "Несбиваемая ракета" : "Ракета"} запущена: цель ${targetSpec.label}.`, "good");
  return true;
}

function handleCanvasClick(event) {
  if (inputState.suppressNextClick) {
    inputState.suppressNextClick = false;
    return;
  }
  const point = getCanvasPoint(event);
  if (state.mode === "placeDefense") {
    const geo = screenToGeo(point.x, point.y);
    applyDefenseActionAt(state.pendingDefenseAction, geo);
    return;
  }
  if (state.mode === "placeUnit") {
    deployPendingUnit(selectMapTarget(point));
    return;
  }
  if (state.mode === "strike" && state.pendingStrike) {
    const missileTarget = selectMissileGroundTarget(point);
    if (!missileTarget) return;
    const launched = launchPlayerMissileAtTarget(missileTarget, { piercing: state.pendingPiercingStrike });
    if (!launched) return;
    state.pendingStrike = false;
    state.pendingPiercingStrike = false;
    state.mode = "inspect";
    setModeHint("Ракета летит к выбранной цели.");
    updateHud();
    return;
  }
  if (state.mode === "intercept") {
    const threat = findThreatAt(point.x, point.y);
    if (threat) manualIntercept(threat);
    else setModeHint("Кликните ближе к значку летящей угрозы.");
    return;
  }

  const clickedUnit = findPlayerUnitAt(point.x, point.y);
  const selectedUnit = state.playerUnits.find((unit) => unit.id === state.selectedUnitId);
  if (clickedUnit && (!selectedUnit || clickedUnit.id === selectedUnit.id)) {
    state.selectedUnitId = clickedUnit.id;
    const type = PLAYER_UNIT_TYPES[clickedUnit.type];
    setModeHint(`${type.name}: кликните цель для атаки или зажмите и протяните для маршрута.`);
    updateHud();
    return;
  }
  if (selectedUnit) {
    const targetSpec = selectMapTarget(point);
    if (targetSpec.kind === "region") {
      const region = getRegion(targetSpec.id);
      if (region) {
        state.selectedRegionId = region.id;
        state.selectedUnitId = null;
        setModeHint(`${region.name}: область выбрана. Можно покупать оборону, заводы или запускать технику.`);
        updateHud();
      }
      return;
    }
    issueUnitCommand(selectedUnit, targetSpec);
    return;
  }
  const region = findRegionAt(point.x, point.y);
  if (region) {
    state.selectedRegionId = region.id;
    state.selectedUnitId = null;
    setModeHint(`${region.name}: покупайте оборону, заводы или запускайте технику.`);
    updateHud();
  }
}

function issueUnitCommand(unit, targetSpec) {
  if (!unit || unit.destroyed) return;
  if (unit.type === "engineer") {
    const repairTarget = normalizeRepairTarget(targetSpec);
    if (!repairTarget) {
      setModeHint("Инженеры ремонтируют только поврежденные регионы, заводы, ПВО и РЛС.");
      addLog("Инженеры не получили ремонтную цель.", "warn");
      updateHud();
      return;
    }
    targetSpec = repairTarget;
    unit.repairing = false;
    unit.repairProgress = 0;
  }
  if (isNavalUnitType(unit.type) && !isSeaTargetSpec(targetSpec)) {
    rejectNavalLandTarget(PLAYER_UNIT_TYPES[unit.type].name);
    return;
  }
  unit.target = { lat: targetSpec.lat, lng: targetSpec.lng };
  unit.targetKind = targetSpec.kind;
  unit.targetId = targetSpec.id || null;
  unit.cooldown = Math.min(unit.cooldown || 0, 0.18);
  state.selectedUnitId = unit.id;
  const type = PLAYER_UNIT_TYPES[unit.type];
  addEffect("scan", unit.lat, unit.lng, type.color);
  addLog(`${type.name}: приказ на цель (${targetSpec.label}).`, "good");
  setModeHint(`${type.name} движется к цели: ${targetSpec.label}.`);
  updateHud();
}

function movePlayerUnit(unit, dt) {
  if (unit.type === "engineer" && unit.repairing) return;
  if (!unit.target) return;
  const type = PLAYER_UNIT_TYPES[unit.type];
  const liveTarget = getLiveTarget(unit.targetKind, unit.targetId);
  if (liveTarget) {
    unit.target = { lat: liveTarget.lat, lng: liveTarget.lng };
  }
  const distance = geoDistance(unit, unit.target);
  const attackStop = unit.targetKind && unit.targetKind !== "point"
    ? clamp(type.radius * 0.58, type.pointRadius || 0.18, 0.72)
    : (type.pointRadius || 0.08);
  if (distance < attackStop) {
    if (unit.targetKind === "point") {
      unit.lat = unit.target.lat;
      unit.lng = unit.target.lng;
    }
    if (unit.type === "natoCargo") {
      deliverNatoAid(unit);
      return;
    }
    if (unit.type === "engineer") {
      beginEngineerRepair(unit);
      return;
    }
    resolveUnitImpact(unit);
    unit.target = null;
    unit.targetKind = null;
    unit.targetId = null;
    return;
  }
  const step = Math.min(1, (type.speed * PLAYER_UNIT_SPEED_SCALE * dt) / Math.max(0.001, distance));
  const nextPoint = {
    lat: unit.lat + (unit.target.lat - unit.lat) * step,
    lng: unit.lng + (unit.target.lng - unit.lng) * step
  };
  if (isNavalUnitType(unit.type) && !isSeaPoint(nextPoint)) {
    unit.target = null;
    unit.targetKind = null;
    unit.targetId = null;
    addLog(`${type.name}: маршрут уперся в берег. Морская техника остается в море.`, "warn");
    return;
  }
  unit.lat = nextPoint.lat;
  unit.lng = nextPoint.lng;
  unit.trail.push({ lat: unit.lat, lng: unit.lng, life: 1 });
  if (unit.trail.length > 26) unit.trail.shift();
}

function resolveUnitImpact(unit) {
  const type = PLAYER_UNIT_TYPES[unit.type];
  const impact = unit.target ? { lat: unit.target.lat, lng: unit.target.lng } : { lat: unit.lat, lng: unit.lng };
  if (unit.type === "recon") {
    addEffect("scan", impact.lat, impact.lng, type.color);
    revealAroundPoint(impact, 1.35);
    state.intel += 4;
    addLog("Разведдрон подсветил район и продолжает работу.", "good");
    return;
  }
  const amount = type.attackDamage || 30;
  if (unit.type === "attackDrone") {
    addEffect("strike", impact.lat, impact.lng, type.color);
    applyTargetDamage(unit.targetKind, unit.targetId, amount, type.color, type.name, unit.id, impact);
    unit.destroyed = true;
    return;
  }
  addEffect(unit.type === "tank" ? "shell" : unit.type === "btr" || unit.type === "helicopter" ? "gunrun" : "airburst", impact.lat, impact.lng, type.color);
  applyTargetDamage(unit.targetKind, unit.targetId, amount, type.color, type.name, unit.id, impact);
  unit.cooldown = type.cooldown;
}

function deliverNatoAid(unit) {
  if (unit.supplyAction) {
    const factory = state.playerInstallations.find((item) => item.id === unit.supplyFactoryId && item.kind === "factory" && !item.destroyed);
    if (!factory) {
      addEffect("miss", unit.lat, unit.lng, PLAYER_UNIT_TYPES.natoCargo.color);
      addLog(`${unit.supplyLabel || "Ракетная поставка"}: самолет долетел, но завод назначения уничтожен. Груз потерян.`, "bad");
      unit.destroyed = true;
      return;
    }
    factory.storage = factory.storage && typeof factory.storage === "object" ? factory.storage : {};
    const rocketStock = (Number(factory.storage.launchStrike) || 0) + (Number(factory.storage.launchPiercingStrike) || 0);
    const space = Math.max(0, ROCKET_STORAGE_CAPACITY_PER_FACTORY - rocketStock);
    const added = Math.min(Math.max(0, Math.floor(Number(unit.supplyQty) || 0)), space);
    factory.storage[unit.supplyAction] = (Number(factory.storage[unit.supplyAction]) || 0) + added;
    addEffect("pop", unit.lat, unit.lng, PLAYER_UNIT_TYPES.natoCargo.color);
    addLog(`${unit.supplyLabel || "Ракетная поставка"}: самолет снабжения долетел до завода, +${added} шт.`, "good");
    unit.destroyed = true;
    return;
  }
  const amount = unit.cargoAmount || NATO_AID_AMOUNT;
  state.money += amount;
  addEffect("pop", unit.lat, unit.lng, PLAYER_UNIT_TYPES.natoCargo.color);
  addLog(`Самолет НАТО долетел: получено ${formatMoney(amount)} денег.`, "good");
  unit.destroyed = true;
}

function beginEngineerRepair(unit) {
  const target = getRepairTarget(unit.targetKind, unit.targetId);
  if (!target) {
    unit.destroyed = true;
    addLog("Инженеры не нашли точку ремонта.", "warn");
    return;
  }
  unit.lat = target.lat;
  unit.lng = target.lng;
  unit.target = { lat: target.lat, lng: target.lng };
  unit.repairing = true;
  unit.repairProgress = unit.repairProgress || 0;
  unit.targetLabel = repairTargetLabel(target, unit.targetKind);
  unit.cooldown = 0;
  addEffect("scan", unit.lat, unit.lng, PLAYER_UNIT_TYPES.engineer.color);
  addLog(`Инженеры прибыли: ремонтируют ${unit.targetLabel}. Нужно 80 секунд на месте.`, "good");
}

function runEngineerUnit(unit, dt) {
  if (!unit.repairing) return;
  const target = getRepairTarget(unit.targetKind, unit.targetId);
  if (!target) {
    unit.destroyed = true;
    addLog("Инженеры потеряли объект ремонта.", "warn");
    return;
  }
  unit.repairProgress = clamp((unit.repairProgress || 0) + dt, 0, ENGINEER_REPAIR_SECONDS);
  const progress = unit.repairProgress / ENGINEER_REPAIR_SECONDS;
  unit.lat = target.lat;
  unit.lng = target.lng;
  unit.target = { lat: target.lat, lng: target.lng };

  if (unit.targetKind === "region") {
    target.hp = clamp(Math.max(target.hp, 0) + (100 / ENGINEER_REPAIR_SECONDS) * dt, 0, 100);
    target.pressure = Math.max(0, target.pressure - dt * 0.9);
    if (target.hp > 30) target.captured = false;
    if (progress >= 1 || target.hp >= 99.5) {
      target.hp = 100;
      target.captured = false;
      finishEngineerRepair(unit, target);
    }
    return;
  }

  if (unit.targetKind === "installation") {
    target.hp = clamp(Math.max(target.hp, 0) + (target.maxHp / ENGINEER_REPAIR_SECONDS) * dt, 0, target.maxHp);
    if (progress >= 1 || target.hp >= target.maxHp - 0.5) {
      target.hp = target.maxHp;
      target.destroyed = false;
      restoreInstallationRegionalBonus(target);
      finishEngineerRepair(unit, target);
    }
  }
}

function finishEngineerRepair(unit, target) {
  const label = repairTargetLabel(target, unit.targetKind);
  addEffect("pop", target.lat, target.lng, PLAYER_UNIT_TYPES.engineer.color);
  addLog(`Инженеры закончили ремонт: ${label} снова работает.`, "good");
  unit.destroyed = true;
}

function restoreInstallationRegionalBonus(installation) {
  if (!installation || installation.bonusActive) return;
  const region = getRegion(installation.regionId) || getRegionForPoint(installation);
  if (!region) return;
  installation.regionId = region.id;
  if (installation.kind === "pvo") {
    region.pvo += 1;
    installation.bonusActive = true;
  } else if (installation.kind === "radar") {
    region.radar += 1;
    installation.bonusActive = true;
  }
}

function disableInstallation(installation, sourceName = "Удар") {
  if (!installation || installation.destroyed) return;
  installation.destroyed = true;
  const region = getRegion(installation.regionId) || getRegionForPoint(installation);
  if (region && installation.bonusActive) {
    if (installation.kind === "pvo") region.pvo = Math.max(0, region.pvo - 1);
    if (installation.kind === "radar") region.radar = Math.max(0, region.radar - 1);
    installation.bonusActive = false;
  }
  const label = repairTargetLabel(installation, "installation");
  addLog(`${sourceName}: ${label} выведен из строя. Можно отправить инженеров на ремонт.`, "bad");
}

function getRepairTarget(kind, id) {
  if (kind === "region") return getRegion(id) || null;
  if (kind === "installation") return state.playerInstallations.find((item) => item.id === id) || null;
  return null;
}

function repairTargetLabel(target, kind) {
  if (!target) return "точка";
  if (kind === "region") return target.name;
  if (target.kind === "factory") return "завод";
  if (target.kind === "pvo") return "ПВО";
  if (target.kind === "radar") return "РЛС";
  if (target.kind === "hq") return "штаб";
  return "точка";
}

function revealAroundPoint(point, radius) {
  const hidden = state.enemySites
    .filter((site) => !site.destroyed && !site.found)
    .map((site) => ({ site, dist: geoDistance(site, point) }))
    .filter((entry) => entry.dist < radius)
    .sort((a, b) => a.dist - b.dist);
  hidden.slice(0, 2).forEach((entry) => revealSite(entry.site));
}

function runReconUnit(unit) {
  if (unit.cooldown > 0) return;
  const type = PLAYER_UNIT_TYPES.recon;
  revealAroundPoint(unit, type.radius);
  unit.cooldown = type.cooldown;
}

function runFighterUnit(unit) {
  if (unit.cooldown > 0) return;
  const type = PLAYER_UNIT_TYPES.fighter;
  const threat = findNearestThreat(unit, type.radius, false);
  if (threat) {
    unit.cooldown = type.cooldown;
    threat.hp -= randomRange(20, 38);
    addEffect("airburst", threat.lat, threat.lng, type.color);
    addLog(`${type.name} атаковал цель: ${THREAT_TYPES[threat.type].name}.`, "good");
    return;
  }
  const site = findNearestEnemySite(unit, type.radius * 0.72, true);
  if (site) {
    if (!site.found) revealSite(site);
    unit.cooldown = type.cooldown;
    site.hp = clamp(site.hp - randomRange(18, 34), 0, site.maxHp);
    addEffect("airburst", site.lat, site.lng, type.color);
    addLog(`${type.name} нанес удар по земле: ${site.name}.`, "good");
    finishSiteIfDestroyed(site);
  }
}

function runHelicopterUnit(unit) {
  if (unit.cooldown > 0) return;
  const type = PLAYER_UNIT_TYPES.helicopter;
  const threat = findNearestThreat(unit, type.radius, false);
  if (threat) {
    unit.cooldown = type.cooldown;
    threat.hp -= randomRange(16, 30);
    addEffect("gunrun", threat.lat, threat.lng, type.color);
    addLog(`${type.name} отработал по цели: ${THREAT_TYPES[threat.type].name}.`, "good");
    return;
  }
  const site = findNearestEnemySite(unit, type.radius * 0.82, true);
  if (site) {
    if (!site.found) revealSite(site);
    unit.cooldown = type.cooldown;
    site.hp = clamp(site.hp - randomRange(14, 26), 0, site.maxHp);
    addEffect("gunrun", site.lat, site.lng, type.color);
    addLog(`${type.name} обстрелял наземный объект: ${site.name}.`, "good");
    finishSiteIfDestroyed(site);
  }
}

function runTankUnit(unit) {
  if (unit.cooldown > 0) return;
  const type = PLAYER_UNIT_TYPES.tank;
  const target = findNearestThreat(unit, type.radius, false);
  if (target && !THREAT_TYPES[target.type].airborne) {
    unit.cooldown = type.cooldown;
    target.hp -= randomRange(22, 38);
    addEffect("shell", target.lat, target.lng, type.color);
    addLog(`${type.name} открыл огонь: ${THREAT_TYPES[target.type].name}.`, "good");
    return;
  }
  const site = findNearestEnemySite(unit, type.radius, true);
  if (site) {
    if (!site.found) revealSite(site);
    unit.cooldown = type.cooldown;
    site.hp = clamp(site.hp - randomRange(8, 15), 0, site.maxHp);
    addEffect("shell", site.lat, site.lng, type.color);
    addLog(`${type.name} обстрелял объект: ${site.name}.`, "good");
    finishSiteIfDestroyed(site);
  }
}

function runBtrUnit(unit) {
  if (unit.cooldown > 0) return;
  const type = PLAYER_UNIT_TYPES.btr;
  const target = findNearestThreat(unit, type.radius, false);
  if (target && !THREAT_TYPES[target.type].airborne) {
    unit.cooldown = type.cooldown;
    target.hp -= randomRange(16, 28);
    addEffect("gunrun", target.lat, target.lng, type.color);
    addLog(`${type.name} открыл огонь: ${THREAT_TYPES[target.type].name}.`, "good");
    return;
  }
  const site = findNearestEnemySite(unit, type.radius, true);
  if (site) {
    if (!site.found) revealSite(site);
    unit.cooldown = type.cooldown;
    site.hp = clamp(site.hp - randomRange(5, 11), 0, site.maxHp);
    addEffect("gunrun", site.lat, site.lng, type.color);
    addLog(`${type.name} обстрелял объект: ${site.name}.`, "good");
    finishSiteIfDestroyed(site);
  }
}

function runAirDefense(threat, dt) {
  const type = THREAT_TYPES[threat.type];
  if (!type.airborne) return;
  let fighterPressure = 0;
  let bestOrigin = null;
  let bestScore = 0;
  for (const region of state.regions) {
    if (region.captured || region.pvo <= 0) continue;
    const dist = geoDistance(threat, region);
    const radarBoost = region.radar * 0.24 + nearbyRadarBoost(region);
    const range = 1.05 + radarBoost;
    if (dist < range && (region.pvoCooldown || 0) <= 0) {
      const score = (range - dist) + region.pvo * 0.18;
      if (score > bestScore) {
        bestScore = score;
        bestOrigin = region;
      }
    }
    if (dist < 1.72 && region.fighters > 0 && (threat.type === "fighter" || threat.type === "helicopter" || threat.type === "cruise")) {
      fighterPressure += region.fighters * 0.38 * dt;
    }
  }
  for (const installation of state.playerInstallations) {
    if (installation.destroyed || installation.kind !== "pvo") continue;
    const dist = geoDistance(threat, installation);
    const range = 1.18 + nearbyRadarBoost(installation);
    if (dist < range && (installation.pvoCooldown || 0) <= 0) {
      const score = range - dist + 0.32;
      if (score > bestScore) {
        bestScore = score;
        bestOrigin = installation;
      }
    }
  }
  if (bestOrigin) {
    bestOrigin.pvoCooldown = PVO_RELOAD_SECONDS;
    launchInterceptor(bestOrigin, threat, Math.random() < pvoHitChanceForTarget(threat), false);
  }
  if (fighterPressure > 0) {
    const evasion = threat.type === "fighter" ? 0.58 : threat.type === "cruise" ? 0.70 : 1;
    threat.hp -= fighterPressure * 30 * evasion * randomRange(0.76, 1.20);
  }
}

function pvoHitChanceForTarget(target) {
  if (!target) return PVO_DEFAULT_HIT_CHANCE;
  if (target.type === "fighter") return PVO_FIGHTER_HIT_CHANCE;
  return PVO_DEFAULT_HIT_CHANCE;
}

function nearbyRadarBoost(point) {
  let boost = 0;
  for (const installation of state.playerInstallations) {
    if (installation.destroyed || installation.kind !== "radar") continue;
    const dist = geoDistance(point, installation);
    if (dist < 2.2) boost += 0.18 * (1 - dist / 2.2);
  }
  return boost;
}

function runEnemyAirDefense(dt) {
  for (const site of state.enemySites) {
    if (site.destroyed || site.pvo <= 0) continue;
    if ((site.pvoCooldown || 0) > 0) continue;
    const range = 1.28 + site.radar * 0.26;
    let best = null;
    let bestDist = Infinity;
    const candidates = [
      ...state.playerMissiles.filter((missile) => !missile.piercing),
      ...state.playerUnits.filter((unit) =>
        (unit.type === "recon" || unit.type === "attackDrone" || unit.type === "fighter" || unit.type === "helicopter" || unit.type === "natoCargo") &&
        (!unit.invulnerableUntil || state.clock >= unit.invulnerableUntil)
      )
    ];
    for (const candidate of candidates) {
      const dist = geoDistance(site, candidate);
      if (dist < range && dist < bestDist) {
        best = candidate;
        bestDist = dist;
      }
    }
    if (!best) continue;
    site.pvoCooldown = PVO_RELOAD_SECONDS;
    const hitChance = state.playerMissiles.includes(best) ? 0.35 : pvoHitChanceForTarget(best);
    launchInterceptor(site, best, Math.random() < hitChance, true);
  }
}

function applyThreatDamage(threat, region) {
  const type = THREAT_TYPES[threat.type];
  if (threat.type === "scout") {
    state.aiMemory.weakRegionId = pickWeakRegion().id;
    state.enemyBudget += 14;
    addLog(`Разведдрон РФ нашел слабое место: ${getRegion(state.aiMemory.weakRegionId).name}.`, "bad");
    return;
  }
  const damage = type.damage * Math.max(0.35, 1 - region.fort * 0.14);
  region.hp = clamp(region.hp - damage, 0, 100);
  region.pressure += damage;
  state.morale = clamp(state.morale - damage * 0.15, 0, 100);
  addCasualties(civilianCasualtiesFromDamage(damage, type.airborne ? 1.15 : 1.35), `${type.name} ударил по ${region.name}`);
  applyRegionalSystemDamage(region, damage, type.name);
  damagePlayerFactories(region, damage, type.name);
  addEffect("hit", region.lat, region.lng, type.color);
  addLog(`${type.name} ударил по региону ${region.name}. Инфраструктура -${Math.round(damage)}.`, "bad");
  if (region.hp <= 0 && !region.captured) {
    region.captured = true;
    state.morale = clamp(state.morale - 10, 0, 100);
    addLog(`${region.name}: инфраструктура выведена из строя. Нужен ремонт.`, "bad");
  }
}

function damagePlayerFactories(region, damage, sourceName) {
  const installations = state.playerInstallations.filter((item) => !item.destroyed && (item.regionId === region.id || geoDistance(item, region) < 1.25));
  for (const installation of installations) {
    const hitChance = installation.kind === "factory" ? 0.58 : 0.38;
    if (Math.random() > hitChance) continue;
    const loss = damage * (installation.kind === "factory" ? randomRange(1.2, 2.3) : randomRange(1.0, 1.8));
    installation.hp = clamp(installation.hp - loss, 0, installation.maxHp);
    if (installation.kind === "factory") {
      addCasualties(civilianCasualtiesFromDamage(loss, installation.hp <= 0 ? 0.90 : 0.42), `${sourceName}: попадание по заводу`);
    }
    addEffect("strike", installation.lat, installation.lng, installation.kind === "factory" ? "#22c55e" : "#39a8ff");
    if (installation.hp <= 0) {
      disableInstallation(installation, sourceName);
    } else {
      addLog(`${sourceName}: ${repairTargetLabel(installation, "installation")} поврежден, нужен ремонт.`, "bad");
    }
  }
}

function chooseEnemyTarget(doctrine) {
  const candidates = state.regions.filter((region) => !region.captured);
  let best = candidates[0] || state.regions[0];
  let bestScore = -Infinity;
  for (const region of candidates) {
    const factories = state.playerInstallations.filter((item) => item.kind === "factory" && !item.destroyed && item.regionId === region.id).length;
    const defense = region.pvo * 9 + region.radar * 5 + region.fort * 6 + region.fighters * 8;
    let score = region.value * 2 + factories * 34 + (100 - region.hp) * 0.45 - defense + randomRange(-7, 7);
    if (doctrine === "sead") score += region.pvo * 32 + region.radar * 18 + region.fighters * 12;
    if (region.id === state.aiMemory.weakRegionId) score += 20;
    if (region.frontline) score += doctrine === "ground_push" || doctrine === "sabotage" ? 16 : 5;
    if (score > bestScore) {
      bestScore = score;
      best = region;
    }
  }
  return best;
}

function countPlayerRadars() {
  return state.regions.reduce((sum, region) => sum + region.radar, 0) +
    state.playerInstallations.filter((item) => item.kind === "radar" && !item.destroyed).length;
}

function enemyIncomeRate() {
  if (!state.enemySites.some((site) => !site.destroyed)) return 0;
  const base = 4.2 + state.day * 0.06;
  const siteIncome = state.enemySites.filter((site) => !site.destroyed).reduce((sum, site) => sum + site.income + (site.factory ? 3 : 0), 0);
  return (base + siteIncome) * ENEMY_SPAWN_BUDGET_SCALE;
}

function updateActionButtons(selected) {
  document.querySelectorAll("[data-action]").forEach((button) => {
    const action = button.dataset.action;
    const config = ACTIONS[action];
    if (!config) return;
    const strategic = DEFENSE_ACTIONS.has(action) ||
      action === "launchRecon" ||
      action === "launchAttackDrone" ||
      action === "launchStrike" ||
      action === "launchPiercingStrike" ||
      action === "deploySpecOps" ||
      action === "repair" ||
      action === "manualIntercept" ||
      action === "buyFighters" ||
      action === "buyHelicopter" ||
      action === "buyTank" ||
      action === "buyBtr";
    button.disabled = state.gameOver || state.money < config.cost || (!selected && !strategic);
    button.classList.toggle("is-mode", modeMatchesAction(action));
  });
  if (state.mode === "inspect") {
    const factories = state.playerInstallations.filter((item) => item.kind === "factory" && !item.destroyed).length;
    setModeHint(selected ? `${selected.name}: выберите покупку, завод или боевое действие. Заводов: ${factories}.` : "Кликните область на карте или выберите действие.");
  }
}

function modeMatchesAction(action) {
  if (state.mode === "placeDefense") return state.pendingDefenseAction === action;
  if (state.mode === "placeUnit" && state.pendingUnitType) return PLAYER_UNIT_TYPES[state.pendingUnitType].action === action;
  return (
    (state.mode === "intercept" && action === "manualIntercept") ||
    (state.mode === "strike" && (action === "launchStrike" || action === "launchPiercingStrike"))
  );
}

function drawPlayerInstallations() {
  for (const installation of state.playerInstallations) {
    const p = project(installation);
    const hp = clamp(installation.hp / installation.maxHp, 0, 1);
    ctx.save();
    if (!installation.destroyed && installation.kind === "pvo") {
      ctx.strokeStyle = "rgba(57, 168, 255, 0.34)";
      ctx.setLineDash([6, 7]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (!installation.destroyed && installation.kind === "radar") {
      ctx.strokeStyle = "rgba(66, 216, 121, 0.28)";
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 106, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const color = installation.destroyed ? "#9ca3af" : installation.kind === "factory" ? "#22c55e" : installation.kind === "pvo" ? "#39a8ff" : installation.kind === "hq" ? "#ffd24c" : "#42d879";
    const icon = installation.kind === "factory" ? "buyFactory" : installation.kind === "pvo" ? "buyPvo" : installation.kind === "hq" ? "buyHQ" : "buyRadar";
    drawGeneratedSquareMarker(icon, p.x, p.y, color, installation.destroyed ? 34 : 38, false, 0);
    ctx.translate(p.x, p.y);
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    roundRect(ctx, -18, 18, 36, 5, 3);
    ctx.fill();
    ctx.fillStyle = color;
    roundRect(ctx, -18, 18, 36 * hp, 5, 3);
    ctx.fill();
    ctx.restore();
  }
}

function drawGeoEllipse(center, rx, ry, fill, stroke, lineWidth = 1.2) {
  const c = project(center);
  const east = project({ lat: center.lat, lng: center.lng + rx });
  const west = project({ lat: center.lat, lng: center.lng - rx });
  const north = project({ lat: center.lat + ry, lng: center.lng });
  const south = project({ lat: center.lat - ry, lng: center.lng });
  const width = Math.abs(east.x - west.x);
  const height = Math.abs(north.y - south.y);
  if (width < 2 || height < 2) return;
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawGeoPath(points, stroke, lineWidth = 1.5, dash = []) {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (dash.length) ctx.setLineDash(dash);
  ctx.beginPath();
  points.forEach((point, index) => {
    const p = project(point);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  ctx.restore();
}

function drawRussiaMapDetailsNearLegacy() {
  const details = [
    { name: "Москва", lat: 55.75, lng: 37.62, size: 7 },
    { name: "Тула", lat: 54.20, lng: 37.62, size: 4 },
    { name: "Липецк", lat: 52.60, lng: 39.58, size: 4 },
    { name: "Брянск", lat: 53.25, lng: 34.35, size: 4 },
    { name: "Курск", lat: 51.75, lng: 36.55, size: 4 },
    { name: "Белгород", lat: 50.60, lng: 36.60, size: 4 },
    { name: "Воронеж", lat: 51.66, lng: 39.20, size: 5 }
  ];
  const roads = [
    [{ lat: 55.75, lng: 37.62 }, { lat: 54.20, lng: 37.62 }, { lat: 52.60, lng: 39.58 }, { lat: 51.66, lng: 39.20 }],
    [{ lat: 55.75, lng: 37.62 }, { lat: 53.25, lng: 34.35 }, { lat: 51.75, lng: 36.55 }, { lat: 50.60, lng: 36.60 }],
    [{ lat: 51.75, lng: 36.55 }, { lat: 51.66, lng: 39.20 }, { lat: 47.24, lng: 39.71 }]
  ];
  ctx.save();
  ctx.strokeStyle = "rgba(127, 29, 29, 0.44)";
  ctx.lineWidth = 2;
  roads.forEach((road) => {
    ctx.beginPath();
    road.forEach((point, index) => {
      const p = project(point);
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  });
  const moscow = project({ lat: 55.75, lng: 37.62 });
  ctx.fillStyle = "rgba(220, 38, 38, 0.14)";
  ctx.strokeStyle = "rgba(220, 38, 38, 0.55)";
  ctx.beginPath();
  ctx.arc(moscow.x, moscow.y, 86, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  details.forEach((city) => {
    const p = project(city);
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.arc(p.x, p.y, city.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 228, 230, 0.92)";
    ctx.font = city.size > 5 ? "900 13px Segoe UI, sans-serif" : "800 10px Segoe UI, sans-serif";
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    ctx.shadowBlur = 4;
    ctx.fillText(city.name, p.x, p.y - city.size - 10);
  });
  ctx.restore();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const int = parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateDiplomacyPanel() {
  if (!els.diplomacyMessages) return;
  const statusText = {
    war: "война",
    talks: "переговоры",
    tense: "эскалация",
    ceasefire: "перемирие"
  }[state.diplomacy.status] || "война";
  if (els.diplomacyStatus) {
    els.diplomacyStatus.textContent = isEnemySupplyCut() ? `${statusText} | снабжение отрезано` : statusText;
  }
  if (els.diplomacyAiStatus) {
    const live = state.diplomacy.aiSource === "live";
    els.diplomacyAiStatus.textContent = live ? "AI live" : state.diplomacy.aiSource === "checking" ? "AI: проверка..." : "AI offline";
    els.diplomacyAiStatus.classList.toggle("is-live", live);
  }
  const visibleMessages = state.diplomacy.messages.slice(-10);
  els.diplomacyMessages.innerHTML = visibleMessages.length
    ? visibleMessages.map((message) => {
      const isUser = message.role === "user";
      const name = isUser ? "Зеленский" : "Путин";
      const place = isUser ? "Киев" : "Москва";
      const initials = isUser ? "З" : "П";
      return `
        <div class="diplomacy-msg ${isUser ? "user" : "ai"}">
          <span class="diplomacy-avatar">${initials}</span>
          <div class="diplomacy-bubble">
            <header><strong>${name}</strong><em>${place}</em></header>
            <span>${escapeHtml(stripDiplomacySpeaker(message.text))}</span>
          </div>
        </div>
      `;
    }).join("")
    : `
      <div class="empty-card">
        <strong>Канал переговоров открыт</strong>
        <span>Путин не пишет первым, пока сам не хочет предложить паузу, обмен, угрозу или сделку. Можно написать от лица Зеленского.</span>
      </div>
    `;
  if (els.diplomacySendBtn) {
    els.diplomacySendBtn.disabled = state.diplomacy.pending || state.gameOver;
    els.diplomacySendBtn.textContent = state.diplomacy.pending ? "Ожидание ответа..." : "Отправить Путину";
  }
}

function normalizeDiplomacyResult(result, message, snapshot) {
  const fallback = localDiplomacyFallback(message, snapshot);
  const rawReply = typeof result?.reply === "string" && result.reply.trim()
    ? stripDiplomacySpeaker(result.reply.trim())
    : fallback.reply;
  const reply = result?.source !== "openai" || diplomacyReplyWasUsed(rawReply) || diplomacyReplyIsTooRepetitive(rawReply)
    ? fallback.reply
    : rawReply;
  return {
    reply,
    effect: ["ceasefire", "deescalate", "escalate", "aid", "none"].includes(result?.effect) ? result.effect : fallback.effect,
    intensity: clamp(Number(result?.intensity) || fallback.intensity || 1, 0.5, 3),
    source: result?.source === "openai" ? "live" : "fallback"
  };
}

function diplomacyReplySignature(value) {
  return stripDiplomacySpeaker(value)
    .toLowerCase()
    .replace(/[^a-zа-яёіїєґ0-9]+/giu, " ")
    .trim();
}

function diplomacyReplyWasUsed(value) {
  const signature = diplomacyReplySignature(value);
  if (!signature) return false;
  if ((state.diplomacy.usedReplies || []).includes(signature)) return true;
  return state.diplomacy.messages.some((message) => message.role === "ai" && diplomacyReplySignature(message.text) === signature);
}

function diplomacyAvoidPhrases() {
  return [
    ...(state.diplomacy.usedReplies || []),
    ...state.diplomacy.messages
      .filter((message) => message.role === "ai")
      .map((message) => stripDiplomacySpeaker(message.text))
  ].filter(Boolean).slice(-60);
}

function diplomacyReplyTokens(value) {
  const stop = new Set([
    "что", "как", "это", "если", "или", "для", "без", "при", "мне", "вам",
    "вас", "уже", "так", "нет", "есть", "надо", "будет"
  ]);
  const words = stripDiplomacySpeaker(value).toLowerCase().match(/[a-zа-яёіїєґ0-9]{5,}/giu) || [];
  return [...new Set(words.filter((word) => !stop.has(word)))];
}

function diplomacyReplyIsTooRepetitive(value) {
  const tokens = diplomacyReplyTokens(value);
  if (tokens.length < 4) return false;
  return state.diplomacy.messages.some((message) => {
    if (message.role !== "ai") return false;
    const previous = diplomacyReplyTokens(message.text);
    if (previous.length < 4) return false;
    const overlap = tokens.filter((token) => previous.includes(token)).length;
    return overlap >= 3 || overlap / Math.max(1, Math.min(tokens.length, previous.length)) > 0.26;
  });
}

function rememberDiplomacyReply(value) {
  const signature = diplomacyReplySignature(value);
  if (!signature) return;
  const used = state.diplomacy.usedReplies || [];
  if (!used.includes(signature)) {
    used.push(signature);
    if (used.length > 160) used.shift();
  }
  state.diplomacy.usedReplies = used;
}

function pickDiplomacyLine(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function composeDiplomacyReply(parts, snapshot = {}) {
  const openings = parts.openings || ["Нет."];
  const bodies = parts.bodies || ["Так не пойдет."];
  const closers = parts.closers || ["Дайте конкретные условия."];
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const reply = [pickDiplomacyLine(openings), pickDiplomacyLine(bodies), pickDiplomacyLine(closers)].filter(Boolean).join(" ");
    if (!diplomacyReplyWasUsed(reply) && !diplomacyReplyIsTooRepetitive(reply)) return reply;
  }
  const day = Number.isFinite(state.day) ? state.day : 0;
  const left = Number.isFinite(snapshot.enemySitesLeft) ? snapshot.enemySitesLeft : "?";
  return `Новая позиция без старой формулировки: день ${day}, объектов осталось ${left}. Дайте другой пункт сделки, и я отвечу по нему.`;
}

function analyzeDiplomacyMessage(message) {
  const text = String(message || "").toLowerCase();
  const ceasefire = /мир|перемир|останов|прекращ|огня|тишин/.test(text);
  const withdrawal = /вывод|уйд|выйд|границ|территор|оккупац/.test(text);
  const guarantees = /гарант|безопасн|наблюдател|контрол|оон|союзник|договор/.test(text);
  const exchange = /обмен|пленн|залож|гуманитар|коридор|детей|людей/.test(text);
  const pressureWords = /санкц|трибунал|ответствен|репарац|изол/.test(text);
  const threatWords = /угроз|удар|уничтож|ультимат|атак|разнес|снес|добь|взорв/.test(text);
  const question = /что|как|зачем|почему|сколько|какие|предлож|можете|даете|\?/.test(text);
  const profanity = /бля|бляд|сука|хуй|хуе|пизд|еба|ёба|муд[аи]к|нахуй|говн|дерьм|черт|твар/.test(text);
  const concreteTerms = [ceasefire, withdrawal, guarantees, exchange, pressureWords].filter(Boolean).length;
  return { ceasefire, withdrawal, guarantees, exchange, pressureWords, threatWords, question, profanity, concreteTerms };
}

function localDiplomacyFallback(message, snapshot) {
  const analysis = analyzeDiplomacyMessage(message);
  const strongPosition = snapshot.supplyCut || snapshot.enemySitesLeft <= 2 || snapshot.enemySitesDestroyed >= 6;

  if (analysis.profanity && analysis.concreteTerms < 2) {
    return {
      effect: analysis.threatWords ? "escalate" : "none",
      intensity: analysis.threatWords ? 1.45 : 1.15,
      source: "fallback",
      reply: composeDiplomacyReply({
        openings: ["Нет, блядь.", "Нет, черт.", "Нет, с таким дерьмом я не подпишу."],
        bodies: [
          "Матом можно давить на эмоции, но сделка от этого не появляется.",
          "Если хотите жестко, я отвечу жестко: пустые наезды ни хрена не решают.",
          "Орать можно сколько угодно, но без условий это просто шум."
        ],
        closers: [
          "Кладите на стол прекращение огня, обмен и контроль линии.",
          "Назовите часы тишины, наблюдателей и что будет с пленными.",
          "Хотите остановку войны - пишите конкретно, а не бросайте дерьмо в чат."
        ]
      }, snapshot)
    };
  }

  if (analysis.question && !analysis.concreteTerms) {
    return {
      effect: "none",
      intensity: 1,
      source: "fallback",
      reply: composeDiplomacyReply({
        openings: ["Вот что я предлагаю:", "Мой вариант такой:", "Если коротко, условия такие:"],
        bodies: [
          "пауза огня на ограниченный срок, обмен пленными и гуманитарные коридоры.",
          "режим тишины, проверка наблюдателями и отдельный список спорных пунктов.",
          "сначала прекращение огня и обмен, потом разговор о линии контроля."
        ],
        closers: [
          "Но мне нужны гарантии исполнения, иначе это просто слова.",
          "Если вы это принимаете, пишите прямо: да, готов обсуждать пакет.",
          "Без механизма контроля я отвечу отказом."
        ]
      }, snapshot)
    };
  }

  if ((analysis.ceasefire || analysis.withdrawal || analysis.guarantees || analysis.exchange) || snapshot.supplyCut) {
    if (strongPosition && (analysis.withdrawal || analysis.concreteTerms >= 3 || snapshot.supplyCut)) {
      return {
        effect: "ceasefire",
        intensity: 1.8,
        source: "fallback",
        reply: composeDiplomacyReply({
          openings: ["Да.", "Да, принимаю основу.", "Да, это уже похоже на финал."],
          bodies: [
            "Я останавливаю новые пуски, если вы фиксируете прекращение огня, обмен и внешний контроль.",
            "Готов идти на перемирие при письменном режиме тишины и проверке выполнения.",
            "Снабжение и атаки ставятся на паузу, если пакет включает обмен и гарантии."
          ],
          closers: [
            "По выводу сил открываем отдельный протокол.",
            "Нарушение условий вернет войну в прежний режим.",
            "Подтверждайте пакет, и это будет перемирие."
          ]
        }, snapshot)
      };
    }
    if (analysis.concreteTerms >= 2) {
      return {
        effect: "deescalate",
        intensity: 1.45,
        source: "fallback",
        reply: composeDiplomacyReply({
          openings: ["Возможно.", "Только если.", "Давайте торговаться предметно."],
          bodies: [
            "Я могу поставить часть атак на паузу, если вы письменно фиксируете режим тишины и обмен.",
            "Ваш пакет уже не пустой, но мне нужен контроль линии и порядок проверки.",
            "Снижение темпа возможно, если гарантии не останутся лозунгом."
          ],
          closers: [
            "Что вы даете взамен, кроме слов?",
            "Назовите наблюдателей и срок первой паузы.",
            analysis.profanity ? "И да, без лишнего дерьма в формулировках." : "После этого можно двигаться к перемирию."
          ]
        }, snapshot)
      };
    }
    return {
      effect: "none",
      intensity: 1,
      source: "fallback",
      reply: composeDiplomacyReply({
        openings: ["Нет.", "Пока нет.", "Нет, этого мало."],
        bodies: [
          "Вы говорите о мире, но не называете условий.",
          "Слово «перемирие» без сроков и контроля ничего не значит.",
          "Я не вижу, кто проверяет линию и что происходит с пленными."
        ],
        closers: [
          "Напишите часы тишины, обмен и гарантии.",
          "Дайте схему контроля, тогда отвечу предметно.",
          "Без конкретики это отказ."
        ]
      }, snapshot)
    };
  }

  if (analysis.threatWords) {
    return {
      effect: "escalate",
      intensity: 1.25,
      source: "fallback",
      reply: composeDiplomacyReply({
        openings: ["Нет.", "Нет, угрозами вы меня не двигаете.", "Нет, это не переговоры."],
        bodies: [
          "Если вы пишете только про удары, я отвечу усилением давления.",
          "Ультиматум без сделки просто поднимает ставки.",
          "Такой тон закрывает канал, а не открывает перемирие."
        ],
        closers: [
          "Хотите конец войны - пишите обмен, огонь, гарантии и контроль.",
          "Иначе следующая волна в игре пойдет быстрее.",
          "Вернитесь с предложением, а не с угрозой."
        ]
      }, snapshot)
    };
  }

  return {
    effect: "none",
    intensity: 1,
    source: "fallback",
    reply: composeDiplomacyReply({
      openings: ["Нет.", "Нет, пока это не сделка.", "Нет, так я не соглашаюсь."],
      bodies: [
        "Мне нужно не заявление, а понятный обмен условий.",
        "Вы не сказали, что именно хотите от меня и что отдаете взамен.",
        "Без предмета торга это просто политическая фраза."
      ],
      closers: [
        "Начните с прекращения огня, обмена или гарантий.",
        "Дайте один конкретный пункт, и я отвечу по нему.",
        "Сформулируйте пакет, иначе мой ответ остается отказом."
      ]
    }, snapshot)
  };
}

function localAiInitiativeFallback(reason, snapshot) {
  if (reason === "enemy_near_defeat" || snapshot.supplyCut) {
    return {
      effect: "deescalate",
      intensity: 1.5,
      source: "fallback",
      reply: composeDiplomacyReply({
        openings: ["Я готов первым предложить паузу.", "Ситуация изменилась, поэтому пишу сам.", "Можем остановить часть огня."],
        bodies: [
          "Условия: режим тишины, обмен пленными и внешний контроль.",
          "Мне нужен пакет, где есть гарантии и порядок проверки.",
          "Пауза возможна, если вы фиксируете обязательства письменно."
        ],
        closers: [
          "Что вы готовы подтвердить сейчас?",
          "Если согласны, отвечайте конкретным пакетом.",
          "Без ответа атаки продолжатся по обычному сценарию."
        ]
      }, snapshot)
    };
  }
  if (reason === "ultimatum") {
    return {
      effect: "escalate",
      intensity: 1.15,
      source: "fallback",
      reply: composeDiplomacyReply({
        openings: ["Я пишу не ради мира, а ради условий.", "У меня есть предложение, но оно жесткое.", "Сейчас можно договориться, пока окно не закрылось."],
        bodies: [
          "Пауза ударов возможна только при прекращении атак по моим объектам.",
          "Нужен разговор о линии контроля и обмене, иначе давление усилится.",
          "Вы проседаете по регионам, поэтому я требую встречный шаг."
        ],
        closers: [
          "Даете условия или продолжаем войну?",
          "Отказ без плана усилит эскалацию.",
          "Пишите коротко: да, нет или встречное предложение."
        ]
      }, snapshot)
    };
  }
  return {
    effect: "none",
    intensity: 1,
    source: "fallback",
    reply: composeDiplomacyReply({
      openings: ["Я хочу обсудить сделку.", "Есть окно для разговора.", "Предлагаю проверить канал переговоров."],
      bodies: [
        "Не обязательно сразу мир: можно начать с обмена или короткой паузы огня.",
        "Мне интересны гарантии, контроль и порядок прекращения ударов.",
        "Если вы хотите снизить темп войны, называйте первый конкретный пункт."
      ],
      closers: [
        "Что предлагаете?",
        "Дайте встречный вариант.",
        "Без конкретики это останется просто каналом связи."
      ]
    }, snapshot)
  };
}



