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

    const nextDate = () => {
        const newpos = Math.min(100, pos + 100 / (dates.length - 1));
        const d = dates[Math.round(newpos / 100 * (dates.length - 1))];
        onHistory(d);
        setPos(newpos);
    }

    const prevDate = () => {
        const newpos = Math.max(0, pos - 100 / (dates.length - 1));
        const d = dates[Math.round(newpos / 100 * (dates.length - 1))];
        onHistory(d);
        setPos(newpos);
    }

    if (play) {
        setTimeout(() => {
            if (pos === 100) {
                setPlay(false);
            } else {
                nextDate();
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
            {/* <Grid item> */}
                <Icon>history</Icon>
            {/* </Grid> */}
            {!withPlay ? null :
                <IconButton onClick={() => setPlay(!play)} size='small'>
                    <Icon> play_arrow</Icon>
                </IconButton>
            }
            <IconButton size='small' onClick={() => prevDate()}>
                <Icon>skip_previous</Icon>
            </IconButton>
            <IconButton size='small' onClick={() => nextDate()}>
                <Icon>skip_next</Icon>
            </IconButton>
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
                    valueLabelDisplay={pos !== 100 ? "on" : "auto"}
                    valueLabelFormat={val => {
                        const d = new Date(dates[Math.round(val / 100 * (dates.length - 1))])
                        return d.getDate() + '.' + (d.getMonth() + 1)
                    }}
                />
            </Grid>
        </Grid>
    )
}
