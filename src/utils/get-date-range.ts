export function getDateRangeFromPeriod(period: string): { fromDate: string; toDate: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const fmt = (d: Date) => d.toISOString().split('T')[0];

    if (/^\d+$/.test(period)) {
        const m = parseInt(period, 10);
        if (m >= 1 && m <= 12) {
            return { fromDate: fmt(new Date(year, m - 1, 1)), toDate: fmt(new Date(year, m, 0)) };
        }
    }

    switch (period) {
        case 'this_month':
            return { fromDate: fmt(new Date(year, month, 1)), toDate: fmt(now) };
        case 'last_month':
            return { fromDate: fmt(new Date(year, month - 1, 1)), toDate: fmt(new Date(year, month, 0)) };
        case 'this_quarter': {
            const qStart = Math.floor(month / 3) * 3;
            return { fromDate: fmt(new Date(year, qStart, 1)), toDate: fmt(now) };
        }
        case 'this_year':
            return { fromDate: fmt(new Date(year, 0, 1)), toDate: fmt(now) };
        case 'last_12_months': {
            const start = new Date(year, month - 11, 1);
            return { fromDate: fmt(start), toDate: fmt(now) };
        }
        default:
            return { fromDate: '', toDate: '' };
    }
}
