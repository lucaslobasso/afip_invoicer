const Afip          = require('@afipsdk/afip.js');
const activeWindow  = electron.getCurrentWindow();
const tempPath      = electron.app.getPath("temp");
const invoiceType   = 11 // Factura C
let afip, lastInvoiceNumber, lastInvoiceDate;

async function initAfip() {
    afip = await getAfipUser();

    if (!afip) {
        configurationError();
    }
    else if (!await isServerOnline()) {
        connectionError();
    }
    else if (!await isAuthenticated()) {
        configurationError();
    } 
    else if (!await getPointsOfSale()) {
        pointOfSaleError();
    }

    await updateLastInvoice();
    return afip;
}

async function getAfipUser() {
    let cuit = await getCuit(),
        data = new Afip({ 
            CUIT      : cuit, 
            res_folder: assestPath,
            ta_folder : tempPath,
            cert      : "cert.crt", 
            key       : "key.key",
            production: true
        });

    return cuit ? data : null;
}

async function getPointsOfSale() {
    try {
        let input  = $("#pointOfSale"),
            points = await afip.ElectronicBilling.getSalesPoints();
            
        if (input.length && points && points.length) {
            points.forEach(point => {
                input.append($("<option />", { html: `${point.Nro}: ${point.EmisionTipo}`, value: point.Nro }));
            });
    
            if (points.length == 1) {
                input.attr("disabled", "");
            }
            else {
                input.removeAttr("disabled");
            }
        }

        return points && points.length;
    } 
    catch (e) {
        errorMessage(e);
    }

    return false;
}

async function getLastInvoice() {
    try {
        let pointOfSale = $("#pointOfSale").val();
        return await afip.ElectronicBilling.getLastVoucher(pointOfSale, invoiceType);
    } 
    catch (e) {
        errorMessage(e);
        return null;
    }
}

async function getInvoiceInfo(invoice) {
    try {
        let pointOfSale = $("#pointOfSale").val();
        return await afip.ElectronicBilling.getVoucherInfo(invoice, pointOfSale, invoiceType);
    } 
    catch (e) {
        errorMessage(e);
        return null;
    }
}

async function getInvoicesListInfo(dateFrom, dateTo) {
    let invoicesList = [];

    try {
        let POS      = $("#pointOfSale").val(),
            invoices = new Uint8Array([...Array(lastInvoiceNumber + 1).keys()]).subarray(1),
            first    = await binaryInvoiceDateSearch(invoices, dateFrom),
            last     = await binaryInvoiceDateSearch(invoices, dateTo),
            inRange  = invoices.subarray(first, last),
            data;
            
        for (let i = 0; i < inRange.length; i++) {
            data = await afip.ElectronicBilling.getVoucherInfo(inRange[i], POS, invoiceType);
            invoicesList.push(data);
        }
    } 
    catch (e) {
        errorMessage(e);
    }
    
    return invoicesList;
}

async function getLastInvoiceDate() {
    try {
        let invoice = await getLastInvoice(),
            info    = await getInvoiceInfo(invoice);

        return parseInvoiceDate(info.CbteFch);
    } 
    catch (e) {
        errorMessage(e);
        return null;
    }
}

async function generateAfipInvoice() {
    if (!await isServerOnline()) {
        errorMessage("El servidor de la AFIP no se encuentra disponible. Intente nuevamente más tarde.");
    }

    try {
        let lastInvoice = await getLastInvoice(),
            invoiceData = await getInvoiceData(lastInvoice);
        
        await afip.ElectronicBilling.createVoucher(invoiceData).then((data, err) => {
            if (err) {
                errorMessage("Se produjo un error al generar la factura.");
                return;
            }
            
            invoiceGenerated(lastInvoice + 1, invoiceData.CbteFch);
        });
    } catch (e) {
        errorMessage(e);
    }
}

