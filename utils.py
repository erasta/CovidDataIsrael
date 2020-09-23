from datetime import datetime
import os
import csv


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


def getFieldByDate(rows, date, fieldname):
    fit = [row for row in rows if row['date'] == date]
    return fit[0][fieldname] if len(fit) > 0 else None


def getRowByDate(rows, date):
    fit = [row for row in rows if row['date'] == date]
    return fit[0] if len(fit) > 0 else None


def coupleDatasByDates(one, two):
    dates = [row['date'] for row in one] + [row['date'] for row in two]
    dates = sorted(list(set(dates)))
    return [(d, getRowByDate(one, d), getRowByDate(two, d)) for d in dates]


def computeDelta(data, csvname):
    if not os.path.isfile(csvname):
        return data
    data = [x.copy() for x in data]
    old = list(csv.DictReader(open(csvname)))
    couple = coupleDatasByDates(data, old)
    coupleAmounts = [(date,
                      newrow['amount'] if newrow is not None else None,
                      int(oldrow['amount']) if oldrow is not None else None)
                     for date, newrow, oldrow in couple]
    changes = [oldamount != newamount for date, newamount, oldamount in coupleAmounts[:-1]]
    changesExist = any(changes)
    newdate = old[-1]['date'] if changesExist else None

    ret = []
    for (date, newrow, oldrow), (_, newamount, oldamount) in zip(couple, coupleAmounts):
        row = {'date': date, 'amount': newamount}
        if changesExist:
            row[newdate] = oldamount
        for col in list(old[0].keys())[2:]:
            row[col] = oldrow[col]
        ret.append(row)

    return ret


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
