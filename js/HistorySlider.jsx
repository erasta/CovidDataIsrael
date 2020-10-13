const {
    MenuItem, Select, InputLabel, FormHelperText, FormControlLabel, Switch, Checkbox, Typography, Slider
} = MaterialUI;

const HistorySlider = ({ onHistory, withPlay = false }) => {
    const [dates, setDates] = React.useState([]);
    const [pos, setPos] = React.useState(100);
    const [play, setPlay] = React.useState(false);
    React.useEffect(() => {
        (async () => {
            const data = await fetchFile('out/history/dates.json');
            setDates(data ? JSON.parse(data) : []);
        })();
    }, []);

    if (play) {
        setTimeout(() => {
            if (pos === 100) {
                setPos(0);
            } else {
                const newpos = pos + 100 / (dates.length - 1);
                const d = dates[Math.round(newpos / 100 * (dates.length - 1))];
                onHistory(d);
                setPos(newpos);
            }
        }, 500);
    }
    return (
        <Grid container direction="row" justify="center" alignItems="center"
            spacing={2}
            style={{
                marginLeft: '5%',
                width: '90%'
            }}>
            {!withPlay ? null :
                <Grid item>
                    <IconButton>
                        <Icon onClick={() => setPlay(!play)}> play_arrow</Icon>
                    </IconButton>
                </Grid>
            }
            <Grid item>
                <Icon>history</Icon>
            </Grid>
            <Grid item xs>
                <Slider
                    disabled={!dates.length}
                    value={pos}
                    onChange={(e, v) => {
                        const d = v === 100 ? false : dates[Math.round(v / 100 * (dates.length - 1))];
                        onHistory(d);
                        setPos(v);
                    }}
                    step={dates.length ? 100 / dates.length : undefined}
                    valueLabelDisplay={play ? "on" : "auto"}
                    valueLabelFormat={val => {
                        const d = new Date(dates[Math.round(val / 100 * (dates.length - 1))])
                        return d.getDate() + '.' + (d.getMonth() + 1)
                    }}
                />
            </Grid>
        </Grid>
    )
}
