const convertToType = (item) => {
    const trimmed = item.trim();
    const num = parseFloat(trimmed);
    if ('' + num === trimmed) return num;
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) return date;
    return trimmed;
}

const truncateDigits = (item) => {
    if (item === 0) {
        return item;
    }
    const log = Math.log10(Math.abs(item));
    const factor = log > 3 ? 100 : Math.pow(10, 6 - Math.ceil(log));
    return Math.round(item * factor) / factor;
}

const convertToShow = (item) => {
    if (Number.isFinite(item)) {
        return truncateDigits(item);
    }
    if (item instanceof Date && !isNaN(item)) {
        if (!item.getUTCHours()) {
            return item.toLocaleDateString('en-GB');
        } else {
            return item.toLocaleString('en-GB', { hour12: false });
        }
    }
    const asNum = parseFloat(item);
    if (Number.isFinite(asNum)) {
        return truncateDigits(asNum);
    }
    return item;
}

const sortBy = (rows, column, asc) => {
    if (rows.length && column) {
        console.log('sorting by', column, asc);
        rows = rows.slice();
        rows.sort((a, b) => {
            return a[column] - b[column]
        });
        if (!asc) {
            rows.reverse();
        }
    }
    return rows;
}

const weekNum = (datequery) => {
    let onejan = new Date(1990, 0, 1);
    return Math.ceil((((datequery.getTime() - onejan.getTime()) / 86400000) + onejan.getDay()) / 7);
}

const onlyUnique = (arr) => {
    return arr.filter((x, i) => arr.indexOf(x) === i)
}

const MILLISECOND_PER_DAY = 1000 * 60 * 60 * 24;

const toUtcDay = (a) => {
    return Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
}

const calcMovingAverage = (dates, nums, span) => {
    const newnums = []
    for (let i = 0; i < dates.length; ++i) {
        let utc = toUtcDay(dates[i]);
        let num = 1;
        let sum = nums[i];
        for (let j = i - 1; j >= 0 && Math.floor((utc - toUtcDay(dates[j])) / MILLISECOND_PER_DAY) < span; --j) {
            ++num;
            sum += nums[j];
        }
        newnums.push(truncateDigits(sum / num));
    }
    return [dates, newnums];
}

const fetchFile = async (url) => {
    try {
        const response = await fetch(url);
        const text = await response.text();
        return response.ok ? text : undefined;
    } catch (e) {
        return undefined;
    }
}

const convertFieldToType = (rows, key) => {
    if (rows.length === 0) return rows;
    const items = rows.map(row => (row[key] === undefined) ? '' : row[key].trim());

    // Check and convert to numbers
    const nums = items.map(x => (!x || x === "") ? 0 : parseFloat(x))
    if (nums.filter((x, i) => x !== 0 && x + '' !== items[i]).length === 0) {
        rows.forEach((row, i) => row[key] = nums[i]);
        return rows;
    }

    // Check and convert to dates
    const firstDate = new Date(2020, 0, 1);
    const dates = items.map(x => x.length ? new Date(x) : new Date(firstDate));
    if (dates.filter(d => isNaN(d.getTime())).length === 0) {
        rows.forEach((row, i) => {
            if (dates[i].getTime() <= firstDate.getTime() + 1) { // sometimes when date is unapplicable we get 1999/1/1
                row[key] = new Date(firstDate); // clone the date just incase
            } else {
                row[key] = dates[i];
            }
        });
        return rows;
    }

    // It is a string field
    return rows;
}

const convertRowsToTypes = (rows) => {
    if (rows.length === 0) return rows;
    Object.keys(rows[0]).map(key => convertFieldToType(rows, key));
    return rows;
}

const fetchCsv = async (url) => {
    const data = await fetchFile(url);
    if (!data) {
        return undefined;
    }
    const parsed = d3.csv.parse(data);
    const converted = convertRowsToTypes(parsed);
    return converted;
}

const colorScheme = d3.schemeSet1.concat(d3.schemeSet2).concat(d3.schemeSet3);

const colorByNumber = (t, amount) => {
    t = t >= 5 ? t + 1 : t;
    t = t >= 18 ? t + 1 : t;
    if (t < colorScheme.length) {
        return colorScheme[t];
    }
    return d3.interpolateRainbow((t - colorScheme.length) / (amount - colorScheme.length))
}

const accumulateNums = (nums) => {
    return nums.map((sum => value => sum += value)(0));
}

const daystr = (date) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
}

const attachAlpha = (color, alpha) => {
    if (color.startsWith('rgb')) {
        const arr = color.split(')')[0].split('(')[1].split(',');
        const justNumsComma = arr.map(x => x.trim()).join(',');
        return 'rgba(' + justNumsComma + ',' + alpha + ')'
    } else {
        let alphahex = parseInt(Math.floor(alpha * 255), 16);
        while (alphahex.length < 2) alphahex = '0' + alphahex;
        return color + alphahex;
    }
}

const camelCaseToSnake = (str) => {
    return str.replace(/(?:^|\.?)([A-Z])/g, function (x, y) { return "_" + y }).replace(/^_/, "");
}

const trans = (lang, text) => {
    if (!text || text === "") return text;
    if (!lang) return '';
    if (lang[text]) return lang[text];
    const nospaces = text.replace(/[ _]/g, '');
    if (lang[nospaces]) return lang[nospaces];
    return text;
}

