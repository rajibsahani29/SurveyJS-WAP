import { NSurveyXmlData, Question, Answer } from '../_models/NSurveyXmlData';
import { AppSettings, UrlConfig } from '../app.setting';
import { transition } from '@angular/core';
import { IPage } from 'survey-knockout';
import { fail } from 'assert';
import { NQuestion, NAnswer, NMatrixRow, NInfo, NSurveyLogic } from './NSurveyModel';
import { type } from 'os';


let urlSetting: UrlConfig = new UrlConfig(window);

export class SurveyJSData {
    SurveyJson = <ISurveyJSJson>{};

    constructor() { }
    loadNSurvey(nSurvey: NSurveyXmlData) {
        //this.SurveyJson.pages = [];
        //this.SurveyJson.pages.push({ name: 'page1', elements: [] });
        this.SurveyJson = this.initilizeSurveyJson(nSurvey);
        if (nSurvey.survey) {
            this.SurveyJson.title = nSurvey.survey.Title;
        }

        if (nSurvey.survey.question) {
            nSurvey.survey.question.forEach(que => {
                let element = this.getConvertedQuestion(que);
                if (element != null) {
                    //element.nquestion.LanguageCode = 
                    element.nquestion.SurveyID = nSurvey.survey.SurveyID;
                    this.SurveyJson.pages[0].elements.push(element);
                }
            });
        }
    }

    /**
     * Get converted surveyjs page element from given question object.
     * @param question 
     */
    getConvertedQuestion(question: Question): IBaseQuestion {
        let returnValue: IBaseQuestion = {} as any;
        returnValue = this.getQuestionType(question);
        return returnValue;
    }

    /**
     * Get Question type for question
     * @param question 
     */
    getQuestionType(question: Question): IBaseQuestion {
        let returnValue: IBaseQuestion;
        let qType: QuestionType = new QuestionType(question)
        return qType.returnSurveyElement();
    }
    
    initilizeSurveyJson(nSurvey: NSurveyXmlData): ISurveyJSJson {
        var _surveyid = 0, _title = '', _showQuestionNumbers = '', _isActive = false;
        if (nSurvey) {
            _surveyid = nSurvey.survey.SurveyID;
            _title = nSurvey.survey.Title;
            _isActive = nSurvey.survey.Activated;
            _showQuestionNumbers = nSurvey.survey.QuestionNumberingDisabled && eval(nSurvey.survey.QuestionNumberingDisabled + "") == true ? 'off' : 'on';
        }
        return {
            pages: [{ name: 'page1', elements: [] }],
            showQuestionNumbers: _showQuestionNumbers,
            title: _title,
            isActive:_isActive,
            showTitle: false,
            surveyid: _surveyid,
        } as ISurveyJSJson

    }

}




class QuestionType {
    _question: Question
    AnswerTypeId: number = 0;
    SelectionModeId: number;
    LayoutModeId: number;

    IsSameTypeAnswer: boolean = false;
    constructor(question: Question) {
        this._question = question;
        this.AnswerTypeId = -1;
        this.SelectionModeId = question._SelectionModeId;
        this.LayoutModeId = question._LayoutModeId;

        if (question.answers != undefined && question.answers.length > 0) {
            this.IsSameTypeAnswer = question.answers.map(r => r._AnswerTypeId).every(val => val === question.answers[0]._AnswerTypeId)
            if (this.IsSameTypeAnswer) {
                this.AnswerTypeId = question.answers[0]._AnswerTypeId;
            }
        }

    }

