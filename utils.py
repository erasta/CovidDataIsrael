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
    data = [(datetime.strptime(row['date'], '%Y-%m-%dT%H:%M:%S.%fZ'), row) for row in data]
    data = [(date, (date.weekday() + 1) % 7, row) for date, row in data]
    weeks = [[]]
    for date, weekday, row in data:
        if weekday == 0 or len(weeks) == 0:
            weeks.append([])
        weeks[-1].append((date, weekday, row))
    ret = []
    for weekdata in weeks:
        dates = [date for date, weekday, row in weekdata]
        amount = sum([row['amount'] for date, weekday, row in weekdata])
        ret.append({'date': max(dates).isoformat() + 'Z', 'from': min(dates).isoformat() + 'Z', 'amount': amount})
    return ret
