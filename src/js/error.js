const activeWindow  = electron.getCurrentWindow();
const viewsPath     = __dirname.replace("/error", "");

$(document).ready(function() {
    bindReConnectButton();
    bindReConfigButton();
});

function bindReConnectButton() {
    let btn = $("#retryConnection");

    btn.on("click", function () {
        if (!submitSpinner(btn)) {
            activeWindow.loadFile(path.join(viewsPath, 'generate_invoice.html'));
        }
        
        submitSpinner(btn, false);
    });
}

function bindReConfigButton() {
    let btn = $("#retryConfiguration");

    btn.on("click", function () {
        if (!submitSpinner(btn)) {
            activeWindow.loadFile(path.join(viewsPath, 'configurate.html'));
        }
        
        submitSpinner(btn, false);
    });
}