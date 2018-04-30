import * as X2JS from 'x2js';

export class NSurveyXmlData {
    survey: Survey;
    //question: Question[];
    //multiLanguageText:MultiLanguageText[];
    //answerType: AnswerType[];
    //answer:Answer[];
    //answerProperty :AnswerProperty[];
    
    constructor(){ }
    loadData(objJson:any) {
       console.log(objJson);
        if(objJson == undefined || objJson.NSurveyForm == undefined ) {
            throw new Error('Data could not be Null');
        }
        else{
            if(objJson.NSurveyForm.Question == undefined){
                objJson.NSurveyForm.Question = [];
            }
            if( objJson.NSurveyForm.Answer == undefined){
                objJson.NSurveyForm.Answer = [];
            }
            if( objJson.NSurveyForm.AnswerType == undefined){
                objJson.NSurveyForm.AnswerType = [];
            }
            if( objJson.NSurveyForm.ChildQuestion == undefined){
                objJson.NSurveyForm.ChildQuestion = [];
            }

            if(objJson.NSurveyForm.Question.constructor != Array)
            {
                let que:any = objJson.NSurveyForm.Question;
                objJson.NSurveyForm.Question = [];
                objJson.NSurveyForm.Question.push(que);
            }
            if(objJson.NSurveyForm.Answer.constructor != Array)
            {
                let ans:any = objJson.NSurveyForm.Answer;
                objJson.NSurveyForm.Answer = [];
                objJson.NSurveyForm.Answer.push(ans);
            }
            if(objJson.NSurveyForm.AnswerType.constructor != Array)
            {
                let ansType:any = objJson.NSurveyForm.AnswerType;
                objJson.NSurveyForm.AnswerType = [];
                objJson.NSurveyForm.AnswerType.push(ansType);
            }
            if(objJson.NSurveyForm.ChildQuestion.constructor != Array)
            {
                let child:any = objJson.NSurveyForm.ChildQuestion;
                objJson.NSurveyForm.ChildQuestion = [];
                objJson.NSurveyForm.ChildQuestion.push(child);
            }
        }
        objJson = objJson.NSurveyForm;

        if(objJson.Survey != undefined){ 
            this.survey = objJson.Survey;
            if(objJson.Question.length > 0) {
                this.survey.question = objJson.Question.filter(item=> item.ParentQuestionID == undefined);
            }
            if(objJson.MultiLanguageText != undefined){ this.survey.multiLanguageText = objJson.MultiLanguageText; }
        }

        if(objJson.AnswerProperty != undefined && typeof(objJson.AnswerProperty) == "object") {
            var answer = objJson.Answer.filter(x => x._AnswerId == objJson.AnswerProperty );
            //answer.answerProperty.push(ansProp);
        }
        else if(objJson.AnswerProperty != undefined) {
            objJson.AnswerProperty.forEach( ansProp => { 
                var answer = objJson.Answer.filter(x => x._AnswerId == ansProp._AnswerId );
                answer.answerProperty.push(ansProp);
            });
        }
        
        if(this.survey.question && this.survey.question.length > 0){
            this.survey.question.forEach( question => {
                var childQuestionList = objJson.ChildQuestion.filter(a=> a._ParentQuestionId == question._QuestionId);
                if(childQuestionList.length > 0) {
                    question.childquestions = [];
                     
                    childQuestionList.forEach(child => {
                        child.ChildQuestionId = child.QuestionId;
                        question.childquestions.push(child);
                    });
                }
                question.answers = objJson.Answer.filter(x => x._QuestionId == question._QuestionId );
                if(question.answers.length > 0) {
                    question.answers.forEach(ans => {
                        var _answerType =  objJson.AnswerType.filter(x => x._AnswerTypeID == ans._AnswerTypeId );
                        if(_answerType != undefined || _answerType.length > 0) {
                            ans.answerType = _answerType[0];
                        }
                    });
                }
                
            });
        }
        

    }
}

class AnswerType {
    Description: string;
    TypeNameSpace: string;
    TypeAssembly: string;
    _AnswerTypeID: number;
    _FieldWidth: number;
    _FieldHeight: number;
    _FieldLength: number;
    _TypeMode: number;
    _PublicFieldResults: boolean;
    _BuiltIn: boolean;
    XMLDataSource?: string;
}

class Survey {
    SurveyID: number;
    ProgressDisplayModeId: number;
    ResumeModeID: number;
    Title: string;
    ThankYouMessage: string;
    NavigationEnabled: boolean;
    Scored: boolean;
    QuestionNumberingDisabled: boolean;
    Activated: boolean;
    Archive: boolean;
    ResultsDisplayTimes: number;
    SurveyDisplayTimes: number;
    CreationDate: string;
     
    question: Question[];
    multiLanguageText: MultiLanguageText[];

}
export class Question {
    QuestionText: string;
    QuestionPipeAlias: string;
    QuestionIDText: string;
    HelpText: string;
    Alias: string;
    ShowHelpText: boolean;
    OldQuestionId: number;
    isSidebySide:boolean;

    _QuestionId: number;
    _LayoutModeId: number;
    _SelectionModeId: number;
    _ColumnsNumber: number;
    _MinSelectionRequired: number;
    _MaxSelectionAllowed: number;
    _RatingEnabled: boolean;
    _RandomizeAnswers: boolean;
    _SurveyId: number;
    _PageNumber: number;
    _DisplayOrder: number;

    
    answers:Answer[];
    childquestions:ChildQuestion[];
}

export class ChildQuestion
{
    ChildQuestionId:number;
    QuestionText:any;
    _ParentQuestionId: number;
}
export class Answer
{
	AnswerText: string;
    ImageURL: string;
    DefaultText: string;
    AnswerPipeAlias: string;
    AnswerIdText: string;
    AnswerAlias: string;
    SliderRange: string;
    SliderValue: number;
    SliderMin: number;
    SliderMax: number;
    SliderAnimate: boolean;
    SliderStep: number;
    OldAnswerId: number;
    _QuestionId: number;
    _AnswerTypeId: number;
    _DisplayOrder: number;
    _ScorePoint: number;
    _RatePart: boolean;
    _Selected: boolean;
    _AnswerId: number;
    _Mandatory: boolean
    _RegularExpressionId: number;

    answerProperty :AnswerProperty[];
    answerType: AnswerType;
}

class AnswerProperty
{
    Properties:string;
    _AnswerId:string;
}
class MultiLanguageText
{
    LanguageItemId: number;
    LanguageCode: string;
    LanguageMessageTypeId: number;
    ItemText: string;
}
