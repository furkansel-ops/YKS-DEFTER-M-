import type {ScreenModule} from "./contracts";

export const paragraphProblemScreen:ScreenModule={
  id:"pp",
  required:[],
  render(){
    const render=(window as Window&{renderParagraphProblemTracker?:()=>void}).renderParagraphProblemTracker;
    if(typeof render==="function")render();
  }
};
