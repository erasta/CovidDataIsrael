def create_index_html(file2desc):
    with open('index.html', 'w') as html:
        print('''
<html>
  <head>
        <meta charset="utf-8">
        <style>
            table {
                border-collapse: collapse;
                border: 2px black solid;
                font: 12px sans-serif;
            }

            td {
                border: 1px black solid;
                padding: 5px;
            }
        </style>
        <script src="https://d3js.org/d3.v3.min.js"></script>
  </head>
  <body>
''', file=html)
        for filename, desc in file2desc:
            print(f"    <p><a href=\"#\" onclick='showtable(\"{filename}\")'>{desc}</a> <a href='{filename}'>download</a></p>", file=html)
        print('''
        <div id="show" style="position: absolute;left: 400px;width: calc(100vw - 400px);height: 100vh;top: 0;z-index: -9999;"></div>
        <script type="text/javascript"charset="utf-8">
        function showtable(fileshow) {
            console.log(fileshow);
            d3.text(fileshow, function(data) {
                var parsedCSV = d3.csv.parseRows(data);

                var container = d3.select("#show")
                container.html('')

                container.append("table")

                    .selectAll("tr")
                        .data(parsedCSV).enter()
                        .append("tr")

                    .selectAll("td")
                        .data(function(d) { return d; }).enter()
                        .append("td")
                        .text(function(d) { return d; });
            });
        }
        showtable("out/csv/contagionDataPerCityPublic.csv");
        </script>
  </body>
</html>
''', file=html)

