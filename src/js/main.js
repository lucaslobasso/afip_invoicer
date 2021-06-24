const { promises: fs }  = require('fs');
const electron          = require('@electron/remote');
const path              = require('path');
const assestPath        = electron.app.getPath("userData");

window.$ = window.jQuery = require('jquery');

function elemLoading(elem, loading = true) {
    if (loading) {
        if (elem.hasClass("is-loading")) {
            return true;
        }

        elem.addClass("is-loading");
    }
    else {
        elem.removeClass("is-loading");
    }

    return false;
}

async function getCuit() {
    let cuit;

    try {
        cuit = await fs.readFile(path.join(assestPath, "cuit.txt"), { encoding: "utf8" });
    } catch (e) {
        console.log(e);
    }

    return cuit;
}

function getFileName(filePath) {
    return filePath.replace(/^.*[\\\/]/, '');
}

function getFileExtension(fileName) {
    return fileName.split('.').pop();
}
