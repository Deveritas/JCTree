var jQuery, JCTree;
JCTree = (function ($) {
	//DEBUG setting
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
	/* Simple JavaScript Inheritance
	 * By John Resig http://ejohn.org/
	 * MIT Licensed.
	 */
	// Inspired by base2 and Prototype
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

	function consoleTrap (obj, func) {
 		var str = "", oldlog = (console.log);
 		console.log = function (text) {
 			str = str + text + '\n';};
 		func.apply(obj);
 		console.log = oldlog;
 		return str;
 	} 

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
		print: function (indent, text){
			var out = "";
			for (var i = 0; i < indent; i++) out += " ";
			out += text;
			console.log(out);
		},
		printTree: function (indent) {
			if (!indent) indent = 0;
			this.print(indent, "Element");
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
			this.print(indent, this.id);
			for (var i in this.children){
				this.children[i].printTree(indent+2);
			}
		},
	});

	Root = Folder.extend({
		printTree: function (indent) {
			if (!indent) indent = 0;
			this.print(indent, "Root");
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
		_buildLabel: function (label) {
			if (isDefined(label))
				this.cw$.append('<span class="'+this.config.globalClass+' '+this.config.labelClass+'">'+label+'</span>');
		},
		_buildElement: function (label) {
			if (label) {
				this.cw$.append('<div class="'+this.config.globalClass+' '+this.config.elementClass+'"></div>');
				this.cw$ = this.cw$.children("."+this.config.elementClass).last();
				this._buildLabel(label);
				this.cw$  = this.cw$.parent();
			}
		},
		_buildChild: function (json) {
			if (json.label || json.children) {
				this.cw$.append('<li class="'+this.config.globalClass+' '+this.config.childClass+'"></li>');
				this.cw$ = this.cw$.children("."+this.config.childClass).last();
				this._buildElement(json.label);
				this._buildChildren(json.children);
				this.cw$  = this.cw$.parent();
			}
		},
		_buildChildren: function (children) {
			if (!isArray(children)) return;
			this.cw$.append('<ul class="'+this.config.globalClass+' '+this.config.childrenClass+'"></ul>');
			this.cw$ = this.cw$.children("."+this.config.childrenClass).last();
			for (var i = 0; i < children.length; i++) this._buildChild(children[i], i);
			this.cw$  = this.cw$.parent();
		},
		buildHTML: function (json) {
			if (!isDefined(json)) return;
			this.cw$ = this.$target;
			this.cw$.append('<div class="'+this.config.globalClass+' '+this.config.treeClass+'"></div>');
			this.cw$ = this.cw$.children("."+this.config.treeClass).last();
			this._buildChildren(json);
			this.cw$  = this.cw$.parent();
		},

		setDefaultConfigs: function (config) {
			config = config || {};
			var globalDefault = "postano-tree"
			this.config.noWarn		= isDefined(config.noWarn)		? config.noWarn			: false;
			this.config.globalClass	= isDefined(config.globalClass)	? config.globalClass	: globalDefault;
			this.config.tagClass	= isDefined(config.tagClass)	? config.tagClass 
																	: this.config.globalClass !==""	? this.config.globalClass 
																									: globalDefault;
			this.config.treeClass	= isDefined(config.treeClass)	? config.treeClass		: this.config.tagClass + "-tree";
			this.config.childrenClass	= isDefined(config.childrenClass)	? config.childrenClass	: this.config.tagClass + "-children";
			this.config.childClass	= isDefined(config.childClass)	? config.childClass		: this.config.tagClass + "-child";
			this.config.elementClass= isDefined(config.elementClass)? config.elementClass	: this.config.tagClass + "-element";
			this.config.labelClass	= isDefined(config.labelClass)	? config.labelClass		: this.config.tagClass + "-label";
			this.config.depthClass	= isDefined(config.depthClass)	? config.depthClass		: this.config.tagClass + "-depth";
			this.config.selectedClass	= isDefined(config.selectedClass)	? config.selectedClass	: this.config.tagClass + "-selected";
		},
 
		stripDepths: function () {
			var everything = this.$target.find("."+this.config.childClass);
			for (var d = 1; d <= this.maxDepth; d++) {
				everything.removeClass(this.config.depthClass+"-"+d);
			}
			this.maxDepth = 0;
		},
		generateDepths: function () {
			var depth = 0, cw$;
			cw$ = this.$target.children("."+this.config.treeClass);
			cw$ = cw$.children("."+this.config.childrenClass);
			cw$ = cw$.children("."+this.config.childClass);
			while (cw$.length) {
				++depth;
				cw$.addClass(this.config.depthClass+"-"+depth);
				cw$ = cw$.children("."+this.config.childrenClass);
				cw$ = cw$.children("."+this.config.childClass);
			}
			this.maxDepth = depth;
		},
		buildDepths: function () {
			this.stripDepths();
			this.generateDepths();
		},

		generateEventHandlers: function () {
			var _this = this;
			this.selectClickHandler = function (e) {
				var $elem = $(this).first();
				if (!$elem.hasClass(_this.config.selectedClass)) {
					$("."+_this.config.selectedClass).removeClass(_this.config.selectedClass);
					$elem.addClass(_this.config.selectedClass);
				}
				e.stopPropagation();
			}
		},
		registerEventHandlers: function (context) {
			context = context || $("."+this.config.globalClass);
			context.parent().find("."+this.config.childClass).click(this.selectClickHandler);
		},

		init: function ($target, json, config) {
			this.config = {};
			this.setDefaultConfigs(config);

			this.$target = $target;
			this.buildHTML(json || JSON.parse($target.html()));

			this.maxDepth = 0;
			this.generateDepths();

			this.generateEventHandlers()
			this.registerEventHandlers();
		},
	});

	MouseWidget = SimpleWidget.extend({
		_buildChild: function (json) {
			var parent = this.cwe;
			this.cwe = json.children ? new Folder(this) : new Element(this);
			this.cwe.parent = parent;
			this._super(json);
			this.cwe.element = this.cw$.children("."+this.config.childClass)[0];
			parent.append(this.cwe);
			this.cwe = parent;
		},
		_buildLabel: function (label) {
			if (this.cwe instanceof Folder) 
				this.cw$.append('<a class="'+this.config.globalClass+' '+this.config.folderClass+'">'+this.config.folderIconOpen+'</a>');
			this.cwe.label = label;
			this._super(label);
		},
		_buildChildren: function (children) {
			if (!isArray(children)) return;
			this.cw$.append('<ul class="'+this.config.globalClass+' '+this.config.childrenClass+' '+this.config.folderOpen+'"></ul>');
			this.cw$ = this.cw$.children("."+this.config.childrenClass).last();
			for (var i = 0; i < children.length; i++) this._buildChild(children[i], i);
			this.cw$  = this.cw$.parent();
		},
		buildHTML: function (json) {
			this.tree = this.cwe = new Root(this);
			this.cwe.label = "";
			this._super(json);
		},

		generateEventHandlers: function () {
			this._super();
			var _this = this;
			this.folderClickHandler = function (e) {
				target = $(e.currentTarget).parent("."+_this.config.elementClass).nextAll("."+_this.config.childrenClass);
					var element = _this.getElementFromLabel(target.html());
				if (target.hasClass(_this.config.folderOpen)){
					if (typeof element !== "undefined") element.open = false;
					target.slideUp(_this.slideSpeed);
					target.removeClass(_this.config.folderOpen).addClass(_this.config.folderClosed);
					target.prevAll("."+_this.config.elementClass).children("."+_this.config.folderClass).html(_this.config.folderIconClosed);
				} else if (target.hasClass(_this.config.folderClosed)){
					if (typeof element !== "undefined") element.open = true;
					target.slideDown(_this.slideSpeed);
					target.removeClass(_this.config.folderClosed).addClass(_this.config.folderOpen);
					target.prevAll("."+_this.config.elementClass).children("."+_this.config.folderClass).html(_this.config.folderIconOpen);
				}
			};
		},
		registerEventHandlers: function (context) {
			context = context || $("."+this.config.globalClass); 
			this._super(context);
			context.find("."+this.config.folderClass).click(this.folderClickHandler);
		},

		getElementFromLabel: function (label) { 
			return this.elements[this.config.getIdFromLabel(label.toString())]; 
		},

		setDefaultConfigs: function (config) {
			this._super(config);
			config = config || {};
			this.config.folderClass			= isDefined(config.folderClass)			? config.folderClass		
																					: this.config.tagClass + "-folder";
			this.config.folderOpen			= isDefined(config.folderOpen)			? config.folderOpen			
																					: this.config.tagClass + "-folder-open";
			this.config.folderClosed		= isDefined(config.folderClosed)		? config.folderClosed		
																					: this.config.tagClass + "-folder-closed";
			this.config.folderIconOpen		= isDefined(config.folderIconOpen)		? config.folderIconOpen		: "\u25bc"; //▼
			this.config.folderIconClosed	= isDefined(config.folderIconClosed)	? config.folderIconClosed	: "\u25b6"; //▶
			this.config.getIdFromLabel		= isDefined(config.getIdFromLabel)		? config.getIdFromLabel		
																					:  function () { return "error"; };
			this.config.getElementFromId	= isDefined(config.getElementFromId)	? config.getElementFromId	
																					: function (id) { return elements[id].element; };
		},

		init: function ($target, json, config){
			this.elements = {};
			this.state = {};
			this.slideSpeed = 200;

			this._super($target, json, config);

			this.tree.buildIds();
		},


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
	});

	DragAndDropWidget  = MouseWidget.extend({
		_getElementsAtPosition: function (y) {
			var _this = this;
			return $("."+this.config.childClass).filter(function () {
				e = $(this);
				var et = e.offset().top, ul = e.children("."+_this.config.childrenClass);
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
		genElement: function ($elem, toGen, y, force) {
			var relY = this.getRelativeYIndex($elem, y);
			if ((relY > 0 && relY < this.config.dropGutter) || force) {
				return $elem.before(toGen).prev();
			} else if (relY < 0 && relY > -this.config.dropGutter) {
				var id = this.config.getIdFromLabel($elem.children("."+this.config.elementClass).children("."+this.config.labelClass).html());
				if (this.elements[id] instanceof Folder){
					return $elem.children("."+this.config.childrenClass).prepend(toGen).children("."+this.config.childClass+":first-child");
				} else {
					return $elem.after(toGen).next();
				}
			} else {
				return $();
			}
		},
		getElementFromHTMLElement: function (htmlelement) {
			for (var element in this.elements) {
				if (htmlelement == this.elements[element].element) return this.elements[element];
			}
		},
		alterTree: function (moving, $newElement) {
			var newParentHTML = $newElement.parent().closest("."+this.config.childClass);
			if (newParentHTML.length){
				var siblings = moving.parent.children;
				var index = siblings.indexOf(moving);
				if (index > -1) siblings.splice(index, 1);
				newParent = this.getElementFromHTMLElement(newParentHTML[0]);
				var newIndex = $newElement.index();
				newParent.children.splice(newIndex, 0, moving);
			}
		},
		buildDraggieStart: function () {
			return function (drag) {
				console.log(consoleTrap(this.tree, this.tree.printTree));
				drag.isMoving = false;
				drag.hasStoppedMoving = false;
				$(drag.element).removeClass("is-dragging");
				drag.currentDraggingElement = this.getElementFromHTMLElement(drag.element);
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
				if (isDefined(elem)){
					var newElem = this.genElement($(elem), drag.element.outerHTML, mouse.pageY);
					newElem.removeClass("is-dragging").addClass("postano-tree-generated").css("-webkit-transform", '');
				} else {
					var newElem = this.genElement($(drag.element), drag.element.outerHTML, 0, true);
					newElem.removeClass("is-dragging").addClass("postano-tree-generated").css("-webkit-transform", '');
				}
				this.buildDepths();
				// if (!elem) return;
				// var id = this.config.getIdFromLabel($(elem).children("."+this.config.labelClass).html());
				// if (this.elements[id] instanceof Folder) {
				// 	if (this.elements[id].open === false)
				// 		this.config.getElementFromId(id).parent().prev().trigger("click");
				// }
			}.bind(this);
		},
		buildDraggieEnd: function () {
			return function (drag, e, mouse){
				if (!drag.isMoving)
					return;
				if (!drag.hasStoppedMoving) 
					drag.hasStoppedMoving = true;
				else return;
				$(".postano-tree-generated").remove();
				$(drag.element).css("left", '').css("top", '').addClass("is-dragging");
				var $elem = $(this.getElementAtPosition(mouse.pageY, drag.element));
				if ($elem.length !== 0) {
					var newElement = this.genElement($elem, drag.element.outerHTML, mouse.pageY).removeClass("is-dragging");
					if (!newElement.length) return;
					drag.element.remove();
					this.registerEventHandlers(newElement);
					this.buildDepths();
					this.alterTree(drag.currentDraggingElement, newElement);
					$(document).trigger("tree.move", [drag.currentDraggingElement, this.getElementFromHTMLElement($elem[0])]);
				} else $(drag.element).removeClass("is-dragging");
			}.bind(this);
		},
		registerEventHandlers: function (context) {
			this._super(context);
			var elems = context ? context.parent().find("."+this.config.childClass) : $("."+this.config.childClass);
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

		init: function ($target, json, config, depth){
			this._super($target, json, config);
			this.slideSpeed = 0;
			if (depth)
				$("."+this.config.depthClass+"-"+depth+" ."+this.config.folderClass).trigger("click");
			$(".postano-tree-depth-2").first().trigger("click");
			this.slideSpeed = 200;
		},
	});

	return {
		SimpleWidget: SimpleWidget, // Generation from JSON
		MouseWidget: MouseWidget, // Opens, closes and selects
		DragAndDropWidget: DragAndDropWidget, // Moveable items
	};
})(jQuery);
