const convertToType = (item) => {
    const trimmed = item.trim();
    const num = parseFloat(trimmed);
    if ('' + num === trimmed) return num;
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) return date;
    return trimmed;
}

const convertToShow = (item) => {
    if (item instanceof Date) {
        if (!item.getUTCHours()) {
            return item.toLocaleDateString();
        } else {
            return item.toLocaleString();
        }
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

const calcMovingAverage = (dates, nums, span) => {
    const newnums = dates.map((dt, idx) => {
        const start = Math.max(0, idx - span);
        let moving = nums.slice(start, idx + 1);
        const movingDates = dates.slice(start, idx + 1);
        moving = moving.filter((_, i) => {
            return Math.round((dt - movingDates[i]) / 86400000) <= span;
        });
        const sum = moving.reduce((a, b) => a + b);
        return sum / moving.length;
    });
    return [dates, newnums];
}

