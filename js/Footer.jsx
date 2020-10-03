const Footer = () => (
    <p style={{
        fontFamily: 'Source Sans Pro, sans-serif',
        textAlign: 'center',
    }}>
        Updated hourly from the&nbsp;
        <MaterialUI.Link href='https://www.health.gov.il/English/Pages/HomePage.aspx' style={{ textDecoration: 'none' }} target="_blank" rel="noopener">
            public API of Ministry of Health of Israel
                </MaterialUI.Link>
        <br />
                Created by&nbsp;
        <MaterialUI.Link href="https://eran.dev/" style={{ textDecoration: 'none' }} target="_blank" >
            © Eran Geva
                </MaterialUI.Link>
                &nbsp;as&nbsp;
        <MaterialUI.Link href='https://github.com/erasta/CovidDataIsrael' style={{ textDecoration: 'none' }} target="_blank" rel="noopener">
            open-source code
                </MaterialUI.Link>
    </p>
)