    returnSurveyElement(): IBaseQuestion {
        let returnValue: IBaseQuestion = this.initilizeQuestion();
        returnValue.answertypeid = this.AnswerTypeId;
        //RadioButton
        if (this.SelectionModeId == enSelectionModeId.RadioButton) {
            //FOR DATE TIME CONTROL
            if (this._question.answers.filter(a => { return a._AnswerTypeId == enAnswerTypeId.FieldCalendarType || a._AnswerTypeId == enAnswerTypeId.FieldBasicType }).length == 2 && this._question.answers.length == 2) {
                let element: ITextQuestion = new ITextQuestion(returnValue, enInputType.DateTime);
                Object.assign(element, returnValue);
                returnValue = element;
            }
            else {
                //FOR PRESURVEY QUESTION
                var isPreSurveyQuestion = true;
                if (this._question.answers.findIndex(t => (t._AnswerTypeId != enAnswerTypeId.FieldBasicType && t._AnswerTypeId != enAnswerTypeId.iAspireHidden)) > -1) {
                    isPreSurveyQuestion = false;
                }
                if (isPreSurveyQuestion == true && this._question.answers.length > 1) {
                    let eleMulti: IBaseQuestion = this.getMultiQuestionInColumn(returnValue);
                    if (eleMulti != null) {
                        Object.assign(eleMulti, returnValue);
                    }
                    returnValue = eleMulti;
                }
                else {
                    let eleOther: IBaseQuestion = this.getQuestionByAnswer(this._question.answers[0]);
                    if (eleOther != null) {
                        Object.assign(eleOther, returnValue);
                    }
                    returnValue = eleOther;
                }
            }
        }
        // Checkbox
        else if (this.SelectionModeId == enSelectionModeId.Checkbox) {
            //FOR DATE TIME CONTROL
            if (this._question.answers.filter(a => { return a._AnswerTypeId == enAnswerTypeId.FieldCalendarType || a._AnswerTypeId == enAnswerTypeId.FieldBasicType }).length == 2 && this._question.answers.length == 2) {
                let element: ITextQuestion = new ITextQuestion(returnValue, enInputType.DateTime);
                Object.assign(element, returnValue);
                returnValue = element;
            }
            else {
                //FOR PRESURVEY QUESTION
                var isPreSurveyQuestion = true;
                if (this._question.answers.findIndex(t => (t._AnswerTypeId != enAnswerTypeId.FieldBasicType && t._AnswerTypeId != enAnswerTypeId.iAspireHidden)) > -1) {
                    isPreSurveyQuestion = false;
                }
                if (isPreSurveyQuestion == true && this._question.answers.length > 1) {
                    let eleMulti: IBaseQuestion = this.getMultiQuestionInColumn(returnValue);
                    if (eleMulti != null) {
                        Object.assign(eleMulti, returnValue);
                    }
                    returnValue = eleMulti;
                }
                else {
                    let eleOther: IBaseQuestion = this.getQuestionByAnswer(this._question.answers[0]);
                    if(eleOther != null && eleOther.constructor.name == "IRadioGroupQuestion")
                    {
                        let eleOther1:ICheckboxGroupQuestion = eleOther as ICheckboxGroupQuestion;
                        eleOther1.type = enType.CheckBox;
                        Object.assign(eleOther1, returnValue);
                        //let newEleOther:ICheckboxGroupQuestion = {} as any;
                        //Object.assign(newEleOther, eleOther);
                        //eleOther = newEleOther;
                    }
                    else if (eleOther != null) {
                        Object.assign(eleOther, returnValue);
                    }
                    returnValue = eleOther;
                }
            }
            //console.error("Not Found: 1 this.AnswerTypeId = " + this.AnswerTypeId);
        }
        //DropDownList
        else if (this.SelectionModeId == enSelectionModeId.DropDownList) {
            if (this.IsSameTypeAnswer) {
                //Selection text
                if (this.AnswerTypeId == enAnswerTypeId.SelectionTextType) {
                    let element: IDropDownQuestion = new IDropDownQuestion(returnValue, this._question.answers);
                    Object.assign(element, returnValue);
                    returnValue = element;
                }
                else {
                    var xmlControlIds = xmlControlList.map(item => item.AnswerTypeId);
                    if (xmlControlIds.indexOf(Number(this.AnswerTypeId)) > -1) {
                        let element: IDropDownQuestion = new IDropDownQuestion(returnValue, this._question.answers);
                        Object.assign(element, returnValue);
                        var control = xmlControlList.find(c => c.AnswerTypeId == this.AnswerTypeId);
                        if (control != null) {
                            element.questiontype = control.name.toLowerCase();
                            element.setChoicesByUrl(control);
                        }
                        returnValue = element;
                    }
                    else {
                        console.error("Not Found: 1 this.AnswerTypeId = " + this.AnswerTypeId);
                    }
                }
            }
            else {
                //FOR PRESURVEY QUESTION
                if (this._question.answers.length > 1) {
                    let eleMulti: IBaseQuestion = this.getMultiQuestionInColumn(returnValue);
                    if (eleMulti != null) {
                        Object.assign(eleMulti, returnValue);
                    }
                    returnValue = eleMulti;
                }
                // else
                // {
                //     let eleOther: IBaseQuestion = this.getQuestionByAnswer(this._question.answers[0]);
                //     if(eleOther != null)
                //     {
                //         Object.assign(eleOther, returnValue);
                //     }
                //     returnValue = eleOther;
                // }
                //console.error("Not Found: 3 this.AnswerTypeId = " + this.AnswerTypeId);
            }

        }
        //Static - StaticTextSelection [Html]
        else if (this.SelectionModeId == enSelectionModeId.Static) {
            let element: IHtmlQuestion = new IHtmlQuestion(returnValue, clsFunction.getSpaceIfTextObject(this._question.QuestionText));
            Object.assign(element, returnValue);
            returnValue = element;
        }
        //Marix
        else if (this.SelectionModeId == enSelectionModeId.Matrix) {
            let element: IMatrixDropdownQuestion = new IMatrixDropdownQuestion(returnValue);
            Object.assign(element, returnValue);
            returnValue.nquestion.Rows = [];
            returnValue.nquestion.Columns = [];
            // For ROWS
            if (this._question.childquestions && this._question.childquestions.length > 0) {
                this._question.childquestions.forEach(child => {
                    var itemText = clsFunction.getSpaceIfTextObject(child.QuestionText);
                    element.rows.push({ text: itemText, value: 'row', rowid: child.ChildQuestionId });
                    returnValue.nquestion.Rows.push({ RowId: child.ChildQuestionId, Name: itemText, _OprationType: '' });
                });
            }
            else {
                //element.rows.push({ value: 'Row', text: ' ', rowid: 0 });
                //returnValue.nquestion.Rows.push({ RowId: 0, Name: ' ', _OprationType: 'ignore' });
            }
            //FOR COLUMNS
            if (this._question.answers && this._question.answers.length > 0) {
                this._question.answers.forEach(ans => {
                    element.columns.push(this.getMatrixCoulmn(ans));
                    returnValue.nquestion.Columns.push({ ColumnId: ans._AnswerId, _OprationType: '', Name: clsFunction.getSpaceIfTextObject(ans.AnswerText), AnswerTypeId: ans._AnswerTypeId, isMandatory: returnValue.isRequired, Value: '' });
                });
            }
            returnValue = element;
        }

        //MultiMatrix - MatrixMultipleSelection
        else if (this.SelectionModeId == enSelectionModeId.MultiMatrix) {
            let element: IMatrixDropdownQuestion = new IMatrixDropdownQuestion(returnValue);
            Object.assign(element, returnValue);
            returnValue.nquestion.Rows = [];
            returnValue.nquestion.Columns = [];
            if (this._question.childquestions && this._question.childquestions.length > 0) {
                this._question.childquestions.forEach(child => {
                    var itemText = clsFunction.getSpaceIfTextObject(child.QuestionText);
                    element.rows.push({ text: itemText, value: 'row', rowid: child.ChildQuestionId });
                    returnValue.nquestion.Rows.push({ RowId: child.ChildQuestionId, Name: itemText, _OprationType: '' });
                });
            }
            else {
                element.rows.push({ value: 'Row', text: ' ', rowid: 0 });
                returnValue.nquestion.Rows.push({ RowId: 0, Name: ' ', _OprationType: 'ignore' });
            }

            if (this._question.answers.length > 0) {
                this._question.answers.forEach(ans => {
                    element.columns.push(this.getMatrixCoulmn(ans));
                    returnValue.nquestion.Columns.push({ ColumnId: ans._AnswerId, _OprationType: '', Name: clsFunction.getSpaceIfTextObject(ans.AnswerText), AnswerTypeId: ans._AnswerTypeId, isMandatory: returnValue.isRequired, Value: '' });
                });
            }
            /*
            //element.rows.push({value:'row', text:' ', rowid:0});
            this._question.answers.forEach(ans=> {
                element.columns.push(this.getMatrixCoulmn(ans));
            });
            */
            returnValue = element;
        }
        else {
            //DateTime [Check for Calender type with Date and Time]
            if (this._question.answers.filter(a => { return a._AnswerTypeId == enAnswerTypeId.FieldCalendarType || a._AnswerTypeId == enAnswerTypeId.FieldBasicType }).length == 2 && this._question.answers.length == 2) {
                let element: ITextQuestion = new ITextQuestion(returnValue, enInputType.DateTime);
                Object.assign(element, returnValue);
                returnValue = element;
            }
            // For Pre SurveyQuestion Text TextType
            else if (this._question.answers.filter(a => { return a._AnswerTypeId == enAnswerTypeId.FieldBasicType || a._AnswerTypeId == enAnswerTypeId.iAspireHidden }).length == 2 && this._question.answers.length == 2) {
                let elePanel: IPanelQuestion = new IPanelQuestion();
                Object.assign(elePanel, returnValue);
                this._question.answers.forEach(ans => {
                    let eleText: ITextQuestion = new ITextQuestion(returnValue, enInputType.Text);
                    Object.assign(elePanel, returnValue);
                    //eleText.defaultValue = ans.DefaultText;
                    eleText.placeHolder = ans.DefaultText;
                    eleText.name = ans._AnswerId.toString();
                    eleText.title = ' ';
                    eleText.startWithNewLine = false;
                    elePanel.elements.push(eleText);
                });
                returnValue = elePanel;
            }
            //All Other type Like Textbox, TextArea, etc.
            else {
                if (this._question.answers.length == 1) {
                    let eleOther: IBaseQuestion = this.getQuestionByAnswer(this._question.answers[0]);
                    if (eleOther != null) {
                        Object.assign(eleOther, returnValue);
                    }
                    returnValue = eleOther;
                }
                else {
                    console.error("Impliment for multianswer text");
                }
            }
        }
        return returnValue;
    }

