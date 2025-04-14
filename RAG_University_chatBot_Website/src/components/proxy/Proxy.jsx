import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import App from "../../App.jsx";
import Loader from "../loader/Loader.jsx";

const Proxy = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [checker, setChecker] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setChecker(true);
        }, 4000);
        window.addEventListener("load", () => {
            setIsLoading(true);
        });
        return () => {
            clearTimeout(timer);
        };
    }, []);
    
    return <App />; 
    if (isLoading && checker) {
        return <App />; 
    } else {
        return  <Loader />;
    }
};

export default Proxy;

