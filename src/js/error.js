const activeWindow  = electron.getCurrentWindow();
const viewsPath     = __dirname.replace("/error", "");

function retryConnection(elem) {
    let btn = $(elem);

    if (!submitSpinner(btn)) {
        activeWindow.loadFile(path.join(viewsPath, 'generate_invoice.html'));
    }
    
    submitSpinner(btn, false);
}

function retryConfiguration(elem) {
    let btn = $(elem);

    if (!submitSpinner(btn)) {
        activeWindow.loadFile(path.join(viewsPath, 'configurate.html'));
    }
    
    submitSpinner(btn, false);
}