    getMultiQuestionInColumn(returnValue: IBaseQuestion): IBaseQuestion {
        let element: ITextQuestion = new ITextQuestion(returnValue, enInputType.Text);
        if (this._question.answers.length < 3) {
            let arrVal = [];
            this._question.answers.forEach(ans => {
                arrVal.push(ans.DefaultText);
            });
            element.placeHolder = arrVal.join(',');
        }
        return element;

        /*
        let elePanel: IPanelQuestion = new IPanelQuestion();
        this._question.answers.forEach(ans=> {
             let element: IBaseQuestion = this.getQuestionByAnswer(ans);
             if(element != null)
             {
                 element.name = ans._AnswerId.toString();
                 element.title = ' ';
                 element.startWithNewLine = false;
             }
             elePanel.elements.push(element); 
        })
        return elePanel;
        */
    }

    getMatrixCoulmn(answer: Answer): IMatrixColumn {
        let returnValue: IMatrixColumn = {} as any;
        returnValue.columnid = answer._AnswerId;
        //returnValue.name = clsFunction.getSpaceIfTextObject(answer.AnswerText);
        returnValue.name = 'column';
        returnValue.title = clsFunction.getSpaceIfTextObject(answer.AnswerText);
        returnValue.isRequired = answer._Mandatory;

        //RadioGroup
        if (answer._AnswerTypeId == enAnswerTypeId.SelectionTextType) {
            returnValue.cellType = enMatrixCellType.RadioGroup;
            //returnValue.choices = [];
        }
        //Text
        else if (answer._AnswerTypeId == enAnswerTypeId.FieldBasicType ||
                answer._AnswerTypeId == enAnswerTypeId.FieldCalendarType || 
                answer._AnswerTypeId == enAnswerTypeId.FieldEmailType ||
                answer._AnswerTypeId == enAnswerTypeId.FieldPasswordType ) {
            returnValue.cellType = enMatrixCellType.Text;
            returnValue.inputType = new NSurveyLogic().getAnswerTypeByID(answer._AnswerTypeId);
        }
        //Comment
        else if (answer._AnswerTypeId == enAnswerTypeId.FieldLargeType) {
            returnValue.cellType = enMatrixCellType.Comment;
        }
        //DropDown OR Custom Created XML Type    
        else if (answer._AnswerTypeId == 106 || (answer.answerType && answer.answerType.TypeNameSpace == "Votations.NSurvey.WebControls.UI.AnswerXmlListItem")) {
            returnValue.cellType = enMatrixCellType.DropDown;
            //returnValue.choices = [];
            if (answer.answerType != undefined) {
                returnValue.choicesByUrl = {
                    url: urlSetting.WAP_BASE + "XmlData/" + answer.answerType.XMLDataSource,
                    path: "NSurveyDataSource;XmlDataSource;XmlAnswers;XmlAnswer",
                    valueName: "AnswerValue",
                    titleName: "AnswerDescription"
                }
            }
        }

        return returnValue
    }

