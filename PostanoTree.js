/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype

var jQuery, JCTree;
JCTree = (function ($) {
	var DEBUG = false;
	document.onkeydown = function (e) {
		if (e.keyCode === 68) {
			if (!DEBUG) DEBUG = true;
		}
	};
	document.onkeyup = function (e) {
		if (e.keyCode === 68) {
			if (DEBUG) DEBUG = false;
		}
	};
	(function(){
		var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
		this.Class = function(){}; // The base Class implementation (does nothing)
		Class.extend = function(prop) { // Create a new Class that inherits from this class
			var _super = this.prototype;
			// Instantiate a base class (but only create the instance, don't run the init constructor)
			initializing = true;
			var prototype = new this();
			initializing = false;
			for (var name in prop) {// Copy the properties over onto the new prototype
				prototype[name] = typeof prop[name] == "function" &&
					typeof _super[name] == "function" && fnTest.test(prop[name]) ? // Check if we're overwriting an existing function
					(function(name, fn){
						return function() {
							var tmp = this._super;
							this._super = _super[name];
							var ret = fn.apply(this, arguments);        
							this._super = tmp;
							return ret;
						};
					})(name, prop[name]) : // Else
					prop[name];
			}
			// The dummy class constructor - all construction is actually done in the init method
			function Class() {if ( !initializing && this.init )this.init.apply(this, arguments);}
			Class.prototype = prototype; // Populate our constructed prototype object
			Class.prototype.constructor = Class; // Enforce the constructor to be what we expect
			Class.extend = arguments.callee; // And make this class extendable
			return Class;
		};
	})();
	var SimpleWidget, MouseWidget, DragAndDrapWidget, Element, Folder, Target, Mobile, elementId=0;
	var isArray=Array.isArray||function(v){return Object.prototype.toString.call( v )==='[object Array]';};
	var isDefined=function(v){return typeof v!="undefined";};
	var isFunction=function(v){return typeof v=="function";};

	//Elements
	Element = Class.extend({
		init: function (widget) {
			this.children = [];
			this.parent = null;
			this.label = "";
			this.widget = widget;
		},
		append: function (element){
			this.children.push(element);
		},
		print: function (text, indent){
			var out = "";
			for (var i = 0; i < indent; i++) out += " ";
			out += text;
			console.log(out);
		},
		printTree: function (indent) {
			if (!indent) indent = 0;
			this.print("Element", indent);
			for (var i in this.children){
				this.children[i].printTree(indent+2);
			}
		},
		buildIds: function () {
			for (var i in this.children){
				if (typeof this.widget.config.getIdFromLabel !== "undefined" && this.children[i].label){
					var match = this.widget.config.getIdFromLabel(this.children[i].label);
					if (match !== null){
						this.children[i]._buildIds(match);
						continue;
					}
				}
				this.children[i]._buildIds(parseInt(i)+1);
			}
		},
		_buildIds: function (current) {
			if (this.widget.elements[current] && !this.widget.config.noWarn) 
				console.warn("Multiple postanoTree elements with identical ids - will cause erratic behavior");
			this.widget.elements[current] = this;
			this.id = current;
			for (var i in this.children){
				if (typeof this.widget.config.getIdFromLabel !== "undefined" && this.children[i].label){
					var match = this.widget.config.getIdFromLabel(this.children[i].label);
					if (match !== null){
						this.children[i]._buildIds(match);
						continue;
					}
				}
				this.children[i]._buildIds(current+"."+(parseInt(i)+1));
			}
		},
	});

	Folder = Element.extend({
		init: function (widget) {
			this._super(widget); 
			this.open = true;
		},
		printTree: function (indent) {
			if (!indent) indent = 0;
			this.print(this.id, indent);
			for (var i in this.children){
				this.children[i].printTree(indent+2);
			}
		},
	});

	Root = Folder.extend({
		printTree: function (indent) {
			if (!indent) indent = 0;
			this.print("Root", indent);
			for (var i in this.children){
				this.children[i].printTree(indent+2);
			}
		},
	});


	//Widgets
	SimpleWidget = Class.extend({
		tree: null,
		depth: 0,
		//Generate HTML
		_buildElement: function (json) {
			if (json.label || json.children) {
				this.html += '<li class="'+this.config.globalClass+' '+this.config.elementClass+' postano-tree-depth-'+(++this.depth)+'" style="list-style-type: none;">';
				this._buildLabel(json.label);
				this._buildChildren(json.children);
				this.depth--;
				this.html += '</li>';
			}
		},
		_buildLabel: function (label) {
			if (!isDefined(label)) return;
			this.html += '<span class="'+this.config.globalClass+' '+this.config.labelClass+'" style="display:inline;">';
			this.html += label;
			this.html += '</span>';
		},
		_buildChildren: function (children) {
			if (!isArray(children)) return;
			this.html += '<ul class="'+this.config.globalClass+' '+this.config.groupClass+'">';
			for (var i = 0; i < children.length; i++){
				this._buildElement(children[i], i);
			}
			this.html += '</ul>';
		},

		//Public functions
		buildHTML: function () {
			if (!isDefined(this.json)) return;
			this.html += '<div class="'+this.config.globalClass+' '+this.config.treeClass+'" id="postano-tree">';
			this._buildChildren(this.json);
			this.html += '</div>';
		},

		setDefaultConfigs: function (config) {
			config = config || {};
			this.config.noWarn		= isDefined (config.noWarn)			? config.noWarn			: false;
			this.config.globalClass	= isDefined (config.globalClass)	? config.globalClass	: "postanoTree";
			this.config.tagClass	= isDefined (config.tagClass)		? config.tagClass 
																		: this.config.globalClass !== ""? this.config.globalClass 
																										: "postanoTree";
			this.config.treeClass	= isDefined (config.treeClass)		? config.treeClass		: this.config.tagClass + "-tree";
			this.config.elementClass= isDefined (config.elementClass)	? config.elementClass	: this.config.tagClass + "-element";
			this.config.labelClass	= isDefined (config.labelClass)		? config.labelClass		: this.config.tagClass + "-label";
			this.config.groupClass	= isDefined (config.groupClass)		? config.groupClass		: this.config.tagClass + "-group";
		},

		init: function ($target, json, config) {
			json = json || JSON.parse($target.html());
			this.$target = $target;
			this.json = json;
			this.config = {};
			this.html = "";

			this.setDefaultConfigs(config);
			this.buildHTML();
			this.$target.html(this.html);
		},
	});

	MouseWidget = SimpleWidget.extend({
		_buildElement: function (json) {
			var parent = this.cwe;
			this.cwe = json.children ? new Folder(this) : new Element(this);
			this.cwe.parent = parent;
			this._super(json);
			if (typeof parent !== "undefined"){
				parent.append(this.cwe);
				this.cwe = parent;
			} else this.tree = this.cwe;
		},
		_buildLabel: function (label) {
			if (this.cwe instanceof Folder) 
				this.html += '<a class="'+this.config.globalClass+' '+this.config.folderClass+'">'+this.config.folderIconOpen+'</a>';
			this.cwe.label = label;
			this._super(label);
		},
		_buildChildren: function (children) {
			if (!isArray(children)) return;
			this.html += '<ul class="'+this.config.globalClass+' '+this.config.groupClass+' '+this.config.folderOpen+'">';
			for (var i = 0; i < children.length; i++){
				this._buildElement(children[i], i);
			}
			this.html += '</ul>';
		},

		buildHTML: function (json) {
			this.tree = this.cwe = new Root(this);
			this.cwe.label = "";
			this._super(json);
		},

		generateClickHandler: function () {
			var _this = this;
			this.clickHandler = function (e) {
				target = $(e.currentTarget).nextAll("ul");
					var element = _this.getElementFromLabel(target.html());
				if (target.hasClass(_this.config.folderOpen)){
					if (typeof element !== "undefined") element.open = false;
					target.slideUp(_this.slideSpeed);
					target.removeClass(_this.config.folderOpen).addClass(_this.config.folderClosed).prev().prev().html(_this.config.folderIconClosed);
				} else if (target.hasClass(_this.config.folderClosed)){
					if (typeof element !== "undefined") element.open = true;
					target.slideDown(_this.slideSpeed);
					target.removeClass(_this.config.folderClosed).addClass(_this.config.folderOpen).prev().prev().html(_this.config.folderIconOpen);
				}
			};
			return this.clickHandler;
		},

		registerClickHandlers: function () { 
			$("."+this.config.folderClass).click(this.generateClickHandler()); },

		getElementFromLabel: function (label) { 
			return this.elements[this.config.getIdFromLabel(label.toString())]; },

		save: function (curr) {
			curr = curr || this.tree;
			if (curr instanceof Folder) {
				this.state[curr.id] = {
					open: curr.open
				};
				for (var i in curr.children){
					this.save(curr.children[i]);
				}
			}
			return this.state;
		},

		load: function (state, slow) {
			this.state = state || this.state;
			for (var elemId in this.state){
				var elemState = this.state[elemId];
				if (typeof elemState.open !== "undefined"){ 
					var folderElement = this.config.getElementFromId(elemId).parent().prev();
					if (!slow) this.slideSpeed = 0;
					if (!elemState.open && folderElement.hasClass(this.config.folderOpen)){
						folderElement.trigger('click');
					} else if (elemState.open && folderElement.hasClass(this.config.folderClosed)){
						folderElement.trigger('click');
					}
					this.slideSpeed = 200;
				}
			}
		},

		setDefaultConfigs: function (config) {
			this._super(config);
			config = config || {};
			this.config.folderClass			= isDefined(config.folderClass)			? config.folderClass		: this.config.tagClass + "-folder";
			this.config.folderOpen			= isDefined(config.folderOpen)			? config.folderOpen			: this.config.tagClass + "-folderOpen";
			this.config.folderClosed		= isDefined(config.folderClosed)		? config.folderClosed		: this.config.tagClass + "-folderClosed";
			this.config.folderIconOpen		= isDefined(config.folderIconOpen)		? config.folderIconOpen		: "\u25bc"; //▼
			this.config.folderIconClosed	= isDefined(config.folderIconClosed)	? config.folderIconClosed	: "\u25b6"; //▶
			this.config.getIdFromLabel		= isDefined(config.getIdFromLabel)		? config.getIdFromLabel		:  function () { return "error"; };
			this.config.getElementFromId	= isDefined(config.getElementFromId)	? config.getElementFromId	: function () { return $(); };
		},

		init: function ($target, json, config){
			this.elements = {};
			this.state = {};
			this.slideSpeed = 200;
			this._super($target, json, config);
			this.tree.buildIds();
			this.registerClickHandlers();
		},
	});

	DragAndDropWidget  = MouseWidget.extend({
		_getElementsAtPosition: function (y) {
			return $("."+this.config.elementClass).filter(function () {
				e = $(this);
				var et = e.offset().top, ul = e.children("ul");
				return /*(ul.length) ? (et < y && y < ul.offset().top) :*/ (et < y && y <= et+e.outerHeight(true));
			});
		},

		getElementAtPosition: function (y, dragging) {
			var elems = this._getElementsAtPosition(y);
			var l = Number.MAX_VALUE, e = null;
			for (var i = 0; i < elems.length; i++){
				if (elems[i].outerHTML.length < l && elems[i] != dragging){
					l = elems[i].outerHTML.length;
					e = i;
				}
			}
			return elems[e];
		},

		getRelativeYIndex: function (e, y) {
			if (!e.length) return;
			var ul = e.children("ul"), et = e.offset().top, h = (ul.length) ? ul.offset().top-et : e.outerHeight(true);
			return (y < et+(++h)/2) ? y-et : y-(et+h);
		},

		genElement: function ($elem, toGen, y) {
			var relY = this.getRelativeYIndex($elem, y);
			if (relY > 0 && relY < this.config.dropGutter) {
				return $elem.before(toGen).prev();
			} else if (relY < 0 && relY > -this.config.dropGutter) {
				var id = this.config.getIdFromLabel($elem.children("."+this.config.labelClass).html());
				if (this.elements[id] instanceof Folder){
					return $elem.children("."+this.config.groupClass).prepend(toGen).children("."+this.config.elementClass+":first-child");
				} else {
					return $elem.after(toGen).next();
				}
			} else {
				return $();
			}
		},

		buildDraggieStart: function () {
			return function (drag) { 
				drag.isMoving = false;
				$(drag.element).removeClass("is-dragging");
			}.bind(this);
		},

		buildDraggieMove: function () {
			return function (drag, e, mouse) {
				$(".postano-tree-generated").remove();
				drag.isMoving = true;
				var $drag = $(drag.element);
				if (!$drag.hasClass("is-dragging")) $drag.addClass("is-dragging");
				var elem = this.getElementAtPosition(mouse.pageY, drag.element);
				if (DEBUG) console.log(elem);
				this.genElement($(elem), drag.element.outerHTML, mouse.pageY).removeClass("is-dragging").addClass("postano-tree-generated").css("-webkit-transform", '');
				if (!elem) return;
				var id = this.config.getIdFromLabel($(elem).children("."+this.config.labelClass).html());
				if (this.elements[id] instanceof Folder) {
					if (this.elements[id].open === false)
						this.config.getElementFromId(id).parent().prev().trigger("click");
				}
			}.bind(this);
		},

		buildDraggieEnd: function () {
			return function (drag, e, mouse){
				if (!drag.isMoving) return;
				$(".postano-tree-generated").remove();
				$(drag.element).css("left", '').css("top", '');
				var $elem = $(this.getElementAtPosition(mouse.pageY, drag.element));
				if ($elem.length) {
					var newElement = this.genElement($elem, drag.element.outerHTML, mouse.pageY);
					if (!newElement.length) return;
					drag.element.remove();
					newElement.find("."+this.config.folderClass).click(this.clickHandler);
					this.setupDraggabilly(newElement);
					this.setupDraggabilly(newElement.find("."+this.config.elementClass));
				}
			}.bind(this);
		},

		setupDraggabilly: function (elem) {
			var elems = elem || $("."+this.config.elementClass);
			for (var i = 0; i < elems.length; i++){
				var draggie = new Draggabilly(elems[i]);
				draggie.on('dragStart', this.buildDraggieStart());
				draggie.on('dragMove', this.buildDraggieMove());
				draggie.on('dragEnd', this.buildDraggieEnd());
			}
		},

		setDefaultConfigs: function (config) {
			this._super(config);
			config = config || {};
			this.config.dropGutter = isDefined(config.dropGutter) ? config.dropGutter : 15;
		},

		init: function ($target, json, config){
			this._super($target, json, config);
			this.setupDraggabilly();
		},
	});

	return {
		SimpleWidget: SimpleWidget, // Generation from JSON
		MouseWidget: MouseWidget, // Opens, closes and selects
		DragAndDropWidget: DragAndDropWidget, // Moveable items
	};
})(jQuery);
