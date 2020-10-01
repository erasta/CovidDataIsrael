const LastUpdate = ({ lang }) => {
    const [lastUpdate, setLastUpdate] = React.useState('...');
    React.useEffect(() => {
        (async () => {
            const last = await fetchCsv(`out/csv/lastUpdate.csv`);
            if (last && last.length && last[0].lastUpdate) {
                setLastUpdate(last[0].lastUpdate.toLocaleString('en-GB', { hour12: false }));
            }
        })();
    })
    return (
        <p style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'left',
        }}>
            {trans(lang, 'lastUpdate')}<br />
            {lastUpdate}
        </p>
    )
}