    getQuestionByAnswer(answer: Answer): IBaseQuestion {
        let returnValue: IBaseQuestion;
        if (answer == undefined)
            return returnValue;

        var xmlControlIds = xmlControlList.map(item => item.AnswerTypeId);
        if (answer._AnswerTypeId == enAnswerTypeId.BooleanType || answer._AnswerTypeId == enAnswerTypeId.SelectionOtherType) {
            let element: ICheckboxGroupQuestion = new ICheckboxGroupQuestion(returnValue, this._question.answers);
            if (this._question._LayoutModeId == NInfo.LayoutModeId.Horizontal) {
                element.colCount = this._question.answers.length;
            }
            //Object.assign(element, returnValue);
            returnValue = element;
        }
        //RadioButtonList
        else if (answer._AnswerTypeId == enAnswerTypeId.SelectionTextType || answer._AnswerTypeId == enAnswerTypeId.SelectionOtherType) {
            let element: IRadioGroupQuestion = new IRadioGroupQuestion(returnValue, this._question.answers);
            if (this._question._LayoutModeId == NInfo.LayoutModeId.Horizontal) {
                element.colCount = this._question.answers.length;
            }
            //Object.assign(element, returnValue);
            returnValue = element;
        }
        //Text
        else if (answer._AnswerTypeId == enAnswerTypeId.FieldBasicType
            || answer._AnswerTypeId == enAnswerTypeId.FieldEmailType
            || answer._AnswerTypeId == enAnswerTypeId.FieldPasswordType) {
            var inputType = new NSurveyLogic().getAnswerTypeByID(answer._AnswerTypeId);
            let element: ITextQuestion = new ITextQuestion(returnValue, inputType);
            if (answer.DefaultText && answer.DefaultText.trim() != "") {
                //element.defaultValue = answer.DefaultText;
                element.placeHolder = answer.DefaultText;
            }
            //Object.assign(element, returnValue);
            returnValue = element;
        }
        //DateTime
        else if (answer._AnswerTypeId == enAnswerTypeId.FieldCalendarType) {
            let element: ITextQuestion = new ITextQuestion(returnValue, enInputType.Date);
            //Object.assign(element, returnValue);
            returnValue = element;
        }
        //Comment
        else if (answer._AnswerTypeId == enAnswerTypeId.FieldLargeType) {
            let element: ICommentQuestion = new ICommentQuestion(returnValue);
            //Object.assign(element, returnValue);
            returnValue = element;
        }
        //Editor
        else if (answer._AnswerTypeId == enAnswerTypeId.ExtendedFreeTextBoxType) {
            let element: ICKEditor = new ICKEditor(returnValue);
            //Object.assign(element, returnValue);
            returnValue = element;
        }
        //Hidden
        else if (answer._AnswerTypeId == enAnswerTypeId.iAspireHidden) {
            let element: ITextQuestion = new ITextQuestion(returnValue, enInputType.Text);
            //element.defaultValue = answer.DefaultText;
            element.placeHolder = answer.DefaultText;
            //Object.assign(element, returnValue);
            returnValue = element;
        }
        else if (answer._AnswerTypeId == enAnswerTypeId.ExtendedFileUploadType) {
            let element: IFileUploadQuestion = new IFileUploadQuestion();
            returnValue = element;
        }
        else if (xmlControlIds.indexOf(Number(answer._AnswerTypeId)) > -1) {
            let element: IDropDownQuestion = new IDropDownQuestion(returnValue, this._question.answers);
            var control = xmlControlList.find(c => c.AnswerTypeId == answer._AnswerTypeId);
            if (control != null) {
                element.questiontype = control.name.toLowerCase();
                element.setChoicesByUrl(control);
            }
            returnValue = element;
        }
        else if (answer._AnswerTypeId == enAnswerTypeId.iAspireSignature) {
            let element: ISignaturePad = new ISignaturePad(returnValue);
            returnValue = element;
        }

        if (this._question.answers.filter(a => (a._Mandatory && a._Mandatory + "" == 'true')).length > 0) {
            returnValue.isRequired = true;
        }
        return returnValue;
    }

