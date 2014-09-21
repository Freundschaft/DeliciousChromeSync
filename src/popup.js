// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Search the bookmarks when entering the search keyword.
$(function() {
  $('#search').change(function() {
     $('#bookmarks').empty();
     dumpBookmarks($('#search').val());
  });  
});
// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks(query) {
  var bookmarkTreeNodes = chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {
      $('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes, query));
	  
  $('#auto-checkboxes').bonsai({
  expandAll: false,
  checkboxes: true, // depends on jquery.qubit plugin
  createCheckboxes: true // takes values from data-name and data-value, and data-name is inherited
});
    });
}
function dumpTreeNodes(bookmarkNodes, query) {
  var list = $('<ol>');
  if(bookmarkNodes[0].parentId === undefined)
  {
	list.attr('id', 'auto-checkboxes');
	list.attr('data-name', 'foo');
  }
  var i;
  for (i = 0; i < bookmarkNodes.length; i++) {
    list.append(dumpNode(bookmarkNodes[i], query));
  }
  return list;
}
function dumpNode(bookmarkNode, query) {
  if (bookmarkNode.title) {
    if (query && !bookmarkNode.children) {
      if (String(bookmarkNode.title).indexOf(query) == -1) {
        return $('<li></li>');
      }
    }
    var anchor = $('<a>');
    anchor.attr('href', bookmarkNode.url);
    anchor.text(bookmarkNode.title);
    /*
     * When clicking on a bookmark in the extension, a new tab is fired with
     * the bookmark url.
     */
    anchor.click(function() {
      chrome.tabs.create({url: bookmarkNode.url});
    });
    var span = $('<span>');
    var options = bookmarkNode.children ?
      $('<span>[<a href="#" id="addlink">Add</a>]</span>') :
      $('<span>[<a id="editlink" href="#">Edit</a> <a id="deletelink" ' +
        'href="#">Delete</a>]</span>');
    var edit = bookmarkNode.children ? $('<table><tr><td>Name</td><td>' +
      '<input id="title"></td></tr><tr><td>URL</td><td><input id="url">' +
      '</td></tr></table>') : $('<input>');
    // Show add and edit links when hover over.
        span.hover(function() {
        span.append(options);
        $('#deletelink').click(function() {
          $('#deletedialog').empty().dialog({
                 autoOpen: false,
                 title: 'Confirm Deletion',
                 resizable: false,
                 height: 140,
                 modal: true,
                 overlay: {
                   backgroundColor: '#000',
                   opacity: 0.5
                 },
                 buttons: {
                   'Yes, Delete It!': function() {
                      chrome.bookmarks.remove(String(bookmarkNode.id));
                      span.parent().remove();
                      $(this).dialog('destroy');
                    },
                    Cancel: function() {
                      $(this).dialog('destroy');
                    }
                 }
               }).dialog('open');
         });
        $('#addlink').click(function() {
          $('#adddialog').empty().append(edit).dialog({autoOpen: false,
            closeOnEscape: true, title: 'Add New Bookmark', modal: true,
            buttons: {
            'Add' : function() {
               chrome.bookmarks.create({parentId: bookmarkNode.id,
                 title: $('#title').val(), url: $('#url').val()});
               $('#bookmarks').empty();
               $(this).dialog('destroy');
               window.dumpBookmarks();
             },
            'Cancel': function() {
               $(this).dialog('destroy');
            }
          }}).dialog('open');
        });
        $('#editlink').click(function() {
         edit.val(anchor.text());
         $('#editdialog').empty().append(edit).dialog({autoOpen: false,
           closeOnEscape: true, title: 'Edit Title', modal: true,
           show: 'slide', buttons: {
              'Save': function() {
                 chrome.bookmarks.update(String(bookmarkNode.id), {
                   title: edit.val()
                 });
                 anchor.text(edit.val());
                 options.show();
                 $(this).dialog('destroy');
              },
             'Cancel': function() {
                 $(this).dialog('destroy');
             }
         }}).dialog('open');
        });
        options.fadeIn();
      },
      // unhover
      function() {
        options.remove();
      }).append(anchor);
  }
  var li = $('<li>').append(span);
	li.attr('data-value', bookmarkNode.id);
  if (bookmarkNode.children && bookmarkNode.children.length > 0) {
    li.append(dumpTreeNodes(bookmarkNode.children, query));
  }
  return li;
}

