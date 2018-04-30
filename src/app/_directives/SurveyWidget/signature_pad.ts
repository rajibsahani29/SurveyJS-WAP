import * as SurveyEditor from 'surveyjs-editor';
import * as widgets from "surveyjs-widgets";
import SignaturePad from "signature_pad";

export function initSignaturePad(Survey) {
  widgets.signaturepad(Survey);

  /*
  var SignaturePad_ModalEditor = {
    name: "signature_pad",
    htmlTemplate: "<canvas class='signature'></canvas>",
    isFit : function(question) { return question["renderAs"] === 'signature_pad'; },
    afterRender: function(question, el) {
        var elS = el.querySelector("canvas");
        var me = this;
        me.signaturePad = new SignaturePad(elS);
        me.signaturePad.penColor = "#1ab394";
        me.signaturePad.fromDataURL(question.value);
        if(question.isReadOnly) {
          me.signaturePad.off();
        }
        me.signaturePad.onEnd = function() {
          var data = me.signaturePad.toDataURL();
          question.value = data;
        }
    },
    willUnmount: function(question, el) {
        this.signaturePad.off();
    }
  }
   
  Survey.CustomWidgetCollection.Instance.addCustomWidget(SignaturePad_ModalEditor);    
  Survey.JsonObject.metaData.addProperty("text", {name: "renderAs", default: "standard", choices: ["standard", "signature_pad"]});
  */
}

