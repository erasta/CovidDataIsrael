const { Grid, Chip } = MaterialUI;

const FieldChips = ({ fieldNames, mutedFields, setMutedFields }) => {
    return (
        <Grid container justify="center">
            {
                fieldNames.length <= 1 ? null : <Chip
                    icon={<Icon >highlight_off</Icon>}
                    key={'?muteall'}
                    size="small"
                    label={mutedFields.length < fieldNames.length ? 'mute all' : 'show all'}
                    clickable
                    onClick={() => { setMutedFields(mutedFields.length < fieldNames.length ? fieldNames : []) }}
                />
            }
            {
                fieldNames.map((field, i) => {
                    const color = mutedFields.includes(field) ? 'lightgrey' : colorByNumber(i, fieldNames.length + 1);
                    return (
                        <Chip
                            key={field}
                            size="small"
                            label={field}
                            clickable
                            style={{
                                margin: 1,
                                backgroundColor: color
                            }}
                            onClick={() => {
                                if (mutedFields.includes(field)) {
                                    setMutedFields(mutedFields.filter(f => f !== field));
                                } else {
                                    setMutedFields(mutedFields.concat([field]));
                                }
                            }}
                        />
                    )
                })
            }
        </Grid>
    )
}