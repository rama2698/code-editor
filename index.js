document.addEventListener('DOMContentLoaded', function() {
    var htmlEditor = CodeMirror.fromTextArea(document.getElementById("rb-html-panel"), {
        mode: "htmlmixed", // Set the initial mode (e.g., HTML)
        lineNumbers: true, // Enable line numbers (optional)
        theme: "dracula", 
        
    });
    htmlEditor.on("keydown", function (cm, event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            cm.replaceSelection("\n");
        }
    });

    var cssEditor = CodeMirror.fromTextArea(document.getElementById("rb-css-panel"), {
        mode: "css", // Set the initial mode (e.g., HTML)
        lineNumbers: true, // Enable line numbers (optional)
        theme: "dracula", // Choose a theme (optional)
    });
    var javascriptEditor = CodeMirror.fromTextArea(document.getElementById("rb-javascript-panel"), {
        mode: "javascript", // Set the initial mode (e.g., HTML)
        lineNumbers: true, // Enable line numbers (optional)
        theme: "dracula", // Choose a theme (optional)
    });
    var implementJS = false;
    var compiledJSCode = "";
    var outputBlock = document.getElementById("rb-output-panel");
    var consoleBlock = document.getElementById("rb-console-panel");
    var consoleErrBtn = document.getElementById("rb-console-show-err");
    var consoleInfoBtn = document.getElementById("rb-console-show-log");
    var consoleAllBtn = document.getElementById("rb-console-show-all");
    
    consoleAllBtn.style.borderBottom = "2px solid rgb(237, 159, 14)";

    // Function to update the output on output panel
    function updateOutput() {
        var iframe = document.getElementById('rb-output-panel');
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        var htmlString = "<html><head><style type='text/css'>" + cssEditor.getValue() + "</style></head><body>" + htmlEditor.getValue() + "</body></html>";

        // Set the content of the iframe's document
        iframeDocument.open();
        iframeDocument.write(htmlString);
        iframeDocument.close();

        if(implementJS){
            document.getElementById("rb-output-panel").contentWindow.eval(javascriptEditor.getValue());
            compiledJSCode = javascriptEditor.getValue();
            implementJS = false;
        }
        else if(compiledJSCode){
            document.getElementById("rb-output-panel").contentWindow.eval(compiledJSCode);
        }
    }
    
    function scrollConsoleBottom(){
        var scrollableDiv = document.getElementById("rb-console-panel");
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    }
    
    function runCode() {
        try {
            updateOutput();

            // Get user code from the textareas
            var htmlCode = htmlEditor.getValue();
            var cssCode = cssEditor.getValue();
            var jsCode = javascriptEditor.getValue();

            // Create an iframe to isolate the execution environment
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';

            // Set up the load event listener for the iframe
            iframe.onload = function () {
                try {

                    iframe.contentWindow.console.log = function (message) {
                        if (typeof message === 'object') {
                            logMessage("Log", JSON.stringify(message));
                        } else {
                            logMessage("Log", message);
                        }
                    };

                    // Write the HTML and CSS code into the iframe
                    iframe.contentDocument.write('<style>' + cssCode + '</style>');
                    iframe.contentDocument.write(htmlCode);

                    // Create a script element for JS code
                    var script = iframe.contentDocument.createElement('script');
                    script.text = jsCode;

                    // Append the script element to the iframe's document
                    iframe.contentDocument.body.appendChild(script);

                    // Remove the iframe after a short delay to allow for async code execution
                    setTimeout(function () {
                        document.body.removeChild(iframe);
                    }, 100);
                    scrollConsoleBottom();
                } catch (error) {
                    if (error.message){
                        logError(error.message);
                    }
                    scrollConsoleBottom();
                }
            }
            document.body.appendChild(iframe);
        }
         catch (error) {
            if (error.message){
                logError(error.message);
            }
            scrollConsoleBottom();
        }
        
    }

    // run the script
    implementJS = true;
    runCode();

    // Function to log messages
    function logMessage(type, message) {
        var consoleDiv = document.getElementById('rb-js-console-block');
        consoleDiv.innerHTML += `<div class="rb-row-flex rb-console-logs rb-justify-start rb-gap-6 ${type === "Log" ? 'rb-text-seal-blue rb-console-log-msg' : 'rb-text-red rb-console-err-msg'}" >
            ${(type === "Log") ? '<div class="rb-console-msg-pill rb-text-dark rb-text-center">&#8505;</div>' : '<div class="rb-console-err-pill rb-text-dark rb-text-center">&#9760;</div>'}
            <div>${message}</div>
            </div>`;
    }

    // Function to log errors
    function logError(error) {
        logMessage("Error", error);
    }

    // function to hide/show display
    function showDisplay(type, value) {
        const logList = document.querySelectorAll('.rb-console-'+type+'-msg');
        if (logList){
            logList.forEach(function(element) {
                element.style.display = value;
            });
        }
    }

    document.getElementById("rb-run-btn").addEventListener("click", function() {
        implementJS = true;
        runCode();
    });

    // to clear console messages
    document.getElementById("rb-console-clear-btn").addEventListener("click", function() {
        const consoleBlock = document.getElementById("rb-js-console-block");
        if (consoleBlock) consoleBlock.innerHTML = ""; 
    });

    // to filter errors
    document.getElementById("rb-console-show-err").addEventListener("click", function() {
        showDisplay('log', 'none');
        showDisplay('err', 'flex');
        consoleErrBtn.style.borderBottom = "2px solid rgb(237, 159, 14)";
        consoleInfoBtn.style.borderBottom = "none";
        consoleAllBtn.style.borderBottom = "none";
    });

    // to filter info logs
    document.getElementById("rb-console-show-log").addEventListener("click", function() {
        showDisplay('log', 'flex');
        showDisplay('err', 'none');
        consoleErrBtn.style.borderBottom = "none";
        consoleInfoBtn.style.borderBottom = "2px solid rgb(237, 159, 14)";
        consoleAllBtn.style.borderBottom = "none";
    });

    // to show all logs
    document.getElementById("rb-console-show-all").addEventListener("click", function() {
        showDisplay('log', 'flex');
        showDisplay('err', 'flex');
        consoleErrBtn.style.borderBottom = "none";
        consoleInfoBtn.style.borderBottom = "none";
        consoleAllBtn.style.borderBottom = "2px solid rgb(237, 159, 14)";
    });

    //full screen
    document.getElementById("rb-console-fullscreen").addEventListener("click", function() {
        if(outputBlock) outputBlock.style.height = '21vh';
        if(consoleBlock) consoleBlock.style.height = '75.5vh';
        document.getElementById("rb-console-fullscreen").style.display = 'none';
        document.getElementById("rb-console-minimize").style.display = 'inline';
    });

    // minimize screen
    document.getElementById("rb-console-minimize").addEventListener("click", function() {
        if(outputBlock) outputBlock.style.height = '81vh';
        if(consoleBlock) consoleBlock.style.height = '16vh';
        document.getElementById("rb-console-fullscreen").style.display = 'inline';
        document.getElementById("rb-console-minimize").style.display = 'none';
    });
    
});