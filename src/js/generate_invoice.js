
$(document).ready(async function() {
    let btn    = $("#generateInvoice"),
        fields = $("#invoice-fields");

    submitSpinner(btn, fields);
    await initAfipConnection();
    bindDatePicker();
    updateDatePicker().setDate(new Date(Date.now()));
    submitSpinner(btn, fields, false);
});

async function generateInvoice(elem) {
    let btn    = $(elem),
        fields = $("#invoice-fields");

    if (!submitSpinner(btn, fields) && validateForm()) {
        await generateAfipInvoice();
        updateDatePicker();
    }

    submitSpinner(btn, fields, false);
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
        minDate   = addDate(new Date(), concept > 1 ? -10 : -5);

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

function validateAmount() {
    let input  = $("#amount");

    try {
        let value  = input.val(),
            amount = parseFloat(value);

        if (amount > 0 && amount < 7600) {
            return true;
        }
    } 
    catch (e) {
        errorMessage(e);
    }

    invalidInput(input);
    return false;
}
