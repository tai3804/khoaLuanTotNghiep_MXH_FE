// ----------------------------------------------------------------------

const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const units = ['', 'nghìn', 'triệu', 'tỷ'];

function readThreeDigits(n: number, showZeroHundred: boolean): string {
    const hundred = Math.floor(n / 100);
    const ten = Math.floor((n % 100) / 10);
    const one = n % 10;
    let result = '';

    if (hundred > 0) {
        result += `${ones[hundred]} trăm `;
    } else if (showZeroHundred) {
        result += 'không trăm ';
    }

    if (ten > 1) {
        result += `${ones[ten]} mươi `;
        if (one === 1) result += 'mốt ';
        else if (one === 5) result += 'lăm ';
        else if (one > 0) result += `${ones[one]} `;
    } else if (ten === 1) {
        result += 'mười ';
        if (one === 5) result += 'lăm ';
        else if (one > 0) result += `${ones[one]} `;
    } else if (one > 0) {
        if (hundred > 0 || showZeroHundred) result += 'lẻ ';
        result += `${ones[one]} `;
    }

    return result;
}

// ----------------------------------------------------------------------

export function numberToVietnameseWords(num: number | undefined | null): string {
    if (num === undefined || num === null || num === 0) return 'Không đồng';

    const groups: number[] = [];
    let remaining = Math.floor(num);
    while (remaining > 0) {
        groups.push(remaining % 1000);
        remaining = Math.floor(remaining / 1000);
    }

    let result = '';
    for (let i = groups.length - 1; i >= 0; i--) {
        if (groups[i] > 0) {
            result += `${readThreeDigits(groups[i], i < groups.length - 1)}${units[i]} `;
        }
    }

    result = result.trim();
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return `${result} đồng.`;
}
