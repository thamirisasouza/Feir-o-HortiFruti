export type UnitType = 'kg' | 'pct' | 'unidade' | 'gramas';

export type CategoryId = string;

export interface CategoryItem {
  id: CategoryId;
  label: string;
}

export interface ProductItem {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  origin?: string;
  harvestNote?: string;
  unitLabel: string;
  unitType: UnitType;
  price: number;
  artId: string;
  nutritionalHighlight?: string;
  isOferta?: boolean;
  isFavorito?: boolean;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'frutas', label: 'Frutas' },
  { id: 'verduras', label: 'Verduras' },
  { id: 'legumes', label: 'Legumes' },
];

export const PRODUCTS: ProductItem[] = [
  {
    id: 'prod-morango',
    name: 'Morango',
    categoryId: 'frutas',
    categoryLabel: 'Frutas',
    origin: 'Minas Gerais',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Bandeja 250g',
    unitType: 'gramas',
    price: 12.90,
    artId: 'morango',
    nutritionalHighlight: 'Morangos vermelhos, doces e suculentos selecionados um a um.',
    isOferta: true,
    isFavorito: true,
  },
  {
    id: 'prod-manga',
    name: 'Manga',
    categoryId: 'frutas',
    categoryLabel: 'Frutas',
    origin: 'Bahia',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Unidade 550g',
    unitType: 'unidade',
    price: 7.90,
    artId: 'manga',
    nutritionalHighlight: 'Manga doce, suculenta e sem fiapos selecionada a mão.',
    isOferta: true,
    isFavorito: false,
  },
  {
    id: 'prod-laranja',
    name: 'Laranja Bahia',
    categoryId: 'frutas',
    categoryLabel: 'Frutas',
    origin: 'São Paulo',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Rede 1kg',
    unitType: 'kg',
    price: 9.80,
    artId: 'mamao',
    nutritionalHighlight: 'Laranjas doces, sem sementes e repletas de suco natural.',
    isOferta: true,
    isFavorito: false,
  },
  {
    id: 'prod-uva',
    name: 'Uva Sem Semente',
    categoryId: 'frutas',
    categoryLabel: 'Frutas',
    origin: 'Pernambuco',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Bandeja 500g',
    unitType: 'gramas',
    price: 14.90,
    artId: 'uva',
    nutritionalHighlight: 'Uvas frescas, doces e suculentas sem semente.',
    isOferta: false,
    isFavorito: true,
  },
  {
    id: 'prod-abacate',
    name: 'Abacate',
    categoryId: 'frutas',
    categoryLabel: 'Frutas',
    origin: 'São Paulo',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Unidade 450g',
    unitType: 'unidade',
    price: 9.50,
    artId: 'abacate',
    nutritionalHighlight: 'Abacate selecionado de polpa macia e amanteigada.',
    isOferta: false,
    isFavorito: true,
  },
  {
    id: 'prod-banana',
    name: 'Banana Prata',
    categoryId: 'frutas',
    categoryLabel: 'Frutas',
    origin: 'São Paulo',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Penca 800g',
    unitType: 'pct',
    price: 8.90,
    artId: 'banana',
    nutritionalHighlight: 'Penca de banana prata doce e selecionada.',
    isOferta: false,
    isFavorito: true,
  },
  {
    id: 'prod-roma',
    name: 'Romã',
    categoryId: 'frutas',
    categoryLabel: 'Frutas',
    origin: 'São Paulo',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Unidade 380g',
    unitType: 'unidade',
    price: 13.50,
    artId: 'roma',
    nutritionalHighlight: 'Grãos vermelhos brilhantes e repletos de suco antioxidante.',
    isOferta: true,
    isFavorito: false,
  },
  {
    id: 'prod-maca',
    name: 'Maçã Gala',
    categoryId: 'frutas',
    categoryLabel: 'Frutas',
    origin: 'Santa Catarina',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Porção 600g',
    unitType: 'gramas',
    price: 10.90,
    artId: 'maca',
    nutritionalHighlight: 'Maçãs crocantes, perfumadas e suculentas da serra.',
    isOferta: false,
    isFavorito: true,
  },
  {
    id: 'prod-alface',
    name: 'Alface',
    categoryId: 'verduras',
    categoryLabel: 'Verduras',
    origin: 'São Paulo',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Maço 300g',
    unitType: 'pct',
    price: 6.50,
    artId: 'alface',
    nutritionalHighlight: 'Folhas verdes crocantes colhidas no início da manhã.',
    isOferta: true,
    isFavorito: false,
  },
  {
    id: 'prod-brocolis',
    name: 'Brócolis',
    categoryId: 'verduras',
    categoryLabel: 'Verduras',
    origin: 'São Paulo',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Unidade 400g',
    unitType: 'unidade',
    price: 8.80,
    artId: 'brocolis',
    nutritionalHighlight: 'Brócolis verde e fresco da colheita da manhã.',
    isOferta: true,
    isFavorito: false,
  },
  {
    id: 'prod-tomate',
    name: 'Tomate',
    categoryId: 'legumes',
    categoryLabel: 'Legumes',
    origin: 'São Paulo',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Bandeja 600g',
    unitType: 'gramas',
    price: 9.80,
    artId: 'tomate',
    nutritionalHighlight: 'Tomates frescos e suculentos colhidos na rama.',
    isOferta: false,
    isFavorito: true,
  },
  {
    id: 'prod-cenoura',
    name: 'Cenoura',
    categoryId: 'legumes',
    categoryLabel: 'Legumes',
    origin: 'São Paulo',
    harvestNote: 'Colheita do dia',
    unitLabel: 'Maço 500g',
    unitType: 'pct',
    price: 7.50,
    artId: 'cenoura',
    nutritionalHighlight: 'Cenouras frescas e crocantes colhidas no dia.',
    isOferta: true,
    isFavorito: false,
  },
];
