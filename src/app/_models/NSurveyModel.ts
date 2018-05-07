import { ChildQuestion } from "./NSurveyXmlData";

export class NSurveyLogic {
    
    getAnswerTypeIdByType(_AnswerType: string): number {
        if(NInfo.AnswerType[_AnswerType] != undefined)
        {
            return NInfo.AnswerType[_AnswerType];
        }
        return 0;
    }

    getAnswerTypeByID(_TypeID:number):string {
        try {
            return Object.keys(NInfo.AnswerType).find(key => NInfo.AnswerType[key] === Number(_TypeID));
        }
        catch(ex) {
            return undefined;
        }
    }
}


export class NQuestion {
    SurveyID: number;
    QuestionID: number;
    QuestionText: string;
    PageNumber: number;
    DisplayOrder: number;
    QuestionType: string;
    SelectionModeId:number;
    Answer: NAnswer[];
    ChildQuestion: ChildQuestion[];
    Rows:NMatrixRow[];
    Columns:NMatrixColumn[];
     
    LanguageCode:string;
    ColumnsNumber:number;
    MinSelectionRequired:number;
    MaxSelectionAllowed:number;
    LayoutModeId:number;
    RandomizeAnswers:boolean = false;
    RatingEnabled:boolean = false;
    QuestionPipeAlias:string;
    QuestionIdText:string;
    ShowHelpText:boolean = false;
    Alias:string;
    HelpText:string;
    isSidebySide:boolean = false;
}

export class NAnswer
{
    AnswerId: number;
    AnswerTypeId:number;
    AnswerIDText:string="";
    Answertext: string="";
    DefaultText: string="";
    AnswerAlias: string="";
    AnswerPipeAlias: string="";
    ImageURL: string="";
    isMandatory: boolean = false;
    isRatePart: boolean = false;
    isSelected: boolean = false;
    ScorePoint: number = 0;
    SliderRange: string;
    SliderValue: number=0;
    SliderMin: number=0;
    SliderMax: number=0;
    isSliderAnimate: boolean=false;
    SliderStep: number = 0;
    RegularExpressionId: number = 0;

    _OprationType:string;
}


export class NMatrixRow
{
    RowId: number;
    Name: string;

    _OprationType:string;
}

export class NMatrixColumn
{
    ColumnId: number;
    Name: string;
    Value: string;
    AnswerTypeId: number;
    isMandatory: boolean;
    _OprationType:string;

    ChoiceList?:NAnswer[];
    AnswerType?:NAnswerType;
}

export class NAnswerType
{
    AnswerTypeID: number;
    Description: string;
    TypeAssembly: string;
    TypeNameSpace: string;
    XmlDataSource: string;
    BuiltIn: boolean;
    TypeMode: number;
}

export class NSurveyDetails
{
    SurveyId: number;
    Title:string;
    isActive:boolean;
    QuestionNumberingDisabled:boolean;
}

export let NInfo = {
    AnswerType : {
        text:3,
        date:22,
        datetime:22,
        email:26,
        password:28,     
        range:56,
        comment: 24,
        html:58,
        file:30,
        checkbox:20,
        radiogroup:1,
        dropdown:1,
        matrixdropdown:0,
        signaturepad:102,
        hidden:101,
        editor:31,

        xmlactivitiesofdailyliving:109,
        xmlevaluation:111,
        xmlgradelist:59,
        xmlrelatedcompetencies:106,
        xmlshorttermobjectivearticulation:108,
        xmlshorttermobjectivelanguage:110,
        xmlstatus:107,
        xmlsubjectlist:60,
        xmlcountrylist:4,

    },
    SelectionMode : {
        RadioButtonSingle: 1,
        CheckBoxMultiple: 2,
        DropDownListSingle: 3,
        MultiMatrix: 4,
        StaticTextInformation: 5,
    },
    LayoutModeId: {
        Vertical:1,
        Horizontal:2
    }
}

 
 