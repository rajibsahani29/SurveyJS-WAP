import { Injectable } from '@angular/core';
import { AppSettings, UrlConfig } from '../app.setting';
//import { Employee } from './employee';

import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable'; 
 
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
 
@Injectable()
export class AuthService {
    private strBaseUrl:string='';

    private headers = new Headers({'Content-Type': 'application/json'});
    constructor(private _http: Http) {
        let urlSetting:UrlConfig = new UrlConfig(window);
        this.strBaseUrl = urlSetting.API_BASE;
    }
  
    validateAccessID(accessID:string){
        const headers = new Headers();
        headers.append("X-iA-AccessID",undefined);
        //headers.append('Access-Control-Allow-Headers', 'Content-Type');
        //headers.append('Access-Control-Allow-Methods', 'GET');
        //headers.append('Access-Control-Allow-Origin', '*');

        return this._http.get(this.strBaseUrl + "Users/Validate/" + accessID ,{headers: headers})
            .map(res => res.json());
    }

      
    private extractData(res: Response) {
        console.log(res);
        let body = res.json();
        return body.data || { };
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}