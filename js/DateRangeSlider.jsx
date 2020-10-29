const DateRangeSlider = ({ dates, dateRange, setDateRange }) => {
    const top = onlyDay(new Date());
    const start = new Date(2020, 0, 1);
    const dist = top - start;
    const dateToPos = (d) => (d - start) / dist * 100;
    const posToDate = (x) => onlyDay(new Date(x / 100 * dist + start.getTime()));
    const nextDate = (curr) => {
        const ret = dates.find((d, i) => d.getTime() > curr.getTime() && i > 0 && dates[i - 1].getTime() <= curr.getTime());
        return ret ? ret : curr;
    }
    const prevDate = (curr) => {
        const ret = dates.find((d, i) => d.getTime() < curr.getTime() && i < dates.length - 1 && dates[i + 1].getTime() >= curr.getTime());
        return ret ? ret : curr;
    }
    return (
        <Grid container justify="center" alignItems="center"
            spacing={2}
            style={{
                marginLeft: '5%',
                width: '90%'
            }}>
            {/* <Grid item> */}
            <Icon>settings_ethernet</Icon>
            {/* </Grid>
            <Grid item> */}
            <IconButton size='small' onClick={() => setDateRange([prevDate(dateRange[0]), dateRange[1]])}>
                <Icon>skip_previous</Icon>
            </IconButton>
            <IconButton size='small' onClick={() => setDateRange([nextDate(dateRange[0]), dateRange[1]])}>
                <Icon>skip_next</Icon>
            </IconButton>
            {/* </Grid> */}
            <Grid item xs>
                <Slider
                    value={dateRange.map(dateToPos)}
                    onChange={(e, v) => setDateRange(v.map(posToDate))}
                    valueLabelDisplay="auto"
                    aria-labelledby="date-slider"
                    valueLabelFormat={(val, side) => {
                        const d = posToDate(val);
                        return d.getDate() + '.' + (d.getMonth() + 1)
                    }}
                />
            </Grid>
            {/* <Grid item> */}
            <IconButton size='small' onClick={() => setDateRange([dateRange[0], prevDate(dateRange[1])])}>
                <Icon>skip_previous</Icon>
            </IconButton>
            <IconButton size='small' onClick={() => setDateRange([dateRange[0], nextDate(dateRange[1])])}>
                <Icon>skip_next</Icon>
            </IconButton>
            {/* </Grid> */}
        </Grid>
    )
}