import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import infoContainerOnOff from './assets/infoContainerOnOff.svg';
import infoContainerOnOffWhiteTheme from './assets/infoContainerOnOffWhiteTheme.svg';

import newChatOnfoContainer  from './assets/newChatOnfoContainer.svg';
import newChatOnfoContainerWhiteTheme  from './assets/newChatOnfoContainerWhiteTheme.svg';

import uosSvg from './assets/uosSvg.svg';
import uosSvgForWhiteTheme from './assets/uosSvgForWhiteTheme.svg';

import smallScreensidebarSvg from './assets/smallScreensidebarSvg.svg';
import smallScreensidebarSvgWhiteTheme from './assets/smallScreensidebarSvgWhiteTheme.svg';

import fileUpload from "./assets/fileUpload.svg"
import fileUploadForWhiteTheme from "./assets/fileUploadForWhiteTheme.svg"

import querySubmit from "./assets/querySubmit.svg"

import modelLogo from "./assets/modelLogo.png"

import './App.css';


const App = () => {

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 830);
    const [numClicked , setNumClicked] = useState(0);
    const [themeState, setThemeState] = useState(null);

    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [removeContOnClick, setRemoveContOnClick] = useState(0)



    useEffect(() => {
      
      const handleResize = () => {
          setIsSmallScreen(window.innerWidth < 830);
          if (window.innerWidth < 830){
            document.querySelector('.rightSideTopUserInfoTextRight').style.width = "auto";
            document.querySelector('.rightSideTopUserInfo').style.justifyContent = "space-between";
          }else{
            document.querySelector('.rightSideTopUserInfoTextRight').style.width = "200px";
          } 
          if (window.innerWidth<window.innerHeight){
            document.querySelector(".app-container").style.height = "98vh"
          }
      };

      window.addEventListener("resize", handleResize);

      if (window.innerWidth < 830){
        document.querySelector('.rightSideTopUserInfoTextRight').style.width = "auto";
        document.querySelector('.rightSideTopUserInfo').style.justifyContent = "space-between";
      }else{
        document.querySelector('.rightSideTopUserInfoTextRight').style.width = "200px";
      }

      const initializeTheme = () => {
        const storedTheme = getColorPreference();
        theme.value = storedTheme;
        themColorChanger(storedTheme);
        setThemeState(storedTheme);
        reflectPreference();
      };
      initializeTheme();
      const toggleButton = document.querySelector('#theme-toggle');
      if (toggleButton) {
        toggleButton.addEventListener('click', onClick);
      }

      if (window.innerWidth<window.innerHeight){
        document.querySelector(".app-container").style.height = "98vh"
      }

      return () => {
        if (toggleButton) {
          toggleButton.removeEventListener('click', onClick);
        }
      };
    }, []);



    const topSVGShowbtn1OnClick = () => {
      if (numClicked%2 == 0){
        document.querySelector(".sideInfoContainer").style.width = "320px"
        document.querySelector(".sideInfoContainer").style.transition = "width 0.15s 0s ease-in-out"
        document.querySelector(".sideInfoContainer").style.paddingLeft = "15px"
        document.querySelector(".sideInfoContainer").style.paddingTop = "15px"
        document.querySelector(".topSVGShow").style.paddingRight = "20px"
      }else{
        document.querySelector(".sideInfoContainer").style.width = "0px"
        document.querySelector(".sideInfoContainer").style.paddingLeft = "0px"
        document.querySelector(".sideInfoContainer").style.paddingTop = "0px"
        document.querySelector(".topSVGShow").style.paddingRight = "0px"
      }
      setNumClicked(numClicked + 1)
      console.log(numClicked)
    }
    
    const topSVGShowbtn2OnClick = () => {
      console.log("Later on I will add chatgpt like animation on topSVGShowbtn1OnClick")  
      try{
        window.location.reload();
      }catch(e){
        console.log("no chat component has created!!!")
      }
    }




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
        document.querySelector(".textQueryInputBox").style.color="black"
        document.documentElement.style.fontWeight = '600';

      }else{
        root.style.setProperty('--allBackgroundColor', '#212121');
        root.style.setProperty('--allBackgroundColorOpposite', '#ffffff');
        root.style.setProperty('--allTextColor', '#e0e0e0');
        root.style.setProperty('--sidebarContColor', '#171717');
        root.style.setProperty('--icon-fill-sun', '#FFC857');
        root.style.setProperty('--icon-fill-hover-sun', '#FFE484');
        root.style.setProperty('--textInputBGColor', '#303030');
        document.querySelector(".textQueryInputBox").style.color="white"
        document.documentElement.style.fontWeight = '500';
      }
    }


    
    //store the user current desire theme and if it is stored then fetch it
    const storageKey = 'theme-preference'
    const onClick = () => {
      // flip current value
      theme.value = theme.value === 'light'? 'dark': 'light'
      console.log(theme.value)
      
      themColorChanger(theme.value)
      setThemeState(theme.value)
      setPreference()
    }
    const getColorPreference = () => {
      if (localStorage.getItem(storageKey))
        return localStorage.getItem(storageKey)
      else
        return window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark': 'light'
    }
  
    const setPreference = () => {
      localStorage.setItem(storageKey, theme.value)
      reflectPreference()
    }
    const reflectPreference = () => {
      document.firstElementChild.setAttribute('data-theme', theme.value)
      document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value)
    }
    const theme = {
      value: getColorPreference(),
    }
    
    reflectPreference()
    window.onload = () => {
      reflectPreference()
      console.log(theme.value)

      themColorChanger(theme.value)
      setThemeState(theme.value)
      document.querySelector('#theme-toggle').addEventListener('click', onClick)
    }
    // sync with system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({matches:isDark}) => {
        theme.value = isDark ? 'dark' : 'light'
        setPreference()
    })


    //show chat part (user query or RAG response) 
    //this it is "user query" it is labeles "isBot: false"
    //this it is "RAG response" it is labeles "isBot: True"
    //based on this we will apply different class to set the text on right or left
    const ChatMessage = ({ message, isBot }) => {
      if (isBot==true){
        return (
          <div className={`message bot_message`}>
              <img src={modelLogo} height={25} width={13}/>
              <div dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        )
      }else{
        return(
          <div className={`message user_message`}>
              <div dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        )
      }
    }
      


    //create connection with backend && cerate userQuery(right side text) and response box(left side box)
    const submitOnQuryBtnClicked = async ()=>{ 
      if (!inputText.trim()) return;

      try{
        setIsLoading(true);
        setMessages(prev => [...prev, { text: inputText, isBot: false }]);

        //const link = "http://10.255.131.123:8709/askQuestion/";
        const link = "http://192.168.70.33:8709/askQuestion/";
        //const link = "http://172.29.36.134:8709/askQuestion/";
        //const link = "http://172.30.240.1:8709/askQuestion/"
        //const link = "http://172.29.11.5:8709/askQuestion/"
        //const link = "http://172.29.11.5:8709/askQuestion/"
        // use npm run dev -- --host
        console.log(inputText)
        const response = await axios.post(link, { 
          query: inputText,
          isChat: true 
        });
        setMessages(prev => [...prev, { text: response.data.answer, isBot: true }]);
      }catch(error){
        console.error('Query error:', error);
        setMessages(prev => [...prev, { text: "Facing Issues Connecting with LLAMA-3.3 70B model", isBot: true }]);
      }finally{
        setIsLoading(false);
        setInputText('');
      }
    }



    return (
      <div className="app-container">

        <div className="sideInfoContainer">
          {(()=>{
              if (themeState == 'dark'){
                  return(
                    <div className="topSVGShow">
                          <img src={newChatOnfoContainer} onClick={()=>{topSVGShowbtn1OnClick()}} className="topSVGShowbtn1" width={30} height={30}/>
                          <img src={infoContainerOnOff} onClick={()=>{topSVGShowbtn2OnClick()}} className="topSVGShowbtn2" width={30} height={30}/>
                    </div>
                  )
              }else{
                  return(
                    <div className="topSVGShow">
                          <img src={newChatOnfoContainerWhiteTheme} onClick={()=>{topSVGShowbtn1OnClick()}} className="topSVGShowbtn1" width={30} height={30}/>
                          <img src={infoContainerOnOffWhiteTheme} onClick={()=>{topSVGShowbtn2OnClick()}} className="topSVGShowbtn2" width={30} height={30}/>
                    </div>
                  )
              }
            }
          )()}
          <div className="bottomTextShow">
            <div className="bottomTextShowText">
              [ Please login to access your chat history ]
            </div>
          </div>
        </div>

        <div className="rightSideChatContainer"> 
          <div className="rightSideTopUserInfo">

            <div className="rightSideTopUserInfoTextRight">
              <div className="rightSideSVGShow">
                {( ()=>{

                      if (isSmallScreen && numClicked%2==0 && themeState == 'dark'){ 
                          return (
                            <img src={smallScreensidebarSvg} onClick={()=>{topSVGShowbtn1OnClick()}} className="rightSideSVGShowbtn3" width={30} height={30}/>
                          );
                      }else if(!isSmallScreen && numClicked%2==0 && themeState == 'dark'){
                        return (
                          <div >
                              <img src={newChatOnfoContainer} onClick={()=>{topSVGShowbtn1OnClick()}} className="topSVGShowbtn1" width={30} height={30}/>
                              <img src={infoContainerOnOff} onClick={()=>{topSVGShowbtn2OnClick()}} className="topSVGShowbtn2" width={30} height={30}/>
                          </div>
                        );
                      }else if(isSmallScreen && numClicked%2==0 && themeState == 'light'){
                        return (
                          <img src={smallScreensidebarSvgWhiteTheme} onClick={()=>{topSVGShowbtn1OnClick()}} className="rightSideSVGShowbtn3" width={30} height={30}/>
                        );
                      }else if (!isSmallScreen && numClicked%2==0 && themeState == 'light'){
                        return (
                          <div >
                              <img src={newChatOnfoContainerWhiteTheme} onClick={()=>{topSVGShowbtn1OnClick()}} className="topSVGShowbtn1" width={30} height={30}/>
                              <img src={infoContainerOnOffWhiteTheme} onClick={()=>{topSVGShowbtn2OnClick()}} className="topSVGShowbtn2" width={30} height={30}/>
                          </div>
                        );
                      }
                    }
                  )()}

              </div>
              {(()=>{
                if (!isSmallScreen){
                  return (
                      <div className="uosChatbottxt">Nextly ChatBot</div>
                    );
                }
              }
              )()}
            </div>
            <div className="menueBarRightPart">
                  <div className="uosSvg">
                    {(()=>{
                      if (themeState === 'dark'){
                        return (
                          <img src={uosSvg} className='uosSvgImg' />
                        );
                      }else{
                        return (
                          <img src={uosSvgForWhiteTheme} className='uosSvgImg' />
                        );
                      }
                    })()}
                  </div>

                  <div className="rightSideTopUserInfoText">
                    <div className="userloginBtn">
                      Login
                    </div>
                    <div className="themeToggleBtn">
                        <button className="theme-toggle" id="theme-toggle" title="Toggles light & dark" aria-label="auto" aria-live="polite">
                            <svg className="sun-and-moon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
                              <mask className="moon" id="moon-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                <circle cx="24" cy="10" r="6" fill="black" />
                              </mask>
                              <circle className="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
                              <g className="sun-beams" stroke="currentColor">
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                              </g>
                            </svg>
                        </button>
                    </div>

                  </div>
            </div>
          </div>

          <div className="rightSideBottomChattingSpace">
            <div className="rightBottomTopchatOutter">
                <div key={removeContOnClick} className="rightBottomTopchat">
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg.text} isBot={msg.isBot} />
                    ))}
                    {isLoading && (
                        <div className="typing_indicator">
                          {[...Array(3)].map((_, i) => (
                              <div key={i} className="typing_dot" style={{ animationDelay: `${i * 0.2}s` }} />
                          ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="rightBottomBottomInputSpace">
              <div className="textQueryInputBoxSec">
                  <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="textQueryInputBox"
                      placeholder="Please ask you question"
                      onKeyDown={(e)=>{
                        if (e.key == "Enter"){
                          submitOnQuryBtnClicked()
                        }
                      }}
                      disabled={isLoading}
                  />
              </div>
              <div className="pdfFileInputBoxSec">
                  {(()=>{
                    if (themeState == 'dark'){
                      return (
                        <div className="inneruploadedSide">
                            <img src={fileUploadForWhiteTheme} className='queryAndFileSubmitCls' />
                            <img 
                                src={querySubmit} 
                                className='queryAndFileSubmitClsBS' 
                                onClick={()=>{submitOnQuryBtnClicked()}}
                                disabled={isLoading}
                            />
                        </div>
                      );
                    }else{
                      return (
                        <div className="inneruploadedSide">
                            <img src={fileUpload} className='queryAndFileSubmitCls' />
                            <img 
                              src={querySubmit} 
                              className='queryAndFileSubmitClsBS' 
                              onClick={()=>{submitOnQuryBtnClicked()}}
                              disabled={isLoading}
                            />
                        </div>
                      );
                    }
                  })()}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };
  
  export default App;
