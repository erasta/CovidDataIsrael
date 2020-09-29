const {
    MenuItem,
    Select,
    InputLabel,
    FormHelperText,
    FormControlLabel,
    Switch,
    Checkbox,
    Typography,
    Slider,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    makeStyles,
    IconButton,
    CardActions,
    Collapse,
} = MaterialUI;

const extractDateAndNumbers = (parsed) => {
    if (!parsed.length || !Object.keys(parsed[0]).includes('date')) {
        return [[], []];
    }
    const dates = parsed.map(row => row['date']);
    const numfields = [], numitems = [];
    Object.keys(parsed[0]).forEach(key => {
        if (key === 'id' || key === '_id') return false;
        let good = true
        const items = parsed.map(row => {
            const x = row[key];
            if (!x) return 0;
            if (Number.isFinite(x)) return row[key];
            const num = parseFloat(x);
            if (Number.isFinite(num)) return num;
            if (x === '<15') return 14;
            const splitted = (x + '').split('-');
            if (splitted.length === 2) {
                const one = parseFloat(splitted[0]), two = parseFloat(splitted[1]);
                if (Number.isFinite(one) && Number.isFinite(two)) {
                    return (one + two) / 2;
                }
            }
            good = false;
            return undefined;
        });
        if (good) {
            numfields.push(key);
            numitems.push(items);
        }
    });
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
    } else if (group === '14DayMA') {
        return calcMovingAverage(dates, nums, 14);
    } else if (group === '28DayMA') {
        return calcMovingAverage(dates, nums, 28);
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

var image = new Image();
image.src = "images/eran.dev.water.png";
const DataGraph = ({ parsed }) => {
    const [chartStyle, setChartStyle] = React.useState(localStorage.getItem('chartStyle') || 'line');
    const [timeGroup, setTimeGroup] = React.useState('Exact');
    const [accumulated, setAccumulated] = React.useState(false);
    const [dateRange, setDateRange] = React.useState([0, 100]);
    const [mutedFields, setMutedFields] = React.useState([]);

    React.useEffect(() => {
        if (['line', 'bar'].includes(chartStyle)) { // scatter and bubble don't switch well
            localStorage.setItem('chartStyle', chartStyle);
        }
    }, [chartStyle]);

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
                if (mutedFields.includes(numfields[i])) return null; // filter is done afterwards to preserve colors
                return {
                    type: chartStyle,
                    label: numfields[i],
                    backgroundColor: attachAlpha(colors[i], 0.2),
                    borderColor: attachAlpha(colors[i], 1),
                    borderWidth: 1,
                    pointRadius: 1,
                    data: (accumulated ? accumulateNums(field) : field).slice(fromIndex, toIndex + 1),
                }
            }).filter(x => x)
        };
    }
    return (
        numfields.length === 0 ? null :
            <>
                <DateRangeSlider
                    dates={dates}
                    dateRange={dateRange}
                    onChangeDateRange={(v) => setDateRange(v)}
                />
                <Select
                    value={chartStyle}
                    onChange={e => setChartStyle(e.target.value)}
                >
                    <MenuItem value={'bar'} >Bars Chart</MenuItem>
                    <MenuItem value={'line'} >Lines Chart</MenuItem>
                    <MenuItem value={'bubble'} >Bubble</MenuItem>
                    <MenuItem value={'scatter'} >Scatter</MenuItem>
                </Select>
                <Select
                    value={timeGroup}
                    onChange={e => setTimeGroup(e.target.value)}
                >
                    <MenuItem value={'Exact'} >Exact at time</MenuItem>
                    {/* <MenuItem value={'Daily'} >Daily</MenuItem> */}
                    <MenuItem value={'3DayMA'} >3 Days moving average</MenuItem>
                    <MenuItem value={'7DayMA'} >7 days moving average</MenuItem>
                    <MenuItem value={'14DayMA'} >14 days moving average</MenuItem>
                    <MenuItem value={'28DayMA'} >28 days moving average</MenuItem>
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
                <FieldChips
                    fieldNames={numfields}
                    colors={colors}
                    mutedFields={mutedFields}
                    setMutedFields={setMutedFields}
                />
                <ReactChartjs2.default
                    legend={false}
                    data={data}
                    type={chartStyle}
                    options={{
                        scales: { yAxes: [{ ticks: { min: 0 } }] },
                        watermark: {
                            image: image, opacity: 0.07, alignToChartArea: true
                        }
                    }}
                />
            </>
    )
}
