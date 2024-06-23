let orgURLs = {};
let addURL = document.querySelector("#addURL");
let orgURL = document.querySelector("#orgURL");
let btnConvert = document.querySelector("#btnConvert");
let apiVersion = "/api/data/v9.2/";

if (localStorage.getItem("lsOrgURLs") !== null) {
    orgURLs = JSON.parse(localStorage.getItem("lsOrgURLs"));
    renderOrgList();
}

btnConvert.onclick = function () {
    if (!isValidURL(orgURL.value) || orgURL.value === null)
        alert("Please enter a organizaton URL.");
    else {
        debugger;
        document.querySelector("#finalURI").href = orgURL.value + apiVersion + "FetchXMLToSQL(FetchXml=@FetchXml)?@FetchXml='" + editor.getCode().replaceAll("'", "\"") + "'";
        document.querySelector("#finalURI").click();
    }
};

orgURL.onchange = function () {
    if (orgURL.value.length === 0)
        return;
    if (isValidURL(orgURL.value)) {
        var url = new URL(orgURL.value);
        orgURL.value = url.origin;
        // localStorage.setItem("orgURL", orgURL.value);
    } else {
        alert("Please enter a valid URL.");
    }
};

addURL.onclick = function () {
    if (isValidURL(orgURL.value)) {
        debugger;
        var url = new URL(orgURL.value);
        orgURL.value = url.origin;
        let orgName = url.hostname.split('.')[0];
        orgURLs[orgName] = url.origin;
        localStorage.setItem("lsOrgURLs", JSON.stringify(orgURLs));
        renderOrgList(orgName);
    } else {
        alert("Please enter a valid URL.");
    }
};

function isValidURL(str) {
    regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(str)) {
        return true;
    }
    else {
        return false;
    }
}

function onChangeEnv(env) {
    orgURL.value = env.value;
}

function renderOrgList(selectedOrg) {
    let orgs = '';
    for (let [key, value] of Object.entries(orgURLs)) {
        console.log(key, value);
        let checked = selectedOrg == key ? 'checked' : '';
        orgs = orgs + `<input type='radio' onchange="onChangeEnv(this);" name='env' id='${key}' value='${value}' ${checked}> <label class='label-inline' for='${key}' title='${value}'>${key}</label> <br />`;
    }
    document.querySelector("#orgList").innerHTML = orgs;
}

var prettifyXml = function (sourceXml) {
    debugger;
    parseXml(sourceXml);
    if (!isValidXml) {
        alert('Invalid fetchXml!');
        return sourceXml;
    }

    var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
    var xsltDoc = new DOMParser().parseFromString([
        // describes how we want to modify the XML - indent everything
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:strip-space elements="*"/>',
        '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
        '    <xsl:value-of select="normalize-space(.)"/>',
        '  </xsl:template>',
        '  <xsl:template match="node()|@*">',
        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '  </xsl:template>',
        '  <xsl:output indent="yes"/>',
        '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    var xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltDoc);
    var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    var resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
};

function parseXml(fetchXml) {
    debugger;
    var parser = new DOMParser();
    var parsedXml = parser.parseFromString(fetchXml, "text/xml");
    if (parsedXml.documentElement.innerHTML.includes('parsererror')) {
        isValidXml = false;
        console.log("fetchXml is Invalid : " + parsedXml.documentElement.textContent);
    } else {
        isValidXml = true;
        return parsedXml;
    }
}

document.querySelector('#beautify').addEventListener('click', () => {
    debugger;
    var ugly = editor.getCode();
    var prettyXml = prettifyXml(ugly);
    editor.setCode(prettyXml);
});