import { Component, Input } from '@angular/core';
import * as Survey from 'survey-angular';

@Component({
    selector: 'survey',
    template: `<div class="survey-container contentcontainer codecontainer"><div id="surveyElement"></div></div>`,
})
export class SurveyFormDirectiveComponent  {
    @Input() set json (value: object) {
        const surveyModel = new Survey.ReactSurveyModel(value);
        Survey.SurveyNG.render('surveyElement', { model: surveyModel });
    }

    ngOnInit() {
    }
}