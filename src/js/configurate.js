const extensions = ['crt', 'key'];

$(document).ready(function() {
    bindSubmitButton();
    bindUploadSection();
    loadCuit();
});

function bindSubmitButton() {
    let btn    = $("#submitConfig"),
        fields = $("#configurate-fields");

    btn.on("click", async function () {
        if (!submitSpinner(btn, fields) && validateCuit() && await validateCertificates()) {
            let activeWindow = electron.getCurrentWindow(),
                cuit = $("#cuit").val();

            fs.writeFile(path.join(assestPath, "cuit.txt"), cuit);
            activeWindow.loadFile(path.join(__dirname, 'generate_invoice.html'));
        }
        
        submitSpinner(btn, fields, false);
    });
}

function bindUploadSection() {
    let uploadSection = document.getElementById("upload-section");

    uploadSection.addEventListener('click', () => {
        electron.dialog.showOpenDialog({
            title: 'Select the File to be uploaded',
            buttonLabel: 'Upload',
            properties: ['openFile','multiSelections'],
            filters: [
                { name: "Certificate & key", extensions: extensions }, 
            ]
        }).then(file => {
            if (!file.canceled) {
                for (const path of file.filePaths) {
                    uploadFile(path, getFileName(path));
                }
            }  
        }).catch(err => { 
            console.log(err); 
        });
    });

    uploadSection.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadSection.classList.add("is-light");

        for (const file of e.dataTransfer.files) {
            if (extensions.includes(getFileExtension(file.name))) {
                uploadFile(file.path, file.name);
            }
        }
    });
    
    uploadSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    uploadSection.addEventListener('dragenter', (e) => {
        uploadSection.classList.remove("is-light");
    });
    
    uploadSection.addEventListener('dragleave', (e) => {
        uploadSection.classList.add("is-light");
    });
}

async function loadCuit() {
    let input = $("#cuit"),
        cuit  = await getCuit();
        
    if (cuit) {
        input.val(cuit);
    }

    input.removeClass("is-loading");
}

function uploadFile(filePath, fileName) {
    let submitBtn = $("#submitConfig");

    submitBtn.addClass("is-loading");
    
    fs.copyFile(filePath, path.join(assestPath, fileName)).then(err => {
        if (err) {
            errorMessage("Se produjo un error al subir el/los archivo/s.");
        }
        
        submitBtn.removeClass("is-loading");
    });
}

function validateCuit() {
    let input = $("#cuit"),
        cuit  = input.val(),
        valid = cuit.length === 11;

    var _a = cuit.split('').map(Number).reverse(), 
        checkDigit = _a[0], 
        rest = _a.slice(1);

    var total = rest.reduce(function (acc, cur, index) { return acc + cur * (2 + (index % 6)); }, 0);
    var mod11 = 11 - (total % 11);
    
    if (mod11 === 11) {
        valid = valid && checkDigit === 0;
    }
    else if (mod11 === 10) {
        valid = false;
    }
    else {
        valid = valid && checkDigit === mod11;
    }

    if (!valid) {
        invalidInput(input);
    }

    return valid;
}

async function validateCertificates() {
    let valid = true;

    await fs.access(path.join(assestPath, 'cert.crt'), constants.F_OK, (err) => {
        if (err) {
            valid = false;
            errorMessage("No se encuentra el certificado.");
        }
    });
    await fs.access(path.join(assestPath, 'key.key'), constants.F_OK, (err) => {
        if (err) {
            valid = false;
            errorMessage("No se encuentra la key.");
        }
    });

    return valid;
}