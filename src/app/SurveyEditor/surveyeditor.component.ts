import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NSurveyService } from '../_services/nsurvey.service'
import { NSurveyLogic, NQuestion, NAnswer, NInfo, NMatrixColumn, NMatrixRow, NSurveyDetails } from '../_models/NSurveyModel';
import { NSurveyXmlData } from '../_models/NSurveyXmlData'
import { SurveyJSData, IMatrixColumn, IMatrixRow } from '../_models/SurveyJSJsonData'
import { forEach } from '@angular/router/src/utils/collection';
import { jsonpFactory } from '@angular/http/src/http_module';
import { DOCUMENT } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { promise } from 'selenium-webdriver';
//import { SurveyEditor } from 'surveyjs-editor';
import { SurveyEditorDirectiveComponent } from '../_directives/surveyEditor.directive';
import { Survey } from 'survey-knockout';
import { UrlConfig } from '../app.setting';

//import { NotificationsService } from 'angular2-notifications';

let urlSetting: UrlConfig = new UrlConfig(window);
@Component({
  selector: 'SurveyJs',
  templateUrl: 'surveyeditor.component.html',
  styleUrls: ['surveyeditor.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [NSurveyService]
})
export class SurveyEditorComponent implements OnInit {
  @ViewChild(SurveyEditorDirectiveComponent) surveyRef: SurveyEditorDirectiveComponent;
  surveyID: number;
  surveyTitle: string;
  LanguageCode: string;
  str: string;   
  ostr: string;  
  key: number;   
  pos: number;   
  surveyData: SurveyJSData = new SurveyJSData();
  json: any;
  SurveyGuid: string;
  backUrl: string;
  isLoading: boolean = false;

  public options = {
    position: ["bottom", "left"],
    timeOut: 5000,
    lastOnBottom: true
  }

  lstLayoutCSS: any[] = [{ text: '-1', value: '-Select-', selected: true }];
  LayoutFormData: any = this.getDefaultLayoutFormData();
  UploadFileContent: FormData;
 
  @ViewChild('fuUploadCSS') selectedFile: any;
  
  //private _notificationsService: NotificationsService, 
  constructor(@Inject(DOCUMENT) private document: any, private activatedRoute: ActivatedRoute, private surveyService: NSurveyService) {
    let tempUrl: string = document.location.href;
    tempUrl = tempUrl.replace('Survey/', '');
    this.backUrl = tempUrl.substr(0, tempUrl.indexOf('editor/')) + "form";
    console.log("backUrl", this.backUrl);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      //this.surveyID = params['surveyID'];
      this.str = params['surveyID']; 
      this.key = 146;
      this.pos = 0;
      this.ostr = '';
      while (this.pos < this.str.length) {
        this.ostr = this.ostr + String.fromCharCode(this.key ^ this.str.charCodeAt(this.pos));
        this.pos += 1;
      }
      this.surveyID = Number(this.ostr);
      this.getSurveyXml(this.surveyID);  
    });
    

    // this.getLanguageDetails().then(
    //   (data) => { console.log(data); },
    //   (err) => { console.log(err); }
    // );

  }
  getDefaultLayoutFormData() {
    this.UploadFileContent = null;
    return {
      LayoutCss: "-1",
      EditCss: '',
      HeaderTemplate:'',
      FooterTemplate:'',
      
      isEditCss: false,
      ErrorMessage :'',
      ErrorMessageUpload:'',
      SuccessMessage:'',
      SuccessUploadMessage:'',

    };
  }
  resetDefaultLayoutFormData() {
    this.UploadFileContent = null;
    this.selectedFile.nativeElement.value = "";
    if(this.LayoutFormData)
    {
      this.LayoutFormData.EditCss = '';
      this.LayoutFormData.isEditCss= false;
      this.LayoutFormData.ErrorMessage ='';
      this.LayoutFormData.ErrorMessageUpload = '';

      this.LayoutFormData.SuccessMessage = '';
      this.LayoutFormData.SuccessUploadMessage = '';
    }
  }

  getSurveyXml(SurveyID: number) {
    this.isLoading = true;
    let nSurveyJson = new NSurveyXmlData();
    this.surveyService.getSurveyXml(SurveyID).then(
      (xmlData) => {
        if (xmlData != undefined) {
          this.getSurveyDetails(nSurveyJson, xmlData);
        }
        else {
          alert("No Data Found");
        }
      },
      (err) => {
        this.isLoading = false;
        this.showError(err);

      }
    );
  }

  getSurveyDetails(nSurveyJson: any, xmlData: any) {
    this.surveyService.getSurveyDetails(this.surveyID).then(
      (data) => {
        this.isLoading = false;
        console.log(data.json());
        this.SurveyGuid = data.json();
        let strSurveyGuid: string = data.json();

        nSurveyJson.loadData(xmlData);
        if (!nSurveyJson.survey) {
          nSurveyJson.survey = {} as any;
        }
        else if (!nSurveyJson.survey.question) {
          nSurveyJson.survey.question = [];
        }

        nSurveyJson.survey.question.sort(function (a, b) { return Number(a._DisplayOrder) - Number(b._DisplayOrder) });
        nSurveyJson.survey.SurveyID = this.surveyID;

        this.surveyData.loadNSurvey(nSurveyJson);
        this.surveyData.SurveyJson.SurveyGUID = strSurveyGuid;
        this.json = this.surveyData.SurveyJson;
        this.surveyTitle = nSurveyJson.survey.Title;

        console.log("nSurveyJson", nSurveyJson);
        console.log("SurveyJson", this.surveyData);
      },
      (err) => {
        this.isLoading = false;
        this.showError(err);
      });
  }

  questionAdded(question) {
    console.log("Add Question", question);
    let objQuestion: NQuestion = question.nquestion;
    objQuestion.SurveyID = this.surveyID;
    console.log("objQuestion", objQuestion);
    //if (objQuestion.Answer.length > 0 || objQuestion.SelectionModeId > 0) 
    {
      this.isLoading = true;
      this.surveyService.createQuestion(objQuestion).then(
        (data) => {
          this.isLoading = false;
          if (data.status == 200) {
            this.updateReturnValueAfterAddEdit(question, data)
          }
          else {
            alert("Error adding new question");
          }
        },
        (err) => {
          this.isLoading = false;
          this.showError(err);
        }
      );
    }
  }

  questionModified(question) {
    console.log("Update Question", question);
    let objQuestion: NQuestion = question.nquestion;
    objQuestion.SurveyID = this.surveyID;

    //if (objQuestion.Answer.length > 0 || objQuestion.SelectionModeId > 0) 
    {
      this.isLoading = true;
      this.surveyService.updateQuestion(objQuestion).then(
        (data) => {

          this.isLoading = false;
          if (data.status == 200) {
            this.updateReturnValueAfterAddEdit(question, data);
          }
          else {
            alert("Error adding new question");
          }
        },
        (err) => {
          this.showError(err);
        }
      );
    }
  }

  updateReturnValueAfterAddEdit(question, data) {
    var surveyQuestion = question.SurveyElement;
    var retValue: NQuestion = data.json();

    if (retValue.Answer && retValue.Answer.length > 0) {
      var index = retValue.Answer.length - 1;
      while (index >= 0) {
        if (retValue.Answer[index]._OprationType === 'delete') {
          retValue.Answer.splice(index, 1);
        }
        else {
          retValue.Answer[index]._OprationType = "";
        }
        index -= 1;
      }
    }
    if (retValue.Rows && retValue.Rows.length > 0) {
      var index = retValue.Rows.length - 1;
      while (index >= 0) {
        if (retValue.Rows[index]._OprationType === 'delete') {
          retValue.Rows.splice(index, 1);
        }
        else {
          retValue.Rows[index]._OprationType = "";
        }
        index -= 1;
      }
      if (retValue.Rows.length == surveyQuestion.rows.length) {
        surveyQuestion.rows.forEach((rw, idx) => {
          rw.rowid = retValue.Rows[idx].RowId;
        });
      }
       
    }

    if (retValue.Columns && retValue.Columns.length > 0) {
      var index = retValue.Columns.length - 1;
      while (index >= 0) {
        if (retValue.Columns[index]._OprationType === 'delete') {
          retValue.Columns.splice(index, 1);
        }
        else {
          retValue.Columns[index]._OprationType = "";
        }
        index -= 1;
      }
      if (retValue.Columns.length == surveyQuestion.columns.length) {
        surveyQuestion.columns.forEach((rw, idx) => {
          rw.columnid = retValue.Columns[idx].ColumnId;
       
        });
      }
    }
    if (question.choices && question.choices.length > 0) {
      // FOR CHOICE TYPE QUESTION
      if (surveyQuestion.choices.length <= retValue.Answer.length) {
        surveyQuestion.choices.forEach((rw, idx) => {
          rw.rowid = retValue.Answer[idx].AnswerId;
        });
      }
    }
    else {
      // FOR OTHER THAN CHOICE IN SINGLE
    }


    //question.choices
    question.nquestion.QuestionID = retValue.QuestionID;
    question.nquestion.Answer = retValue.Answer;
    question.nquestion.Rows = retValue.Rows;
    question.nquestion.Columns = retValue.Columns;

    question.questionid = retValue.QuestionID;
    question.SurveyElement.questionid = retValue.QuestionID;

    console.log("Updated", question.nquestion);
  }


  questionOrderChanged(question) {
    let nQue: NQuestion = question.nquestion;
    console.log("nQue", nQue);
    this.isLoading = true;
    this.surveyService.changeQuestionDisplayOrder(nQue.QuestionID, nQue.DisplayOrder).then(
      (data) => {
        this.isLoading = false;
        //alert("Added" + data);
      },
      (err) => {
        this.isLoading = false;
        this.showError(err);
      }
    );
  }

  questionDeleted(question) {
    console.log(question);
    let QuestionId: number = question.questionid ? question.questionid : 0;
    if (QuestionId > 0) {
      this.isLoading = true;
      this.surveyService.deleteQuestion(QuestionId).then(
        (data) => {
          this.isLoading = false;
          ///alert("delete")
        },
        (err) => {
          this.showError(err);
        }
      );
    }
  }

  surveySaved(survey) {
    this.json = survey;
  }


  saveSurveyDetails(surveyDetails:NSurveyDetails)
  {
    if (surveyDetails.SurveyId > 0 && surveyDetails.Title.length > 0) {
      this.isLoading = true;
      this.surveyService.updateSurveyDetails(surveyDetails).then(
        (data) => {
          this.isLoading = false;
          this.surveyTitle = surveyDetails.Title;
        },
        (err) => {
          this.showError(err);
        }
      );
    }
    else
    {
      alert("Please enter survey title.");
    }
    
    
  }




  LayoutButton_Click(data) {
    //this.LayoutFormData = this.getDefaultLayoutFormData();
    this.resetDefaultLayoutFormData();
    this.getLayoutData();
  }

  getLayoutData() {
    this.isLoading = true;
    this.surveyService.getSurveyTemplateCSS(this.surveyID, "").then(
      (data) => {
        this.isLoading = false;
        var Responce = data.json();
        this.lstLayoutCSS = Responce.lstCSSFiles;
        var item = this.lstLayoutCSS.find(t => t.selected == true);
        if (item) {
          this.LayoutFormData.LayoutCss = item.value;
        }
        $("#modalLayout").modal("show");
      },
      (err) => {
        this.isLoading = false;
        this.showError(err);
      });
  }

  EditCSS_click() {

    /*
    this._notificationsService.success(
      'Some Title',
      'Some Content',
      {
          timeOut: 5000,
          showProgressBar: true,
          pauseOnHover: false,
          clickToClose: false,
          maxLength: 10
      }
    )
    */

    this.resetDefaultLayoutFormData();
    if (this.LayoutFormData.LayoutCss != "-1") {
      this.isLoading = true;
      this.surveyService.getCSSContent(this.surveyID, this.LayoutFormData.LayoutCss).then(
        (data) => {
          this.isLoading = false;
          this.LayoutFormData.isEditCss = true;
          this.LayoutFormData.EditCss = data.json().data;
          //console.log(data.json())
        },
        (error) => {
          this.isLoading = false;
          this.LayoutFormData.EditCss = "";
          this.showError(error);
        },
      );
    }
    else {
      this.LayoutFormData.EditCss = "";
      this.LayoutFormData.ErrorMessage = "Please select css file.";
      //alert("Please select css file.");
    }
  }

  EdirCancel_click(){
    this.resetDefaultLayoutFormData();
  }
  SaveEditCSS_click()
  {
    if (this.LayoutFormData.LayoutCss != "-1") {
      this.isLoading = true;

      var objSurveyLayout = {
        SurveyId: this.surveyID,
        SelectedFile: this.LayoutFormData.LayoutCss,
        FileContent  : this.LayoutFormData.EditCss,
        
      };
      this.surveyService.saveSurveyCSS(objSurveyLayout).then(
        (data) => {
          this.isLoading = false;
          this.resetDefaultLayoutFormData();
          this.LayoutFormData.SuccessMessage = "Save Success.!";
        },
        (error) => {
          this.isLoading = false;
          this.LayoutFormData.EditCss = "";
          this.LayoutFormData.ErrorMessage = "Something went wrong, Please try again !";
          this.showError(error);
        },
      );
    }
    else {
      this.LayoutFormData.EditCss = "";
      this.LayoutFormData.ErrorMessage = "No file selected for update.";
      //alert("Please select css file.");
    }
  }

  DeleteCSS_click() {
    if(confirm("Are you sure want to delete ?")) 
    {
      //this.resetDefaultLayoutFormData();
      if (this.LayoutFormData.LayoutCss != "-1") {
        this.isLoading = true;
        this.surveyService.deleteSurveyCSS(this.surveyID, this.LayoutFormData.LayoutCss).then(
          (data) => {
            //this.LayoutFormData = this.getDefaultLayoutFormData();
            this.resetDefaultLayoutFormData();
            this.getLayoutData();
            this.LayoutFormData.SuccessMessage = "Delete Success.!";
          },
          (error) => {
            this.isLoading = false;
            this.showError(error);
          },
        );
      }
      else {
        this.LayoutFormData.EditCss = "";
        this.LayoutFormData.ErrorMessage = "Please select css file.";
        //alert("Please select css file.");
      }
    }
  }

  DownloadCSS_click() {
    this.resetDefaultLayoutFormData();
    if (this.LayoutFormData.LayoutCss != "-1") {
      this.isLoading = true;
      this.surveyService.getCSSContent(this.surveyID, this.LayoutFormData.LayoutCss).then(
        (data) => {
          this.isLoading = false;
          this.downloadFile(data.json().data, this.LayoutFormData.LayoutCss);
        },
        (error) => {
          this.isLoading = false;
          this.showError(error);
        },
      );
    }
    else {
      this.LayoutFormData.EditCss = "";
      this.LayoutFormData.ErrorMessage = "Please select css file.";
      //alert("Please select css file.");
    }
  }
  downloadFile(data: Response, fileName: string) {
    var a = document.createElement("a");
    var blob = new Blob([data], { type: "octet/stream" }),
      url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    /*
    var blob = new Blob([data], { type: 'text/csv' });
    var url= window.URL.createObjectURL(blob);
    window.open(url);
    */
  }


  onChangeCSS(e) {
    this.resetDefaultLayoutFormData();
  }

  SaveLayout_click() {
     
    this.LayoutFormData.EditCss = '';
    this.LayoutFormData.isEditCss = false;
 
      this.isLoading = true;

      var objSurveyLayout = {
        SurveyId: this.surveyID,
        SelectedFile: this.LayoutFormData.LayoutCss,
        HeaderTemplate:this.LayoutFormData.HeaderTemplate,
        FooterTemplate:'',

      };
      this.surveyService.saveSurveyLayout(objSurveyLayout).then(
        (data) => {
          this.isLoading = false;
          this.resetDefaultLayoutFormData();
          this.LayoutFormData.SuccessMessage = "Save Success.!";
        },
        (error) => {
          this.isLoading = false;
          this.LayoutFormData.EditCss = "";
          this.LayoutFormData.ErrorMessage = "Something went wrong, Please try again !";
          this.showError(error);
        },
      );
    
  }

  Upload_click() {
    this.isLoading = true;
    if (this.UploadFileContent && this.UploadFileContent.has("uploadFile")) {
      this.UploadFileContent.append('SurveyId', this.surveyID.toString());

      this.surveyService.uploadSurveyCSS(this.UploadFileContent).then(
        (data) => {
          //this.LayoutFormData = this.getDefaultLayoutFormData();
          this.getLayoutData();
          this.resetDefaultLayoutFormData();
          this.LayoutFormData.SuccessUploadMessage = "File Upload Success.!";
        },
        (err) => {
          this.isLoading = false;
          //this.showError(err); 
        },
      )
    }
  }

  fileChange(event) {
    this.UploadFileContent = new FormData();
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      this.UploadFileContent.append('uploadFile', file, file.name);
      let headers = new Headers();
    }
  }

  // getLanguageDetails() {
  //   const promise = new Promise((resolve, reject) => {
  //     this.surveyService.getLanguageList(this.surveyID).subscribe(
  //       data => {
  //         resolve(data);
  //       },
  //       error => {
  //         reject(error);
  //       }
  //     )
  //   })
  //   return promise;
  // }

  showError(error) {
    if (error.ok == false) {
      if (error.status == 0) {
        alert("Connection Error");
      }
      else {
        alert(error.status + " : " + error.statusText);
      }
    }
    else {
      throw error;
    }

  }
}
