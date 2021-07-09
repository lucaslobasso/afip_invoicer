
$(document).ready(async function() {
    let btn    = $("#loadMore"),
        fields = $("#invoice-fields");

    submitSpinner(btn, fields);
    await initAfipConnection();
    bindPointOfSale();
    updateDateRangePicker().setDates(addDate(new Date(), -1), new Date());
    submitSpinner(btn, fields, false);
    await searchInvoices();
});

function bindPointOfSale() {
    let input  = $("#pointOfSale"),
        search = $("#searchInvoices"),
        fields = $("#invoice-fields");

    input.on("change", async function() {
        submitSpinner(search, fields);
        await updateLastInvoice();
        submitSpinner(search, fields, false);
    });
}

function updateDateRangePicker() {
    let range     = $("#range"),
        oldPicker = $(".datepicker");

    if (oldPicker.length) {
        oldPicker.remove();
    }

    return generateDateRangePicker(range);
}

async function searchInvoices(elem) {
    let btn    = $(elem),
        fields = $("#filter-fields");

    if (!submitSpinner(btn, fields) && validateDatePicker(2)) {
        await searchAfipInvoices();
    }

    submitSpinner(btn, fields, false);
}

async function searchAfipInvoices() {
    let spinner  = $("#invoices-loader"),
        list     = $("#invoices-list"),
        template = $("#invoice-list-item-template"),
        noData   = $("#invoice-list-no-items"),
        items    = $(".invoice-list-item:not([id])");

    spinner.addClass("is-active");
    noData.addClass("is-hidden");
    items.remove();
    
    if (lastInvoiceNumber > 0) {
        let from = $("[name='start']").val(),
            to   = $("[name='end']").val(),
            invs = await getInvoicesListInfo(getDate(from), addDate(getDate(to), 1)),
            clone;

        if (invs.length) {
            invs.forEach(invoice => {
                clone = template.clone();
                
                clone.removeAttr("id");
                clone.removeClass("is-hidden");
                clone.find(".invoice-number").html(invoice.CbteDesde);
                clone.find(".invoice-date").html(parseInvoiceDate(invoice.CbteFch).toLocaleDateString());
                clone.find(".invoice-concept").html(parseInvoiceConcept(invoice.Concepto));
                clone.find(".invoice-amount").html("$" + invoice.ImpTotal);
                clone.appendTo(list);
            });
        }
        else {
            noData.removeClass("is-hidden");
        }
    }
    else {
        noData.removeClass("is-hidden");
    }

    spinner.removeClass("is-active");
}
