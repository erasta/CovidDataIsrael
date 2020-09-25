const {
    MenuItem, Select, InputLabel, FormHelperText
} = MaterialUI;

const extractDateAndNumbers = (parsed) => {
    if (!parsed.length || !Object.keys(parsed[0]).includes('date')) {
        return [[], []];
    }
    parsed = parsed.filter(row => row['date'].trim() !== '');
    const strDates = parsed.map(row => row['date'].trim());
    const dates = strDates.map(row => new Date(row));
    const invalidDates = dates.filter(x => isNaN(x.getTime()));
    if (invalidDates.length > 0) {
        return [[], []];
    }
    const checkedfields = Object.keys(parsed[0]).filter(key => key !== 'date');
    const numfields = checkedfields.filter(key => {
        const nums = parsed.map(row => parseFloat(row[key].trim()));
        const nans = nums.filter(isNaN);
        return nans.length === 0;
    })
    const numitems = numfields.map(key => {
        return parsed.map(row => parseFloat(row[key].trim()));
    })
    return [numitems, numfields, dates];
}

const weekNum = (datequery) => {
    let onejan = new Date(1990, 0, 1);
    return Math.ceil((((datequery.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
}

const onlyUnique = (arr) => {
    return arr.filter((x, i) => arr.indexOf(x) === i)
}

const groupByTime = (group, dates, nums) => {
    if (group === 'Exact') {
        return [dates, nums];
    }
    let weeknums;
    if (group === 'Weekly') {
        weeknums = dates.map(weekNum);
    } else if (group === 'Monthly') {
        weeknums = dates.map(d => d.getFullYear() * 10 + d.getMonth());
    } else {
        weeknums = dates.map(d => d.getFullYear() * 1000 + d.getMonth() * 10 + d.getDate());
    }
    const uniqWeeknums = onlyUnique(weeknums);
    const groupdates = uniqWeeknums.map(w => {
        const datesinweek = dates.filter((d, i) => weeknums[i] === w);
        return new Date(Math.max(...datesinweek));
    })
    const groupnums = uniqWeeknums.map(w => nums.filter((d, i) => weeknums[i] === w).reduce((a, b) => a + b, 0))
    return [groupdates, groupnums];
};

const groupGroupsByTime = (group, dates, numitems) => {
    let groupdates;
    console.log(group)
    const groupnumitems = numitems.map(nums => {
        let groupnums;
        [groupdates, groupnums] = groupByTime(group, dates, nums);
        return groupnums;
    })
    return [groupdates, groupnumitems];
}

const DataGraph = ({ parsed }) => {
    const [chartStyle, setChartStyle] = React.useState('Line');
    const [timeGroup, setTimeGroup] = React.useState('Exact');

    const [numitems, numfields, dates] = extractDateAndNumbers(parsed);
    const [groupdates, groupnumitems] = groupGroupsByTime(timeGroup, dates, numitems);
    let data = {}
    if (numfields.length) {
        data = {
            labels: groupdates.map(d => d.toLocaleDateString()),
            datasets: groupnumitems.map((field, i) => {
                const color = new Array(3).fill().map(() => '' + Math.floor(Math.random() * 256)).join(',')
                return {
                    label: numfields[i],
                    backgroundColor: 'rgba(' + color + ',0.2)',
                    borderColor: 'rgba(' + color + ',0.8)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(' + color + ',0.6)',
                    hoverBorderColor: 'rgba(' + color + ',1)',
                    data: field,
                }
            })
        };
    }
    return (
        numfields.length === 0 ? null :
            <>
                <Select
                    value={chartStyle}
                    onChange={e => setChartStyle(e.target.value)}
                >
                    <MenuItem value={'Bar'} >Bars Chart</MenuItem>
                    <MenuItem value={'Line'} >Lines Chart </MenuItem>
                </Select>
                <Select
                    value={timeGroup}
                    onChange={e => setTimeGroup(e.target.value)}
                >
                    <MenuItem value={'Exact'} >No time groupings</MenuItem>
                    <MenuItem value={'Daily'} >Daily</MenuItem>
                    <MenuItem value={'Weekly'} >Weekly</MenuItem>
                    <MenuItem value={'Monthly'} >Monthly</MenuItem>
                </Select>
                {(chartStyle === 'Line') ?
                    <ReactChartjs2.Line
                        data={data}
                    /> :
                    <ReactChartjs2.Bar
                        data={data}
                    />
                }
            </>
    )
}
