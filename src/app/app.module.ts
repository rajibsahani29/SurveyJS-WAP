import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ErrorHandler } from '@angular/core';
import { MyErrorHandler } from './app.ErrorHandler';
 
import { AppComponent } from './app.component';
import { SurveyFormDirectiveComponent } from './_directives/surveyForm.directive';
import { SurveyEditorDirectiveComponent } from './_directives/surveyEditor.directive';
import { SurveyEditorComponent } from './SurveyEditor/surveyeditor.component';
import { SurveyFormComponent } from './SurveyForm/surveyform.component';
 
import { routing } from './app.routing';
import { AuthService } from './_services/auth.service';
 

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { SimpleNotificationsModule } from 'angular2-notifications';


@NgModule({
  //BrowserAnimationsModule, SimpleNotificationsModule.forRoot()
  imports: [BrowserModule, FormsModule, HttpModule, routing, ],
  declarations: [ 
    AppComponent, SurveyFormDirectiveComponent, SurveyEditorDirectiveComponent, SurveyEditorComponent,
    SurveyFormComponent,
  ],
  providers: [
    AuthService,
    {provide: Window, useValue: window},
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: ErrorHandler, useClass: MyErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  
}
