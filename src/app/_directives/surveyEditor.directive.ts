import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { SurveyJSEditorSetting } from './surveyJsEditorSetting';
import * as SurveyEditor from 'surveyjs-editor';
import * as Surveyko from 'survey-knockout';
//import * as Survey from 'survey-angular';
//import { showdown } from 'showdown';

import * as CKWidget from './SurveyWidget/ck-editor';
import * as SignatureWidget from './SurveyWidget/signature_pad';

import { UrlConfig } from '../app.setting';
import { NSurveyLogic, NQuestion, NAnswer, NInfo, NMatrixColumn, NMatrixRow, NSurveyDetails } from '../_models/NSurveyModel';
import { xmlControlList, preSurveyQuestionList } from '../_models/SurveyJSJsonData'
//import * as $ from 'jquery';

const showdown = require('showdown');

@Component({
    selector: 'survey-editor',
    template: `<div id="surveyEditorContainer" json></div>`,
})

export class SurveyEditorDirectiveComponent implements OnChanges {
    editor: SurveyEditor.SurveyEditor;
    @Input() json: any;

    @Output() surveySaved: EventEmitter<any> = new EventEmitter();
    @Output() onQuestionRemoved: EventEmitter<any> = new EventEmitter();
    @Output() onQuestionAdded: EventEmitter<any, any> = new EventEmitter();
    @Output() onQuestionModified: EventEmitter<any> = new EventEmitter();
    @Output() onQuestionChangeOrder: EventEmitter<any> = new EventEmitter();
    @Output() onLayoutClick: EventEmitter<any> = new EventEmitter();
    @Output() onSaveSurveyDetails: EventEmitter<any> = new EventEmitter();


    private strWapBase: string = '';
    private strCurrentOperation = '';
    constructor() {
        let urlSetting: UrlConfig = new UrlConfig(window);
        this.strWapBase = urlSetting.WAP_BASE;
    }

