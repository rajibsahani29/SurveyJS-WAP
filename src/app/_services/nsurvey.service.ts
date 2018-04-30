import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable'; 
import * as X2JS from 'x2js';
import { AppSettings, UrlConfig } from '../app.setting';
import { NQuestion } from '../_models/NSurveyModel';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

@Injectable()
export class NSurveyService {
    private strBaseUrl:string='';

    private headers = new Headers({'Content-Type': 'application/json'});
    constructor(private _http: Http) {
        let AccessID:string = localStorage.getItem("AccessID");
        AccessID = JSON.parse(AccessID)
        this.headers.append("X-iA-AccessID",AccessID);
        
        let urlSetting:UrlConfig = new UrlConfig(window);
        this.strBaseUrl = urlSetting.API_BASE;
    }

    /**
     * Get Survey XMl from Survey by SurveyID
     * @param SurveyID 
     */
    getSurveyXml(SurveyID:number){
        var _x2js = new X2JS();
        this.headers.append('Accept', 'application/xml');
        return this._http.get(
            this.strBaseUrl + "NSurvey/SurveyXML/" + SurveyID,
            { headers: this.headers }
        ).map(res => _x2js.xml2js(res.text())).toPromise();
        //.map(res => JSON.parse((res.text(),'  ')))
    }
    
    /**
     * Delete Survey Question by QuestionID
     * @param QuestionID 
     */
    deleteQuestion(QuestionID:number){
        return this._http.get(
            this.strBaseUrl + "NSurvey/QuestionDelete/" + QuestionID,
            { headers: this.headers }
        ).toPromise();
    }

    /**
     * Create New Question In Survey
     * @param QuestionID
     */
    createQuestion(question: NQuestion) {
        return this._http.post(
            this.strBaseUrl + "NSurvey/CreateQuestion",
            question,
            { headers: this.headers }
            
        ).toPromise();
    }

    changeQuestionDisplayOrder(QuestionId:number, DisplayOrder:number) {
        return this._http.get(
            this.strBaseUrl + "NSurvey/QuestionDisplayOrderChange?QuestionId=" +QuestionId + "&DisplayOrder="+DisplayOrder ,
            { headers: this.headers }
        ).toPromise();
    }

    updateQuestion(question: NQuestion) {
        return this._http.post(
            this.strBaseUrl + "NSurvey/UpdateQuestion",
            question,
            { headers: this.headers }
            
        ).toPromise();
    }

    getSurveyDetails(SurveyID: number) {
        return this._http.get(
            this.strBaseUrl + "NSurvey/SurveyDetails/" + SurveyID,
            { headers: this.headers }
        ).toPromise();
    }

    getSurveyTemplateCSS(SurveyID: number, LanguageCode) {
        if(LanguageCode == "") LanguageCode = null;
        return this._http.get(
            this.strBaseUrl + "NSurvey/SurveyLayout/" + SurveyID + "/" + LanguageCode,
            { headers: this.headers }
        ).toPromise();
    }
    getCSSContent(SurveyID: number, FileName:string) {
        return this._http.get(
            this.strBaseUrl + "NSurvey/SurveyCSSContent/" + SurveyID + "/" + FileName + "/",
            { headers: this.headers }
        ).toPromise();
    }
    deleteSurveyCSS(SurveyID: number, FileName:string) {
        return this._http.get(
            this.strBaseUrl + "NSurvey/SurveyCSSDelete/" + SurveyID + "/" + FileName + "/",
            { headers: this.headers }
        ).toPromise();
    }

    uploadSurveyCSS(formData: FormData) {
        //this.headers.set('Content-Type', 'multipart/form-data');
        //this.headers.append('Accept', 'application/json');
        var headers = new Headers();
        const options = new RequestOptions({headers: headers});


        let urlSetting:UrlConfig = new UrlConfig(window);
        let url:string = urlSetting.WAP_BASE + "AjaxWebForm.aspx";
        formData.append("DoAction","UploadSurveyCSS");
        return this._http.post(
            url, formData, options
        ).toPromise();
    }
    saveSurveyCSS(SurveyLayout: any) {
        return this._http.post(
            this.strBaseUrl + "NSurvey/SurveyCSSSave",
            SurveyLayout,
            { headers: this.headers }
            
        ).toPromise();
    }

    updateSurveyDetails(SurveyDetails)
    {
        return this._http.post(
            this.strBaseUrl + "NSurvey/SurveyDetailsSave",
            SurveyDetails,
            { headers: this.headers }
        ).toPromise();
        
    }
    
    saveSurveyLayout(SurveyLayout: any) {
        return this._http.post(
            this.strBaseUrl + "NSurvey/SurveyLayoutSave",
            SurveyLayout,
            { headers: this.headers }
            
        ).toPromise();
    }
    /*
    getLanguageList(SurveyID:string){
        return this._http.get(this.strBaseUrl + "NSurvey/Language/" + SurveyID, {headers: this.headers})
            .map(res => res.json());
    }
    getSurveyPageCount(SurveyID:string){
        return this._http.get(this.strBaseUrl + "NSurvey/PageCount/" + SurveyID, {headers: this.headers})
            .map((resp: Response) => resp.json());

    }
    */


    // from https://angular.io/docs/ts/latest/guide/server-communication.html
    private handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        //console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