    initilizeQuestion(): IBaseQuestion {
        if (this._question == undefined)
            return {} as any;
        let strTitle: string = " ";
        let strName: string = " ";
        if (this._question.QuestionText != null && this._question.QuestionText != undefined && this._question.QuestionText != "") {
            strName = strName.length > 70 ? strName.substr(0, 70) + "..." : strName;
            strTitle = clsFunction.getSpaceIfTextObject(this._question.QuestionText)
        }
        this._question.isSidebySide = this._question.isSidebySide||false;
        return {
            questionid: this._question.OldQuestionId,
            questiontype: '',
            name: strName,
            title: strTitle,
            answertypeid: 0,
            nquestion: this.setNQuestionData(this._question),
            readOnly: false,
            startWithNewLine: !eval(this._question.isSidebySide + ""),
        };
    }

    setNQuestionData(que: Question): NQuestion {
        let returnValue: NQuestion = {} as NQuestion
        returnValue.SurveyID = que._SurveyId;
        returnValue.QuestionID = que.OldQuestionId;
        returnValue.QuestionText = clsFunction.getSpaceIfTextObject(que.QuestionText);
        returnValue.PageNumber = que._PageNumber;
        returnValue.DisplayOrder = que._DisplayOrder;
        //returnValue.QuestionType = que.;
        returnValue.SelectionModeId = que._SelectionModeId;
        //returnValue.Answer = que.;
        //returnValue.Rows = que.;
        //returnValue.Columns = que.;
        //returnValue.LanguageCode = ;
        //returnValue.ColumnsNumber = que.;
        returnValue.MinSelectionRequired = que._MinSelectionRequired;
        returnValue.MaxSelectionAllowed = que._MaxSelectionAllowed;
        returnValue.LayoutModeId = que._LayoutModeId;
        returnValue.RandomizeAnswers = que._RandomizeAnswers;
        returnValue.RatingEnabled = que._RatingEnabled;
        returnValue.QuestionPipeAlias = que.QuestionPipeAlias;
        returnValue.QuestionIdText = clsFunction.getSpaceIfTextObject(que.QuestionIDText);
        returnValue.ShowHelpText = que.ShowHelpText;
        returnValue.Alias = que.Alias;
        returnValue.HelpText = que.HelpText;
        returnValue.isSidebySide = que.isSidebySide;

        returnValue.Answer = [];
        returnValue.ChildQuestion = que.childquestions;
        if (!returnValue.ChildQuestion) {
            returnValue.ChildQuestion = [];
        }

        que.answers.forEach(ans => {
            returnValue.Answer.push(this.setNAnswerData(ans));
        });

        return returnValue;
    }

