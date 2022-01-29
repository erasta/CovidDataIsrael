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
        dead77: '',
        deadThisWeek: '',
        vaccinated: '...',
        vac_prec: '...',
    });

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(-1, 59, 59);
    const weekago = new Date(now - 7 * 24 * 3600 * 1000);
    weekago.setHours(0, 0, 0, 0);
    const date77 = new Date(2021, 6, 6);

    React.useEffect(() => {
        (async () => {
            const [infected, deadTable, vaccinated, sickTwo, hardPatientTable, sickPatientPerLocation] = await Promise.all([
                await fetchCsv(`out/csv/infectedPerDate.csv`),
                await fetchCsv(`out/csv/deadPatientsPerDate.csv`),
                await fetchCsv(`out/csv/vaccinated.csv`),
                await fetchCsv(`out/csv/sickPerDateTwoDays.csv`),
                await fetchCsv(`out/csv/hardPatient.csv`),
                await fetchCsv(`out/csv/sickPatientPerLocation.csv`)
            ]);

            function valueOrUnknown(val) {
                return ((val !== undefined) ? val : '...');
            }
            const vac_cum = vaccinated[vaccinated.length - 1].vaccinated_cum;
            const sum = sumarr(infected.map(row => row['amount']));
            const yester = infected[infected.length - 2]['amount'];
            const sumdead = sumarr(deadTable.map(row => row['amount']));
            const sumdead77 = sumarr(deadTable.filter(row => row['date'].getTime() > date77).map(row => row['amount']));
            const deadweek = sumarr(deadTable
                .filter(row => row['date'].getTime() > weekago.getTime() && row['date'].getTime() < yesterday.getTime())
                .map(row => row['amount']))
            const vac_week_ago = vaccinated.find(v => Math.abs(v.Day_Date - weekago) < 1000 * 3600 * 4);
            const vac_prec = vac_week_ago ? vac_week_ago.vaccinated_seconde_dose_population_perc + '%' : '...';
            const infected_now = sickTwo.map(x => x.amount).reduce((a, b) => a + b, 0);
            const lastmedium= valueOrUnknown(hardPatientTable[0]['countMediumStatus']);
            const lastbreathe= valueOrUnknown(hardPatientTable[0]['countBreath']);
            const lasthard= valueOrUnknown(hardPatientTable[0]['countHardStatus']);
            const lastcritical= valueOrUnknown(hardPatientTable[0]['countCriticalStatus']);
            const lasthospital= valueOrUnknown(sickPatientPerLocation.filter(x=>x['name'] === 'hospital')[0]['amount']);
            console.log(sum, yester, sumdead, vac_cum);
            const newData = {
                infectedTotal: sum,
                infectedYesterday: yester,
                infectedNow: infected_now, //last['Counthospitalized'] + last['patients_home'] + last['patients_hotel'],
                medium: lastmedium,
                breathe: lastbreathe,
                hard: lasthard,
                critical: lastcritical,
                hospital: lasthospital,
                dead: sumdead,
                dead77: sumdead77,
                deadThisWeek: deadweek,
                vaccinated: vac_cum,
                vac_prec: vac_prec
            };
            console.log(newData);
            setData(Object.assign({}, data, newData));
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
                    <WidgetItem name={'מחוסנים במלואם'} data={data.vac_prec} xs={2} color='Green' />
                </Grid>
            </Card>
            <Grid container direction="row-reverse" justify="space-between" alignItems="stretch">
                <Grid item
                    xs={6}
                    style={{ minWidth: 250 }}
                >
                    <DataShow
                        name={'hospitalizationStatusDaily'}
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
                            // fields: ["Count Hard Status", "Count Medium Status", "Count Breath", 'Count Critical Status', 'Count Hospitalized'],
                            // colors: ['#ff0000', '#ffa500', '#0000ff', '#ff00ff', '#800080'],
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
                            <Grid container direction="row" justify="space-between" alignItems="center">
                                <WidgetItem name={'נפטרים מאז ה-7.7.21'} data={data.dead77} xs={3} color='black' />
                                <WidgetItem name={'סה״כ נפטרים'} data={data.dead} xs={3} color='black' />
                            </Grid>
                        }
                    />
                </Grid>
            </Grid>
        </>
    );
}
