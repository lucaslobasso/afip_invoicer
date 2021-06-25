const Afip          = require('@afipsdk/afip.js');
const activeWindow  = electron.getCurrentWindow();
const tempPath      = electron.app.getPath("temp");
let afip;

$(document).ready(async function() {
    let btn    = $("#generateInvoice"),
        fields = $("#invoice-fields");

    infoMessage("Conectando con AFIP...");
    submitSpinner(btn, fields);
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
    else {
        bindInvoiceButton();
        submitSpinner(btn, fields, false);
        successMessage("Conectado");
    }
});

function bindInvoiceButton() {
    let btn    = $("#generateInvoice"),
        fields = $("#invoice-fields");

    btn.on("click", async function() {
        if (!submitSpinner(btn, fields) && validateAmount()) {
            await generateInvoice();
        }

        submitSpinner(btn, fields, false);
    })
}

function validateAmount() {
    let input  = $("#amount"),
        amount = input.val();

    if (amount > 0 && amount < 7500) {
        return true;
    }

    invalidInput(input);
    return false;
}

async function generateInvoice() {
    if (!await isServerOnline()) {
        errorMessage("El servidor de la AFIP no se encuentra disponible. Intente nuevamente más tarde.");
    }

    try {
        let data = await getInvoiceData(amount);
    
        await afip.ElectronicBilling.createVoucher(data).then((data, err) => {
            if (err) {
                errorMessage("Se produjo un error al generar la factura.");
                return;
            }
            
            invoiceGenerated(data['CAE']);
        });
    } catch (e) {
        errorMessage(e);
    }
}

async function getInvoiceData(amount) {
    let invoiceType = 11, // Factura C
        salePoints  = await afip.ElectronicBilling.getSalesPoints(),
        salePointNo = salePoints[0].Nro,
        lastVoucher = await afip.ElectronicBilling.getLastVoucher(salePointNo, invoiceType),
        currVoucher = lastVoucher + 1,
        dateNow     = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0],
        dateParsed  = parseInt(dateNow.replace(/-/g, '')),
        data        = {
            'CantReg' 		: 1,            // Cantidad de comprobantes a registrar
            'PtoVta' 		: salePointNo,  // Punto de venta
            'CbteTipo' 		: invoiceType,  // Tipo de comprobante (11 Factura C)
            'Concepto' 		: 2,            // Concepto del Comprobante: (1) Productos, (2) Servicios, (3) Productos y Servicios
            'DocTipo' 		: 99,           // Tipo de documento del comprador (99 consumidor final)
            'DocNro' 		: 0,            // Número de documento del comprador (0 consumidor final)
            'CbteDesde' 	: currVoucher,  // Numero de comprobante o numero del primer comprobante en caso de ser mas de uno
            'CbteHasta' 	: currVoucher,  // Numero de comprobante o numero del ultimo comprobante en caso de ser mas de uno
            'CbteFch' 		: dateParsed,   // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
            'FchServDesde' 	: dateParsed,   // (Opcional) Fecha de inicio del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
            'FchServHasta' 	: dateParsed,   // (Opcional) Fecha de fin del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
            'FchVtoPago' 	: dateParsed,   // (Opcional) Fecha de vencimiento del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
            'ImpTotal' 		: amount,       // Importe total del comprobante
            'ImpTotConc' 	: 0,            // Importe neto no gravado
            'ImpNeto' 		: amount,       // Importe neto gravado
            'ImpOpEx' 		: 0,            // Importe exento de IVA
            'ImpIVA' 		: 0,            // Importe total de IVA
            'ImpTrib' 		: 0,            // Importe total de tributos
            'MonId' 		: 'PES',        // Tipo de moneda usada en el comprobante ('PES' para pesos argentinos) 
            'MonCotiz' 		: 1,            // Cotización de la moneda usada (1 para pesos argentinos)  
        };

    return data;
}

function invoiceGenerated(cae) {
    let input = $("#amount"),
        btn   = $("#generateInvoice");

    input.val("");
    elemLoading(btn, false);
    successMessage(`Factura generada correctamente. CAE: ${cae}.`);
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

async function isServerOnline() {
    return await afip.ElectronicBilling.getServerStatus().then(async function(status) {
        console.log(status)
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
    activeWindow.loadFile(path.join(__dirname, 'error/configuration_error.html'));
}

function connectionError() {
    activeWindow.loadFile(path.join(__dirname, 'error/connection_error.html'));
}
