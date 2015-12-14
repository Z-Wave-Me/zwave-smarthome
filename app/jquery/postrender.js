/**
 * POST/PUT data from Alpaca form
 * @returns false
 */
var postRenderAlpaca = function(renderedForm) {

    var $alpaca = $('#alpaca_data');

    //load postRender function from module
    if($alpaca && $alpaca.data('modulePostrender') && !!$alpaca.data('modulePostrender')) {
        eval($alpaca.data('modulePostrender'));

        // call postRender function from module
        if (typeof(modulePostRender) == 'function') {
           modulePostRender();
        }
    }

    $('#btn_module_submit').click(function() {
        var data = postRenderAlpacaData(renderedForm);
        var url = config_data.cfg.server_url + config_data.cfg.api['instances'] + (data.instanceId > 0 ? '/' + data.instanceId : '');
        var type = (data.instanceId > 0 ? 'PUT' : 'POST');
        var sid = $(this).data('sid');
        var lang = $(this).data('lang');
//        console.log(sid)
//        return;
        // submit via ajax
        $.ajax({
            type: type,
            cache: false,
            url: url,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': sid
            },
            data: JSON.stringify(data),
            beforeSend: function() {
                console.log(data);
                return; 
                //$('.module-spinner').show();
            },
            success: function(response) {
                 $('.module-spinner').fadeOut();
                 window.location.replace("#apps");
                 //window.location.reload(true);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                 $('.module-spinner').fadeOut();
                if (xhr.status && xhr.status == 400) {
                    alert(xhr.responseText);
                } else {
                    alert("Something went wrong");
                }
            }
        });
        return false;
    });
};
/**
 * Build form data
 * @returns {Object}
 */
function postRenderAlpacaData(renderedForm) {
    var defaults = ['instanceId', 'moduleId', 'active', 'title', 'description'];
    var alpacaData = {'params': renderedForm.getValue()};
    var formData = $('#form_module').serializeArray();
    var inputData = {};
    $.each(formData, function(k, v) {
        if (defaults.indexOf(v.name) > -1) {
            inputData[v.name] = v.value;
        }

    });
    return $.extend(inputData, alpacaData);
};