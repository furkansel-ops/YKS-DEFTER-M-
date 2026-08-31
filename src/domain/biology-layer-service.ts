import {organExamFocus,organGuide} from "../data/biology-organs.ts";

export interface BiologyLayerPlan {
  organId:string;
  surface:readonly string[];
  internal:readonly string[];
  priority:readonly string[];
  route:string;
}

/** Read-only layer plan for the Atlas viewer. */
export function buildBiologyLayerPlan(organId:string):BiologyLayerPlan|null {
  const guide=organGuide(organId),focus=organExamFocus(organId);if(!guide||!focus)return null;
  const known=new Set(guide.structures.map(part=>part.id));
  return {
    organId,
    surface:guide.structures.filter(part=>!part.internal).map(part=>part.id),
    internal:guide.structures.filter(part=>part.internal).map(part=>part.id),
    priority:focus.mustKnow.filter(id=>known.has(id)),
    route:focus.route
  };
}
