import { Inject } from '@angular/core';
import { environment } from 'environments/environment';
export class AppSettings {
    //private static API_HOST = environment.ApiUrl;
    //public static API_BASE = environment.ApiUrl + environment.ApiPath;
    //public static WAP_BASE = environment.WapUrl  + environment.WapPath;

}
export class UrlConfig {
    public API_BASE:string = "";
    public WAP_BASE:string = "";
    
    constructor(@Inject(Window) private _window: Window)
    {
        this.API_BASE = this._window.location.protocol + "//" + environment.ApiUrl + environment.ApiPath;
        this.WAP_BASE = this._window.location.protocol + "//"+ environment.WapUrl  + environment.WapPath;
    }
}