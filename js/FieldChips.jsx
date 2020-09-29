const { Grid, Chip } = MaterialUI;

const FieldChips = ({ fieldNames, colors, mutedFields, setMutedFields }) => {
    return (
        <Grid container justify="center">
            {
                fieldNames.map((field, i) =>
                    <Chip
                        key={field}
                        size="small"
                        label={field}
                        clickable
                        style={{
                            margin: 1,
                            backgroundColor: mutedFields.includes(fieldname) ? 'lightgrey' : colors[i]
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
            }
        </Grid>
    )
}