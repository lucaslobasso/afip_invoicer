const Afip          = require('@afipsdk/afip.js');
const activeWindow  = electron.getCurrentWindow();
const tempPath      = electron.app.getPath("temp");
const invoiceType   = 11 // Factura C
let afip, lastInvoiceDate;

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

    await updateLastInvoiceDate();
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
            
        if (points && points.length) {
            points.forEach(point => {
                input.append($("<option />", { html: `${point.Nro}: ${point.EmisionTipo}`, value: point.Nro }));
            });

            if (points.length == 1) {
                input.attr("disabled", "");
            }
            else {
                input.removeAttr("disabled");
            }

            return true;
        }
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

async function generateInvoice() {
    if (!await isServerOnline()) {
        errorMessage("El servidor de la AFIP no se encuentra disponible. Intente nuevamente más tarde.");
    }

    try {
        let invoiceData = await getInvoiceData();
        
        await afip.ElectronicBilling.createVoucher(invoiceData).then((data, err) => {
            if (err) {
                errorMessage("Se produjo un error al generar la factura.");
                return;
            }
            
            invoiceGenerated(data['CAE'], invoiceData.CbteFch);
        });
    } catch (e) {
        errorMessage(e);
    }
}

async function getInvoiceData() {
    let concept     = $("#concept").val(),
        pointOfSale = $("#pointOfSale").val(),
        date        = $("#date").val(),
        amount      = $("#amount").val(),
        dateParsed  = serializeInvoiceDate(date),
        serviceDate = parseInt(concept) > 1 ? dateParsed : null,
        lastVoucher = await getLastInvoice(),
        currVoucher = lastVoucher + 1,
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

function invoiceGenerated(cae, invoiceDate) {
    let btn    = $("#generateInvoice"),
        fields = $("#invoice-fields");

    $("#amount").val("");
    updateLastInvoiceDate(invoiceDate);
    submitSpinner(btn, fields, false);
    successMessage(`Factura generada correctamente. CAE: ${cae}.`);
}

async function updateLastInvoiceDate(date) {
    lastInvoiceDate = date ? parseInvoiceDate(date.toString()) : await getLastInvoiceDate();
    updateDatePicker();
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
