"use client";
export const SITE_PUBLISHED_EVENT="sabor-site-content-published";
const STORAGE_KEY="sabor-site-refresh-version";
/** Notify the already open public site and any other browser tabs after a verified save. */
export function announceSitePublished(){
 if(typeof window==="undefined")return;
 try{window.localStorage.setItem(STORAGE_KEY,String(Date.now()));}catch{}
 window.dispatchEvent(new Event(SITE_PUBLISHED_EVENT));
}
export function isSitePublishStorageEvent(event:StorageEvent){
 return event.key===STORAGE_KEY;
}
