function countBy(arr) {
    return arr.reduce((acc, val) => {
        acc[val] = (acc[val] ?? 0) + 1;
        return acc;
    }, {});
}
function topKey(dist) {
    return Object.entries(dist).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
}
export function transformLogs(logs) {
    if (!logs.length) {
        return {
            totalLogs: 0,
            uniquePiiTypes: 0,
            mostFrequentAction: '—',
            avgConfidence: 0,
            piiDistribution: {},
            actionDistribution: {},
            phaseDistribution: {},
            lawsDistribution: {},
            timelineData: [],
        };
    }
    const piiDistribution = countBy(logs.map(l => l.pii));
    const actionDistribution = countBy(logs.map(l => l.act));
    const phaseDistribution = countBy(logs.map(l => l.phase));
    const lawsDistribution = countBy(logs.flatMap(l => l.laws ?? []));
    const avgConfidence = logs.reduce((sum, l) => sum + (l.conf ?? 0), 0) / logs.length;
    // Group by date (YYYY-MM-DD)
    const dateMap = {};
    for (const log of logs) {
        const date = log.ts ? log.ts.slice(0, 10) : 'unknown';
        dateMap[date] = (dateMap[date] ?? 0) + 1;
    }
    const timelineData = Object.entries(dateMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }));
    return {
        totalLogs: logs.length,
        uniquePiiTypes: Object.keys(piiDistribution).length,
        mostFrequentAction: topKey(actionDistribution),
        avgConfidence: Math.round(avgConfidence * 100),
        piiDistribution,
        actionDistribution,
        phaseDistribution,
        lawsDistribution,
        timelineData,
    };
}
/* ── Label formatters ───────────────────────────── */
export function formatPhase(phase) {
    return phase
        .replace(/^PHASE_\d+_/, '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
}
export function formatAction(act) {
    return act.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
export function formatPii(pii) {
    return pii.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
export function formatTs(ts) {
    if (!ts)
        return '—';
    try {
        return new Date(ts).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }
    catch {
        return ts;
    }
}