async function getInvoiceData(lastInvoice) {
    let concept     = $("#concept").val(),
        pointOfSale = $("#pointOfSale").val(),
        date        = $("#date").val(),
        amount      = $("#amount").val(),
        dateParsed  = serializeInvoiceDate(date),
        serviceDate = parseInt(concept) > 1 ? dateParsed : null,
        currVoucher = lastInvoice + 1,
        invoiceData = {
            'CantReg' 		: 1,            // Cantidad de comprobantes a registrar
            'PtoVta' 		: pointOfSale,  // Punto de venta
            'CbteTipo' 		: invoiceType,  // Tipo de comprobante (11 Factura C)
            'Concepto' 		: concept,      // Concepto del Comprobante: (1) Productos, (2) Servicios, (3) Productos y Servicios
            'DocTipo' 		: 99,           // Tipo de documento del comprador (99 consumidor final)
            'DocNro' 		: 0,            // Número de documento del comprador (0 consumidor final)
            'CbteDesde' 	: currVoucher,  // Numero de comprobante o numero del primer comprobante en caso de ser mas de uno
            'CbteHasta' 	: currVoucher,  // Numero de comprobante o numero del ultimo comprobante en caso de ser mas de uno
            'CbteFch' 		: dateParsed,   // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
            'FchServDesde' 	: serviceDate,  // (Opcional) Fecha de inicio del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
            'FchServHasta' 	: serviceDate,  // (Opcional) Fecha de fin del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
            'FchVtoPago' 	: serviceDate,  // (Opcional) Fecha de vencimiento del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
            'ImpTotal' 		: amount,       // Importe total del comprobante
            'ImpTotConc' 	: 0,            // Importe neto no gravado
            'ImpNeto' 		: amount,       // Importe neto gravado
            'ImpOpEx' 		: 0,            // Importe exento de IVA
            'ImpIVA' 		: 0,            // Importe total de IVA
            'ImpTrib' 		: 0,            // Importe total de tributos
            'MonId' 		: 'PES',        // Tipo de moneda usada en el comprobante ('PES' para pesos argentinos) 
            'MonCotiz' 		: 1,            // Cotización de la moneda usada (1 para pesos argentinos)  
        };

    return invoiceData;
}

function serializeInvoiceDate(date) {
    let parsed = getDate(date),
        offset = new Date().getTimezoneOffset() * 60000;

    return parseInt(new Date(parsed).toISOString().split('T')[0].replace(/-/g, ''))
}

function parseInvoiceDate(date) {
    let year  = date.substr(0, 4),
        month = date.substr(4, 2),
        day   = date.substr(6, 2);

    return new Date(year, month - 1, day);
}

function parseInvoiceConcept(concept) {
    switch (concept) {
        case 1:
            return "Productos";
        case 2:
            return "Servicios";
        case 3:
            return "Productos y Servicios";
        default:
            return "Error al parsear el concepto";
    }
}

function invoiceGenerated(invoiceNumber, invoiceDate) {
    let btn    = $("#generateInvoice"),
        fields = $("#invoice-fields");

    $("#amount").val("");
    updateLastInvoice(invoiceNumber, invoiceDate);
    submitSpinner(btn, fields, false);
    successMessage(`Comprobante nº ${invoiceNumber} generado correctamente.`);
}

async function updateLastInvoice(number, date) {
    lastInvoiceNumber = number ? parseInt(number.toString()) : await getLastInvoice();
    lastInvoiceDate = date ? parseInvoiceDate(date.toString()) : await getLastInvoiceDate();
}

async function isServerOnline() {
    return await afip.ElectronicBilling.getServerStatus().then(async function(status) {
        if (!status || status.AppServer != "OK" || status.DbServer != "OK" || status.AuthServer != "OK") {
            return false;
        }
        
        return true;
    }).catch(_ => false);
}

async function isAuthenticated() {
    return await afip.ElectronicBilling.getWSInitialRequest().then(async function(data) {
        if (!data || !data.Auth || !data.Auth.Cuit) {
            return false;
        }
        
        return true;
    }).catch(_ => false);
}

function configurationError() {
    activeWindow.loadFile(path.join(__dirname, 'error/configuration.html'));
}

function connectionError() {
    activeWindow.loadFile(path.join(__dirname, 'error/connection.html'));
}

function pointOfSaleError() {
    activeWindow.loadFile(path.join(__dirname, 'error/point_of_sale.html'));
}

async function binaryInvoiceDateSearch(list, date) {
    let from = 0, to = lastInvoiceNumber - 1, m, i, d;

    while (from  <= to) {
        m = parseInt(from + (to - from) / 2);
        i = await getInvoiceInfo(list[m]);
        d = parseInvoiceDate(i.CbteFch);

        if (d < date) {
            from = m + 1;
        } 
        else {
            to = m - 1;
        }
    }

    return to + 1;
}
