const { promises: fs } = require('fs');
const electron = require('electron').remote;
const path = require('path');
const assestPath = electron.app.getPath("userData");
const extensions = ['crt', 'key'];

window.$ = window.jQuery = require('jquery');

// Submit
let submit = $("#submitConfig");

submit.on("click", async function () {
    let cuit = $("#cuit").val();

    if (validateCuit(cuit) && await validateCertificates()) {
        let activeWindow = electron.getCurrentWindow();

        fs.writeFile(path.join(assestPath, "cuit.txt"), cuit);
        activeWindow.loadFile(path.join(__dirname, 'generate_invoice.html'));
    }
});

// Upload section
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

// Aux functions
function uploadFile(filePath, fileName) {
    fs.copyFile(filePath, path.join(assestPath, fileName)).catch((err) => {
        if (err) {
            console.error(err);
        }
    });
}

function getFileName(filePath) {
    return filePath.replace(/^.*[\\\/]/, '');
}

function getFileExtension(fileName) {
    return fileName.split('.').pop();
}

function validateCuit(cuit) {
    if (cuit.length !== 11) {
        return false;
    }

    var _a = cuit.split('').map(Number).reverse(), 
        checkDigit = _a[0], 
        rest = _a.slice(1);

    var total = rest.reduce(function (acc, cur, index) { return acc + cur * (2 + (index % 6)); }, 0);
    var mod11 = 11 - (total % 11);
    
    if (mod11 === 11) {
        return checkDigit === 0;
    }
    if (mod11 === 10) {
        return false;
    }

    return checkDigit === mod11;
}

async function validateCertificates() {
    try {
        await fs.access(path.join(assestPath, 'cert.crt'));
        await fs.access(path.join(assestPath, 'key.key'));
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}