function TickChildrenBookMarks()
{
	//Implement Function that makes child Bookmarks selected when the parent folder is selected
}

function DeliciousLogin()
{
chrome.identity.launchWebAuthFlow(
  {'url': 'https://delicious.com/auth/authorize?client_id=a9adbe0c558cc27a3ec117e80dd29353&redirect_uri=https://pcfmpnploldofmgahfnikgdgpmmdahan.chromiumapp.org/delicious', 'interactive': true},
	function(redirect_url) { /* Extract token from redirect_url */ 
		alert(redirect_url.split('=')[1]);
  });
}

function stripVowelAccent(str)
{
 var rExps=[
 {re:/[\xC0-\xC6]/g, ch:'A'},
 {re:/[\xE0-\xE6]/g, ch:'a'},
 {re:/[\xC8-\xCB]/g, ch:'E'},
 {re:/[\xE8-\xEB]/g, ch:'e'},
 {re:/[\xCC-\xCF]/g, ch:'I'},
 {re:/[\xEC-\xEF]/g, ch:'i'},
 {re:/[\xD2-\xD6]/g, ch:'O'},
 {re:/[\xF2-\xF6]/g, ch:'o'},
 {re:/[\xD9-\xDC]/g, ch:'U'},
 {re:/[\xF9-\xFC]/g, ch:'u'},
 {re:/[\xD1]/g, ch:'N'},
 {re:/[\xF1]/g, ch:'n'} ];

 for(var i=0, len=rExps.length; i<len; i++)
  str=str.replace(rExps[i].re, rExps[i].ch);

 return str;
}

function SyncBookMarks()
{
$(':checkbox:checked').each(function () {
	var BookmarkID = $(this).val();
	chrome.bookmarks.get(BookmarkID, function(results){
		//Check for Parents
	
		try
		{
			//Check for Children
			results[0].children.each(function(index, value) {
				console.log("Sending bookmark to delicious " + value.title);
				$.ajax({
					url: 'https://api.del.icio.us/v1/posts/add?url=' + escape(value.url) + '&description=' + value.title + '&tags=' + stripVowelAccent(results[0].title),
					type: 'POST',
					crossDomain: true,
					dataType: 'text',
					success: function(data, textstatus) { 
						alert('success: ' + textstatus + ' ' + JSON.stringify(data)); 
					},
					error: function(data, textstatus) {
						alert('error: ' + textstatus + ' ' + JSON.stringify(data)); 
					},
					complete: function() {
					}
				});
			});
		}
		catch (ex)
		{
		}
		
		
		//get Parent, the title of the parent bookmark (usually a folder) is used for the tag at delicious
		chrome.bookmarks.get(results[0].parentId, function(parent){
			console.log("Sending bookmark to delicious " + results[0].title);
			$.ajax({
				url: 'https://api.del.icio.us/v1/posts/add?url=' + escape(results[0].url) + '&description=' + results[0].title + '&tags=' + stripVowelAccent(parent[0].title),
				type: 'POST',
				crossDomain: true,
				dataType: 'text',
				success: function(data, textstatus) { 
					//alert('success: ' + textstatus + ' ' + JSON.stringify(data)); 
				},
				error: function(data, textstatus) {
					//alert('error: ' + textstatus + ' ' + JSON.stringify(data)); 
				},
				complete: function() {
				}
			});
		}); 
		
	/*
		$.post( "https://api.del.icio.us/v1/posts/add", {url:results[0].url, description:results[0].title, tag:'webdev',meta:'yes'},function( data ) {
		  alert(data);
		});
		*/

		//https://api.del.icio.us/v1/posts/add?url=test.com&description=test&tag=webdev&meta=yes
	});
});
}

document.addEventListener('DOMContentLoaded', function () {
  dumpBookmarks();

  document.getElementById('btnsync').addEventListener('click', SyncBookMarks);
  document.getElementById('btnLogin').addEventListener('click', DeliciousLogin);
  
});
