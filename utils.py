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


