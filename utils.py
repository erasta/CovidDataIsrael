from datetime import datetime


def group_sheet_data(sheets, datas):
    sheets = [name[0].lower() + name[1:] for name in sheets]
    uniqsheets = [x for i, x in enumerate(sheets) if i == sheets.index(x)]
    datazip = []
    for u in uniqsheets:
        if sheets.count(u) == 1:
            datazip.append((u, datas[sheets.index(u)]))
        else:
            for occur, index in enumerate([i for i, x in enumerate(sheets) if x == u]):
                datazip.append((u + str(occur + 1), datas[index]))
    return datazip


def computeWeekly(data):
    sum = 0
    ret = []
    for row in data:
        date = datetime.strptime(row['date'], '%Y-%m-%dT%H:%M:%S.%fZ')
        sum += row['amount']
        if date.weekday() == 5:  # saturday
            ret.append({'date': row['date'], 'amount': sum})
            sum = 0
    if ret[-1]['date'] != data[-1]['date']:
        ret.append({'date': data[-1]['date'], 'amount': sum})
    return ret
