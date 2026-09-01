import type {ScreenId} from "../types";
import type {ScreenModule} from "./contracts";
import {homeScreen} from "./home";
import {programScreen} from "./program";
import {topicsScreen} from "./topics";
import {examsScreen} from "./exams";
import {progressScreen} from "./progress";
import {focusScreen} from "./focus";
import {paragraphProblemScreen} from "./paragraph-problem";
import {moreScreen} from "./more";

export const SCREEN_MODULES:readonly ScreenModule[]=[
  homeScreen,
  programScreen,
  topicsScreen,
  examsScreen,
  progressScreen,
  focusScreen,
  paragraphProblemScreen,
  moreScreen
];

const SCREEN_MAP=new Map<ScreenId,ScreenModule>(SCREEN_MODULES.map(module=>[module.id,module]));

export function getScreenModule(id:ScreenId):ScreenModule|undefined{
  return SCREEN_MAP.get(id);
}
