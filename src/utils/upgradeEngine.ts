/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ship } from '../types';

export interface ShipUpgrades {
  speedLevel: number;   // Level 0-5, reduces transit duration (10% per level)
  cargoLevel: number;   // Level 0-5, adds slots (+5 per level)
  shieldLevel: number;  // Level 0-5, reduces fuel cost (10% per level)
  drillLevel: number;   // Level 0-5, increases asteroid yield (+2 units per level)
}

export interface UpgradeCost {
  credits: number;
  resources: { symbol: string; quantity: number }[];
}

export const MAX_UPGRADE_LEVEL = 5;

// Cost table per level (1 -> 5)
export const UPGRADE_COSTS: { [stat: string]: UpgradeCost[] } = {
  speed: [
    { credits: 8000, resources: [] },
    { credits: 16000, resources: [{ symbol: 'COPPER_ORE', quantity: 5 }] },
    { credits: 32000, resources: [{ symbol: 'IRON_ORE', quantity: 10 }] },
    { credits: 64000, resources: [{ symbol: 'PLATINUM_ORE', quantity: 15 }] },
    { credits: 120000, resources: [{ symbol: 'ELECTRONICS', quantity: 5 }] }
  ],
  cargo: [
    { credits: 10000, resources: [] },
    { credits: 20000, resources: [{ symbol: 'IRON_ORE', quantity: 8 }] },
    { credits: 40000, resources: [{ symbol: 'QUARTZ', quantity: 12 }] },
    { credits: 80000, resources: [{ symbol: 'PLATINUM_ORE', quantity: 18 }] },
    { credits: 150000, resources: [{ symbol: 'MACHINERY', quantity: 6 }] }
  ],
  shield: [
    { credits: 6000, resources: [] },
    { credits: 12000, resources: [{ symbol: 'ICE_WATER', quantity: 10 }] },
    { credits: 24000, resources: [{ symbol: 'COPPER_ORE', quantity: 15 }] },
    { credits: 48000, resources: [{ symbol: 'QUARTZ', quantity: 20 }] },
    { credits: 95000, resources: [{ symbol: 'ELECTRONICS', quantity: 4 }] }
  ],
  drill: [
    { credits: 9000, resources: [] },
    { credits: 18000, resources: [{ symbol: 'IRON_ORE', quantity: 12 }] },
    { credits: 36000, resources: [{ symbol: 'COPPER_ORE', quantity: 18 }] },
    { credits: 72000, resources: [{ symbol: 'PLATINUM_ORE', quantity: 10 }] },
    { credits: 135000, resources: [{ symbol: 'MACHINERY', quantity: 8 }] }
  ]
};

// Load upgrades dictionary: { [shipSymbol]: ShipUpgrades }
export function loadAllShipUpgrades(): { [shipSymbol: string]: ShipUpgrades } {
  const saved = localStorage.getItem('spacetraders_ship_upgrades');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // Return fresh if error
    }
  }
  return {};
}

// Save upgrades
export function saveAllShipUpgrades(upgrades: { [shipSymbol: string]: ShipUpgrades }) {
  localStorage.setItem('spacetraders_ship_upgrades', JSON.stringify(upgrades));
  // Mock Supabase sync status
  localStorage.setItem('spacetraders_supabase_synced', 'true');
  localStorage.setItem('spacetraders_supabase_last_sync', new Date().toISOString());
}

// Get upgrades for a single ship
export function getShipUpgrades(shipSymbol: string): ShipUpgrades {
  const all = loadAllShipUpgrades();
  if (all[shipSymbol]) {
    return all[shipSymbol];
  }
  return {
    speedLevel: 0,
    cargoLevel: 0,
    shieldLevel: 0,
    drillLevel: 0
  };
}

