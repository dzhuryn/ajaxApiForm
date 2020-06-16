function AjaxApiFormPrototype(options) {
    this.eventListeners = {

    };
    this.options = $.extend({
        $form: null,
        actionUrl: null,
        alwaysAddFieldError:false,

        messages: {
            ownerClass: 'ajax-api-form-messages'
        },
        successMessage: {
            addType: 'append', //replace
            message: "Наши менеджеры свяжутся с вами",
            ownerClass: 'ajax-api-form-success-message'
        },

        validation: {
            errorClass: "error",
            requiredClass: "required",
            errorFieldBlockClass: "ajax-api-form-field-error",
        }

    }, options);



    var obj = this;
    this.options.actionUrl = this.options.$form.data('action');
    this.options.$form.submit(function (event) {
        event.preventDefault();
        obj.submit(event, this)
    })

}

AjaxApiFormPrototype.prototype.addEventListener = function (eventName,callback) {

    if(!this.eventListeners[eventName]){
        this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
}

AjaxApiFormPrototype.prototype.invokeEvent = function (eventName,...params) {
    if(this.eventListeners[eventName]){
        for(var i=0;i<this.eventListeners[eventName].length;i++){
            var callback = this.eventListeners[eventName][i];
            callback.call(this, ...params);

        }
    }
};


AjaxApiFormPrototype.prototype.hideSuccessMessage = function () {
    var $form = this.options.$form;
    var $messagesOwner = $form.find('.' + this.options.successMessage.ownerClass);
    $messagesOwner.hide();

}
AjaxApiFormPrototype.prototype.renderSuccessMessage = function (response) {

    var $form = this.options.$form;
    var $messagesOwner = $form.find('.' + this.options.successMessage.ownerClass);

    if ($messagesOwner.length === 0) {
        $messagesOwner = $('<div>').addClass(this.options.successMessage.ownerClass);
    }

    $messagesOwner.show()
    if (this.options.successMessage.addType === 'replace') {
        $form.replaceWith($messagesOwner);
    } else {
        $form.prepend($messagesOwner);
    }


    $messagesOwner.html('');
    $messagesOwner.show();

    var success;
    if (response.fields.successTpl) {
        success = response.fields.successTpl;
    } else {
        success = $('<div>').text(this.options.successMessage.message);
    }
    $messagesOwner.html(success)


}
AjaxApiFormPrototype.prototype.renderMessages = function (response) {
    var $form = this.options.$form;
    var $messagesOwner = $form.find('.' + this.options.messages.ownerClass);

    if ($messagesOwner.length === 0) {
        $messagesOwner = $('<div>').addClass(this.options.messages.ownerClass);
        $form.prepend($messagesOwner);
    }

    $messagesOwner.html('');
    $messagesOwner.hide();
    for (var i = 0; i < response.messages.length; i++) {
        var message = response.messages[i];
        $messagesOwner.append($('<div>').text(message));
    }

    if (response.messages.length > 0) {
        $messagesOwner.show();
    }
};
AjaxApiFormPrototype.prototype.renderFieldErrorMessage = function (response) {
    var $form = this.options.$form;

    var errorBlockClass = this.options.validation.errorFieldBlockClass;

    $form.find('.'+errorBlockClass).hide();

    for (var field in response.errors) {
        for (var errorType in response.errors[field]) {
            var $input = $form.find('[name="' + field + '"]');
            var $errorBlock = $form.find('.'+errorBlockClass+'.'+errorBlockClass+'-'+field);

            if($input.length !== 0 && $errorBlock.length === 0 && this.options.alwaysAddFieldError === true){
                $errorBlock = $('<div></div>').addClass(errorBlockClass).addClass(errorBlockClass+'-'+field);
                $input.after($errorBlock);
            }
            if($errorBlock.length){
                $errorBlock.show();
                $errorBlock.text(response.errors[field][errorType])
            }

        }
    }
};

AjaxApiFormPrototype.prototype.renderClasses = function (response) {
    var $form = this.options.$form;


    $form.find('*').removeClass(this.options.validation.errorClass);
    $form.find('*').removeClass(this.options.validation.requiredClass);

    for (var field in response.errors) {
        for (var errorType in response.errors[field]) {
            var $input = $form.find('[name="' + field + '"]');

            var className = errorType === 'required' ? this.options.validation.requiredClass : this.options.validation.errorClass;
            $input.addClass(className);

        }
    }
};
AjaxApiFormPrototype.prototype.submit = function (e, obj) {
    e.preventDefault();

    var $form = this.options.$form;

    var formId = $form.attr('id');

    var data = new FormData(document.getElementById(formId));


    var AjaxApiForm = this;
    this.options.$form.find('input[type="submit"]').prop('disabled', true);
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: this.options.actionUrl,
        processData: false,
        contentType: false,
        data: data,
        success: function (response) {
            //

           $form.find('input[type="submit"]').prop('disabled', false);
           AjaxApiForm.renderClasses(response);
           AjaxApiForm.renderMessages(response);
            AjaxApiForm.renderFieldErrorMessage(response);
            AjaxApiForm.hideSuccessMessage();

            if (response.status) {
                AjaxApiForm.renderSuccessMessage(response);
                $form.trigger('reset');

                AjaxApiForm.invokeEvent('afterSuccess')
            }

        }
    });

};

 
