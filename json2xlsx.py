import json
import os

from xlsxwriter import Workbook

os.makedirs('out', exist_ok=True)
with Workbook('out/w.xlsx') as workbook:
    for i, data in enumerate(map(lambda x: x['data'], json.load(open('./json/data.json')))):
        if not isinstance(data, list):
            data = [data]
        fields = list(data[0].keys())
        print(i, fields)

        worksheet = workbook.add_worksheet()
        worksheet.write_row(row=0, col=0, data=fields)
        for index, item in enumerate(data):
            row = map(lambda field_id: item.get(field_id, ''), fields)
            worksheet.write_row(row=index + 1, col=0, data=row)
