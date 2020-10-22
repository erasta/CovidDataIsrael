const DataShowComputedDeath = ({ lang, showtable = true }) => {
    const [state, setState] = React.useState({ parsed: [], work: true });
    const [multiplyDead, setMultiplyDead] = React.useState(1);
    const [offsetDate, setOffsetDate] = React.useState(0);
    React.useEffect(() => {
        (async () => {
            setState({ parsed: state.parsed, work: true });
            const infected = (await new FetchedTable('infectedPerDate').doFetch()).suffixFields('_infected').data;
            const dead = (await new FetchedTable('deadPatientsPerDate').doFetch()).suffixFields('_dead').data;
            const parsed = mergeTablesByDate(infected, dead);
            parsed.forEach(row => {
                const { Amount_infected, Amount_dead, Recovered_infected } = row;
                row['Currently_sick'] = (Amount_infected ?? 0) - (Amount_dead ?? 0) - (Recovered_infected ?? 0);
            });
            setState({ parsed: parsed, work: false });
        })();
    }, [])
    let changed = state.parsed.map((row, i) => {
        const crow = Object.assign({}, row);
        const index = Math.max(0, Math.min(i + offsetDate, state.parsed.length - 1));
        crow['Amount_dead'] = state.parsed[index]['Amount_dead'] * multiplyDead;
        return crow;
    });
    if (offsetDate > 0) changed = changed.slice(0, changed.length - offsetDate);
    if (offsetDate < 0) changed = changed.slice(-offsetDate);
    return (
        <>
            <CardContent>
                <Typography gutterBottom variant="h5" component="h5" align='center' style={{ marginBlockEnd: 0 }}>
                    {trans(lang, 'infectedVsDead')}
                </Typography>
            </CardContent>
            <Grid container direction="row">
                <Typography id="dead-slider" gutterBottom>
                    Multiply dead
                </Typography>
                <Slider
                    style={{ width: '25%', marginLeft: 10 }}
                    aria-labelledby="dead-slider"
                    valueLabelDisplay="auto"
                    value={multiplyDead}
                    step={0.01}
                    min={0.01}
                    max={300}
                    onChange={(e, v) => setMultiplyDead(v)}
                />
            </Grid>
            <Grid container direction="row">
                <Typography id="date-slider" gutterBottom>
                    Offset Date
                </Typography>
                <Slider
                    style={{ width: '25%', marginLeft: 10 }}
                    aria-labelledby="date-slider"
                    valueLabelDisplay="auto"
                    value={offsetDate}
                    step={1}
                    min={-50}
                    max={50}
                    onChange={(e, v) => setOffsetDate(v)}
                />
            </Grid>
            <DataGraph parsed={changed} showControls={true} />
            <CircularWorkGif work={state.work} />
            {/* {!showtable ? null :
                <TableShow parsed={state.parsed} />
            } */}
        </>
    )
}
