const DEFAULT_TIMEOUT_MS = 8000;

function isCellBroadcastEnabled() {
  return String(process.env.CELL_BROADCAST_ENABLED || '').toLowerCase() === 'true';
}

function parseTimeoutMs() {
  const value = Number(process.env.CELL_BROADCAST_TIMEOUT_MS);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_TIMEOUT_MS;
  return value;
}

function sanitizeTowerIds(towerIds) {
  if (Array.isArray(towerIds)) {
    return towerIds
      .map((id) => String(id).trim())
      .filter(Boolean);
  }

  if (typeof towerIds === 'string') {
    return towerIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  return [];
}

function buildEmergencyMessage(alert) {
  const base = alert.description && alert.description.trim()
    ? alert.description.trim()
    : `Emergency alert: ${alert.title}`;
  return `${base} Please follow local safety instructions immediately.`;
}

/**
 * Sends a cell-broadcast request to a telecom provider API.
 * This is the only practical way to reach all phones currently attached to towers.
 */
async function broadcastEmergencyToCellTowers(alert, options = {}) {
  if (!isCellBroadcastEnabled()) {
    return {
      attempted: false,
      sent: false,
      reason: 'CELL_BROADCAST_ENABLED is false',
    };
  }

  const providerUrl = process.env.CELL_BROADCAST_PROVIDER_URL;
  if (!providerUrl) {
    return {
      attempted: false,
      sent: false,
      reason: 'CELL_BROADCAST_PROVIDER_URL is not configured',
    };
  }

  const timeoutMs = parseTimeoutMs();
  const towerIds = sanitizeTowerIds(options.towerIds);
  const payload = {
    external_alert_id: alert.id,
    title: alert.title,
    message: options.message || buildEmergencyMessage(alert),
    type: alert.type,
    severity: alert.severity,
    expires_at: alert.expires_at,
    target: {
      latitude: alert.latitude,
      longitude: alert.longitude,
      radius_km: alert.radius_km,
      tower_ids: towerIds,
    },
    channels: ['cell_broadcast'],
  };

  const headers = {
    'Content-Type': 'application/json',
  };
  if (process.env.CELL_BROADCAST_API_KEY) {
    headers.Authorization = `Bearer ${process.env.CELL_BROADCAST_API_KEY}`;
  }

  try {
    const response = await fetch(providerUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const bodyText = await response.text();
    let body;
    try {
      body = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      body = { raw: bodyText };
    }

    if (!response.ok) {
      return {
        attempted: true,
        sent: false,
        status: response.status,
        error: body?.error || body?.message || 'Provider rejected broadcast request',
        provider_response: body,
      };
    }

    return {
      attempted: true,
      sent: true,
      status: response.status,
      provider_response: body,
    };
  } catch (error) {
    return {
      attempted: true,
      sent: false,
      error: error.message,
    };
  }
}

module.exports = { broadcastEmergencyToCellTowers, sanitizeTowerIds };
