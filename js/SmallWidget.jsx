const SmallWidget = ({ lang }) => {
    const infectedTotal = 0;
    const infectedNow = 0;
    const infectedYesterday = 0;
    const hospital = 0;
    const hard = 0;
    const medium = 0;
    const breathe = 0;
    const dead = 0;
    return (
        <>
            <p>נדבקים: {infectedTotal}</p>
            <p>פעילים: {infectedNow}</p>
            <p>אתמול: {infectedYesterday}</p>
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
            <p>מאושפזים: {hospital}</p>
            <p>קשה: {hard}</p>
            <p>בינוני: {medium}</p>
            <p>מונשמים: {breathe}</p>
            <p>נפטרים: {dead}</p>
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