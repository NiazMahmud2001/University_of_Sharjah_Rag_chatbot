import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import infoContainerOnOff from './assets/infoContainerOnOff.svg';
import newChatOnfoContainer  from './assets/newChatOnfoContainer.svg';
import uosSvg from './assets/uosSvg.svg';
import './App.css';

let numClicked = 0

const topSVGShowbtn1OnClick = () => {
  if (numClicked%2 == 0){
    console.log("Later on I will add chatgpt like animation on topSVGShowbtn1OnClick")
  }else{
    console.log("Later on I will add chatgpt like animation on topSVGShowbtn1OnClick")
  }
  numClicked += 1
}
const topSVGShowbtn2OnClick = () => {
  console.log("Later on I will add chatgpt like animation on topSVGShowbtn1OnClick")  
}

const App = () => {
    return (
      <div className="app-container">

        <div className="sideInfoContainer">
          <div className="topSVGShow">
                <img src={newChatOnfoContainer} onClick={()=>{topSVGShowbtn1OnClick()}} className="topSVGShowbtn1" width={30} height={30}/>
                <img src={infoContainerOnOff} onClick={()=>{topSVGShowbtn2OnClick()}} className="topSVGShowbtn2" width={30} height={30}/>
          </div>
          <div className="bottomTextShow">
            <div className="bottomTextShowText">
              Lorem ipsum dolor sit amet<br/><br/> 
              consectetur adipisicing elit. <br/><br/>
              Officia totam nam dignissimos <br/>
              veritatis, porro sint nisi <br/><br/> 
              quo voluptatum ducimus, voluptatibus <br/><br/> 
              id animi eaque! Incidunt praesentium<br/> 
              dicta recusandae dolor quod <br/><br/> 
              quasi in cum, sit exercitationem! <br/>
              Accusantium recusandae ipsum <br/><br/> 
              similique consectetur iusto <br/>
              minus aspernatur architecto <br/><br/> 
              alias dolorem quaerat tenetur<br/>
              nihil, est iste asperiores <br/>
              eligendi atque officia, perspiciatis <br/><br/> 
              incidunt molestiae aliquam? Sapiente odio non debitis quia sequi, atque laboriosam dolore reprehenderit commodi dolorum inventore quisquam, voluptatibus facere ipsum illo autem enim recusandae necessitatibus. Impedit necessitatibus, temporibus asperiores doloribus blanditiis fugit minus molestias excepturi vel, quaerat quae nam ducimus? Perspiciatis, suscipit provident et dolores ad accusantium non sapiente repudiandae optio adipisci modi nam. Reiciendis officiis magnam, illum expedita eligendi quisquam laboriosam quis ipsam aperiam! Iure ullam dicta inventore laboriosam optio sequi dolor voluptatem assumenda deleniti quidem, quas dignissimos voluptates quibusdam? Iure recusandae eos nemo sint porro. Ea voluptatem, autem adipisci rerum omnis similique iusto sint aut doloribus, minus quos obcaecati saepe expedita reprehenderit magnam perspiciatis ullam odit architecto, officia mollitia porro maiores temporibus? Magni eligendi modi explicabo sequi perferendis consectetur velit quia, sed eos molestias amet tempora cum hic laudantium aperiam nihil laboriosam reiciendis pariatur quibusdam inventore porro blanditiis? Corrupti, totam magni? Enim officia tenetur natus, praesentium possimus impedit! Molestias deleniti accusamus quas, iste ratione aut voluptatum, porro corrupti harum commodi nam nesciunt quam. Earum, culpa cum quod, laborum, doloremque atque non deleniti neque molestiae commodi ad voluptates excepturi repellat accusantium. Quo qui natus, laborum quos dignissimos excepturi corrupti nobis exercitationem voluptatum placeat aut hic itaque recusandae consequuntur amet necessitatibus iure, ut sequi reprehenderit quasi minima nihil. Aperiam, repellendus? Voluptatem aperiam enim ipsa at sit ab in culpa recusandae cumque consequatur, beatae maxime esse illum harum id hic? Inventore quos aliquid quisquam qui vel voluptatum fugit ipsa tenetur alias consequuntur, asperiores, debitis nostrum dicta ut aliquam facere nulla magni tempore assumenda sapiente recusandae doloremque quibusdam reprehenderit distinctio. Quidem aut possimus repudiandae, temporibus totam exercitationem debitis aliquam provident eligendi. Commodi optio eius quis iste culpa tenetur. Cum repudiandae accusantium illo amet debitis aspernatur voluptate, magni molestias necessitatibus cupiditate porro quibusdam doloribus repellat vitae. Alias culpa quod veritatis explicabo laborum atque? Laboriosam, assumenda. Labore placeat officiis animi esse voluptas ex mollitia libero fugit repudiandae, molestias cumque sapiente suscipit iure. Ad quaerat quasi suscipit autem corrupti eos aut ipsa minima temporibus. Consequatur eligendi, necessitatibus tenetur, laudantium neque, voluptas tempora atque nesciunt deserunt omnis soluta officia sunt quae. Reiciendis obcaecati assumenda voluptatibus nulla impedit totam itaque cum pariatur laudantium. Mollitia veniam, a quaerat porro eum doloribus sequi, ducimus recusandae eos, aut illo. Quis minus excepturi consectetur perferendis, iste dolor. Quia vero ab ex repellat iure, quis esse! Excepturi officiis non alias obcaecati placeat ipsum cum accusantium qui quia debitis neque assumenda, et molestias id maxime eum temporibus voluptatum. Numquam provident commodi necessitatibus tenetur, id beatae facilis error quibusdam illum molestias perferendis dolor atque ipsa a totam voluptatibus dolores laboriosam ipsum, non in eius obcaecati doloremque! Quisquam reprehenderit nesciunt aspernatur, quae quo recusandae, vitae, dolorum vero commodi minima repellendus?
            </div>
          </div>
        </div>

        <div className="rightSideChatContainer">
          
          <div className="rightSideTopUserInfo">
            <div className="rightSideTopUserInfoText">UOS Chatbot</div>
            <div className="uosSvg">
              <img src={uosSvg} className='uosSvgImg' width={100} height={70}/>
            </div>
            <div className="rightSideTopUserInfoText">Login</div>
          </div>


          <div className="rightSideBottomChattingSpace">
            <div className="rightBottomTopchat"></div>
            <div className="rightBottomBottomInputSpace"></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default App;

