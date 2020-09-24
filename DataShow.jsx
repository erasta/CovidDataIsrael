const DataShow = ({ fileshow }) => {
    const [work, setWork] = React.useState(true);
    const ref = React.useRef()
    React.useEffect(() => {
        (async () => {
            setWork(true);
            const container = d3.select(ref.current)
            container.html('')
            console.log(fileshow);
            const data = await (await fetch(fileshow)).text();
            const parsedCSV = d3.csv.parse(data);
            if (parsedCSV.length) {
                const columns = Object.keys(parsedCSV[0]);
                // The table generation function
                var table = container.append("table"),
                    thead = table.append("thead"),
                    tbody = table.append("tbody");

                // append the header row
                thead.append("tr")
                    .selectAll("th")
                    .data(columns)
                    .enter()
                    .append("th")
                    .text(function (column) { return column; });

                // create a row for each object in the data
                var rows = tbody.selectAll("tr")
                    .data(parsedCSV)
                    .enter()
                    .append("tr");

                // create a cell in each row for each column
                rows.selectAll("td")
                    .data(function (row) {
                        return columns.map(function (column) {
                            return { column: column, value: row[column] };
                        });
                    })
                    .enter()
                    .append("td")
                    .attr("style", "font-family: Courier") // sets the font style
                    .html(function (d) { return d.value; });
            }
            setWork(false);
        })();
    }, [])
    return (
        <>
            {work ? <img src='android-spinner.gif' width='150'></img> : null}
            <div
                ref={ref}
            />
        </>
    )
}
