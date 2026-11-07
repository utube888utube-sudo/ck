import { Product, ProductCategory } from '../types.ts';

// Initial product catalogue is intentionally empty.
// Store Administrator (7975614686) adds and activates real products via the Admin Dashboard.
export const INITIAL_PRODUCTS: Product[] = [];

export interface CategoryMeta {
  name: string;
  displayName: string;
  aliases: string[];
  imageUrl: string;
  iconName: string;
  count: number;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    name: 'Rice & Grains',
    displayName: 'Rice & Grains',
    aliases: ['Rice and grains', 'Rice & Grains'],
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
    iconName: 'Wheat',
    count: 0,
  },
  {
    name: 'Atta & Flour',
    displayName: 'Atta & Flour',
    aliases: ['Atta and flour', 'Atta & Flour'],
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
    iconName: 'Package',
    count: 0,
  },
  {
    name: 'Dals & Pulses',
    displayName: 'Dals & Pulses',
    aliases: ['Pulses and dals', 'Dals & Pulses'],
    imageUrl: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=300&q=80',
    iconName: 'Layers',
    count: 0,
  },
  {
    name: 'Cooking Oils',
    displayName: 'Cooking Oils',
    aliases: ['Cooking oil and ghee', 'Cooking Oils'],
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
    iconName: 'Droplet',
    count: 0,
  },
  {
    name: 'Spices & Masalas',
    displayName: 'Spices & Masalas',
    aliases: ['Spices and masalas', 'Spices & Masalas'],
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&q=80',
    iconName: 'Flame',
    count: 0,
  },
  {
    name: 'Sugar & Salt',
    displayName: 'Sugar & Salt',
    aliases: ['Sugar and salt', 'Sugar & Salt'],
    imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=300&q=80',
    iconName: 'Sparkles',
    count: 0,
  },
  {
    name: 'Biscuits & Snacks',
    displayName: 'Biscuits & Snacks',
    aliases: ['Biscuits and snacks', 'Biscuits & Snacks'],
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80',
    iconName: 'Cookie',
    count: 0,
  },
  {
    name: 'Tea & Coffee',
    displayName: 'Tea & Coffee',
    aliases: ['Tea and coffee', 'Tea & Coffee'],
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80',
    iconName: 'Coffee',
    count: 0,
  },
  {
    name: 'Personal Care',
    displayName: 'Personal Care',
    aliases: ['Soaps and personal care', 'Personal Care'],
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=300&q=80',
    iconName: 'Smile',
    count: 0,
  },
  {
    name: 'Household Cleaning',
    displayName: 'Household Cleaning',
    aliases: ['Household cleaning products', 'Household Cleaning'],
    imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=300&q=80',
    iconName: 'Sparkle',
    count: 0,
  },
];
