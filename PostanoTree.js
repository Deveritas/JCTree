/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
	

/*
* 
* ul
* 	li
* 		div
* 			element
* 		<subtree>
* 	li
* 		div
* 			element
* 		<subtree>
* 	...
* 
* 
* 
* 
* Using JQTree's format, for more cross-compatibility
{
	label: "<tag></tag>",
	children: [{
		label: "<tag></tag>",
		children: []
	},{
		label: "<tag></tag>",
		children: [{
			label: "<tag></tag>",
			children: []
		}]
	}]
};
*
*
* ul
* 	li
* 		div
* 			label
* 		ul
* 			li
* 				div
* 					label
* 			li
* 				div
* 					label
* 				ul
* 					li
* 						div
* 							label
*/

var jQuery, JCTree;
JCTree = (function ($) {
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
	var isArray = function (v) {
		return Object.prototype.toString.call( v ) === '[object Array]'
	};
	isArray = Array.isArray || isArray;
	var isDefined = function (v) {return typeof v != "undefined";};
	var isFunction = function (v) {return typeof v == "function";};

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
		printTree: function (indent) {
			if (!indent) indent = 0;
			var out = "";
			for (var i = 0; i < indent; i++) out += " ";
			out += "Element";//this.label;
			console.log(out);
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
			var out = "";
			for (var i = 0; i < indent; i++) out += " ";
			out += this.id;//this.label;
			console.log(out);
			for (var i in this.children){
				this.children[i].printTree(indent+2);
			}
		}
	});

	Root = Folder.extend();


	//Widgets
	SimpleWidget = Class.extend({
		tree: null,
		name: "SimpleWidget",
		//Generate HTML
		_buildElement: function (json) {
			if (json.label || json.children) {
				this.html += '<li class="'+this.config.globalClass+' '+this.config.elementClass+'" style="list-style-type: none;">';
				this._buildLabel(json.label);
				this._buildChildren(json.children);
				this.html += '</li>';
			}
		},
		_buildLabel: function (label) {
			if (!isDefined(label)) return;
			this.html += '<span class="'+this.config.globalClass+' '+this.config.labelClass+'" style="display:inline;">';
			this.html += label;
			this.html += '</span>'
		},
		_buildChildren: function (children) {
			if (!isArray(children)) return;
			this.html += '<ul class="'+this.config.globalClass+' '+this.config.groupClass+'">';
			for (var i = 0; i < children.length; i++){
				this._buildElement(children[i], i);
			}
			this.html += '</ul>'
		},

		//Public functions
		buildHTML: function () {
			if (!isDefined(this.json)) return;
			this.html += '<div class="'+this.config.globalClass+' '+this.config.treeClass+'" id ="tree">';
			this._buildChildren(this.json);
			this.html += '</div>';
		},

		setDefaultConfigs: function (config) {
			config = config || {};
			this.config.noWarn       = isDefined (config.noWarn)	   ? config.noWarn : false;
			this.config.globalClass  = isDefined (config.globalClass)  ? config.globalClass  : "postanoTree";
			this.config.tagClass	 = isDefined (config.tagClass) 	   ? config.tagClass 
																   	   : this.config.globalClass != "" ? this.config.globalClass 
																   								   		: "postanoTree";
			this.config.treeClass 	 = isDefined (config.treeClass)    ? config.treeClass    : this.config.tagClass + "-tree";
			this.config.elementClass = isDefined (config.elementClass) ? config.elementClass : this.config.tagClass + "-element";
			this.config.labelClass   = isDefined (config.labelClass)   ? config.labelClass   : this.config.tagClass + "-label";
			this.config.groupClass   = isDefined (config.groupClass)   ? config.groupClass   : this.config.tagClass + "-group";
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
				this.html += '<a class="'+this.config.globalClass+' '+this.config.folderClass+' '+this.config.folderOpen+'">'+this.config.folderIconOpen+'</a>'
			this.cwe.label = label;
			this._super(label);
		},

		buildHTML: function (json) {
			this.tree = this.cwe = new Root(this);
			this.cwe.label = "";
			this._super(json);
		},

		registerClickHandlers: function () {
			var _this = this;
			$("."+this.config.folderClass).click(function (e){
				target = $(e.currentTarget);
				if (target.hasClass(_this.config.folderOpen)){
					var element = _this.getElementFromLabel(target.next().html());
					if (typeof element !== "undefined") element.open = false;
					target.nextAll("ul").slideUp(_this.slideSpeed);
					target.removeClass(_this.config.folderOpen).addClass(_this.config.folderClosed).html(_this.config.folderIconClosed);
				} else if (target.hasClass(_this.config.folderClosed)){
					var element = _this.getElementFromLabel(target.next().html());
					if (typeof element !== "undefined") element.open = true;
					target.nextAll("ul").slideDown(_this.slideSpeed);
					target.removeClass(_this.config.folderClosed).addClass(_this.config.folderOpen).html(_this.config.folderIconOpen);
				}
			});
		},

		getElementFromLabel: function (label) {
			return this.elements[this.config.getIdFromLabel(label.toString())];
		},

		save: function (curr) {
			var curr = curr || this.tree;
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

		load: function (state) {
			this.state = state || this.state;
			for (var elemId in this.state){
				var elemState = this.state[elemId];
				if (typeof elemState.open !== "undefined"){ 
					var folderElement = this.config.getElementFromId(elemId).parent().prev();
					this.slideSpeed = 0;
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
			var _this = this;
			config = config || {};
			this.config.folderClass  	 = isDefined(config.folderClass)  	  ? config.folderClass  	: this.config.tagClass + "-folder";
			this.config.folderOpen 		 = isDefined(config.folderOpen)   	  ? config.folderOpen   	: this.config.tagClass + "-folderOpen";
			this.config.folderClosed 	 = isDefined(config.folderClosed) 	  ? config.folderClosed 	: this.config.tagClass + "-folderClosed";
			this.config.folderIconOpen 	 = isDefined(config.folderIconOpen)   ? config.folderIconOpen 	: "\u25bc"; //▼
			this.config.folderIconClosed = isDefined(config.folderIconClosed) ? config.folderIconClosed : "\u25b6"; //▶
			this.config.getIdFromLabel	 = isDefined(config.getIdFromLabel)   ? config.getIdFromLabel   :  function () { return "error"; }
			this.config.getElementFromId = isDefined(config.getElementFromId) ? config.getElementFromId : function () { return $(); }
		},

		name: "MouseWidget",
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
	});

	return {
		SimpleWidget: SimpleWidget, // Generation from JSON
		MouseWidget: MouseWidget, // Opens, closes and selects
		DragAndDropWidget: DragAndDropWidget, // Moveable items
	};
})(jQuery);
