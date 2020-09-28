const DateRangeSlider = ({ dates, onChange }) => {
    const [dateRange, setDateRange] = React.useState([0, 100]);
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
                    value={dateRange}
                    onChange={(e, v) => {
                        onChange(v);
                        setDateRange(v);
                    }}
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
    )
}