    setNAnswerData(ans: Answer): NAnswer {
        let nAns: NAnswer = {} as any;
        nAns.AnswerId = ans._AnswerId;
        nAns.AnswerTypeId = ans._AnswerTypeId;
        nAns.AnswerIDText = clsFunction.getSpaceIfTextObject(ans.AnswerIdText);
        nAns.Answertext = clsFunction.getSpaceIfTextObject(ans.AnswerText);
        nAns.DefaultText = clsFunction.getSpaceIfTextObject(ans.DefaultText);
        nAns.AnswerAlias = ans.AnswerAlias;
        nAns.AnswerPipeAlias = ans.AnswerPipeAlias;
        nAns.ImageURL = ans.ImageURL;
        nAns.isMandatory = ans._Mandatory;
        nAns.isRatePart = ans._RatePart;
        nAns.isSelected = ans._Selected;
        nAns.ScorePoint = ans._ScorePoint;
        nAns.SliderRange = ans.SliderRange;
        nAns.SliderValue = ans.SliderValue;
        nAns.SliderMin = ans.SliderMax;
        nAns.SliderMax = ans.SliderMax;
        nAns.isSliderAnimate = ans.SliderAnimate;
        nAns.SliderStep = ans.SliderStep;
        nAns.RegularExpressionId = ans._RegularExpressionId;
        return nAns;
    }

}

/**
 * ISurveyJSJson
 */
interface ISurveyJSJson {
    surveyid: number;
    title: string;
    showTitle: boolean
    isActive:boolean;
    showQuestionNumbers: string;
    questionTitleTemplate: string;
    questionStartIndex: string;
    showProgressBar: string;
    pages: IPages[];
    SurveyGUID?: string;
}

interface IPages {
    name: string;
    elements: IBaseQuestion[];
}

class IBaseQuestion {
    questionid: number;
    questiontype: string;
    name: string;
    title: string;
    placeHolder?: string;
    type?: string;
    description?: string;
    width?: string;

    answertypeid: number = 0;
    readOnly?: boolean;
    isRequired?: boolean;
    startWithNewLine: boolean;
    visible?: boolean;
    visibleIf?: string;
    nquestion: NQuestion;
}
class ITextQuestion extends IBaseQuestion {
    inputType: string;
    //defaultValue: string;
    //placeHolder:string;
    constructor(que: IBaseQuestion, _inputType: string) {
        super();
        this.type = enType.Text;
        this.inputType = _inputType;
    }
}
class ISignaturePad extends IBaseQuestion {
    constructor(que: IBaseQuestion) {
        super();
        this.type = enType.SignaturePad;
    }
}

class ICommentQuestion extends IBaseQuestion {
    //defaultValue: string;
    //placeHolder: string;
    rows?: number;
    cols?: number;
    //iscommentineditor:boolean;

    constructor(que: IBaseQuestion) {
        super();
        //this.iscommentineditor = false;
        this.type = enType.Comment;
    }

}
class ICKEditor extends IBaseQuestion {
    //defaultValue: string;
    //placeHolder: string;
    
