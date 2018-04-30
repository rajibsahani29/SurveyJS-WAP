import * as SurveyEditor from 'surveyjs-editor';
import * as SurveyKo from 'survey-knockout';
import * as widgets from "surveyjs-widgets";
//import { CKEDITOR } from 'ckeditor'


var ckEditorConfig = {
    // justify,font,colorbutton
    extraPlugins: 'justify,font,panelbutton,colorbutton',
    toolbar : [
        { name: 'document', items: [ 'Source'] },
        { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike', 'Subscript', 'Superscript' ] },
        { name: 'paragraph', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' , '-', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote' ] },
		{ name: 'links', items: [ 'Link', 'Unlink' ] },
       
        { name: 'styles', items: [ 'Format', 'Font', 'FontSize' ] },
        { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
        { name: 'insert', items: [ 'Image', 'Table', 'HorizontalRule', 'PageBreak' ] },	
        { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText','-', 'Undo', 'Redo' ] },
		{ name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
       
        
        /*
        { name: 'document', items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
		{ name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
		{ name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
		{ name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
		'/',
		{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
		{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },
		{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
		{ name: 'insert', items: [ 'Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
		'/',
		{ name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
		{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
		{ name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
		*/
    ],
    allowedContent : true,
    autoParagraph : false,
    enterMode: false,
    //toolbarCanCollapse : true,
}

export function initCkEditor(Survey) {
    // UnComment if want to add in Toolbox
    widgets.ckeditor(SurveyKo);
    
    //console.log("window", window);
    window["CKEDITOR"].plugins.addExternal( 'justify', window.location.origin + window.location.pathname + 'assets/ck-addon/justify/', 'plugin.js' );
    window["CKEDITOR"].plugins.addExternal( 'panelbutton', window.location.origin + window.location.pathname + 'assets/ck-addon/panelbutton/', 'plugin.js' );
    window["CKEDITOR"].plugins.addExternal( 'colorbutton', window.location.origin + window.location.pathname + 'assets/ck-addon/colorbutton/', 'plugin.js' );
    window["CKEDITOR"].plugins.addExternal( 'font', window.location.origin + window.location.pathname + 'assets/ck-addon/font/', 'plugin.js' );
    
    var CkEditor_ModalEditor = {
        afterRender: function (modalEditor, htmlElement) {
        
            var editor = window["CKEDITOR"].replace(htmlElement,ckEditorConfig);
            editor.config.autoParagraph = false;
            editor.config.enterMode = window["CKEDITOR"].ENTER_BR;
            
            editor.on("change", function () {
                modalEditor.editingValue = editor.getData();
            });
            editor.setData(modalEditor.editingValue);
        },
        destroy: function (modalEditor, htmlElement) {
            var instance = window["CKEDITOR"].instances[htmlElement.id];
            if (instance) {
                instance.removeAllListeners();
                window["CKEDITOR"].remove(instance);
            }
        }
    };
    
    SurveyEditor.SurveyPropertyModalEditor.registerCustomWidget("html", CkEditor_ModalEditor);
    SurveyEditor.SurveyPropertyModalEditor.registerCustomWidget("text", CkEditor_ModalEditor);

    var questionDef = SurveyEditor.SurveyQuestionEditorDefinition.definition.questionbase;
    //questionDef.tabs.push({name: "title", index: 0});
    //SurveyEditor.defaultStrings.pe.tabs["title"] = "Title";
    var ind = questionDef.properties.indexOf("title");
    if (ind > -1) questionDef.properties.splice(ind, 1);


    /*
    //Modify Question Editor. Remove title from general and add it as a tab.
   
    var questionDef = SurveyEditor.SurveyQuestionEditorDefinition.definition.questionbase;
    questionDef.tabs.push({name: "title", index: 1});
    SurveyEditor.defaultStrings.pe.tabs["title"] = "Title";
    var ind = questionDef.properties.indexOf("title");
    if(ind > -1) questionDef.properties.splice(ind, 1);
    
    */
}

