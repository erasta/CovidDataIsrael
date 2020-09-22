import json
import os

from xlsxwriter import Workbook

os.makedirs('out', exist_ok=True)
names = []
with Workbook('out/covid.xlsx') as workbook:
    for i, data in enumerate(map(lambda x: x['data'], json.load(open('./json/data.json')))):
        if not isinstance(data, list):
            data = [data]
        data = list(data)
        fields = list(data[0].keys())
        print(i, fields)

        shname = '_'.join(list(filter(lambda x:x != 'date', fields))[0:4])
        if shname == 'name_amount':
            shname = '_'.join(map(lambda x: x['name'], data))
        shname = shname[:29]
        if shname in names:
            shname = shname + str(len(list(map(lambda n: shname in n, names))))
        names.append(shname)

        worksheet = workbook.add_worksheet(shname)
        worksheet.write_row(row=0, col=0, data=fields)
        for index, item in enumerate(data):
            row = map(lambda field_id: item.get(field_id, ''), fields)
            worksheet.write_row(row=index + 1, col=0, data=row)
