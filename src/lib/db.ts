import type { D1Database } from '@cloudflare/workers-types';
import type {
    SessionType, ConsumptionMethod,
    StockMovementType
} from './db-types';

// Assume DB is globally available or passed via context/DI
declare global {
    var DB: D1Database;
}

// --- Session Management ---

interface LogSessionData {
    userId: string;
    startTime: number; // Unix timestamp
    durationMinutes: number;
    consumptionMethod: ConsumptionMethod;
    effects: string[];
    notes?: string;
    strainId?: string;
    sessionType: SessionType;
}

export async function logSession(data: LogSessionData): Promise<void> {
    const effectsJson = JSON.stringify(data.effects);
    try {
        await DB.prepare(`
            INSERT INTO sessions (
                user_id, start_time, duration_minutes, consumption_method,
                effects, notes, strain_id, session_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            data.userId,
            data.startTime,
            data.durationMinutes,
            data.consumptionMethod,
            effectsJson,
            data.notes,
            data.strainId,
            data.sessionType
        ).run();
    } catch (error) {
        console.error("Error logging session:", error);
        throw new Error("Failed to log session.");
    }
}

// --- Inventory Management ---

interface UpdateStockData {
    strainId: string;
    quantityChange: number; // Positive for purchase/adjustment, negative for consumption
    movementType: StockMovementType;
    note?: string;
}

export async function updateStock(data: UpdateStockData): Promise<void> {
    try {
        await DB.batch([
            // Update the current quantity on the strain record
            DB.prepare(`
                UPDATE strains
                SET current_quantity_grams = current_quantity_grams + ?,
                    updated_at = unixepoch()
                WHERE strain_id = ?
            `).bind(data.quantityChange, data.strainId),

            // Record the movement in the stock_movements table
            DB.prepare(`
                INSERT INTO stock_movements (strain_id, quantity_change, movement_type, note)
                VALUES (?, ?, ?, ?)
            `).bind(data.strainId, data.quantityChange, data.movementType, data.note)
        ]);
    } catch (error) {
        console.error("Error updating stock:", error);
        throw new Error("Failed to update stock.");
    }
} 