    constructor(que: IBaseQuestion) {
        super();
        this.type = enType.Editor;
    }

}
class IFileUploadQuestion extends IBaseQuestion {
    constructor() {
        super();
        this.type = enType.FileUpload;
    }
}

class IHtmlQuestion extends IBaseQuestion {
    html: string;
    constructor(que: IBaseQuestion, HtmlString: string) {
        super();
        this.type = enType.Html;
        this.html = HtmlString;
    }
}

class IDropDownQuestion extends IBaseQuestion {
    choices: IChoices[];
    choicesByUrl?: IChoicesByUrl;
    optionsCaption?: string;

    constructor(que: IBaseQuestion, answers: Answer[]) {
        super();
        this.type = enType.DropDown;
        this.choices = [];
        answers.forEach(ans => {
            this.choices.push({ rowid: ans._AnswerId, value: ans._AnswerId.toString(), text: clsFunction.getSpaceIfTextObject(ans.AnswerText) });
        });
    }
    setChoicesByUrl(element) {
        this.choicesByUrl = {
            url: urlSetting.WAP_BASE + "XmlData/" + element.xmlFile,
            path: "NSurveyDataSource;XmlDataSource;XmlAnswers;XmlAnswer",
            valueName: "AnswerValue",
            titleName: "AnswerDescription"
        };
    }
}

class IRadioGroupQuestion extends IBaseQuestion {
    choices: IChoices[];
    choicesByUrl?: IChoicesByUrl;
    choicesOrder?: string;
    colCount?: number;
    hasOther?: boolean;
    otherText?: string;

    constructor(que: IBaseQuestion, answers: Answer[]) {
        super();
        this.type = enType.RadioGroup;
        this.choices = [];
        answers.forEach(ans => {
            ans.AnswerText = clsFunction.getSpaceIfTextObject(ans.AnswerText);
            if (ans._AnswerTypeId == enAnswerTypeId.SelectionOtherType) {
                this.hasOther = true;
                this.otherText = clsFunction.getSpaceIfTextObject(ans.AnswerText);
            }
            else {
                this.choices.push({ rowid: ans._AnswerId, value: ans._AnswerId.toString(), text: clsFunction.getSpaceIfTextObject(ans.AnswerText) });
            }
        });
    }
}

class ICheckboxGroupQuestion extends IBaseQuestion {
    choices: IChoices[];
    choicesByUrl?: IChoicesByUrl;
    choicesOrder?: string;
    colCount?: number;
    hasOther?: boolean;
    otherText?: string;

    constructor(que: IBaseQuestion, answers: Answer[]) {
        super();
        this.type = enType.CheckBox;
        this.choices = [];
        answers.forEach(ans => {
            ans.AnswerText = clsFunction.getSpaceIfTextObject(ans.AnswerText);
            if (ans._AnswerTypeId == enAnswerTypeId.SelectionOtherType) {
                this.hasOther = true;
                this.otherText = clsFunction.getSpaceIfTextObject(ans.AnswerText);
            }
            else {
                this.choices.push({ rowid: ans._AnswerId, value: ans._AnswerId.toString(), text: clsFunction.getSpaceIfTextObject(ans.AnswerText) });
            }
        });
    }
}

class IMatrixDropdownQuestion extends IBaseQuestion {
    cellType: string;
    choices: IChoices[];
    columns: IMatrixColumn[];
    rows: IMatrixRow[];

    constructor(que: IBaseQuestion) {
        super();
        this.type = enType.MatrixDropdown;
        this.choices = [];
        this.columns = [];
        this.rows = [];

    }
}

class IPanelQuestion extends IBaseQuestion {
    elements: IBaseQuestion[];
    constructor() {
        super();
        this.type = enType.Panel;
        this.elements = [];
    }
}

interface IChoices { rowid: number; value: string; text: string; }
interface IChoicesByUrl { url: string, path?: string, valueName?: string, titleName?: string }
export interface IMatrixColumn {
    columnid: number; name: string; title: string; isRequired: boolean
    cellType?: string; choices?: IChoices[], choicesByUrl?: IChoicesByUrl, inputType?:string,
}

export interface IMatrixRow { rowid: number; value: string; text: string; }


enum enMatrixCellType {
    DropDown = 'dropdown', CheckBox = 'checkbox', RadioGroup = 'radiogroup',
    Text = 'text', Comment = 'comment', Boolean = 'boolean', DateTime = 'datetime',
    Date = 'date', Email = 'email', Password = 'password',
}

