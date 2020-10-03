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
            const [table1, table2] = await Promise.all([
                await fetchCsv(`out/csv/patientsPerDate.csv`),
                await fetchCsv(`out/csv/infectedPerDate.csv`)
            ]);
            const last = table1[table1.length - 1];
            console.log('patientsPerDate', last);
            const sum = table2.map(row => row['amount']).reduce((a, b) => a + b);
            const yester = table2[table2.length - 2]['amount'];
            console.log('infectedPerDate', sum, yester)
            setData(Object.assign({}, data, {
                infectedTotal: sum,
                infectedYesterday: yester,
                infectedNow: last['Counthospitalized'] + last['patients_home'] + last['patients_hotel'],
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