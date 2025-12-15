import { addDays, getDate, getMonth, getYear } from 'date-fns';

interface Holiday {
    date: string; // YYYY-MM-DD
    name: string;
    type: 'fixed' | 'variable';
}

// Easter calculation (Meeus/Jones/Butcher algorithm)
const getEasterDate = (year: number): Date => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
};

export const getHolidays = (year: number): Holiday[] => {
    const holidays: Holiday[] = [];

    // Fixed Holidays (National + SP State + Major Academic)
    const fixed = [
        { m: 0, d: 1, name: 'Confraternização Universal' },
        { m: 0, d: 25, name: 'Aniversário de São Paulo' }, // City/State relevant
        { m: 3, d: 21, name: 'Tiradentes' },
        { m: 4, d: 1, name: 'Dia do Trabalhador' },
        { m: 6, d: 9, name: 'Revolução Constitucionalista (SP)' }, // SP State Holiday
        { m: 7, d: 11, name: 'Dia do Estudante' }, // Academic
        { m: 8, d: 7, name: 'Independência do Brasil' },
        { m: 9, d: 12, name: 'Nossa Senhora Aparecida' },
        { m: 9, d: 15, name: 'Dia do Professor' }, // Academic (Usually Oct 15, wait. Oct is 9 0-indexed? No. Jan=0, Feb=1... Oct=9. Yes.)
        // Wait: Jan=0, Feb=1, Mar=2, Apr=3, May=4, Jun=5, Jul=6, Aug=7, Sep=8, Oct=9. 
        // Logic check: Oct 15 is month 9.
        // Logic check: Sep 7 is month 8.
        { m: 9, d: 28, name: 'Dia do Servidor Público' }, // Public Service
        { m: 10, d: 2, name: 'Finados' }, // Nov 2 (Month 10)
        { m: 10, d: 15, name: 'Proclamação da República' }, // Nov 15 (Month 10)
        { m: 10, d: 20, name: 'Dia da Consciência Negra' }, // Nov 20 (Month 10)
        { m: 11, d: 25, name: 'Natal' }, // Dec 25 (Month 11)
    ];

    fixed.forEach(h => {
        holidays.push({
            date: `${year}-${String(h.m + 1).padStart(2, '0')}-${String(h.d).padStart(2, '0')}`,
            name: h.name,
            type: 'fixed'
        });
    });

    // Variable Holidays (based on Easter)
    const easter = getEasterDate(year);
    const carnival = addDays(easter, -47);
    const goodFriday = addDays(easter, -2);
    const corpusChristi = addDays(easter, 60);

    const format = (d: Date) => `${getYear(d)}-${String(getMonth(d) + 1).padStart(2, '0')}-${String(getDate(d)).padStart(2, '0')}`;

    holidays.push({ date: format(carnival), name: 'Carnaval', type: 'variable' });
    holidays.push({ date: format(goodFriday), name: 'Sexta-feira Santa', type: 'variable' });
    holidays.push({ date: format(easter), name: 'Páscoa', type: 'variable' });
    holidays.push({ date: format(corpusChristi), name: 'Corpus Christi', type: 'variable' });

    return holidays.sort((a, b) => a.date.localeCompare(b.date));
};
