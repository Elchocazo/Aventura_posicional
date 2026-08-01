import { GradeLevel, LevelConfig, PositionalCol, StoreItem, StoryTheme } from '../types';

export const LEVEL_CONFIGS: Record<GradeLevel, LevelConfig> = {
  2: {
    cols: ['d', 'u'],
    min1: 10,
    max1: 89,
    min2: 10,
    max2: 89,
    label: 'Segundo Grado (D, U)',
    goldSec: 120,
    silverSec: 240,
  },
  3: {
    cols: ['c', 'd', 'u'],
    min1: 100,
    max1: 799,
    min2: 50,
    max2: 400,
    label: 'Tercer Grado (C, D, U)',
    goldSec: 180,
    silverSec: 320,
  },
  4: {
    cols: ['um', 'c', 'd', 'u'],
    min1: 1000,
    max1: 6999,
    min2: 500,
    max2: 3000,
    label: 'Cuarto Grado (UM, C, D, U)',
    goldSec: 240,
    silverSec: 400,
  },
  5: {
    cols: ['dm', 'um', 'c', 'd', 'u'],
    min1: 10000,
    max1: 69999,
    min2: 5000,
    max2: 30000,
    label: 'Quinto Grado (DM, UM, C, D, U)',
    goldSec: 300,
    silverSec: 500,
  },
};

export const ALL_COLUMNS: PositionalCol[] = ['cm', 'dm', 'um', 'c', 'd', 'u'];

export const COLUMN_INFO: Record<PositionalCol, { name: string; bg: string; text: string; headerGradient: string }> = {
  cm: {
    name: 'Centenas de Mil',
    bg: 'bg-pink-500',
    text: 'text-pink-600',
    headerGradient: 'from-pink-600 to-pink-700',
  },
  dm: {
    name: 'Decenas de Mil',
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    headerGradient: 'from-purple-600 to-purple-800',
  },
  um: {
    name: 'Unidades de Mil',
    bg: 'bg-violet-600',
    text: 'text-violet-600',
    headerGradient: 'from-violet-600 to-violet-800',
  },
  c: {
    name: 'Centenas',
    bg: 'bg-amber-500',
    text: 'text-amber-600',
    headerGradient: 'from-amber-500 to-amber-600',
  },
  d: {
    name: 'Decenas',
    bg: 'bg-emerald-500',
    text: 'text-emerald-600',
    headerGradient: 'from-emerald-500 to-emerald-600',
  },
  u: {
    name: 'Unidades',
    bg: 'bg-sky-500',
    text: 'text-sky-600',
    headerGradient: 'from-sky-500 to-sky-600',
  },
};

