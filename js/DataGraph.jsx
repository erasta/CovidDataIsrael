const {
    MenuItem, Select, InputLabel, FormHelperText, FormControlLabel, Switch, Checkbox, Typography, Slider
} = MaterialUI;

const extractDateAndNumbers = (parsed) => {
    if (!parsed.length || !Object.keys(parsed[0]).includes('date')) {
        return [[], []];
    }
    const numfields = Object.keys(parsed[0]).filter(key => Number.isFinite(parsed[0][key]));
    const numitems = numfields.map(key => parsed.map(row => row[key]));
    const dates = parsed.map(row => row['date']);
    return [numitems, numfields, dates];
}

const groupByTime = (group, dates, nums) => {
    if (group === 'Exact') {
        return [dates, nums];
    }
    if (group === '3DayMA') {
        return calcMovingAverage(dates, nums, 3);
    } else if (group === '7DayMA') {
        return calcMovingAverage(dates, nums, 7);
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
    const groupnumitems = numitems.map(nums => {
        let groupnums;
        [groupdates, groupnums] = groupByTime(group, dates, nums);
        return groupnums;
    })
    return [groupdates, groupnumitems];
}

const findDateRangeIndices = (dates, fromDate, toDateInc) => {
    let i = 0;
    while (i < dates.length - 1 && dates[i] < fromDate && dates[i + 1] <= fromDate) i++;
    let j = dates.length - 1;
    while (j > 0 && dates[j] > toDateInc && dates[j - 1] >= toDateInc) j--;
    return [i, j];
}

const dateByPercent = (dates, percent) => {
    return dates[Math.round(percent / 100 * (dates.length - 1))];
}

const DataGraph = ({ parsed }) => {
    const [chartStyle, setChartStyle] = React.useState('line');
    const [timeGroup, setTimeGroup] = React.useState('Exact');
    const [accumulated, setAccumulated] = React.useState(false);
    const [dateRange, setDateRange] = React.useState([0, 100]);

    const [numitems, numfields, dates] = extractDateAndNumbers(parsed);

    const [groupdates, groupnumitems] = groupGroupsByTime(timeGroup, dates, numitems);

    let fromIndex = 0, toIndex = -1;
    if (groupdates && groupdates.length && groupnumitems.length) {
        const fromDate = dateByPercent(dates, dateRange[0]);
        const toDateInc = dateByPercent(dates, dateRange[1]);
        [fromIndex, toIndex] = findDateRangeIndices(groupdates, fromDate, toDateInc);
    }

    const colors = groupnumitems.map((_, i) => colorByNumber(i, groupnumitems.length + 1));
    let data = {}
    if (numfields.length) {
        data = {
            labels: groupdates.slice(fromIndex, toIndex + 1).map(d => d.toLocaleDateString()),
            datasets: groupnumitems.map((field, i) => {
                return {
                    type: chartStyle,
                    label: numfields[i],
                    backgroundColor: attachAlpha(colors[i], 0.2),
                    borderColor: attachAlpha(colors[i], 1),
                    borderWidth: 1,
                    pointRadius: 1,
                    data: (accumulated ? accumulateNums(field) : field).slice(fromIndex, toIndex + 1),
                }
            })
        };
    }
    const options = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    min: 0
                }
            }]
        }
    };
    return (
        numfields.length === 0 ? null :
            <>
                <Grid container
                    spacing={2}
                    style={{
                        marginLeft: '5%',
                        width: '90%'
                    }}>
                    <Grid item>
                        <Icon>settings_ethernet</Icon>
                    </Grid>
                    <Grid item xs>
                        <Slider
                            value={dateRange}
                            onChange={(e, v) => setDateRange(v)}
                            valueLabelDisplay="auto"
                            aria-labelledby="date-slider"
                            valueLabelFormat={(val, side) => {
                                if (!dates.length) return val;
                                const d = dates[Math.round(val / 100 * (dates.length - 1))]
                                return d.getDate() + '.' + (d.getMonth() + 1)
                            }}
                        />
                    </Grid>
                </Grid>
                <Select
                    value={chartStyle}
                    onChange={e => setChartStyle(e.target.value)}
                >
                    <MenuItem value={'bar'} >Bars Chart</MenuItem>
                    <MenuItem value={'line'} >Lines Chart</MenuItem>
                    <MenuItem value={'scatter'} >Scatter</MenuItem>
                    <MenuItem value={'bubble'} >Bubble</MenuItem>
                </Select>
                <Select
                    value={timeGroup}
                    onChange={e => setTimeGroup(e.target.value)}
                >
                    <MenuItem value={'Exact'} >Exact at time</MenuItem>
                    {/* <MenuItem value={'Daily'} >Daily</MenuItem> */}
                    <MenuItem value={'3DayMA'} >3 Days moving average</MenuItem>
                    <MenuItem value={'7DayMA'} >7 days moving average</MenuItem>
                    <MenuItem value={'Weekly'} >Weekly sums</MenuItem>
                    <MenuItem value={'Monthly'} >Monthly sums</MenuItem>
                </Select>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={accumulated}
                            onChange={e => setAccumulated(e.target.checked)}
                            color="primary"
                        />}
                    label="Sum"
                    labelPlacement="start"
                />
                <ReactChartjs2.default
                    // legend={false}
                    data={data}
                    type={chartStyle}
                    options={options}
                />
            </>
    )
}
