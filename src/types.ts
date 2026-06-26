/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Agent {
  symbol: string;
  headquarters: string;
  credits: number;
  startingFaction: string;
  shipCount: number;
}

export interface ContractDeliver {
  tradeSymbol: string;
  destinationSymbol: string;
  unitsRequired: number;
  unitsFulfilled: number;
}

export interface ContractTerms {
  deadline: string;
  payment: {
    onAccepted: number;
    onFulfilled: number;
  };
  deliver?: ContractDeliver[];
}

export interface Contract {
  id: string;
  faction: string;
  type: string;
  terms: ContractTerms;
  accepted: boolean;
  fulfilled: boolean;
  expiration: string;
  deadlineToAccept: string;
}

export interface WaypointRef {
  symbol: string;
  type: string;
  x: number;
  y: number;
}

export interface Route {
  destination: WaypointRef;
  departureTime: string;
  arrivalTime: string;
}

export interface ShipNav {
  systemSymbol: string;
  waypointSymbol: string;
  route: Route;
  status: 'IN_ORBIT' | 'DOCKED' | 'IN_TRANSIT';
  flightMode: 'CRUISE' | 'DRIFT' | 'STEALTH' | 'BURN';
}

export interface ShipFuel {
  current: number;
  capacity: number;
  consumed?: {
    amount: number;
    timestamp: string;
  };
}

export interface CargoItem {
  symbol: string;
  name: string;
  description: string;
  units: number;
}

export interface ShipCargo {
  capacity: number;
  units: number;
  inventory: CargoItem[];
}

export interface Cooldown {
  shipSymbol: string;
  totalSeconds: number;
  remainingSeconds: number;
  expiration?: string;
}

export interface Ship {
  symbol: string;
  registration: {
    name: string;
    factionSymbol: string;
    role: string;
  };
  nav: ShipNav;
  fuel: ShipFuel;
  cargo: ShipCargo;
  cooldown: Cooldown;
}

export interface WaypointTrait {
  symbol: string;
  name: string;
  description: string;
}

export interface Waypoint {
  symbol: string;
  type: string;
  x: number;
  y: number;
  orbitals: Array<{ symbol: string }>;
  traits: WaypointTrait[];
  faction?: {
    symbol: string;
  };
}

export interface MarketGood {
  symbol: string;
  type: 'IMPORT' | 'EXPORT' | 'EXCHANGE';
  tradeVolume: number;
  supply: 'SCARCE' | 'LIMITED' | 'MODERATE' | 'ABUNDANT';
  purchasePrice: number;
  sellPrice: number;
}

export interface Market {
  symbol: string;
  exports: Array<{ symbol: string; name: string; description: string }>;
  imports: Array<{ symbol: string; name: string; description: string }>;
  exchange: Array<{ symbol: string; name: string; description: string }>;
  tradeGoods?: MarketGood[];
}

export interface ShipyardShip {
  type: string;
  name: string;
  description: string;
  purchasePrice: number;
  activity?: string;
}

export interface Shipyard {
  symbol: string;
  shipTypes: Array<{ type: string }>;
  ships?: ShipyardShip[];
}

export interface LogMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}