export const STORY_THEMES: StoryTheme[] = [
  {
    icon: '🥖',
    addStory: (b1, b2) => `En la panadería hornearon ${b1} panes de queso por la mañana y ${b2} panes integrales por la tarde.`,
    addQuestion: '¿Cuántos panes hornearon en total?',
    subStory: (b1, b2) => `En la panadería había ${b1} panes recién horneados y vendieron ${b2} durante el día.`,
    subQuestion: '¿Cuántos panes quedan en la panadería?',
  },
  {
    icon: '📚',
    addStory: (b1, b2) => `En la biblioteca organizaron ${b1} libros de cuentos y recibieron una donación de ${b2} libros de ciencias.`,
    addQuestion: '¿Cuántos libros hay en total en la biblioteca?',
    subStory: (b1, b2) => `En la biblioteca había ${b1} libros disponibles y los estudiantes prestaron ${b2} para estudiar.`,
    subQuestion: '¿Cuántos libros quedan disponibles en la biblioteca?',
  },
  {
    icon: '🚀',
    addStory: (b1, b2) => `En el observatorio espacial registraron ${b1} estrellas brillantes y ${b2} cometas luminosos.`,
    addQuestion: '¿Cuántos astros observaron en total?',
    subStory: (b1, b2) => `En la estación espacial tenían ${b1} suministros de oxígeno y los astronautas utilizaron ${b2} en su misión.`,
    subQuestion: '¿Cuántos suministros de oxígeno quedan disponibles?',
  },
  {
    icon: '🐟',
    addStory: (b1, b2) => `En el acuario nadan ${b1} peces dorados y agregaron ${b2} pececitos azules al tanque.`,
    addQuestion: '¿Cuántos peces hay en total en el acuario?',
    subStory: (b1, b2) => `En el estanque del parque había ${b1} peces tropicales y trasladaron ${b2} a una nueva pecera.`,
    subQuestion: '¿Cuántos peces quedan en el estanque?',
  },
  {
    icon: '🍎',
    addStory: (b1, b2) => `En el huerto cosecharon ${b1} manzanas rojas y ${b2} naranjas jugosas.`,
    addQuestion: '¿Cuántas frutas cosecharon en total?',
    subStory: (b1, b2) => `En la granja recolectaron ${b1} frutas del árbol y empacaron ${b2} para llevar al mercado.`,
    subQuestion: '¿Cuántas frutas quedan en la granja?',
  },
  {
    icon: '🎈',
    addStory: (b1, b2) => `Para la fiesta de cumpleaños inflaron ${b1} globos amarillos y ${b2} globos azules.`,
    addQuestion: '¿Cuántos globos inflaron en total?',
    subStory: (b1, b2) => `En la fiesta tenían ${b1} globos decorativos y se reventaron ${b2} durante los juegos.`,
    subQuestion: '¿Cuántos globos quedan inflados?',
  },
  {
    icon: '🐱',
    addStory: (b1, b2) => `En el refugio de mascotas cuidaban a ${b1} perritos y rescataron a ${b2} gatitos nuevos.`,
    addQuestion: '¿Cuántas mascotas atienden en total?',
    subStory: (b1, b2) => `En el albergue tenían ${b1} animalitos rescatados y ${b2} fueron adoptados por familias amorosas.`,
    subQuestion: '¿Cuántos animales quedan en el albergue?',
  },
  {
    icon: '🤖',
    addStory: (b1, b2) => `En la juguetería exhibieron ${b1} robots articulados y ${b2} muñecos de madera.`,
    addQuestion: '¿Cuántos juguetes hay en exhibición?',
    subStory: (b1, b2) => `La juguetería tenía ${b1} carritos de carreras en inventario y vendieron ${b2} por la tarde.`,
    subQuestion: '¿Cuántos carritos quedan en inventario?',
  },
  {
    icon: '🧁',
    addStory: (b1, b2) => `En la pastelería hornean ${b1} cupcakes de fresa y ${b2} galletas de chocolate.`,
    addQuestion: '¿Cuántos postres prepararon en total?',
    subStory: (b1, b2) => `En la vitrina de la pastelería había ${b1} donas glaseadas y se vendieron ${b2} a los clientes.`,
    subQuestion: '¿Cuántas donas quedan en la vitrina?',
  },
  {
    icon: '⚽',
    addStory: (b1, b2) => `En el almacén deportivo contaron ${b1} balones de fútbol y ${b2} balones de baloncesto.`,
    addQuestion: '¿Cuántos balones hay en total?',
    subStory: (b1, b2) => `En la cancha deportiva tenían ${b1} raquetas de tenis y prestaron ${b2} a los alumnos.`,
    subQuestion: '¿Cuántas raquetas quedan disponibles?',
  },
];

export const STORE_MASCOTS: StoreItem[] = [
  { id: '🦉', name: 'Búho Sabio', cost: 0, icon: '🦉', category: 'mascot' },
  { id: '🦄', name: 'Unicornio Mágico', cost: 150, icon: '🦄', category: 'mascot' },
  { id: '🚀', name: 'Cohete Veloz', cost: 300, icon: '🚀', category: 'mascot' },
  { id: '🤖', name: 'Robot Cómputo', cost: 500, icon: '🤖', category: 'mascot' },
  { id: '🦁', name: 'León Rey', cost: 800, icon: '🦁', category: 'mascot' },
  { id: '🐼', name: 'Panda Genio', cost: 1000, icon: '🐼', category: 'mascot' },
  { id: '🐲', name: 'Dragón Fuego', cost: 1500, icon: '🐲', category: 'mascot' },
];

export const STORE_ACCESSORIES: StoreItem[] = [
  { id: '🎓', name: 'Birrete Sabio', cost: 0, icon: '🎓', category: 'accessory' },
  { id: '👑', name: 'Corona Real', cost: 200, icon: '👑', category: 'accessory' },
  { id: '🎩', name: 'Sombrero Mago', cost: 350, icon: '🎩', category: 'accessory' },
  { id: '🥽', name: 'Gafas de Sol', cost: 600, icon: '🥽', category: 'accessory' },
  { id: '🎀', name: 'Moño Brillante', cost: 850, icon: '🎀', category: 'accessory' },
];
