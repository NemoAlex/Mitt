var mitt = {};
mitt.runtimeReqs = {};
mitt.catchedReqs = [];

(function initChromeListeners() {
  chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    mitt.runtimeReqs[details.requestId] = {
      requestHeaders: details.requestHeaders
    };
  },
  {urls: ["<all_urls>"], types: ["main_frame", "sub_frame"]},
  ["blocking", "requestHeaders"]);

  chrome.webRequest.onHeadersReceived.addListener(function(details) {
    var cType = details.responseHeaders.filter(function(el) { return el.name == 'Content-Type'; })[0];
    var req = mitt.runtimeReqs[details.requestId];
    if (
      cType 
        && !~cType.value.indexOf('text/') 
      && !~cType.value.indexOf('image/')
      && !~cType.value.indexOf('message/')
    ) {
      req.responseHeaders = details.responseHeaders;
      req.url = details.url;
      catchRequest(req);
      delete mitt.runtimeReqs[details.requestId];
      //return {cancel: true};
    }
    else delete mitt.runtimeReqs[details.requestId];
  },
  {urls: ["<all_urls>"], types: ["main_frame", "sub_frame"]},
  ["blocking", "responseHeaders"]);
})();

function catchRequest(req) {
  mitt.catchedReqs.push(req);
  console.log(handleHeaders(req.requestHeaders, 'wget'));
}

function handleHeaders(headers, clientName) {
  var str = '';
  if (clientName == 'axel') {
    headers.forEach(function(el) {
      str = str + " -H \""
      + el.name
      + ": "
      + el.value
      + "\"";
    });
  }
  else if (clientName == 'wget') {
    headers.forEach(function(el) {
      str = str + " --header=\""
      + el.name
      + ": "
      + el.value
      + "\"";
    });
  }
  return str;
}
