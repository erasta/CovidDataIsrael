const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress,
    List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, Avatar,
    Collapse
} = MaterialUI;

const ShowByName = ({ name, names, lang }) => {
    if (name.toLowerCase() === 'showcharts') return <DataShowCharts names={names} lang={lang} />
    if (name.toLowerCase() === 'about') return <ShowAbout lang={lang} />
    if (name.toLowerCase() === 'map') return <DataMap />
    if (name.toLowerCase() === 'infectedvsdead') return <DataShowComputedDeath showtable={true} lang={lang} />
    return <DataShow name={name} lang={lang} />
}

const CsvButtons1 = ({ names, lang, language, setLanguage }) => (
    <Grid container direction='column'>
        <Button
            key={'lang'}
            style={{ margin: 3 }}
            variant="contained"
            color="primary"
            onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
        >
            <Grid container direction='row' justify="center" spacing={1}>
                <Grid item>
                    <img width={24} height={24} src={`images/${language === 'he' ? 'il' : 'gb'}.svg`}></img>
                </Grid>
                <Grid item>
                    Change language
                </Grid>
            </Grid>
        </Button>
        {
            ['ShowCharts', 'infectedVsDead'].concat(names).map(name => (
                <Button
                    key={name}
                    component={Link}
                    to={`?sheet=${name}`}
                    style={{ margin: 3 }}
                    variant="contained"
                    color="primary"
                >
                    {trans(lang, name)}
                </Button>
            ))
        }
    </Grid>
)

const sheetnames = [
    "About",
    "ShowCharts",
    "contagionDataPerCityPublic",
    "map",
    {
        "PerDate": [
            "infectedVsDead",
            "infectedPerDate",
            "patientsPerDate",
            "deadPatientsPerDate",
            "recoveredPerDay",
            "testResultsPerDate",
            "doublingRate",
        ]
    },
    {
        "Hospitals": [
            "isolatedDoctorsAndNurses",
            "hospitalStatus",
            "otherHospitalizedStaff",
            "sickPatientPerLocation",
        ]
    },
    {
        "AgeAndGender": [
            "infectedByAgeAndGenderPublic",
            "breatheByAgeAndGenderPublic",
            "severeByAgeAndGenderPublic",
            "deadByAgeAndGenderPublic",
        ]
    },
    {
        "OtherMOH": [
            "moh_corona_isolation_per_day",
            "moh_tested individuals",
            "moh_corona_hospitalization",
            "moh_corona_age_and_gender",
            "moh_corona_medical_staff",
            "moh_corona_deceased",
            "moh_young_population_weekly"
        ]
    },
    {
        "OtherData": [
            "lastUpdate",
            "updatedPatientsOverallStatus",
            "sickPerDateTwoDays",
            "CalculatedVerified",
        ]
    },
];

const CollapsableListItem = ({ name, children }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <>
            <ListItem
                button
                onClick={() => setOpen(!open)}
                key={name + 'colitem'}
            >
                {open ? <Icon>expand_less</Icon> : <Icon>expand_more</Icon>}
                <ListItemText
                    style={{ textAlign: "right" }}
                    primary={name}
                />
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit
                key={name + 'collist'}
            >
                {children}
            </Collapse>
        </>
    )
}

const useStyles = makeStyles((theme) => ({
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
    }
}));

const CsvButtons = ({ names, lang, language, setLanguage }) => {
    const classes = useStyles();

    return (
        <List component="nav" aria-label="secondary">
            <ListItem button
                key={'lang'}
                style={{ textAlign: "right" }}
                onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
            >
                <ListItemAvatar>
                    <Avatar className={classes.small}>
                        <img width={'100%'} height={'100%'} style={{ objectFit: 'cover' }}
                            src={`images/${language === 'he' ? 'il' : 'gb'}.svg`}
                        ></img>
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Language" />
            </ListItem>
            {
                sheetnames.map(name => {
                    if (typeof (name) === 'string') {
                        return (
                            <ListItem button
                                key={name}
                                component={Link}
                                to={`?sheet=${name}`}
                            >
                                <ListItemText
                                    style={{ textAlign: "right" }}
                                    primary={trans(lang, name)}
                                />
                            </ListItem>
                        )
                    } else {
                        const key = Object.keys(name)[0];
                        return (
                            <CollapsableListItem key={key} name={trans(lang, key)}>
                                {name[key].map(under => (
                                    <ListItem button
                                        key={under}
                                        component={Link}
                                        to={`?sheet=${under}`}
                                    >
                                        <ListItemText
                                            style={{ textAlign: "right", paddingRight: 10 }}
                                            primary={trans(lang, under)}
                                        />
                                    </ListItem>
                                ))}
                            </CollapsableListItem>
                        )
                    }
                })
            }
        </List>
    )
}


const MainView = ({ names, name, lang, language, setLanguage, showSideBar }) => (
    <Grid container direction="row">
        <Grid item xs={showSideBar ? 10 : 12}>
            <ShowByName name={name} names={names} lang={lang} />
        </Grid>
        {
            !showSideBar ? null :
                <Grid item xs={2}>
                    <CsvButtons names={names} lang={lang} language={language} setLanguage={setLanguage} />
                </Grid>
        }
    </Grid>
)