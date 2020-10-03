const WidgetItem = ({ lang, name, data }) => {
    return (
        <Paper>
            <Typography variant="h5" component="h2">
                {data}
            </Typography>
            <Typography variant="body2" component="p">
                {name}
            </Typography>
        </Paper>
    )
}
const SmallWidget = ({ lang }) => {
    const [data, setData] = React.useState({
        infectedTotal: '',
        infectedYesterday: '',
        infectedNow: '',
        hospital: '',
        hard: '',
        medium: '',
        breathe: '',
        dead: '',
    });
    React.useEffect(() => {
        (async () => {
            const [patients, infected, deadTable] = await Promise.all([
                await fetchCsv(`out/csv/patientsPerDate.csv`),
                await fetchCsv(`out/csv/infectedPerDate.csv`),
                await fetchCsv(`out/csv/deadPatientsPerDate.csv`)
            ]);
            const last = patients[patients.length - 1];
            const sum = infected.map(row => row['amount']).reduce((a, b) => a + b);
            const yester = infected[infected.length - 2]['amount'];
            const sumdead = deadTable.map(row => row['amount']).reduce((a, b) => a + b);
            console.log(sum, yester, sumdead, last);
            setData(Object.assign({}, data, {
                infectedTotal: sum,
                infectedYesterday: yester,
                infectedNow: last['Counthospitalized'] + last['patients_home'] + last['patients_hotel'],
                medium: last['CountMediumStatus'],
                breathe: last['CountBreath'],
                hard: last['CountHardStatus'],
                dead: sumdead,
                hospital: last['Counthospitalized'],
            }));
        })();
    }, [])
    return (
        <>
            <Card elevation={3} style={{ margin: 5, padding: 5 }}>
                <Grid container direction="row" justify="space-between" alignItems="center">
                    <WidgetItem name={'אתמול'} data={data.infectedYesterday} xs={4}/>
                    <WidgetItem name={'פעילים'} data={data.infectedNow} xs={4}/>
                    <WidgetItem name={'נדבקים'} data={data.infectedTotal} xs={4} />
                </Grid>
            </Card>
            <DataShow
                name={'patientsPerDate'}
                lang={lang}
                showtable={false}
                showTitle={false}
                enforceChart={{
                    style: 'line',
                    bounds: [new Date(2020, 5, 1)],
                    fields: ["Count Hard Status", "Count Medium Status", "Count Easy Status", "Count Breath"]
                }}
            />
            <Card elevation={3} style={{ margin: 5, padding: 5 }}>
                <Grid container direction="row" justify="space-between" alignItems="center">
                    <WidgetItem name={'מאושפזים'} data={data.hospital} xs={3}/>
                    <WidgetItem name={'קשה'} data={data.hard} xs={3}/>
                    <WidgetItem name={'בינוני'} data={data.medium}xs={3} />
                    <WidgetItem name={'מונשמים'} data={data.breathe} xs={3}/>
                    <WidgetItem name={'נפטרים'} data={data.dead} />
                </Grid>
            </Card>
            <DataShow
                name={'deadPatientsPerDate'}
                lang={lang}
                showtable={false}
                showTitle={false}
                enforceChart={{
                    style: 'bar',
                    bounds: [new Date() - 7 * 24 * 3600 * 1000]
                }}
            />
        </>
    );
}