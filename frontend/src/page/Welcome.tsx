import React, {type ReactElement, useContext, useState} from "react";
import {PageState, PageStateContext} from "../App";
import {Button, IconButton, InputAdornment, OutlinedInput, Paper} from "@mui/material";
import { Search } from "@mui/icons-material";

const Welcome = (): ReactElement => {
    const {setState} = useContext(PageStateContext);
    const [searchTerm, setSearchTerm] = useState("");

    const handleInputChange = (event: any):void => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = ():void => {
        // Hier kannst du die Logik für die Suchfunktion implementieren
        // Verwende die Variable searchTerm für die Suchabfrage
        console.log("Search term:", searchTerm);
        // Führe hier den entsprechenden Code aus, um die Suche durchzuführen
    };

    return (
        <>
            <div className="headerLandingPage">
                <img id="logo" src="logoTravelInsights.png"/>
            </div>
            <div className="blurFilter">
                    <Paper sx={{
                        position: 'absolute', left: '50%', top: '30%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                    <OutlinedInput value={searchTerm} onChange={handleInputChange}
                           placeholder="Wohin geht es als nächstes?" endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={handleSearch}>
                                    <Search />
                                </IconButton>
                            </InputAdornment>}/>
                    </Paper>
            </div>

            <div className="worldBackground"></div>

            <footer className="footerLandingPage">
                <Button variant={"contained"} onClick={() => {setState(PageState.MAP)}}>to Map</Button>
            </footer>
        </>
    );
};

export default Welcome;
