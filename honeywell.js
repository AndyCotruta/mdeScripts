var defaultReader, readerAutoClosed = false;
var hidden, visibilityChange;
var barcodeReaders;



function setup() {
	// Check whether the browser supports detection of the web page visibility.
	if (typeof document.webkitHidden !== "undefined") { // Android 4.4 Chrome
		hidden = "webkitHidden";
		visibilityChange = "webkitvisibilitychange";
	}
	else if (typeof document.hidden !== "undefined") { // Standard HTML5 attribute
		hidden = "hidden";
		visibilityChange = "visibilitychange";
	}

	if (hidden && typeof document.addEventListener !== "undefined" &&
		typeof document[hidden] !== "undefined") {
		// Add an event listener for the visibility change of the web page.
		document.addEventListener(visibilityChange, handleVisibilityChange, false);
	}

	openBarcodeReader();
}



function onBarcodeDataReady(data, type, time) {
	stBrowserDidScanBarcode(null, data.trim(), null);
}

// After BarcodeReader object is created we can configure our symbologies and add our event listener
function onBarcodeReaderComplete(result) {
	if (result.status === 0) {
		
		window.addEventListener("beforeunload", onBeforeUnload);

		defaultReader.addEventListener("barcodedataready", onBarcodeDataReady, false);

		defaultReader.set("Symbology", "EANUPC", "EAN13CheckDigit", "true", onSetComplete);
		defaultReader.set("Symbology", "EANUPC", "UPCACheckDigit", "true", onSetComplete);

	}
	else {
		defaultReader = null;
		alert('Failed to create BarcodeReader, ' + result.message);
	}
}

function onSetComplete(result) {
}

function handleVisibilityChange() {
	if (document[hidden]) // The web page is hidden
	{
		closeBarcodeReader(true);
	}
	else // The web page is visible
	{
		if (readerAutoClosed) {
			// Note: If you switch to another tab and quickly switch back
			// to the current tab, the following call may have no effect
			// because the BarcodeReader may not be completely closed yet.
			// Once the BarcodeReader is closed, you may use the Open Reader
			// button to create a new BarcodeReader object.
			openBarcodeReader();
		}
	}
}

function openBarcodeReader() {
	if (!defaultReader) {
		defaultReader = new BarcodeReader(null, onBarcodeReaderComplete);
	}
}



function closeBarcodeReader(isAutoClose) {
	if (defaultReader && !readerAutoClosed) {
		readerAutoClosed = isAutoClose;
		defaultReader.close(function (result) {
			if (result.status === 0) {
				defaultReader = null;
				window.removeEventListener("beforeunload", onBeforeUnload);

				if (isAutoClose) {
					//alert('Scanner getrennt (Autoclose)');
				}
				else {
					//alert('Scanner getrennt');
				}
			}
		});
	}
}

function onBeforeUnload(e) {
	closeBarcodeReader(true);
}

window.onload = function () {

	if (navigator.userAgent.includes("EDA52")) {
		$.getScript('/Scripts/honeywell/BarcodeReader.js', function () {
			setup();
		});
	}
}