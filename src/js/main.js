const { promises: fs, constants } = require('fs');
const electron   = require('@electron/remote');
const path       = require('path');
const assestPath = electron.app.getPath("userData");

window.$ = window.jQuery = require('jquery');

bulmaToast.setDefaults({
    type: 'is-danger',
    duration: 3000,
    pauseOnHover: true,
    dismissible: true,
    closeOnClick: false,
    animate: { in: 'fadeIn', out: 'fadeOut' }
});

function successMessage(msg) {
    bulmaToast.toast({ message: msg.toString(), type: 'is-success' });
}

function errorMessage(msg) {
    bulmaToast.toast({ message: msg.toString() });
    console.log(msg);
}

function infoMessage(msg) {
    bulmaToast.toast({ message: msg.toString(), type: 'is-info' });
}

function submitSpinner(btn, fields, loading = true) {
    if (loading) {
        if (btn.hasClass("is-loading")) {
            return true;
        }

        if (fields) {
            fields.attr("disabled", "");
        }
        btn.addClass("is-loading");
    }
    else {
        if (fields) {
            fields.removeAttr("disabled");
        }
        btn.removeClass("is-loading");
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

function generateDatePicker(elem, minDate) {
    let concept = $("#concept").val();

    return new Datepicker(elem[0], {
        autohide        : true,
        todayHighlight  : true,
        minDate         : minDate,
        maxDate         : new Date(new Date().setDate(concept > 1 ? new Date().getDate() + 10 : new Date().getDate() + 5)),
        language        : "es"
    });
}

function getDate(date) {
    try {
        let splitted = date.split("/"),
            parsed   = new Date(splitted[2], splitted[1] - 1, splitted[0]);

        return parsed;
    } 
    catch (e) {
        return null;
    }
}

async function getCuit() {
    let cuit;

    await fs.readFile(path.join(assestPath, "cuit.txt"), "utf-8").then((data, err) => {
        if (!err) {
            cuit = data;
        }
    });

    return cuit;
}

function getFileName(filePath) {
    return filePath.replace(/^.*[\\\/]/, '');
}

function getFileExtension(fileName) {
    return fileName.split('.').pop();
}