    isAddModelSubmitting: boolean = false;
    ngOnInit() {
        this.initSurveyEditor();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.editor != undefined && this.json) {
            this.editor.text = JSON.stringify(this.json);
            this.editor.saveSurveyFunc = this.doOnSaveSurvey;
            this.editor.onModified.add(this.doOnQuestionModified);
            var self = this;
            this.editor.onElementDeleting.add(function (editor, options) {
                // if(self.isCopiedElementDeleting)
                // {
                //     self.isCopiedElementDeleting = false;
                //     options.allowing = false;
                // }
                // else 
                let arrNoBe = ['CANCEL', 'COPY'];
                if (arrNoBe.indexOf(self.strCurrentOperation) == -1) {
                    if (!window.confirm("Are you sure want to delete the question?")) {
                        options.allowing = false;
                    }
                }
                // else
                // {
                //     self.strCurrentOperation = "";
                // }
            });
            this.editor.onElementDoubleClick.add(function (editor, options) {
                editor.showElementEditor(options.element, function (isCanceled) {
                    //if (isCanceled) editor.deleteElement(options.element);
                });
            });
            this.setSurveyToolbar();
        }
    }

    initSurveyEditor(): void {
        //Initilize Widgets
        CKWidget.initCkEditor(Surveyko);
        SignatureWidget.initSignaturePad(Surveyko);

        this.setSurveyEditorCustomSetting();
        let editorOptions =
            {
                showEmbededSurveyTab: SurveyJSEditorSetting.showEmbededSurveyTab,
                showJSONEditorTab: SurveyJSEditorSetting.showJSONEditorTab,
                showTestSurveyTab: SurveyJSEditorSetting.showTestSurveyTab,
                generateValidJSON: SurveyJSEditorSetting.generateValidJSON,
                showPropertyGrid: SurveyJSEditorSetting.showPropertyGrid,
                showOptions: SurveyJSEditorSetting.showOptions,
                questionTypes: SurveyJSEditorSetting.questionTypes,
                //designerHeight        : "75vh"
                designerHeight: "73vh",
            };

        this.editor = new SurveyEditor.SurveyEditor('surveyEditorContainer', editorOptions);
        this.editor.haveCommercialLicense = true;
        this.editor.showApplyButtonInEditors = SurveyJSEditorSetting.showApplyButtonInEditors;
        this.editor.onElementAllowOperations.add(function (editor, options) {
            options.allowEdit = true; //default value - allow show Editor question/panel/page
            options.allowDelete = true; //remove delete menu item
            options.allowCopy = true; //remove Copy menu item
            options.allowAddToToolbox = false; // remove add to toolbox menu item
            options.allowDragging = true; //default allow drag this question/page
            options.allowChangeType = true; //do not allow to convert question from one question to another
            options.allowShowHideTitle = false;
            options.allowChangeRequired = false;
        });
        

        this.editor.onCanShowProperty.add(function (sender, options) {
            if (options.obj.getType() == "page") {
                options.canShow = false;
            }
            else if (options.obj.getType() == "survey") {
                //var allProperyList = ['clearInvisibleValues','completeText','completedBeforeHtml','completedHtml','cookieName','firstPageIsStarted','focusFirstQuestionAutomatic','goNextPageAutomatic','isSinglePage','loadingHtml','locale','maxTimeToFinish','maxTimeToFinishPage','mode','pageNextText','pagePrevText','questionErrorLocation','questionStartIndex','questionTitleLocation','questionTitleTemplate','questionsOrder','requiredText','sendResultOnPageNext','showCompletedPage','showNavigationButtons','showPageNumbers','showPageTitles','showPrevButton','showProgressBar','showQuestionNumbers','showTimerPanel','showTimerPanelMode','showTitle','startSurveyText','storeOthersAsComment','title','triggers'];
                //console.log(options.obj);
                var arrDisplayProp = ['title', 'showQuestionNumbers', 'isActive'];
                if (arrDisplayProp.indexOf(options.property.name) > -1) {
                    options.canShow = true;
                }
                else {
                    options.canShow = false;
                }
            }
            //console.log(options.property.name);
        });




        //Create showdown mardown converter
        var converter = new showdown.Converter();
        function doMarkdown(survey, options) {
            //convert the mardown text to html
            var str = converter.makeHtml(options.text);
            if (str.startsWith("<p>") && str.endsWith("</p>")) {
                //remove root paragraphs <p></p>
                str = str.substring(3);
                str = str.substring(0, str.length - 4);
            }
            options.html = str;
        }

        this.editor.onDesignerSurveyCreated.add(function (editor, options) {
            options.survey.onTextMarkdown.add(doMarkdown);
            options.survey.onGetQuestionTitle.add(function (survey, options) {
                if (options.question.title == options.question.name) options.title = "";
            });
        });
        this.editor.onSetPropertyEditorOptions.add(function (sender, options) {
            options.editorOptions.itemsEntryType = "fast";
        });

        /*
        this.editor.onDefineElementMenuItems.add(function(editor, options) {
            //options.items.unshift({text: "Add Into Shared Repository", onClick: function(obj){ }});
            options.items.splice(options.items.findIndex(t=>t.name=="addToToolbox"),1);
        });
        */
        this.initilizeCustomControls();
    }

    setSurveyEditorCustomSetting() {
        
        Surveyko.defaultBootstrapCss.navigationButton = "btn btn-primary";
        SurveyEditor.removeAdorners(["controlLabel", "item", "title", "label", "itemText", "itemTitle"]);
        
        Surveyko.JsonObject.metaData.findProperty("questionbase", "name").readOnly = true;
        Surveyko.JsonObject.metaData.addProperty("questionbase", { name: "questionid:number", default: 0 });
        Surveyko.JsonObject.metaData.addProperty("questionbase", { name: "customcontrol:boolean", default: false });
        Surveyko.JsonObject.metaData.addProperty("questionbase", { name: "answertypeid:number", default: 0 });
        Surveyko.JsonObject.metaData.addProperty("questionbase", { name: "questiontype:string" });
        Surveyko.JsonObject.metaData.addProperty("questionbase", { name: "nquestion:NQuestion", default: {} });
        //Surveyko.JsonObject.metaData.addProperty("questionbase", { name: "iscommentineditor:boolean", default: false });
        //SurveyEditor.defaultStrings.pe["iscommentineditor"] = "Show As Editor";
        SurveyEditor.defaultStrings.pe["startWithNewLine"] = "Start Question with New Line";
        // remove visibleIf tab for all questions
        
        SurveyEditor.SurveyQuestionEditorDefinition.definition["questionbase"].tabs = [];
        SurveyEditor.SurveyQuestionEditorDefinition.definition["questionbase"].properties = [
            "title",
            "html",
            //"defaultValue",
            //"placeHolder",
            "commentText",
            { name: "isRequired" },
            "startWithNewLine",
            "iscommentineditor"
        ];
        
        SurveyEditor.SurveyQuestionEditorDefinition.definition.selectbase.tabs = [{ name: "general" }, { name: "choices", index: 10 }];
        SurveyEditor.SurveyQuestionEditorDefinition.definition["selectbase"].properties = [
            { name: "hasOther", tab: "choices" },
            { name: "otherText", tab: "choices" },
            { name: "colCount", tab: "choices" },
        ];

        Surveyko.JsonObject.metaData.addProperty("survey", { name: "isActive:boolean", default: false });
        Surveyko.JsonObject.metaData.addProperty("survey", { name: "surveyid:number", default: 0 });
        Surveyko.JsonObject.metaData.findProperty("survey", "title").type = "string";
        Surveyko.JsonObject.metaData.findProperty("survey", "showQuestionNumbers").setChoices(["on", "off"], undefined);
        
        SurveyEditor.SurveyQuestionEditorDefinition.definition["survey"].properties = [
            "title",
            "showQuestionNumbers",
            "isActive"
        ];
        
        Surveyko.JsonObject.metaData.addProperty("ItemValue", { name: "rowid:number", default: -1 });
        
        //Surveyko.JsonObject.metaData.findProperty("itemvalue", "value").visible = false;
        //Surveyko.JsonObject.metaData.findProperty("itemvalue", "value").isRequired = false;

        Surveyko.JsonObject.metaData.addProperty("panel", { name: "questionid:number", default: 0 });

        Surveyko.JsonObject.metaData.addProperty("matrixdropdowncolumn", { name: "columnid:number", default: -1 });
        //Surveyko.JsonObject.metaData.findProperty("matrixdropdowncolumn","name").visible = false;
 
        SurveyEditor.SurveyQuestionEditorDefinition.definition["html"].tabs = [];
        
        /* UNCOMMENT After New Release
        SurveyEditor.SurveyQuestionEditorDefinition.definition.html = {
            tabs: [{ name: "general", visible: false }, { name: "html", index: 10 }]
        }
        */
    }

    setSurveyToolbar() {
        if (this.editor != undefined) {
            var edt = this.editor;
            var DefaultToolbar = this.editor.toolbarItems().map(a => a.id);// ["svd-survey-settings","svd-redo","svd-options","svd-test","svd-save","svd_state"]
            $(DefaultToolbar).each(function() {
                var exceptHide = ["svd-survey-settings"];
                if(exceptHide.indexOf(this+"") == -1)
                {
                    var index = edt.toolbarItems().findIndex(t=> t.id == this+"" );
                    edt.toolbarItems().splice(index,1);
                }
            });
            
            if (this.editor.toolbarItems().findIndex(t => t.id == 'custom-preview') == -1) {
                var strWapURL = this.strWapBase;
                var SurveyGuid = this.json.SurveyGUID;
                this.editor.toolbarItems.push({
                    id: "custom-preview",
                    visible: true,
                    title: "Survey Preview",
                    action: function () {
                        window.open(strWapURL + "surveymobile.aspx?surveyid=" + SurveyGuid, "_blank");
                    }
                });
            }
            if (this.editor.toolbarItems().findIndex(t => t.id == 'custom-layout') == -1) {
                var LayoutEvent = this.onLayoutClick;
                this.editor.toolbarItems.push({
                    id: "custom-layout",
                    visible: true,
                    title: "Layout",
                    action: function () {
                        LayoutEvent.emit("");
                    }
                });
            }
            // this.editor.toolbarItems.remove(function (item) {
            //     return (item.title == "Undo" || item.title == "Redo" || item.title == "Save Survey");
            // });
        }
    }

    initilizeCustomControls() {
        let toolCurrentDateTime: SurveyEditor.IQuestionToolboxItem = {} as any;
        Object.assign(toolCurrentDateTime, {
            name: "datetime", isCopied: false, iconName: "icon-text", title: 'Date & Time',
            json: {
                type: "text",
                inputType:"datetime",
                name: "datetime",
                title: "Date & Time",
            }
        });
        this.editor.toolbox.addItem(toolCurrentDateTime);


        let toolPhoto: SurveyEditor.IQuestionToolboxItem = {} as any;
        Object.assign(toolPhoto, {
            name: "photo", isCopied: false, iconName: "icon-file", title: 'Photo',
            json: {
                type: "file",
                name: "photo",
                title: "Photo:"
            }
        });
        this.editor.toolbox.addItem(toolPhoto);

        let toolVideo: SurveyEditor.IQuestionToolboxItem = {} as any;
        Object.assign(toolVideo, {
            name: "video", isCopied: false, iconName: "icon-file", title: 'Video',
            json: {
                type: "file",
                name: "video",
                title: "Video:"
            }
        });
        this.editor.toolbox.addItem(toolVideo);

        let toolVoice: SurveyEditor.IQuestionToolboxItem = {} as any;
        Object.assign(toolVoice, {
            name: "voice", isCopied: false, iconName: "icon-file", title: 'Voice',
            json: {
                type: "file",
                name: "voice",
                title: "Voice:"
            }
        });
        this.editor.toolbox.addItem(toolVoice);



        let toolSection: SurveyEditor.IQuestionToolboxItem = {} as any;
        Object.assign(toolSection, {
            name: "section", isCopied: false, iconName: "icon-html", title: 'Section',
            json: {
                type: "html",
                name: "section",
                html: "<div style=\"width: 100%; background-color: #00A8C6; border-radius: 5px; padding: 0px 10px; color: white;\">\n<p style=\"text-align:center\"><span style=\"font-size:16px\">Text</span></p>\n</div>\n"
            }
        });
        this.editor.toolbox.addItem(toolSection);

        let toolObserverOnlyComment: SurveyEditor.IQuestionToolboxItem = {} as any;
        Object.assign(toolObserverOnlyComment, {
            name: "ObserverOnlyComment", isCopied: false, iconName: "icon-comment", title: 'Observer Only Comment',
            json: {
                type: "comment",
                name: "ObserverOnlyComment1",
                title: "<div class=\"nostyle clsNCRemoveExceptGlobalAdminObserver\"><strong>Coaches Only Comments</strong></div>"
            }
        });
        this.editor.toolbox.addItem(toolObserverOnlyComment);

        if (SurveyJSEditorSetting.showPreSurveyQuestion) {
            preSurveyQuestionList.forEach(element => {
                let item: SurveyEditor.IQuestionToolboxItem = {} as any;
                Object.assign(item, {
                    name: element.name, isCopied: false, iconName: "icon-expression", title: element.title,
                    json: {
                        "type": element.type,
                        "placeHolder": element.placeHolder,
                        "title": element.title,
                    }
                });

                this.editor.toolbox.addItem(item);
            });
        }

        if (SurveyJSEditorSetting.showXMLCustomQuestion) {
            xmlControlList.forEach(element => {
                let item: SurveyEditor.IQuestionToolboxItem = {} as any;
                Object.assign(item, {
                    name: element.name, isCopied: false, iconName: "icon-dropdown", title: element.title,
                    json: {
                        "type": "dropdown",
                        "choicesByUrl": {
                            "url": this.strWapBase + "XmlData/" + element.xmlFile,
                            "path": "NSurveyDataSource;XmlDataSource;XmlAnswers;XmlAnswer",
                            "valueName": "AnswerValue",
                            "titleName": "AnswerDescription"
                        },
                        "name": element.name,
                        "customcontrol": true,
                        //"title": element.title,
                        "answertypeid": element.AnswerTypeId,
                        "questiontype": element.name.toLowerCase(),
                    }
                });
                this.editor.toolbox.addItem(item);
            });
        }
    }

    SetDefaultsForControls(question: any) {
        question.nquestion = {};
        if (question.getType() == 'checkbox' || question.getType() == 'radiogroup' || question.getType() == 'dropdown') {
            if (question.choices && question.choices.length > 0) {
                //var obj = question.choices.shift();
                question.choices = [];
                //question.choices.push(obj);
            }
        }
        else if (question.getType() == 'matrixdropdown') {
            question.choices = [];
            question.columns = [];
            question.rows = [];
            question.cellType = "text";
        }
    }
    doOnQuestionModified = (editor, options) => {
        this.strCurrentOperation = "";
        //console.log("options", options);
        var element = null;
        var parentElement = null;
        var actionType = '';

        //if (options.type == "ADDED_FROM_TOOLBOX" || options.type == "ELEMENT_COPIED") {

        if (options.type == "ADDED_FROM_TOOLBOX") {
            element = options.question;
            parentElement = options.question.parent;
            actionType = "ADD";
        }
        else if (options.type == "DO_DROP" && options.newElement) {
            element = options.newElement;
            parentElement = options.newElement.parent;
            actionType = "ADD";
        }
        else if (options.type == "ELEMENT_COPIED") {
            element = options.question;
            parentElement = options.question.parent;
            actionType = "COPY";
        }
        else if (options.type == "DO_DROP" && !options.newElement) {
            //alert(options.moveToIndex);
            parentElement = options.moveToParent;
            element = options.target;
            actionType = "REORDER";
        }
        else if (options.type == "OBJECT_DELETED" && !options.newElement) {
            element = options.target;
            parentElement = options.target.parent;
            actionType = "DELETE";
        }
        else if (options.type == "QUESTION_CHANGED_BY_EDITOR") {
            element = options.question;
            parentElement = options.question.parent;
            actionType = "MODIFY";
        }
        else if (options.type == "QUESTION_CONVERTED") {
            console.log("options", options);
            element = options.newValue;
            parentElement = options.newValue.parent;
            actionType = "QUESTION_CONVERTED";
        }
        console.log(actionType, element);

        if (actionType == "ADD") {
            this.isAddModelSubmitting = true;
            /*
            if (options.type == "ELEMENT_COPIED") {
                element.title = element.title + " - Cloned";
                element.nquestion.QuestionID = 0;
            }
            else {
                this.SetDefaultsForControls(element);
            }
            */
            this.SetDefaultsForControls(element);

            var self = this;
            editor.showElementEditor(element, function (isCanceled) {
                if (isCanceled) {
                    if (options.type == "ELEMENT_COPIED") {
                        self.strCurrentOperation = 'COPY';
                    }
                    else {
                        self.strCurrentOperation = 'CANCEL';
                    }
                    editor.deleteElement(element)
                }
            });

        }

        else if (actionType == "MODIFY") {
            // For Survey Edit
            if (element.getType() == "survey") {
                let surveyDetails: NSurveyDetails = {} as any;
                surveyDetails.Title = element.title;
                surveyDetails.isActive = element.isActive;
                surveyDetails.SurveyId = element.surveyid;
                surveyDetails.QuestionNumberingDisabled = editor.survey.showQuestionNumbers == 'off' ? true : false;

                this.onSaveSurveyDetails.emit(surveyDetails);
                console.log(element);
            }
            // For All type of Question
            else {
                var json = this.getSurveyQuestionJSON(element, parentElement);
                json.SurveyElement = element;
                if (this.isAddModelSubmitting) {
                    //ADD QUESTION CASE
                    this.isAddModelSubmitting = false;
                    json.nquestion.QuestionID = 0;
                    //json.SurveyQuestion = element;
                    this.onQuestionAdded.emit(json)
                }
                else {
                    //EDIT QUESTION CASE
                    this.onQuestionModified.emit(json);
                    //alert("Edit Case");
                }
            }

        }
        else if (actionType == "COPY") {
            element.title = element.title + " - Cloned";
            element.nquestion.QuestionID = 0;

            var json = this.getSurveyQuestionJSON(element, parentElement);
            json.SurveyElement = element;
            json.nquestion.QuestionID = 0;
            this.onQuestionAdded.emit(json);
        }
        else if (actionType == "DELETE") {
            editor.allowing = false;
            console.log("element", element);
            //options.allowing = false;
            //options.allowing = options.elementType !== 'page' && options.element.name === 'page1';
            //alert("Delete call");
            var objConteol = element; //? options.question : options.panel;
            var json = new Surveyko.JsonObject().toJsonObject(element);
            console.log("Deleted Question", json);
            if (json.nquestion.QuestionID > 0) {
                this.onQuestionRemoved.emit(json);
            }
        }
        else if (actionType == "REORDER") {
            if (options.moveToIndex != undefined) {
                //var json =  this.getSurveyQuestionJSON(element,parentElement);
                var nDisplayOrder = element.nquestion.DisplayOrder;
                var json = this.getSurveyQuestionJSON(element, parentElement);
                json.nquestion.DisplayOrder = nDisplayOrder;
                if (json.nquestion.DisplayOrder < options.moveToIndex) {
                    json.nquestion.DisplayOrder = options.moveToIndex;
                }
                else {
                    json.nquestion.DisplayOrder = options.moveToIndex + 1;
                }
                this.onQuestionChangeOrder.emit(json);
            }
        }
        else if (actionType = "QUESTION_CONVERTED") {
            var newElement = options.newValue;
            var oldElement = options.oldValue;
            var json = this.getConvertedQuestion(oldElement, newElement);
            json.SurveyElement = element
            this.onQuestionModified.emit(json);
        }
    }
    getConvertedQuestion(oldElement: any, newElement: any) {
        var inputType = newElement.getType();
        var inputType1 = inputType == "checkbox"?"radiogroup":inputType;
        var newAnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType(inputType);

        var json = new Surveyko.JsonObject().toJsonObject(newElement);
        json.type = newElement.getType()
        json.elementId = newElement.id;

        json.questiontype = json.questiontype && json.questiontype != "" ? json.questiontype : json.type;
        console.log(json.nquestion);

        if (json.nquestion) {
            json.nquestion.QuestionType = "single";
            if (inputType == "dropdown") {
                json.nquestion.SelectionModeId = NInfo.SelectionMode.DropDownListSingle;
            }
            else if (inputType == "matrixdropdown") {
                json.nquestion.SelectionModeId = NInfo.SelectionMode.MultiMatrix;
                json.nquestion.QuestionType = "matrix";
            }
            else if (inputType == "html") {
                json.nquestion.SelectionModeId = NInfo.SelectionMode.StaticTextInformation;
            }
            else if (inputType == "checkbox") {
                json.nquestion.SelectionModeId = NInfo.SelectionMode.CheckBoxMultiple;
                if (json.nquestion.LayoutModeId == NInfo.LayoutModeId.Horizontal) {
                    json.colCount = json.nquestion.Answer.length;
                    newElement.colCount = json.nquestion.Answer.length;
                }
            }
            else {
                json.nquestion.SelectionModeId = NInfo.SelectionMode.RadioButtonSingle;
                if (json.nquestion.LayoutModeId == NInfo.LayoutModeId.Horizontal) {
                    json.colCount = json.nquestion.Answer.length;
                    newElement.colCount = json.nquestion.Answer.length;
                }
            }
            if (json.nquestion.Answer && json.nquestion.Answer.length > 0) {
                json.nquestion.Answer.forEach(ans => {
                    if(ans.AnswerTypeId != 2 || inputType == "dropdown")
                    {
                        ans.AnswerTypeId = newAnswerTypeId;
                    }
                    ans._OprationType = 'edit';
                });
            }
        }
        return json
    }


    getSurveyQuestionJSON(element: any, parent: any) {
        var json = new Surveyko.JsonObject().toJsonObject(element);
        json.type = element.getType()
        json.elementId = element.id;

        json.questiontype = json.questiontype && json.questiontype != "" ? json.questiontype : json.type;
        json.nquestion = this.getNQuestionByQuestion(element, parent);
        return json
    }


    doOnQuestionRemoved = (sender, options) => {
        sender.allowing = false;
        /*
        console.log("type", options);
        //options.allowing = false;
        //options.allowing = options.elementType !== 'page' && options.element.name === 'page1';
        //alert("Delete call");
        var objConteol = options.element ? options.element : options.panel;
        var json = new Surveyko.JsonObject().toJsonObject(objConteol);
        console.log("Deleted Question", json);
        this.onQuestionRemoved.emit(json);
        */
    }

    doOnSaveSurvey = () => {
        console.log(JSON.stringify(this.editor.text));
        this.surveySaved.emit(JSON.parse(this.editor.text));
    }
    getNQuestionByQuestion(question: any, parent: any): NQuestion {
        let returnValue: NQuestion;
        if (question.nquestion) { returnValue = question.nquestion; }
        else { returnValue = {} as NQuestion; }

        returnValue.PageNumber = (parent ? parent.visibleIndex : 0) + 1;

        //if (!(returnValue.DisplayOrder && returnValue.DisplayOrder > 0)) 
        {
            returnValue.DisplayOrder = (parent ? parent.elements.indexOf(question) : 0) + 1;
        }
        //returnValue.QuestionText = (question.title && question.title != '') ? question.title : question.name;
        returnValue.QuestionText = (question.name == question.title) ? '' : question.title;

        returnValue.QuestionType = "single";
        returnValue.isSidebySide = !question.startWithNewLine;
        let inputType: string = question.getType();
        if (inputType == "text" && question.inputType != undefined) {
            inputType = question.inputType;
        }
        if (inputType == "dropdown") {
            returnValue.SelectionModeId = NInfo.SelectionMode.DropDownListSingle;
        }
        else if (inputType == "matrixdropdown") {
            returnValue.SelectionModeId = NInfo.SelectionMode.MultiMatrix;
            returnValue.QuestionType = "matrix";
        }
        else if (inputType == "html") {
            returnValue.SelectionModeId = NInfo.SelectionMode.StaticTextInformation;
            returnValue.QuestionText = question.html;
        }
        else if (inputType == "checkbox"){
            returnValue.SelectionModeId = NInfo.SelectionMode.CheckBoxMultiple;
        }
        else {
            returnValue.SelectionModeId = NInfo.SelectionMode.RadioButtonSingle;
        }

        if (returnValue.QuestionType == "single") {
            if (returnValue.Answer == undefined) {
                returnValue.Answer = [];
            }

            if (question.choices && question.choices.length > 0) {
                //Implement Delete Case Here
                var CurrentIDList = question.choices.map(function (el) { if (el.value) return el.rowid });
                returnValue.Answer.forEach(element => {
                    if (CurrentIDList.indexOf(Number(element.AnswerId)) == -1) {
                        if(element.AnswerTypeId != 2) {
                            element._OprationType = 'delete';
                        }
                    }
                });
                //Check for Add/Modify case
                question.choices.forEach(element => {
                    let ansText: string = '';
                    let ansValue: number = -1;
                    let opType = '';
                    if (typeof (element) == "string") {
                        ansText = element;
                        opType = 'add';
                    }
                    else {
                        var ansIndex = returnValue.Answer.findIndex(a => a.AnswerId == element.rowid);
                        ansText = element.text;
                        if (ansIndex != -1) {
                            opType = 'edit';
                            ansValue = element.value;
                        }
                        else { opType = 'add'; }
                    }
                    if (opType == 'add') {
                        let ans: NAnswer = {} as NAnswer;
                        let inputType1 = inputType == "checkbox"? "radiogroup":inputType;
                        ans.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType(inputType1);
                        ans.Answertext = ansText;
                        ans.AnswerId = -1;
                        ans._OprationType = opType;
                        //if (question.isRequired) { ans.isMandatory = question.isRequired; }
                        if (ans.AnswerTypeId > 0) {
                            returnValue.Answer.push(ans);
                        }
                    }
                    else if (opType == 'edit') {
                        var ans = returnValue.Answer.find(a => a.AnswerId == element.rowid);
                        if (ans) {
                            ans._OprationType = opType;
                            ans.Answertext = ansText;
                        }
                    }
                });
                // If Col Count is 0 or greater Then 1 it will be horizontal
                if (question.colCount != 1) {
                    returnValue.LayoutModeId = NInfo.LayoutModeId.Horizontal;
                }
                else {
                    returnValue.LayoutModeId = NInfo.LayoutModeId.Vertical;
                }
                
                if (question.hasOther && question.hasOther == true) {
                    let eleItem:NAnswer =  returnValue.Answer.filter(t => t.AnswerTypeId == 2)[0];
                    if(eleItem == undefined) {
                        let answer: NAnswer = {} as any;
                        answer.AnswerTypeId = 2;
                        answer.AnswerId = -1;
                        answer.Answertext = question.otherText;
                        answer._OprationType = 'add';
                        //if (question.isRequired) { answer.isMandatory = question.isRequired; }
                        returnValue.Answer.push(answer);
                    }
                    else {
                        eleItem.Answertext =  question.otherText;
                        eleItem._OprationType = 'edit';
                        var idx =returnValue.Answer.findIndex(t => t.AnswerTypeId == 2);
                        var item = returnValue.Answer.slice(idx ,1);
                        if(item.length !=0)
                        {
                            returnValue.Answer.push(item[0]);
                        }
                    }
                }
                else {
                    let eleItem:NAnswer =  returnValue.Answer.filter(t => t.AnswerTypeId == 2)[0];
                    if(eleItem != undefined) {
                        eleItem._OprationType = 'delete';
                    }
                }
            }
            //Sigle Question Without Choice like text and others
            else {
                let answer: NAnswer = {} as any;
                //if (question.isRequired) { answer.isMandatory = question.isRequired; }
                var xmlControlIds = xmlControlList.map(item => item.AnswerTypeId);
                if (xmlControlIds.indexOf(question.answertypeid) > -1) {
                    var arrControl = xmlControlList.filter(a => { return a.AnswerTypeId == question.answertypeid });
                    if (arrControl.length > 0) {
                        inputType = arrControl[0].name;
                    }
                }
                if (inputType != "html") {
                    answer.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType(inputType);
                }
                //FOR EDIT
                if (returnValue.Answer && returnValue.Answer.length > 0) {
                    //FOR DATETIME
                    if (inputType == "datetime") {
                        question.nquestion.LayoutModeId = NInfo.LayoutModeId.Horizontal;
                        // If Already DateTime -> do nothiung
                        if (!(returnValue.Answer.findIndex(t => t.AnswerTypeId == new NSurveyLogic().getAnswerTypeIdByType('text')) > -1
                            && returnValue.Answer.findIndex(t => t.AnswerTypeId == new NSurveyLogic().getAnswerTypeIdByType('datetime')) > -1)) {
                            returnValue.Answer.forEach(ele => {
                                ele._OprationType = 'delete';
                            });
                            if (answer.AnswerTypeId > 0) {
                                answer._OprationType = 'add';
                                answer.DefaultText = '##CurrentDateTime##';
                                returnValue.Answer.push(answer);
                                let answer1: NAnswer = {} as any;
                                answer1._OprationType = 'add';
                                answer1.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('text');
                                answer1.DefaultText = '##CurrentTime##';
                                returnValue.Answer.push(answer1);
                            }
                        }
                        else {
                            //IF Already DateTime Re Set Default text
                            var ans1 = returnValue.Answer.find(t => t.AnswerTypeId == new NSurveyLogic().getAnswerTypeIdByType('datetime'));
                            if(ans1 != undefined) {
                                ans1.DefaultText = '##CurrentDateTime##';
                                ans1._OprationType = 'edit';
                            }
                            var ans2 = returnValue.Answer.find(t => t.AnswerTypeId == new NSurveyLogic().getAnswerTypeIdByType('text'));
                            if(ans2 != undefined) {
                                ans2.DefaultText = '##CurrentTime##';
                                ans2._OprationType = 'edit';
                            }
                            
                        }
                    }
                    else {
                        question.nquestion.LayoutModeId = NInfo.LayoutModeId.Vertical;

                        //if(question.defaultValue && question.defaultValue != "")
                        if (inputType == 'text' && question.placeHolder && question.placeHolder != "") {
                            //EDIT CODE FOR PRESURVEY
                            var arrDefaultTexts = (question.placeHolder + "").split(',');
                            
                            var itemMax = Math.max(arrDefaultTexts.length, returnValue.Answer.length);
                            for (let i = 0; i < itemMax; i++) {
                                if (i < arrDefaultTexts.length) {
                                    if(i >= returnValue.Answer.length) {
                                        let answer1: NAnswer = {} as any;
                                        answer1._OprationType = 'add';
                                        answer1.DefaultText = (arrDefaultTexts[i] + "").trim();
                                        if (i == 0) {
                                            answer1.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('text');
                                        }
                                        else {
                                            answer1.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('hidden');
                                        }
                                        returnValue.Answer.push(answer1);
                                    }
                                    else {
                                        if (i == 0) {
                                            returnValue.Answer[i].AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('text');
                                        }
                                        else {
                                            returnValue.Answer[i].AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('hidden');
                                        }
                                        returnValue.Answer[i].DefaultText = (arrDefaultTexts[i] + "").trim();
                                        returnValue.Answer[i]._OprationType = 'edit';
                                    }
                                }
                                else {
                                    returnValue.Answer[i]._OprationType = 'delete';
                                }
                            }


                            /*
                            for (let i = 0; i < returnValue.Answer.length; i++) {
                                if (i < arrDefaultTexts.length) {
                                    if (i == 0) {
                                        if (returnValue.Answer[i].AnswerTypeId != new NSurveyLogic().getAnswerTypeIdByType('text')) {
                                            returnValue.Answer[i].AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('text');
                                            returnValue.Answer[i].DefaultText = (arrDefaultTexts[i] + "").trim();
                                            returnValue.Answer[i]._OprationType = 'edit';
                                        }
                                    }
                                }
                                else {
                                    returnValue.Answer[i]._OprationType = 'delete';
                                }
                            }
                            if (arrDefaultTexts.length > returnValue.Answer.length) {
                                for (let i = returnValue.Answer.length; i < arrDefaultTexts.length; i++) {
                                    let answer1: NAnswer = {} as any;
                                    answer1._OprationType = 'add';
                                    answer1.DefaultText = (arrDefaultTexts[i] + "").trim();
                                    if (i == 0) {
                                        answer1.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('text');
                                    }
                                    else {
                                        answer1.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('hidden');
                                    }
                                    returnValue.Answer.push(answer1);
                                }
                            }
                            */
                        }
                        else {
                            returnValue.Answer.forEach(ans => {
                                if (ans.DefaultText && ans.DefaultText != "") {
                                    ans.DefaultText = "";
                                    ans._OprationType = 'edit';
                                }
                            });
                            if (returnValue.Answer.length == 1 && returnValue.Answer[0].AnswerTypeId == answer.AnswerTypeId) {
                                // Do Nothing, Because No Change in Type.
                            }
                            else {
                                returnValue.Answer.forEach(ele => {
                                    ele._OprationType = 'delete';
                                });
                                answer._OprationType = 'add';
                                returnValue.Answer.push(answer);
                            }
                        }

                    }
                }
                //FOR ADD CASE
                else {
                    //FOR DATETIME
                    if (inputType == "datetime") {
                        if (answer.AnswerTypeId > 0) {
                            answer.DefaultText = '##CurrentDateTime##';
                            returnValue.Answer.push(answer);
                            let answer1: NAnswer = {} as any;
                            answer1.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('text');
                            answer1.DefaultText = '##CurrentTime##';
                            returnValue.Answer.push(answer1);
                            question.nquestion.LayoutModeId = NInfo.LayoutModeId.Horizontal;
                        }
                    }
                    else {
                        //if(question.defaultValue && question.defaultValue != "")
                        if (inputType == 'text' && question.placeHolder && question.placeHolder != "") {
                            if (inputType != 'text') {
                                question.type = 'text';
                            }
                            var arrDefaultTexts = (question.placeHolder + "").split(',');
                            for (let i = 0; i < arrDefaultTexts.length; i++) {
                                let answer1: NAnswer = {} as any;
                                answer1.DefaultText = arrDefaultTexts[i];
                                if (i == 0) {
                                    answer1.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('text');
                                }
                                else {
                                    answer1.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('hidden');
                                }

                                returnValue.Answer.push(answer1);
                            }
                        }
                        else {
                            if (answer.AnswerTypeId == 0) { 
                                answer.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType('text');
                            }
                            if (answer.AnswerTypeId > 0) {
                                //if(returnValue.Answer == undefined) returnValue.Answer = [];
                                returnValue.Answer.push(answer);
                            }
                        }
                    }
                }
            }
            if (question.isRequired) {
                returnValue.Answer.forEach(answer => {
                    answer.isMandatory = question.isRequired;
                });
            }
        }
        else if (returnValue.QuestionType == "matrix") {
            if (returnValue.Rows == undefined) { returnValue.Rows = []; }
            if (returnValue.Columns == undefined) { returnValue.Columns = []; }

            //Implement Delete Case Here
            var CurrentRowIDList = question.rows.map(function (el) { if (el.rowid != undefined) return el.rowid });
            returnValue.Rows.forEach(row => {
                if (CurrentRowIDList.indexOf(Number(row.RowId)) == -1 && row._OprationType != 'ignore') {
                    row._OprationType = 'delete';
                }
            });
            var CurrentColIDList = question.columns.map(function (el) { if (el.columnid != undefined) return el.columnid });
            returnValue.Columns.forEach(col => {
                if (CurrentColIDList.indexOf(Number(col.ColumnId)) == -1) {
                    col._OprationType = 'delete';
                }
            });

            question.rows.forEach(element => {
                let opType = '';
                var row = returnValue.Rows.find(a => a.RowId == element.rowid);
                if (row == undefined || (row && row._OprationType != 'ignore')) {
                    if (typeof (element) == "string") {
                        opType = 'add';
                    }
                    else {
                        //var ansIndex = returnValue.Rows.findIndex(a=>a.RowId == element.rowid);
                        if (row != undefined) {
                            opType = 'edit';
                        }
                        else { opType = 'add'; }
                    }

                    if (opType == 'add') {
                        let matrixRow: NMatrixRow = {} as any;
                        matrixRow.Name = typeof (element) == "string" ? ' ' : element.text;
                        matrixRow.RowId = 0;
                        matrixRow._OprationType = opType;
                        returnValue.Rows.push(matrixRow);
                    }
                    else if (opType == 'edit') {
                        //var row = returnValue.Rows.find(a=>a.RowId == element.rowid);
                        if (row != undefined) {
                            row._OprationType = opType;
                            row.Name = typeof (element) == "string" ? ' ' : element.text;
                        }
                    }
                }
            });

            question.columns.forEach(element => {
                let opType = '';
                var col = returnValue.Columns.find(a => a.ColumnId == element.columnid);
                if (col == undefined || (col && col._OprationType != 'ignore')) {
                    if (typeof (element) == "string") {
                        opType = 'add';
                    }
                    else {
                        //var ansIndex = returnValue.Columns.findIndex(a=>a.ColumnId == element.columnid);
                        if (col != undefined) {
                            opType = 'edit';
                        }
                        else { opType = 'add'; }
                    }

                    let cellType: string = question.cellType;
                    if (element.cellType != 'default') { 
                        if(element.cellType == 'text') {
                            cellType = element.inputType;
                        }
                        else {
                            cellType = element.cellType; 
                        }
                    }
                    
                    if (opType == 'add') {

                        let matrixCol: NMatrixColumn = {} as any;
                        matrixCol.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType(cellType);
                        matrixCol.Name = typeof (element) == "string" ? ' ' : element.title;
                        matrixCol.ColumnId = 0;
                        matrixCol.isMandatory = false;
                        matrixCol._OprationType = opType;
                        //FOR XML DropDown
                        if (cellType == 'dropdown') {
                            matrixCol.ChoiceList = [];
                            element.choices.forEach(chElement => {
                                let ansText: string = '';
                                //let ansValue: number = -1;
                                if (typeof (chElement) == "string") {
                                    ansText = chElement;
                                }
                                else {
                                    ansText = chElement.text;
                                    //ansValue = chElement.value;
                                }

                                let ans: NAnswer = {} as NAnswer;
                                ans.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType(cellType);
                                ans.Answertext = ansText;
                                ans.AnswerId = -1;
                                if (ans.AnswerTypeId > 0) {
                                    matrixCol.ChoiceList.push(ans);
                                }
                            });
                        }
                        if (matrixCol.AnswerTypeId != 0) {
                            returnValue.Columns.push(matrixCol);
                        }
                    }
                    else if (opType == 'edit') {
                        // DO Nothing if XML Dropdown
                        if (col != undefined && cellType != 'dropdown') {
                            col._OprationType = opType;
                            col.AnswerTypeId = new NSurveyLogic().getAnswerTypeIdByType(cellType);
                            //col.Name  = typeof (element) == "string" ? element : (element.title ? element.title: element.name);
                            col.Name = typeof (element) == "string" ? ' ' : element.title;
                            col.isMandatory = element.isRequired;
                        }
                    }
                    // SurveyJs Not Allow to set Required Validation for perticular Controls
                }
            });
        }
        console.log(returnValue);
        return returnValue;
    }
}

