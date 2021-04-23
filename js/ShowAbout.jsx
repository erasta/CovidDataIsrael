const useStyles = makeStyles({
    root: {
        padding: '30px 15%',
        '& p': {
            fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'large',
        },
    },
});

const CopyCode = () => {
    const code = `<iframe style="border: 0;" src="https://erasta.github.io/CovidDataIsrael/widget.html" width="475" height="800" frameborder="0"></iframe>`;
    return (
        <>
            <IconButton size='small'
                onClick={() => navigator.clipboard.writeText(code)}
            >
                <Icon>attach_file</Icon>
            </IconButton>
            <TextField size='small' disabled
                value={code}
            ></TextField>
        </>
    )
}

const ShowAbout = ({ lang }) => {
    const classes = useStyles();
    return (
        <>
            <div className={classes.root} dir='rtl'>
                <Typography variant="h4" component="h5" style={{ marginBlockEnd: 0 }}>
                    על האתר
                </Typography>
                <p>
                    נתוני הקורונה שאנחנו מקבלים מהעיתונות, טלויזיה ומשרד הבריאות תמיד חסרים או מעובדים היטב כדי שאנחנו ״נבין״.
                </p>
                <p>
                    לקחתי את הנתונים הגולמיים של הדשבורד של משרד הבריאות, ודחפתי אותם לטבלאות שאפשר להוריד או להסתכל.
                    הכנסתי גרפים לכל הטבלאות שיש להם תאריכים ונתונים מספריים ויש דשבורד שבו אפשר לראות את כל הגרפים ביחד.
                    הנתונים הגולמיים נשלפים כל רבע שעה דרך הממשק הרשמי של משרד הבריאות.
                </p>
                <p>
                    בניתי על בסיס הפרויקט
                    רכיב תמונת מצב (ווידג׳ט) שהוטמע בכל דפי הקורונה של עמותת&nbsp;
                    <MaterialUI.Link href="http://midaat.org.il/articles/diseases/covid19/"
                        style={{ textDecoration: 'none' }} target="_blank" rel="noopener">
                        מדעת
                    </MaterialUI.Link>
                    .
                </p>
                <Typography variant="h4" component="h5" style={{ marginBlockEnd: 0 }}>
                    קצת טכני
                </Typography>
                <p>
                    נכתב כקוד פתוח על
                    github.
                    <br />
                    שליפת הנתונים הגולמיים מתבצעת כל רבע שעה באמצעות
                    github actions
                    עם קוד python.<br />
                    הנתונים נקראים כ
                    json
                    מהממשק
                    ונאגרים כטבלאות
                    csv
                    על ה
                    repo.
                    <br />
                    הצגת הנתונים עם
                    react
                    כדפים סטטיים
                    עם
                    chartjs, leaflet ו material-ui.
                </p>
                <p style={{ marginBlockEnd: 0 }}>
                    קוד הטמעה לרכיב המופיע באתר מדעת:
                </p>
                <CopyCode />
                <p>
                    אשמח לכל הצעה, שיפור כ
                    pull request
                     או כוכבית. <br />
                    <MaterialUI.Link href="https://github.com/erasta/CovidDataIsrael"
                        style={{ textDecoration: 'none' }} target="_blank" rel="noopener">
                        https://github.com/erasta/CovidDataIsrael
                    </MaterialUI.Link>
                </p>
                <Typography variant="h4" component="h5" style={{ marginBlockEnd: 0 }}>
                    תודות
                </Typography>
                <p>
                    ליעל פורמן על הייעוץ הרב בנושאי קורונה.<br />
                    לדן כרמון שאגר נתונים אצלו עוד מיוני.<br />
                    לכל העוזרים.ות והמתקנות.ים:<br />
                    בר פינקוס, אדוה לוטן, תומר נועם, ארנוו פניני, רות אברהם, לנה קוזקוביץ׳, קקטוס שוורץ,
                     מיכאל פרנקל, אלעד הלר, מתן בניטה, גלעד באומן, דורון ויידה
                    ולכל מי ששכחתי.
                </p>
                <Typography variant="h4" component="h5" style={{ marginBlockEnd: 0 }}>
                    המידע
                </Typography>
                <p>
                    המידע מבוסס על נתוני משרד הבריאות הפתוחים לציבור.
                    נתונים אלה עוברים תיקונים כל העת, ולכן בהשוואה ההיסטורית ניתן לראות הבדלים במידע בין ימים שכבר חלפו.
                    המידע העדכני ביותר הוא תמיד החדש ביותר.
                </p>
                <p>
                    המידע ההיסטורי בטבלת הערים מבוסס על איסוף נתוני משרד הבריאות כפי שהיו בעת פרסומם.
                    יתכן שהמידע תוקן מאז, ותיקונים אלה לא מופיעים כאן.
                </p>
                <p>
                    חישוב נוסחת רמזור מבוצע לפי פרסומים בעיתונות, אפשר להגיע לאחד מהם&nbsp;
                    <MaterialUI.Link
                        style={{ textDecoration: 'none' }} target="_blank" rel="noopener"
                        href="https://www.themarker.com/embeds/pdf_upload/2020/20200830-160844.pdf"
                    >
                        בעמוד 8 במסמך מדה-מרקר.
                    </MaterialUI.Link>
                    &nbsp;מכיוון שקיימת אי בהירות לגבי החישוב, מוצגים שני חישובים אפשריים, אשר אף אחד מהם אינו וודאי:
                    <li>
                        חישוב לפי מספר מנורמל של מאומתים
                        (N)
                        ובדיקות
                        (P)
                    </li>
                    <li>
                        חישוב לפי מספר מנורמל של חולים פעילים
                        (N)
                        ומאומתים
                        (P)
                    </li>
                </p>
                <Typography variant="h4" component="h5" style={{ marginBlockEnd: 0 }}>
                    צרו קשר
                </Typography>
                <div dir='ltr'>
                    <EmailForm />
                </div>
            </div>
        </>
    )
}