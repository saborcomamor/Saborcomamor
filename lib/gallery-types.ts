import type {SitePhoto} from "./photos";
export type GalleryPhoto=SitePhoto & {
 fit_mode:"cover"|"contain";focus_x:number;focus_y:number;zoom:number;
};
export type GallerySelection={
 photo_id:string;fit_mode:"cover"|"contain";focus_x:number;focus_y:number;zoom:number;
};
export const defaultFrame=():Omit<GallerySelection,"photo_id">=>({
 fit_mode:"contain",focus_x:50,focus_y:50,zoom:1
});
