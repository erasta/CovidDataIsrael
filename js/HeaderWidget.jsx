const HeaderWidget = ({ lang }) => {
    const [data, setData] = React.useState({
        infectedTotal: '...',
        infectedYesterday: '...',
        infectedNow: '...',
        hospital: '',
        hard: '',
        critical: '',
        medium: '',
        breathe: '',
        dead: '',
        deadThisWeek: '',
        vaccinated: '...',
        vac_prec: '...',
    });

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(-1, 59, 59);
    const weekago = new Date(now - 7 * 24 * 3600 * 1000);
    weekago.setHours(0, 0, 0, 0);

    React.useEffect(() => {
        (async () => {
            const [patients, infected, deadTable, vaccinated] = await Promise.all([
                await fetchCsv(`out/csv/patientsPerDate.csv`),
                await fetchCsv(`out/csv/infectedPerDate.csv`),
                await fetchCsv(`out/csv/deadPatientsPerDate.csv`),
                await fetchCsv(`out/csv/vaccinated.csv`)
            ]);
            const vac_cum = vaccinated[vaccinated.length - 1].vaccinated_cum;
            const last = patients[patients.length - 1];
            const sum = sumarr(infected.map(row => row['amount']));
            const yester = infected[infected.length - 2]['amount'];
            const sumdead = sumarr(deadTable.map(row => row['amount']));
            const deadweek = sumarr(deadTable
                .filter(row => row['date'].getTime() > weekago.getTime() && row['date'].getTime() < yesterday.getTime())
                .map(row => row['amount']))
            const vac_week_ago = vaccinated.find(v => Math.abs(v.Day_Date - weekago) < 1000 * 3600 * 12);
            const vac_prec = vac_week_ago ? vac_week_ago.vaccinated_seconde_dose_population_perc + '%' : '...';
            console.log(sum, yester, sumdead, last, vac_cum);
            setData(Object.assign({}, data, {
                infectedTotal: sum,
                infectedYesterday: yester,
                infectedNow: last['Counthospitalized'] + last['patients_home'] + last['patients_hotel'],
                medium: last['CountMediumStatus'],
                breathe: last['CountBreath'],
                hard: last['CountHardStatus'],
                critical: last['CountCriticalStatus'],
                dead: sumdead,
                hospital: last['Counthospitalized'],
                deadThisWeek: deadweek,
                vaccinated: vac_cum,
                vac_prec: vac_prec
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
                    <WidgetItem name={'סה״כ מאובחנים'} data={data.infectedTotal} xs={2} />
                    <WidgetItem name={'חולים פעילים'} data={data.infectedNow} xs={2} />
                    <WidgetItem name={'אתמול'} data={data.infectedYesterday} xs={2} />
                    <WidgetItem name={'מתחסנים'} data={data.vaccinated} xs={2} color='ForestGreen' />
                    <WidgetItem name={'מחוסנים לגמרי'} data={data.vac_prec} xs={2} color='Green' />
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
                            fields: ["Count Hard Status", "Count Medium Status", "Count Breath", 'Count Critical Status', 'Count Hospitalized'],
                            colors: ['#ff0000', '#ffa500', '#0000ff', '#ff00ff', '#800080'],
                        }}
                        footer={
                            <Grid container direction="row" justify="space-between" alignItems="center">
                                <WidgetItem name={'מונשמים'} data={data.breathe} color='blue' />
                                <WidgetItem name={'קריטי'} data={data.critical} color='#ff00ff' />
                                <WidgetItem name={'קשה'} data={data.hard} color='red' />
                                <WidgetItem name={'בינוני'} data={data.medium} color='orange' />
                                <WidgetItem name={'מאושפזים'} data={data.hospital} color='purple' />
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
                            fields: ['Amount'],
                            numberOnTop: true,
                        }}
                        dateBounds={[weekago, now]}
                        footer={
                            <WidgetItem name={'סה״כ נפטרים'} data={data.dead} xs={3} color='black' />
                        }
                    />
                </Grid>
            </Grid>
        </>
    );
}
