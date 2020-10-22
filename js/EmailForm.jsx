const { TextField, Grid, Button } = MaterialUI;

const EmailForm = () => {
    // const classes = useStyles();
    const [buttonState, setButtonState] = React.useState({ name: 'Send', disabled: false });

    const validate = (email) => {
        const expression = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/;
        return expression.test(String(email).toLowerCase())
    }

    const sendEmail = (e) => {
        e.preventDefault();
        if (!validate(e.target.elements.reply_to.value)) {
            setButtonState({ name: 'Please use a valid email', disabled: true });
            setTimeout(() => {
                setButtonState({ name: 'Send', disabled: false });
            }, 1000);
        } else {
            setButtonState({ name: 'Sending...', disabled: true });
            emailjs.sendForm('service_hzxzd3n', 'template_XhDp0sEa', e.target, 'user_KppIphZbVYHwkcmCox7zI')
                .then((result) => {
                    console.log(result.text);
                    setButtonState({ name: 'Sent!', disabled: true });
                }, (error) => {
                    console.log(error.text);
                    setButtonState({ name: 'Cannot send now.', disabled: true });
                });
        }
    }

    return (
        <div>
            <form onSubmit={sendEmail}>
                <Grid container direction="column" justify="center" alignItems="stretch" spacing={1}>
                    <Grid item>
                        <TextField name="from_name" label="Name" variant="outlined" />
                    </Grid>
                    <Grid item>
                        <TextField name="reply_to" label="your@email.com" variant="outlined" />
                    </Grid>
                    <Grid item>
                        <TextField name="message" label="Message" variant="outlined" multiline rows={4} fullWidth />
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="primary" type="submit" disabled={buttonState.disabled}>
                            {buttonState.name}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
}