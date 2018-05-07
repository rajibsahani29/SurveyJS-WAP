import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyEditorComponent } from './SurveyEditor/surveyeditor.component';
import { SurveyFormComponent } from './SurveyForm/surveyform.component';


const appRoutes :Routes = [
    { path: '', redirectTo:'editor/2397', pathMatch: 'full'},    
    { path: 'editor/:surveyID', pathMatch: 'full', component: SurveyEditorComponent},    
    { path: 'surveyform', component: SurveyFormComponent},    
];  

export const routing : ModuleWithProviders = RouterModule.forRoot(appRoutes);