function AjaxApiFormPrototype(options) {

    this.options = $.extend( this.options, options);

    var obj = this;

    this.options.actionUrl = this.options.$form.data('action');
    this.options.$form.submit(function (event) {

        event.preventDefault();

        obj.submit(event,this)
    })

}
AjaxApiFormPrototype.prototype.options = {
    $form:null,
    actionUrl:null,

    messages:{
        ownerId:'ajax-api-form-messages',
        ownerClass:'ajax-api-form-messages'
    },



    successMessage:{
        addType:'append', //replace
        message:"Наши менеджеры свяжутся с вами",
        ownerId:'ajax-api-form-success-message',
        ownerClass:'ajax-api-form-success-message'
    },

    validation:{
        errorClass:"error",
        requiredClass:"required",
    }

};
AjaxApiFormPrototype.prototype.renderSuccessMessage = function(response){

    var $form = this.options.$form;
    var $messagesOwner = $form.find('#'+this.options.successMessage.ownerId);

    if($messagesOwner.length === 0){
        $messagesOwner = $('<div>').attr('id',this.options.successMessage.ownerId).addClass(this.options.successMessage.ownerClass);


        if(this.options.successMessage.addType === 'replace'){
            $form.replaceWith($messagesOwner);
        }
        else{
            $form.prepend($messagesOwner);
        }

    }


    $messagesOwner.html('');
    $messagesOwner.show();

    var success;
    if(response.fields.successTpl){
        success = response.fields.successTpl;
    }
    else{
        success = $('<div>').text(this.options.successMessage.message);
    }


    $messagesOwner.html(success)


}
AjaxApiFormPrototype.prototype.renderMessages = function(response){
    var $form = this.options.$form;
    var $messagesOwner = $form.find('#'+this.options.messages.ownerId);

    if($messagesOwner.length === 0){
        $messagesOwner = $('<div>').attr('id',this.options.messages.ownerId).addClass(this.options.messages.ownerClass);
        $form.prepend($messagesOwner);
    }


    $messagesOwner.html('');
    $messagesOwner.hide();
    for( var i = 0;i<response.messages.length;i++){
        var message = response.messages[i];
        $messagesOwner.append($('<div>').text(message));
    }

    if(response.messages.length>0){
        $messagesOwner.show();
    }
};
AjaxApiFormPrototype.prototype.renderClasses = function(response){
    var $form = this.options.$form;


    $form.find('*').removeClass(this.options.validation.errorClass);
    $form.find('*').removeClass(this.options.validation.requiredClass);

    for(var field in response.errors){
        for(var errorType in response.errors[field]){
            var $input = $form.find('[name="'+field+'"]');

            var className =  errorType === 'required'? this.options.validation.requiredClass:this.options.validation.errorClass;
            $input.addClass(className);

        }
    }
};
AjaxApiFormPrototype.prototype.submit = function(e,obj){
   e.preventDefault();

   var $form = this.options.$form;

   var AjaxApiForm = this;

    var values = $form.serializeArray();
    this.options.$form.find('input[type="submit"]').prop('disabled', true);
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: this.options.actionUrl,
        data: values,
        success: function (response) {

            $form.find('input[type="submit"]').prop('disabled', false);
            AjaxApiForm.renderClasses(response)
            AjaxApiForm.renderMessages(response)

            if(response.status){
                AjaxApiForm.renderSuccessMessage(response);
                $form.trigger('reset');
            }

        }
    });

};

 
