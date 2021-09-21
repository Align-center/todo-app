'use strict';

document.addEventListener("DOMContentLoaded", function loaded() {

	let lists = document.querySelectorAll(".list");
	let container = document.querySelector(".container");
	var keys = {37: 1, 38: 1, 39: 1, 40: 1, 32: 1, 33: 1, 34: 1, 35: 1, 36: 1};
	var colors = ['#B8E2EC', '#DCB8EC', '#ECC2B8', '#C8ECB8'];
	var errorContainer = document.querySelector('.errors');
	var isMenuOpen = false;
	
	//Scrolling stop vars
	// modern Chrome requires { passive: false } when adding event
	var supportsPassive = false;
	try {
	  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
		get: function () { supportsPassive = true; } 
	  }));
	} catch(e) {}

	var wheelOpt = supportsPassive ? { passive: false } : false;
	var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
	
	Element.prototype.appendAfter = function (element) {
	  element.parentNode.insertBefore(this, element.nextSibling);
	},false;
	
	// 	FUNCTIONS
	function disableScroll() {
	  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
	  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
	  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
	  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
	}

	function enableScroll() {
	  window.removeEventListener('DOMMouseScroll', preventDefault, false);
	  window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
	  window.removeEventListener('touchmove', preventDefault, wheelOpt);
	  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
	}
	
	function preventDefault(e) {
	  e.preventDefault();
	}

	function preventDefaultForScrollKeys(e) {
	  if (keys[e.keyCode]) {
		preventDefault(e);
		return false;
	  }
	}
	
	function deleteCard(el) {
		let deleteModal = document.querySelector(".delete-modal-bg");

		if (/hidden/gi.test(deleteModal.className)) {
			deleteModal.className = deleteModal.className.replace(/hidden/gi, "");

			disableScroll();
			
			let cancelBtn = document.querySelector(".cancel");
			let deleteBtn = document.querySelector(".delete");
			
			cancelBtn.addEventListener("click", function onClickCancelDeletion(e) {
				deleteModal.className += " hidden";
				enableScroll();
			});

			deleteBtn.addEventListener("click", function onClickDeleteEntry(e) {
				let entry = el.closest(".content");
				entry.remove();
				deleteModal.className += " hidden";
				enableScroll();
			});
		}
	}

	function displayEditor(el) {
		let data = el.innerHTML;

		el.innerHTML = `<textarea id="editor" rows="4">${data}</textarea>`;

		let editor = document.querySelector("#editor");

		editor.focus();

		editor.value += " ";

		editor.addEventListener("focusout", function () {
			let newData = editor.value;

			if (newData == "") {
				el.remove();
			} else {
				
				el.innerHTML = newData;
			}
		});
	}

	function focusEditor () {
		
		let editor = document.querySelector("#editor");

		editor.focus();

		editor.addEventListener("focusout", function () {
			let newData = editor.value;

			if (newData == "") {
				newData = "Default title, double click to edit.";
			}

			let el = editor.closest(".title");
			el.innerHTML = newData;
		});
	}
	
	function createNewEntryElement (title, content) {
		
		let uniqueID = Math.random().toString(36).substr(2, 9);
		
		if (title == undefined) {
			title = `<textarea id="editor" rows="4" placeholder="Type your title here"></textarea>`;
		}
		
		if (content == undefined) {
			content = 'Double click to edit';
		}
		
		let entry = document.createElement("div");
				entry.className = "content";
				entry.id = "c" + uniqueID;
				entry.setAttribute("draggable", "true");
				entry.innerHTML = `
				<h3 class="title">${title}</h3>
				<p class="desc">${content}</p>`;
		
		return entry;
	}
	
	function createNewListElement (title, data) {
		let x = Math.floor(Math.random() * 4);
		
		if (title == undefined) {
			title = "Default Title";
		}
		
		let newList = document.createElement('article');
			newList.className = "list-container";
			newList.setAttribute('style', `--color: ${colors[x]}`);
			newList.innerHTML = `
					<h2 class="container-title">${title}</h2>
					<small class="commands">Options</small>
					<nav class="menu hidden">
						<ul>
							<li class='add-entry'>Add new Entry</li>
							<li class='add-list'>Add new List</li>
							<li class="remove-list">Delete this list</li>
							<li class="save">Save list(s)</li>
						</ul>
					</nav>
				`;
		
		let list = document.createElement('article');
		list.className = "list";
		
		newList.appendChild(list);
			
			if (data) {
				for (let i = 0; i < data.length; i++) {
					
					newList.children[3].appendChild(createNewEntryElement(data[i].title, data[i].content));
				}
			} else {
				newList.children[3].appendChild(createNewEntryElement());
			}
		
		return newList;
	}
	
	function save() {
		let listContainers = document.querySelectorAll('.list-container');
		let data = [];
		
		for (let i = 0; i < listContainers.length; i++) {
			
			let tempData = {
				containerTitle: "",
				cards: []
			};
			
			for (let j = 0; j < listContainers[i].children.length; j++) {
				if (/container-title/gi.test(listContainers[i].children[j].className)) {
					
					tempData.containerTitle = listContainers[i].children[j].innerHTML
				}
				
				if (/list/gi.test(listContainers[i].children[j].className)) {
					
					let list = listContainers[i].children[j];
					
					for (let k = 0; k < list.children.length; k++) {
						
						if (/content/gi.test(list.children[k].className)) {
							
							let card = {
								title: list.children[k].children[0].innerHTML,
								content: list.children[k].children[1].innerHTML
							}
							
							tempData.cards.push(card);
						}
					}
				}
			}
			
			data.push(tempData);
		}
		let JSONdata = JSON.stringify(data);
		
		localStorage.setItem('TodoAppData', JSONdata);
	}
	
	function restoreData () {
		
		if (localStorage.getItem('TodoAppData') != null) {
			let data = JSON.parse(localStorage.getItem('TodoAppData'));
			let listsContainer = document.querySelectorAll('.list-container');
			let cardsContainer = document.querySelectorAll('.list');
			
			
			for (let i = 0; i < data.length; i++) {
				
				let newList = createNewListElement(data[i].containerTitle, data[i].cards);
				
				container.append(newList);
			}
		} else {
			let newList = createNewListElement();
			container.append(newList);
			
			focusEditor();
		}
	}
	// MAIN CODE
	
	container.addEventListener('click', function onClickJavascriptSucks(e) {
		
		let target = e.target;
		let menus = document.querySelectorAll('.menu');
		let menu = e.target.closest(".menu");
		let listContainer;
		
		if (/commands/gi.test(target.className)) {
			
			let command = e.target;
			let nextMenu = command.nextElementSibling;
			
			if (/hidden/gi.test(nextMenu.className)) {
				
				for (let i =0; i < menus.length; i++) {
					menus[i].className += ' hidden';
				}
				
				nextMenu.className = nextMenu.className.replace(/hidden/gi, "");
				isMenuOpen = true;
			} else {
				nextMenu.className += " hidden";
				isMenuOpen = false;
			}
		} 
		else if (/add-entry/gi.test(target.className)) {
			
			let entry = createNewEntryElement();

			menu.nextElementSibling.prepend(entry);

			menu.className += " hidden";

			focusEditor();
		} 
		else if (/add-list/gi.test(target.className)) {
			
			let newList = createNewListElement();
			listContainer = menu.nextElementSibling.closest('.list-container');

			newList.appendAfter(listContainer);

			focusEditor();
			
			if(!/hidden/gi.test(menu.className)) {
				menu.className += " hidden";
			}
		} 
		else if (/remove-list/gi.test(target.className)) {
			
			listContainer = menu.nextElementSibling.closest('.list-container');
			
			if (container.childElementCount == 1) {
				
				errorContainer.innerHTML = 'You cannot delete the last list :(';
				
				errorContainer.className += ' flash';
				
				setTimeout(function () {
					
					if (/flash/gi.test(errorContainer.className)) {
						
						errorContainer.className = errorContainer.className.replace(/flash/, '');	
					}
					
					return;
				}, 2000);
			} else {
				
				listContainer.remove();
			}	
		}
		else if (/save/gi.test(target.className)){
			
			save();
			
			if(!/hidden/gi.test(menu.className)) {
				menu.className += " hidden";
			}
		} else {
			
			if (isMenuOpen) {
				
				for (let i =0; i < menus.length; i++) {
					menus[i].className += ' hidden';
				}
				
				isMenuOpen = false;
			}
		}
	});
	
	container.addEventListener('contextmenu', function onRightClickDelete(e) {
		if (
				/^content/gi.test(e.target.className) ||
				/^title/gi.test(e.target.className) ||
				/^desc/gi.test(e.target.className)
			) {
				e.preventDefault();

				deleteCard(e.target);
			}
	});
	
	container.addEventListener('dblclick', function onDblClickEdit(e) {
		
		if (
				/title/gi.test(e.target.className) ||
				/desc/gi.test(e.target.className)
			) {
				displayEditor(e.target);
			} else if (/content/gi.test(e.target.className)) {

				if (e.target.childElementCount == 0) {
					
					e.target.innerHTML =
						"<h3 class='title'>Default title, double click to edit.</h3>";
					displayEditor(e.target.firstElementChild);
				} else if (e.target.childElementCount == 1 && /title/gi.test(e.target.firstElementChild.className)) {
					e.target.innerHTML +=
						"<p class='desc'>Default desc, double click to edit.</p>";
					displayEditor(e.target.lastElementChild);
				} else if (e.target.childElementCount == 1 && /desc/gi.test(e.target.firstElementChild.className)) {
					
					let title = document.createElement('h3');
					title.className = 'title';
					title.innerHTML = "Default title, double click to edit";
					
					e.target.prepend(title);
					displayEditor(e.target.firstElementChild);
				}
			}
	});
	
	container.addEventListener('dragstart', function onDragStart(e) {
		if (/content/gi.test(e.target.className)) {
			e.target.className += " is-dragged";

			e.dataTransfer.setData("text", e.target.id);
		}
	});
	
	container.addEventListener('dragend', function onDragEnd (e) {
		if (/is-dragged/gi.test(e.target.className)) {
				e.target.className = e.target.className.replace(/is-dragged/, "");
			}
	});
	
	container.addEventListener('dragover', function onDragOver (e) {
		e.preventDefault();
	});
	
	container.addEventListener('drop', function onDrop (e) {
		e.preventDefault();

		let data = e.dataTransfer.getData("text");

		let element = document.querySelector(`#${data}`);

		if (/list/gi.test(e.target.className)) {
			e.target.prepend(element);
		} else if (/^title/gi.test(e.target.className)|| /^content/gi.test(e.target.className) || /^desc/gi.test(e.target.className)) {
			
			e.target.closest(".list").prepend(element);
		}
	});
	
	restoreData();
});