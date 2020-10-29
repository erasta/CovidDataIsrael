const DateRangeSlider = ({ dates, dateRange, setDateRange }) => {
    const top = onlyDay(new Date());
    const start = new Date(2020, 0, 1);
    const dist = top - start;
    const dateToPos = (d) => (d - start) / dist * 100;
    const posToDate = (x) => onlyDay(new Date(x / 100 * dist + start.getTime()));
    return (
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
        </Grid>
    )
}