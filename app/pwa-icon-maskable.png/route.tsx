import {renderPwaIcon} from "@/lib/pwa/render-icon";
export const dynamic="force-static";
export function GET(){return renderPwaIcon(512,true);}
