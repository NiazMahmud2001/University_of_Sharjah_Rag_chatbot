import React, { useEffect, useState } from 'react';
import "./Loader.css";
import "../../App.css"
import ModelLogo_with_text from "../../assets/modelLogo_with_text.png"
import uosSvg from '../../assets/uosSvg.svg';
import uosSvgForWhiteTheme from '../../assets/uosSvgForWhiteTheme.svg';


const Loader = () => {
    //fetch if the background color is saved or not
    const themColorChanger = (themeColor)=>{
        const root = document.documentElement;
        if (themeColor === 'light'){
          root.style.setProperty('--allBackgroundColor', '#ffffff');
          root.style.setProperty('--allBackgroundColorOpposite', '#212121');
          root.style.setProperty('--allTextColor', '#000000');
          root.style.setProperty('--sidebarContColor', '#F9F9F9');
          root.style.setProperty('--icon-fill-sun', '#6b4d11');
          root.style.setProperty('--icon-fill-hover-sun', '#4b3b04');
          root.style.setProperty('--textInputBGColor', '#ffffff');
        }else{
          root.style.setProperty('--allBackgroundColor', '#212121');
          root.style.setProperty('--allBackgroundColorOpposite', '#ffffff');
          root.style.setProperty('--allTextColor', '#e0e0e0');
          root.style.setProperty('--sidebarContColor', '#171717');
          root.style.setProperty('--icon-fill-sun', '#FFC857');
          root.style.setProperty('--icon-fill-hover-sun', '#FFE484');
          root.style.setProperty('--textInputBGColor', '#303030');
        }
    }

    const storageKey = 'theme-preference'
    const getColorPreference = () => {
        if (localStorage.getItem(storageKey)) 
            return localStorage.getItem(storageKey)
        else 
            return window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark': 'light'
    }
    const theme = {
        value: getColorPreference(),
    }

    window.onload = () => {
        themColorChanger(theme.value)
    }

    return (
        <div className="mainLoader">
            <div className="photosPart">

                {(()=>{
                    if (theme.value === 'dark'){
                        
                        return (
                            <img src={uosSvg} className='uosSvgImg'  width={100} height={100} />
                        );
                    }else{
                        return (
                            <img src={uosSvgForWhiteTheme} className='uosSvgImg' width={100} height={100}/>                        );
                    }
                })()}
                <img src={ModelLogo_with_text} className='photosPartInner'/>
            </div>
            <section className="container">
                <div className="square"></div>
                <div className="infinite-scroll"></div>
            </section>
        </div>
    );

};

export default Loader;