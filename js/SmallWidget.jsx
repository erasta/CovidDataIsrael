const WidgetItem = ({ lang, name, data, color }) => {
    return (
        <div style={{ textAlign: 'right' }}>
            <Typography variant="body2" component="p" style={{ color: color }}>
                {name}
            </Typography>
            <Typography variant="h6" component="h6" style={{ color: color }}>
                {numberWithCommas(data)}
            </Typography>
        </div>
    )
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
        deadThisWeek: '',
    });

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(-1, 59, 59);
    const weekago = new Date(now - 7 * 24 * 3600 * 1000);
    weekago.setHours(0, 0, 0, 0);

    React.useEffect(() => {
        (async () => {
            const [patients, infected, deadTable, sickTwo] = await Promise.all([
                await fetchCsv(`out/csv/patientsPerDate.csv`),
                await fetchCsv(`out/csv/infectedPerDate.csv`),
                await fetchCsv(`out/csv/deadPatientsPerDate.csv`),
                await fetchCsv(`out/csv/sickPerDateTwoDays.csv`)
            ]);
            const last = patients[patients.length - 1];
            const sum = sumarr(infected.map(row => row['amount']));
            const yester = infected[infected.length - 2]['amount'];
            const sumdead = sumarr(deadTable.map(row => row['amount']));
            const deadweek = sumarr(deadTable
                .filter(row => row['date'].getTime() > weekago.getTime() && row['date'].getTime() < yesterday.getTime())
                .map(row => row['amount']))
                const infected_now = sickTwo.map(x => x.amount).reduce((a, b) => a + b, 0);
                console.log(sum, yester, sumdead, last);
            setData(Object.assign({}, data, {
                infectedTotal: sum,
                infectedYesterday: yester,
                infectedNow: infected_now, //last['Counthospitalized'] + last['patients_home'] + last['patients_hotel'],
                medium: last['CountMediumStatus'],
                breathe: last['CountBreath'],
                hard: last['CountHardStatus'],
                dead: sumdead,
                hospital: last['Counthospitalized'],
                deadThisWeek: deadweek,
            }));
        })();
    }, [])

    return (
        <>
            <MaterialUI.Link href="https://erasta.github.io/CovidDataIsrael" style={{ textDecoration: 'none' }} target="_blank">
                <Card elevation={3} style={{ margin: 5, padding: 5 }}>
                    <Grid container direction="column">
                        <Grid container direction="row" justify="space-between" alignItems="center">
                            <WidgetItem name={'אתמול'} data={data.infectedYesterday} xs={3} />
                            <WidgetItem name={'סה״כ מאובחנים'} data={data.infectedTotal} xs={3} />
                        </Grid>
                        <WidgetItem name={'חולים פעילים'} data={data.infectedNow} xs={3} />
                    </Grid>
                </Card>
            </MaterialUI.Link>
            <MaterialUI.Link href="https://erasta.github.io/CovidDataIsrael/?sheet=patientsPerDate" style={{ textDecoration: 'none' }} target="_blank">
                <DataShow
                    name={'patientsPerDate'}
                    lang={lang}
                    showtable={false}
                    title={
                        <Typography variant="h6" component="h6" align='center' style={{ marginBlockEnd: 0 }}>
                            {'מאושפזים לפי תאריך'}
                        </Typography>
                    }
                    enforceChart={{
                        style: 'curve',
                        bounds: [new Date(2020, 5, 1)],
                        fields: ["Count Hard Status", "Count Medium Status", "Count Breath", 'Count Hospitalized'],
                        colors: ['#ff0000', '#ffa500', '#0000ff', '#800080'],
                    }}
                    footer={
                        <Grid container direction="row" justify="space-between" alignItems="center">
                            <WidgetItem name={'מונשמים'} data={data.breathe} xs={3} color='blue' />
                            <WidgetItem name={'קשה'} data={data.hard} xs={3} color='red' />
                            <WidgetItem name={'בינוני'} data={data.medium} xs={3} color='orange' />
                            <WidgetItem name={'מאושפזים'} data={data.hospital} xs={3} color='purple' />
                        </Grid>
                    }
                />
            </MaterialUI.Link>
            <MaterialUI.Link href="https://erasta.github.io/CovidDataIsrael/?sheet=deadPatientsPerDate" style={{ textDecoration: 'none' }} target="_blank">
                <DataShow
                    name={'deadPatientsPerDate'}
                    lang={lang}
                    showtable={false}
                    title={
                        <Typography variant="h6" component="h6" align='center' style={{ marginBlockEnd: 0 }}>
                            {'נפטרים בשבוע האחרון ' + data.deadThisWeek}
                        </Typography>
                    }
                    enforceChart={{
                        style: 'bar',
                        bounds: [weekago, now],
                        fields: ['Amount'],
                        numberOnTop: true,
                    }}
                    dateBounds={[weekago, now]}
                    footer={
                        <WidgetItem name={'סה״כ נפטרים'} data={data.dead} xs={3} color='black' />
                    }
                />
            </MaterialUI.Link>
            <Typography variant="subtitle2" component="p" align='center'>
                powered by&nbsp;
                <MaterialUI.Link href="https://eran.dev/" style={{ textDecoration: 'none' }} target="_blank" >
                    eran.dev
                </MaterialUI.Link>
            </Typography>
        </>
    );
}
