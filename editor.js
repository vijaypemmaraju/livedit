/*jslint browser: true*/
/*jslint indent: 4*/
/*global $, jQuery, alert*/


function saveSelection(containerEl) {
    var charIndex = 0, start = 0, end = 0, foundStart = false, stop = {};
    var sel = rangy.getSelection(), range;

    function traverseTextNodes(node, range) {
        if (node.nodeType == 3) {
            if (!foundStart && node == range.startContainer) {
                start = charIndex + range.startOffset;
                foundStart = true;
            }
            if (foundStart && node == range.endContainer) {
                end = charIndex + range.endOffset;
                throw stop;
            }
            charIndex += node.length;
        } else {
            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                traverseTextNodes(node.childNodes[i], range);
            }
        }
    }

    if (sel.rangeCount) {
        try {
            traverseTextNodes(containerEl, sel.getRangeAt(0));
        } catch (ex) {
            if (ex != stop) {
                throw ex;
            }
        }
    }

    return {
        start: start,
        end: end
    };
}

function restoreSelection(containerEl, savedSel) {
    var charIndex = 0, range = rangy.createRange(), foundStart = false, stop = {};
    range.collapseToPoint(containerEl, 0);

    function traverseTextNodes(node) {
        if (node.nodeType == 3) {
            var nextCharIndex = charIndex + node.length;
            if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                range.setStart(node, savedSel.start - charIndex);
                foundStart = true;
            }
            if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                range.setEnd(node, savedSel.end - charIndex);
                throw stop;
            }
            charIndex = nextCharIndex;
        } else {
            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                traverseTextNodes(node.childNodes[i]);
            }
        }
    }

    try {
        traverseTextNodes(containerEl);
    } catch (ex) {
        if (ex == stop) {
            rangy.getSelection().setSingleRange(range);
        } else {
            throw ex;
        }
    }
}

$(document).ready(function() {
    rangy.init();
});

 var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }
//$(document).keydown(function(e) {
//    // trap the return key being pressed
//    if (e.keyCode === 13) {
//      // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
//      document.execCommand('insertHTML', false, '<br><br>');
//      // prevent the default behaviour of return key pressed
//        console.log("RETURN");
//      return false;
//    }
//});

var enterSelection = null;
var currentSelection = null;
var firstEnter = true;
$(function(){
$(document).on('keydown', function (e) {
    
    if (e.keyCode == 13) {
        
        console.log("Enter");
        enterSelection = saveSelection($('.editor')[0]);
        console.log(enterSelection);
        e.preventDefault();
        e.stopPropagation();
        var text = $('.editor').text();
        if (currentSelection) {
            
            //if (text.slice(currentSelection.start, currentSelection.start + 1) == "\n") {
                
            if (currentSelection.start < text.length) {
                document.execCommand('insertHTML', false, '<br>');
            }   else  {
                document.execCommand('insertHTML', false, '<br><br>');    
            }
        }
//        } else if (text.slice(-1) == "\n") {
//            document.execCommand('insertHTML', false, '<br>');
//            firstEnter = false;
//        } else {
//            document.execCommand('insertHTML', false, '<br><br>');
//        }
        return false;
    }
    if (e.keyCode == 9) {
        e.preventDefault();
        e.stopPropagation();
        document.execCommand('insertHTML', false, '  ');
        return false;
    }
})
});
$(document).on('keyup', function (e) {
    "use strict";
    var editor = $('.editor'), preview = $('.preview'), contents = escapeHtml(editor[0].innerText);
    var editorNode = editor[0];

    if (editorNode.hasChildNodes) {

        currentSelection = saveSelection(editorNode);
        if (e.keyCode == 13) {
            currentSelection.start = enterSelection.start + 1;
            currentSelection.end = enterSelection.end + 1;
        }
        preview[0].source = "about:blank";
        preview[0].contentDocument.open();
        preview[0].contentDocument.write(editor.text());
        
        //preview.html(editor.text());
        preview.css({"-webkit-animation": "all 1s"});
        console.log(contents);  
        contents = contents.replace(/(&lt;[&#x2F;]*?[a-zA-Z0-9=\/\"\W]*?&gt;)/g, function (str, matched) {
            return "<span class=\"element\">" + str + "</span>";
        });

        contents = contents.replace(/(&lt;!--[\w\W]*--&gt;)/g, function (str, matched) {
            return "<span class=\"comment\">" + str + "</span>";
        });

        
        editor.html(contents);
        restoreSelection(editorNode, currentSelection);
    }
    
    
}).on('keyup', function (e) {
    "use strict";
    if (e.keyCode === 8) {
        $('element').trigger('keypress');
    }
   
});