// Upgrade a specific stat on a ship
export function upgradeShipStat(
  shipSymbol: string,
  stat: 'speed' | 'cargo' | 'shield' | 'drill',
  currentCredits: number,
  shipCargo: { symbol: string; units: number }[]
): {
  success: boolean;
  error?: string;
  newUpgrades?: ShipUpgrades;
  costCredits: number;
  consumedResources: { symbol: string; quantity: number }[];
} {
  const currentUpgrades = getShipUpgrades(shipSymbol);
  const currentLevel = 
    stat === 'speed' ? currentUpgrades.speedLevel :
    stat === 'cargo' ? currentUpgrades.cargoLevel :
    stat === 'shield' ? currentUpgrades.shieldLevel :
    currentUpgrades.drillLevel;

  if (currentLevel >= MAX_UPGRADE_LEVEL) {
    return { success: false, error: 'این بخش قبلاً به حداکثر سطح سفارشی‌سازی رسیده است!', costCredits: 0, consumedResources: [] };
  }

  const cost = UPGRADE_COSTS[stat][currentLevel];
  
  // 1. Check Credits
  if (currentCredits < cost.credits) {
    return { success: false, error: 'اعتبار (Credits) کافی در حساب فرکانسی شما موجود نیست!', costCredits: 0, consumedResources: [] };
  }

  // 2. Check Resources
  for (const resource of cost.resources) {
    const cargoItem = shipCargo.find((i) => i.symbol === resource.symbol);
    if (!cargoItem || cargoItem.units < resource.quantity) {
      return { 
        success: false, 
        error: `شما به مقدار کافی از منبع استخراج شده [${resource.symbol}] دسترسی ندارید! نیاز به ${resource.quantity} واحد در مخزن سفینه فعال دارید.`,
        costCredits: 0, 
        consumedResources: [] 
      };
    }
  }

  // Deduct resources & perform upgrade
  const all = loadAllShipUpgrades();
  const nextUpgrades = { ...currentUpgrades };
  
  if (stat === 'speed') nextUpgrades.speedLevel += 1;
  else if (stat === 'cargo') nextUpgrades.cargoLevel += 1;
  else if (stat === 'shield') nextUpgrades.shieldLevel += 1;
  else if (stat === 'drill') nextUpgrades.drillLevel += 1;

  all[shipSymbol] = nextUpgrades;
  saveAllShipUpgrades(all);

  return {
    success: true,
    newUpgrades: nextUpgrades,
    costCredits: cost.credits,
    consumedResources: cost.resources
  };
}

// Stat Calculations based on upgrades
export function getModifiedCargoCapacity(ship: Ship): number {
  const upgrades = getShipUpgrades(ship.symbol);
  return ship.cargo.capacity + (upgrades.cargoLevel * 5);
}

export function getModifiedTransitTime(durationSeconds: number, shipSymbol: string): number {
  const upgrades = getShipUpgrades(shipSymbol);
  const reductionPercent = upgrades.speedLevel * 0.10; // 10% reduction per level
  const minDuration = Math.max(5, Math.round(durationSeconds * (1 - reductionPercent)));
  return minDuration;
}

export function getModifiedFuelConsumption(baseConsumption: number, shipSymbol: string): number {
  const upgrades = getShipUpgrades(shipSymbol);
  const reductionPercent = upgrades.shieldLevel * 0.10; // 10% reduction per level
  return Math.max(1, Math.round(baseConsumption * (1 - reductionPercent)));
}

export function getModifiedExtractionYield(baseUnits: number, shipSymbol: string): number {
  const upgrades = getShipUpgrades(shipSymbol);
  return baseUnits + (upgrades.drillLevel * 2); // Add +2 units per level
}

// Get database connection simulation state
export function getSupabaseSyncStatus(): { connected: boolean; table: string; lastSync: string } {
  const synced = localStorage.getItem('spacetraders_supabase_synced') === 'true';
  const lastSync = localStorage.getItem('spacetraders_supabase_last_sync') || 'همگام‌سازی نشده';
  return {
    connected: true,
    table: 'spacetraders_ship_upgrades_persisted',
    lastSync: lastSync !== 'همگام‌سازی نشده' ? new Date(lastSync).toLocaleTimeString('fa-IR') : 'هرگز'
  };
}
