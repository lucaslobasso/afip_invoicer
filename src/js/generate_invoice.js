const { promises: fs } = require('fs');
const electron = require('electron').remote;
const path = require('path');
const Afip = require('@afipsdk/afip.js');
const assestPath = electron.app.getPath("userData");

window.$ = window.jQuery = require('jquery');

let invoiceButton = $("#generateInvoice");

invoiceButton.on("click", async function() {
    let amount = $("#amount").val(),
        cuit   = await fs.readFile(path.join(assestPath, "cuit.txt"), {encoding: "utf8"}),
        afip   = new Afip({ 
            CUIT      : cuit, 
            res_folder: assestPath,
            ta_folder : assestPath,
            cert      : "cert.crt", 
            key       : "key.key",
            production: true, 
        });
        
    if (validateAmount(amount)) {
        generateInvoice(afip, amount);
    }
})

function validateAmount(amount) {
    if (amount > 0 && amount < 7500) {
        return true;
    }

    return false;
}

function generateInvoice(afip, amount) {
    afip.ElectronicBilling.getServerStatus().then(async function(status) {
        if (!status || status.AppServer != "OK" || status.DbServer != "OK" || status.AuthServer != "OK") {
            console.log("Server down");
            return;
        }
    
        let invoiceType = 11, // Factura C
            salePoints  = await afip.ElectronicBilling.getSalesPoints(),
            salePointNo = salePoints[0].Nro,
            lastVoucher = await afip.ElectronicBilling.getLastVoucher(salePointNo, invoiceType),
            currVoucher = lastVoucher + 1,
            dateNow     = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0],
            dateParsed  = parseInt(dateNow.replace(/-/g, '')),
            invoiceData = {
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
    
        
        afip.ElectronicBilling.createVoucher(invoiceData).then(res => {
            console.log(res);
        });
    });
}
