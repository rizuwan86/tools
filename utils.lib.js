function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}

function fetching(url, callback) {
    const noop = () => {}

    const custom_fetch = (fetch, {
        onrequest = noop,
        onresponse = noop,
        onresult = noop,
        onbody = [],
    }) => async (input, init) => {
        onrequest(input, init)
        const response = await fetch(input, init)
        onresponse(response)

        for (const handler of onbody) {
            if (handler.match(response)) {
                Promise.resolve(handler.execute(response.clone()))
                    .then((result) => onresult(result))
            }
        }

        return response
    }

    const intercept_fetch = (options) => (unsafeWindow.fetch = custom_fetch(fetch, options))

    intercept_fetch({
        // onrequest: (input, init) => console.log('FETCH CALL', input, init),
        // onresponse: (response) => console.log('FETCH RESPONSE', response),

        onbody: [{
            match: (response) => response.url.startsWith(url),
            execute: (response) => response.json().then((json) => callback(json)),
        }],
    })
}

function xhr(url, data, method, callback) {
    $( document ).ajaxComplete(function( event, xhr, settings ) {
        settings.data = settings.type == 'POST' ? settings.data : '';
        console.log(settings.url.indexOf(url) != -1, settings.data.indexOf(data) != -1);
        if(settings.type == method && settings.url.indexOf(url) != -1 && settings.data.indexOf(data) != -1) {            
            callback(xhr.responseText);
        }
    });
}