enum enType {
    Text = 'text', Html = 'html', RadioGroup = 'radiogroup', CheckBox = 'checkbox', Comment = 'comment', FileUpload = 'file', Panel = 'panel',Editor = 'editor',
    DropDown = 'dropdown', MatrixDropdown = 'matrixdropdown', SignaturePad = 'signaturepad'
}
enum enInputType { Text = 'text', Color = 'color', Date = 'date', DateTime = 'datetime', Time = 'time' }

enum enSelectionModeId {
    Checkbox = 2, DropDownList = 3, Matrix = 4, MultiMatrix = 6, RadioButton = 1, Static = 5
}

enum enAnswerTypeId {
    SelectionTextType = 1, SelectionOtherType = 2, FieldBasicType = 3,
    XMLCountryList = 4, BooleanType = 20, FieldRequiredType = 21, FieldCalendarType = 22,
    FieldLargeType = 24, FieldEmailType = 26, FieldHiddenType = 27, FieldPasswordType = 28,
    SubscriberXMLList = 29, ExtendedFileUploadType = 30, ExtendedFreeTextBoxType = 31,
    FieldSliderType = 56, iAspireHidden = 101, iAspireSignature = 102, iAspireEncrypted = 103,

    XmlActivitiesOfDailyLiving = 109,
    XmlEvaluation = 111,
    XmlGradeList = 59,
    XmlRelatedCompetencies = 106,
    XmlShortTermObjectiveArticulation = 108,
    XmlShortTermObjectiveLanguage = 110,
    XmlStatus = 107,
    XmlSubjectList = 60,
    XmlCountryList = 4,
}

export let xmlControlList = [
    { AnswerTypeId: 109, xmlFile: 'ActivitiesofDailyLiving.xml', name: 'xmlactivitiesofdailyliving', title: 'XML - ActivitiesofDailyLiving' },
    { AnswerTypeId: 111, xmlFile: 'Evaluation.xml', name: 'xmlevaluation', title: 'XML - Evaluation' },
    { AnswerTypeId: 59, xmlFile: 'grades.xml', name: 'xmlgradelist', title: 'XML - Grade List' },
    { AnswerTypeId: 106, xmlFile: 'RelatedCompetencies.xml', name: 'xmlrelatedcompetencies', title: 'XML - Related Competencies' },
    { AnswerTypeId: 108, xmlFile: 'ShortTermObjectiveArticulation.xml', name: 'xmlshorttermobjectivearticulation', title: 'XML - ShortTermObjectiveArticulation' },
    { AnswerTypeId: 110, xmlFile: 'ShortTermObjectiveLanguage.xml', name: 'xmlshorttermobjectivelanguage', title: 'XML - ShortTermObjectiveLanguage' },
    { AnswerTypeId: 107, xmlFile: 'Status.xml', name: 'xmlstatus', title: 'XML - Status' },
    { AnswerTypeId: 60, xmlFile: 'subject.xml', name: 'xmlsubjectlist', title: 'XML - Subject List' },
    { AnswerTypeId: 4, xmlFile: 'countries.xml', name: 'xmlcountrylist', title: 'XML - CountryList' }
];

export let preSurveyQuestionList = [
    { type: 'text', title: 'Employee', name: 'employeename', placeHolder: '##EmployeeName##,##EmployeeID##', },
    { type: 'text', title: 'Teacher', name: 'teachername', placeHolder: '##TeacherName##,##TeacherID##', },

    { type: 'text', title: 'iAspire User', name: 'username', placeHolder: '##iAspireUserName##,##iAspireUserID##', },
    //{ type:'text', title:'Site/Department/Region', name:'sitename', placeHolder:'##SiteName##,##SiteID##',},
    { type: 'text', title: 'Site', name: 'sitename', placeHolder: '##SiteName##,##SiteID##', },
    { type: 'text', title: 'Department', name: 'department', placeHolder: '##SiteName##,##SiteID##', },
    { type: 'text', title: 'School', name: 'schoolname', placeHolder: '##SchoolName##,##SchoolID##', },
    { type: 'text', title: 'Grade', name: 'gradename', placeHolder: '##GradeName##,##GradeID##', },
    { type: 'text', title: 'Subject', name: 'subject', placeHolder: '##SubjectName##,##SubjectID##', },
];

class clsFunction {
    static getSpaceIfTextObject(TextValue: any) {
        return typeof (TextValue) == 'object' ? ' ' : TextValue;
    }
}