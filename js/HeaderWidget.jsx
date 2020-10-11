const HeaderWidgetItem = ({ lang, name, data, color }) => {
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

const sumarr = (arr) => {
    return arr.reduce((a, b) => a + b);
}

const HeaderWidget = ({ lang }) => {
    const [data, setData] = React.useState({
        infectedTotal: '...',
        infectedYesterday: '...',
        infectedNow: '...',
        hospital: '',
        hard: '',
        medium: '',
        breathe: '',
        dead: '',
        deadThisWeek: '',
    });

    console.log('helloo')

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(-1, 59, 59);
    const weekago = new Date(now - 7 * 24 * 3600 * 1000);
    weekago.setHours(0, 0, 0, 0);

    React.useEffect(() => {
        (async () => {
            const [patients, infected, deadTable] = await Promise.all([
                await fetchCsv(`out/csv/patientsPerDate.csv`),
                await fetchCsv(`out/csv/infectedPerDate.csv`),
                await fetchCsv(`out/csv/deadPatientsPerDate.csv`)
            ]);
            const last = patients[patients.length - 1];
            const sum = sumarr(infected.map(row => row['amount']));
            const yester = infected[infected.length - 2]['amount'];
            const sumdead = sumarr(deadTable.map(row => row['amount']));
            const deadweek = sumarr(deadTable
                .filter(row => row['date'].getTime() > weekago.getTime() && row['date'].getTime() < yesterday.getTime())
                .map(row => row['amount']))
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
                deadThisWeek: deadweek,
            }));
        })();
    }, [])

    return (
        <>
            <Card elevation={3} style={{ margin: 5, padding: 5 }} xs={3}
            // minWidth='300'
            >
                <Grid container direction="row-reverse" justify="space-between" alignItems="stretch">
                    {/* <Grid container direction="row" justify="space-between" alignItems="center">
                    </Grid> */}
                    <HeaderWidgetItem name={'סה״כ מאובחנים'} data={data.infectedTotal} xs={3} />
                    <HeaderWidgetItem name={'חולים פעילים'} data={data.infectedNow} xs={3} />
                    <HeaderWidgetItem name={'אתמול'} data={data.infectedYesterday} xs={3} />
                </Grid>
            </Card>
            <Grid container direction="row-reverse" justify="space-between" alignItems="stretch">
                <Grid item
                    xs={6}
                    style={{ minWidth: 250 }}
                >
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
                                <HeaderWidgetItem name={'מונשמים'} data={data.breathe} xs={3} color='blue' />
                                <HeaderWidgetItem name={'קשה'} data={data.hard} xs={3} color='red' />
                                <HeaderWidgetItem name={'בינוני'} data={data.medium} xs={3} color='orange' />
                                <HeaderWidgetItem name={'מאושפזים'} data={data.hospital} xs={3} color='purple' />
                            </Grid>
                        }
                    />
                </Grid>
                <Grid item
                    xs={6}
                    style={{ minWidth: 250 }}
                >
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
                            numberOnTop: true,
                        }}
                        dateBounds={[weekago, now]}
                        footer={
                            <HeaderWidgetItem name={'סה״כ נפטרים'} data={data.dead} xs={3} color='black' />
                        }
                    />
                </Grid>
            </Grid>
        </>
    );
}