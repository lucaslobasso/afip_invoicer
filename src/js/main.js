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

async function initAfipConnection() {
    let spinner = $("#page-loader");

    spinner.addClass("is-active");
    await initAfip();
    spinner.removeClass("is-active");
}

function loadPointsOfSale() {
    let input = $("#pointOfSale");

    if (input.length && pointsOfSale && pointsOfSale.length) {
        pointsOfSale.forEach(point => {
            input.append($("<option />", { html: `${point.Nro}: ${point.EmisionTipo}`, value: point.Nro }));
        });

        if (pointsOfSale.length == 1) {
            input.attr("disabled", "");
        }
        else {
            input.removeAttr("disabled");
        }
    }
}

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
            fields.attr("disabled", "");
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

function loadInvoicesListView(elem) {
    let btn = $(elem);

    if (!submitSpinner(btn)) {
        activeWindow.loadFile(path.join(__dirname, 'invoices_list.html'));
    }
    
    submitSpinner(btn, false);
}

function loadGenerateInvoiceView(elem) {
    let btn = $(elem);

    if (!submitSpinner(btn)) {
        activeWindow.loadFile(path.join(__dirname, 'generate_invoice.html'));
    }
    
    submitSpinner(btn, false);
}

function loadConfigurationView(elem) {
    let btn = $(elem);

    if (!submitSpinner(btn)) {
        activeWindow.loadFile(path.join(__dirname, 'configurate.html'));
    }
    
    submitSpinner(btn, false);
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
        orientation     : "bottom",
        minDate         : minDate,
        maxDate         : addDate(new Date(), concept > 1 ? 10 : 5),
        language        : "es"
    });
}

function generateDateRangePicker(elem) {
    return new DateRangePicker(elem[0], {
        autohide        : true,
        todayHighlight  : true,
        orientation     : "bottom",
        minDate         : addDate(new Date(), 0, -2),
        maxDate         : addDate(new Date(), 0, 2),
        language        : "es"
    });
}

function validateDatePicker(amount = 1) {
    if ($(".datepicker").length && $(".datepicker").length < (amount + 1) && !$(".datepicker").hasClass("active")) {
        return true;
    }

    return false;
}

function getDate(date) {
    try {
        let splitted = date.split("/"),
            parsed   = new Date(splitted[2], splitted[1] - 1, splitted[0]);

        return parsed;
    } 
    catch (e) {
        return new Date();
    }
}

function addDate(date, days = 0, months = 0) {
    try {
        return new Date(date.getFullYear(), date.getMonth() + months, date.getDate() + days);
    } catch (e) {
        return new Date();
    }
}

function parseAmount(amount) {
    return (parseFloat(amount)).toLocaleString();
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
