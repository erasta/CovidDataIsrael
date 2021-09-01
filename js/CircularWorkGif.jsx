const CircularWorkGif = ({ work }) => (
    <>
        {
            work ?
                <img src='images/android-spinner.gif' width='150' alt="Data is loading"></img> :
                null
        }
    </>
)