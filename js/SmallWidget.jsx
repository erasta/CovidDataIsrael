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
            const table1 = await fetchCsv(`out/csv/patientsPerDate.csv`);
            const table2 = await fetchCsv(`out/csv/sickPerDateTwoDays.csv`);
            const table3 = await fetchCsv(`out/csv/infectedPerDate.csv`);
            const last = table1[table1.length - 1];
            console.log('patientsPerDate', last);
            const infectedNow = table2.map(row => row['amount']).reduce((a, b) => a + b);
            console.log('sickPerDateTwoDays', infectedNow)
            const sum = table3.map(row => row['amount']).reduce((a, b) => a + b);
            const yester = table3[table3.length - 2]['amount'];
            console.log('infectedPerDate', sum, yester)
            setData(Object.assign({}, data, {
                infectedTotal: sum,
                infectedYesterday: yester,
                infectedNow: infectedNow,
                medium: last['CountMediumStatus'],
                breathe: last['CountBreath'],
                hard: last['CountHardStatus'],
                dead: last['CountDeath'],
                hospital: last['Counthospitalized'],
            }));
        })();
    }, [])
    return (
        <>
            <p>נדבקים: {data.infectedTotal}</p>
            <p>פעילים: {data.infectedNow}</p>
            <p>אתמול: {data.infectedYesterday}</p>
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
            <p>מאושפזים: {data.hospital}</p>
            <p>קשה: {data.hard}</p>
            <p>בינוני: {data.medium}</p>
            <p>מונשמים: {data.breathe}</p>
            <p>נפטרים: {data.dead}</p>
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