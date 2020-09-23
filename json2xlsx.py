import json
import os

from xlsxwriter import Workbook

from dashreq import get_dash_data
from xlscolumn import worksheet_autowidth

dashjson, dashrequest = get_dash_data()

os.makedirs('out', exist_ok=True)
with Workbook('out/covid.xlsx') as workbook:
    datas = map(lambda x: x['data'], dashjson)
    sheets = map(lambda x: x["queryName"], dashrequest["requests"])
    shnames = []
    for shname, data in zip(sheets, datas):

        if shname in shnames:
            shname = shname + str(len(list(map(lambda n: shname in n, shnames))))
        shnames.append(shname)

        if not isinstance(data, list):
            data = [data]
        data = list(data)
        fields = list(data[0].keys())
        print(shname, fields)

        worksheet = workbook.add_worksheet(shname)
        worksheet.write_row(row=0, col=0, data=fields)
        for index, item in enumerate(data):
            row = map(lambda field_id: item.get(field_id, ''), fields)
            worksheet.write_row(row=index + 1, col=0, data=row)

        worksheet_autowidth(worksheet, len(fields))
