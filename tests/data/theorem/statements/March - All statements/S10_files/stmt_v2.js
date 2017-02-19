/* $Id: stmt_v2.js,v 1.1 2013/09/04 20:15:51 mgibbons Exp $ */

function printStmt () {
	window.print ( );
}

function showTable(bodyDiv) {
    if (bodyDiv != null) {
        bodyDiv.style.display = 'block';
        bodyDiv.style.position = '';
    }
}

function hideTable(bodyDiv) {
    if (bodyDiv != null) {
        bodyDiv.style.display = 'none';
        bodyDiv.style.position = 'absolute';
    }
}

function openSection(headingDiv) {
    if (headingDiv != null) {
	headingDiv.className = "sectionHeadingOpened";
    }
}

function closeSection(headingDiv) {
    if (headingDiv != null) {
	headingDiv.className = "sectionHeadingClosed";
    }
}

function showHide(bodyDiv, headingDiv) {
    if (document.getElementById(bodyDiv).style.display == "none") {
 	openSection(document.getElementById(headingDiv));
 	showTable(document.getElementById(bodyDiv));
    } else {
        closeSection(document.getElementById(headingDiv));
        hideTable(document.getElementById(bodyDiv));
    }
}

function expand_contract_all (showOrHide) { 
    for (var i=0; i < document.getElementsByTagName('div').length; i++) {
        if (((document.getElementsByTagName('div')[i].id ).indexOf("sec") >= 0)) {
	    if (showOrHide == 1) {
                openSection(document.getElementsByTagName('div')[i]);
            } else {
                closeSection(document.getElementsByTagName('div')[i]);
            }
        }

        if (((document.getElementsByTagName('div')[i].id ).indexOf("tbl") >= 0)) {
	    if (showOrHide == 1) {
                showTable(document.getElementsByTagName('div')[i]);
            } else {
                hideTable(document.getElementsByTagName('div')[i]);
            }
        }
    }
}

function openWin (url) {
    newWindow = window.open(url, 'popUp', 'height=400, width=650, scrollbars=yes');
    if (window.focus) {
        newWindow.focus();
    }
    return false;
}