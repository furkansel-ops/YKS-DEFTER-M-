import {installAndroidFocusNotification} from "./android-focus-notification";

try{
  installAndroidFocusNotification();
}catch(error){
  document.documentElement.dataset.focusLiveNotification="deferred";
  console.error("Android odak canlı bildirimi yüklenemedi",error);
}
