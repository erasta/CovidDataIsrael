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
    sheets_names = []
    for sheetname, data in zip(sheets, datas):

        if sheetname in sheets_names:
            sheetname = sheetname + str(len(list(map(lambda n: sheetname in n, sheets_names))))
        sheets_names.append(sheetname)

        if not isinstance(data, list):
            data = [data]
        data = list(data)
        fields = list(data[0].keys())
        print(sheetname, fields)

        worksheet = workbook.add_worksheet(sheetname)
        worksheet.write_row(row=0, col=0, data=fields)
        for index, item in enumerate(data):
            row = map(lambda field_id: item.get(field_id, ''), fields)
            worksheet.write_row(row=index + 1, col=0, data=row)

        worksheet_autowidth(worksheet, len(fields))
