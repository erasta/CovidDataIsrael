import json
import os

from xlsxwriter import Workbook

from dashreq import get_dash_data, get_dash_req
from xlscolumn import worksheet_autowidth

dashrequest = get_dash_req()
sheets = list(map(lambda x: x["queryName"], dashrequest["requests"]))
sheets = [name + (str(sheets[:i].count(name)+1) if sheets.count(name) > 1 else '') for i, name in enumerate(sheets)]

dashjson = get_dash_data()

os.makedirs('out', exist_ok=True)
with Workbook('out/covid.xlsx') as workbook:
    datas = map(lambda x: x['data'], dashjson)
    for sheetname, data in zip(sheets, datas):

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
