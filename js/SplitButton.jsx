const { Popper, Grow, ClickAwayListener, MenuList, MenuItem } = MaterialUI;

const SplitButton = ({ options, onClick}) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleClick = () => {
        onClick(0);
        // console.info(`You clicked ${options[0]}`);
    };

    const handleMenuItemClick = (event, index) => {
        onClick(index);
        // console.info(`You clicked ${options[index]}`);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    return (
        <Grid container direction="column">
            <Grid item xs={12}>
                <ButtonGroup variant="contained" color="primary" ref={anchorRef} aria-label="split button">
                    <Button onClick={handleClick}>{options[0]}</Button>
                    <Button
                        color="primary"
                        size="small"
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label="select merge strategy"
                        aria-haspopup="menu"
                        onClick={handleToggle}
                    >
                        <Icon >arrow_drop_down</Icon>
                    </Button>
                </ButtonGroup>
                <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{ zIndex: 9999 }}>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu">
                                        {options.map((option, index) => (
                                            <MenuItem
                                                key={option}
                                                onClick={(event) => handleMenuItemClick(event, index)}
                                            >
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </Grid>
        </Grid>
    );
}
