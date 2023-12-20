$(document).ready(function()  {
    var htmlEditor = CodeMirror.fromTextArea(document.getElementById("rb-html-panel"), {
        mode: "htmlmixed", // Set the initial mode (e.g., HTML)
        lineNumbers: true, // Enable line numbers (optional)
        theme: "dracula", 
        
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

    // Function to update the output on output panel
    function updateOutput() {
        $("iframe").contents().find("html").html("<html><head><style type='text/css'>" + cssEditor.getValue() + "</style></head><body>" + htmlEditor.getValue() + "</body></html>");
        if(implementJS){
            document.getElementById("rb-output-panel").contentWindow.eval(javascriptEditor.getValue());
            compiledJSCode = javascriptEditor.getValue();
            implementJS = false;
        }
        else if(compiledJSCode){
            document.getElementById("rb-output-panel").contentWindow.eval(compiledJSCode);
        }
        var scrollableDiv = $('#console');
        scrollableDiv.scrollTop(scrollableDiv.prop('scrollHeight'));
    }
    
    // updating output
    updateOutput();
    
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
                } catch (error) {
                    if (error.message){
                        logError(error.message);
                    }
                }
            }
            document.body.appendChild(iframe);
        }
         catch (error) {
            if (error.message){
                logError(error.message);
            }
        }
        
    }

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

    $("#rb-run-btn").click(function() {
        implementJS = true;
        runCode();
    });

    // to clear console messages
    $("#rb-console-clear-btn").click(function() {
        const consoleBlock = document.getElementById("rb-js-console-block");
        if (consoleBlock) consoleBlock.innerHTML = ""; 
    });

    // to filter errors
    $("#rb-console-show-err").click(function() {
        showDisplay('log', 'none');
        showDisplay('err', 'flex');
    });

    // to filter info logs
    $("#rb-console-show-log").click(function() {
        showDisplay('log', 'flex');
        showDisplay('err', 'none');
    });

    // to show all logs
    $("#rb-console-show-all").click(function() {
        showDisplay('log', 'flex');
        showDisplay('err', 'flex');
    });

    //full screen
    $("#rb-console-fullscreen").click(function() {
        if(outputBlock) outputBlock.style.height = '21vh';
        if(consoleBlock) consoleBlock.style.height = '75.5vh';
        document.getElementById("rb-console-fullscreen").style.display = 'none';
        document.getElementById("rb-console-minimize").style.display = 'inline';
    });

    // minimize screen
    $("#rb-console-minimize").click(function() {
        if(outputBlock) outputBlock.style.height = '81vh';
        if(consoleBlock) consoleBlock.style.height = '16vh';
        document.getElementById("rb-console-fullscreen").style.display = 'inline';
        document.getElementById("rb-console-minimize").style.display = 'none';
    });
    
});