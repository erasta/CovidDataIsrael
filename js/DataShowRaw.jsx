const DataShowRaw = ({ fileshow }) => {
    const [work, setWork] = React.useState(true);
    const ref = React.useRef()
    React.useEffect(() => {
        (async () => {
            setWork(true);
            const container = d3.select(ref.current)
            container.html('')
            console.log(fileshow);
            const data = await (await fetch(fileshow)).text();
            const parsedCSV = d3.csv.parseRows(data);
            container.append("table")
                .selectAll("tr")
                .data(parsedCSV).enter()
                .append("tr")
                .selectAll("td")
                .data(function (d) { return d; }).enter()
                .append("td")
                .text(function (d) { return d; });
            setWork(false);
        })();
    }, [fileshow])
    return (
        <>
            <CircularWorkGif work={work} />
            <div
                ref={ref}
            />
        </>
    )
}

