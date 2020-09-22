import csv
import json
import os

for i, data in enumerate(map(lambda x: x['data'], json.load(open('./json/data.json')))):
    if not isinstance(data, list):
        data = [data]
    fields = list(data[0].keys())
    print(i, fields)

    os.makedirs('./out/csv', exist_ok=True)
    with open('./out/csv/covid' + str(i) + '.csv', 'w') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fields)
        writer.writeheader()
        for row in data:
            writer.writerow(row)
