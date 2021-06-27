
$(document).ready(async function() {
    let btn    = $("#generateInvoice"),
        fields = $("#invoice-fields");

    submitSpinner(btn, fields);
    //infoMessage("Conectando con AFIP...");

    await initAfip();

    bindInvoiceButton();
    bindDatePicker();
    updateDatePicker().setDate(new Date(Date.now()));

    submitSpinner(btn, fields, false);
    $(".pageloader").removeClass("is-active");
    //successMessage("Conectado!");
});

function bindInvoiceButton() {
    let btn    = $("#generateInvoice"),
        fields = $("#invoice-fields");

    btn.on("click", async function() {
        if (!submitSpinner(btn, fields) && validateForm()) {
            await generateInvoice();
        }

        submitSpinner(btn, fields, false);
    });
}

function bindDatePicker() {
    let concept     = $("#concept"),
        pointOfSale = $("#pointOfSale");

    concept.on("change", updateDatePicker);
    pointOfSale.on("change", function() {
        updateLastInvoiceDate();
    });
}

function updateDatePicker() {
    let concept   = $("#concept").val(),
        date      = $("#date"),
        oldPicker = $(".datepicker"),
        minDate   = new Date(new Date().setDate(concept > 1 ? new Date().getDate() - 10 : new Date().getDate() - 5));

    if (oldPicker.length) {
        oldPicker.remove();
    }
    
    if (lastInvoiceDate && lastInvoiceDate > minDate) {
        minDate = lastInvoiceDate;
    }

    return generateDatePicker(date, minDate);
}

function validateForm() {
    return validateDatePicker() && validateAmount();
}

function validateDatePicker() {
    if ($(".datepicker").length && $(".datepicker").length < 2 && !$(".datepicker").hasClass("active")) {
        return true;
    }

    return false;
}

function validateAmount() {
    let input  = $("#amount");

    try {
        let value  = input.val(),
            amount = parseInt(value);

        if (amount > 0 && amount < 7500) {
            return true;
        }
    } 
    catch (e) {
        errorMessage(e);
    }

    invalidInput(input);
    return false;
}
