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

const DataGraph = ({ parsed }) => {
    const [chartStyle, setChartStyle] = React.useState('Line');

    const [numitems, numfields, dates] = extractDateAndNumbers(parsed);
    console.log(numitems)
    let data = {}
    if (numfields.length) {
        data = {
            labels: dates.map(d => d.toLocaleDateString()),
            datasets: numitems.map((field, i) => {
                const color = new Array(3).fill().map(() => '' + Math.floor(Math.random() * 256)).join(',')
                return {
                    label: numfields[i],
                    backgroundColor: 'rgba(' + color + ',0.2)',
                    borderColor: 'rgba(' + color + ',1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(' + color + ',0.4)',
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
                    onChange={setChartStyle}
                >
                    <MenuItem value={'Bar'} >Bars Chart</MenuItem>
                    <MenuItem value={'Line'} >Lines Chart </MenuItem>
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
