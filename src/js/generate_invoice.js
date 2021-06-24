const Afip      = require('@afipsdk/afip.js');
const tempPath  = electron.app.getPath("temp");

$(document).ready(function() {
    bindInvoiceButton();
});

function bindInvoiceButton() {
    let btn = $("#generateInvoice");

    btn.on("click", async function() {
        if (!elemLoading(btn) && validateAmount()) {
            await generateInvoice();
        }

        elemLoading(btn, false);
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
    let input  = $("#amount"),
        amount = input.val(),
        cuit   = await getCuit();
    
    if (!cuit) {
        return;
    }

    let afip = new Afip({ 
        CUIT      : cuit, 
        res_folder: assestPath,
        ta_folder : tempPath,
        cert      : "cert.crt", 
        key       : "key.key",
        production: false, 
    });

    await afip.ElectronicBilling.getServerStatus().then(async function(status) {
        if (!status || status.AppServer != "OK" || status.DbServer != "OK" || status.AuthServer != "OK") {
            console.log("Server down");
            return;
        }
    
        let data = await getInvoiceData(afip, amount);
    
        if (!data) {
            return;
        }

        await afip.ElectronicBilling.createVoucher(data).then(res => {
            console.log(res);
            invoiceGenerated();
        });
    });
}

async function getInvoiceData(afip, amount) {
    let data;

    try {
        let invoiceType = 11, // Factura C
            salePoints  = await afip.ElectronicBilling.getSalesPoints(),
            salePointNo = salePoints[0].Nro,
            lastVoucher = await afip.ElectronicBilling.getLastVoucher(salePointNo, invoiceType),
            currVoucher = lastVoucher + 1,
            dateNow     = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0],
            dateParsed  = parseInt(dateNow.replace(/-/g, ''));

        data = {
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
    } catch (e) {
        console.log(e);
    }

    return data;
}

function invoiceGenerated() {
    let input = $("#amount"),
        btn   = $("#generateInvoice");

    input.val("");
    elemLoading(btn, false);
}
