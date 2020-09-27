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

const fetchFile = async (url) => {
    const data = await (await fetch(url)).text();
    if (data.split('\n', 1)[0].trim() === "<!DOCTYPE html>") {
        return undefined;
    }
    return data;
}

const convertFieldToType = (rows, key) => {
    if (rows.length === 0) return rows;
    const items = rows.map(row => row[key].trim());

    // Check and convert to numbers
    const nums = items.map(x => (!x || x === "") ? 0 : parseFloat(x))
    if (nums.filter((x, i) => x + '' !== items[i]).length === 0) {
        rows.forEach((row, i) => row[key] = nums[i]);
        return rows;
    }

    // Check and convert to dates
    const dates = items.map(x => x.length ? new Date(x) : new Date(1999, 0, 1));
    if (dates.filter(d => isNaN(d.getTime())).length === 0) {
        rows.forEach((row, i) => row[key] = dates[i]);
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

