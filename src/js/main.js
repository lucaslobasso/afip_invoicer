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

function invalidInput(input, invalid = true) {
    let validation = input.closest(".field").find("p.help");

    if (invalid) {
        input.addClass("is-danger");
        validation.removeClass("is-hidden");
    }
    else {
        input.removeClass("is-danger");
        validation.addClass("is-hidden");
    }

    input.unbind("change.validation").on("change.validation", function() { 
        invalidInput(input, false);
    });
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
