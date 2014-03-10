# JCTree

###### var widget = JCTree._widgetType_(_target, structure, configuration_);

Where [`target`](#Target) is a jQuery object, [`structure`](#Format) is a JSON object, and [`configuration`](#Config) is an object.

`widgetType` is [SimpleWidget](#Simple), [MouseWidget](#Mouse) or [DragAndDropWidget](#Drag)

#### <a name="Format"></a> Format

	[
		{
			"label": "Folder",
			"children": [
				{
					"label": "Folder with no children",
					"children": []
				},
				...
			]
		},
		{
			"label": "Element - no 'children' attribute. Will not display folder icon if MouseWidget"
		},
		...
	]

## <a name="Simple"></a> SimpleWidget

##### The generation of the HTML

#### <a name="Target"></a>Structure
	<target>
		<div class="globalClass treeClass" id="postano-tree">
			<ul class="globalClass groupClass">
				<li class="globalClass elementClass postano-depth-(depth)">
					<span class="globalClass labelClass"> Label </span>
					<ul class="globalClass groupClass">
						...
					</ul>
				</li>
				...
			</ul>
		</div>
	</target>

####<a name="Config"></a>Configuration Options

Config | Default | Value 
--------|---------|-------
`globalClass` | postanoTree | A class added to every node in the tree proper.
`tagClass` | `globalClass` | The class that is by default prepended to the rest of the classes. If `globalClass` is falsy, the default is postanoTree.
`treeClass` | `tagClass`-tree | The class present in the root `DIV`.
`groupClass` | `tagClass`-group | The class present in the `UL` elements.
`elementClass` | `tagClass`-element |  The class present in the `LI` elements.
`labelClass` | `tagClass`-label | The class present in the `DIV` elements other than the root.

## <a name="Mouse"></a> MouseWidget

##### The opening and closing of elements

#### Structure

###### Open Element

	<ul class="globalClass groupClass folderOpen">
		<li class="globalClass elementClass postano-depth-(depth)">
			<a class="globalClass folderClass"> folderIconOpen </a>
			<span class="globalClass labelClass"> Label </span>
			<ul class="globalClass groupClass">
				...
			</ul>
		</li>
		...
	</ul>

###### Closed Element

	<ul class="globalClass groupClass folderClosed">
		<li class="globalClass elementClass postano-depth-(depth)">
			<a class="globalClass folderClass"> folderIconClosed </a>
			<span class="globalClass labelClass"> Label </span>
			<ul class="globalClass groupClass">
				...
			</ul>
		</li>
		...
	</ul>

####Configuration Options

SimpleWidget configs and:

Config | Default | Value 
--------|---------|-------
`folderClass` | `tagClass`-folder | The class for the open-close `A` element
`folderOpen` | `tagClass`-folderOpen | The class for open
`folderClosed` | `tagClass`-folderClosed | The class for closed
`folderIconOpen` | \u25bc  ▼ | The open icon. (Can accept arbitrary HTML.)
`folderIconClosed` | \u25b6  ▶ | The closed icon. (Can accept arbitrary HTML.)
`getIdFromLabel` | Outline schema | ""
`getElementFromId` | Outline schema | _$()_

#### Methods

###### Save State
`var state = widget.save();`

Saves state internally; returns same state;

###### Load State
`widget.load(state);`

Loads given state. If no given state, loads last saved state.

###### Examples
	var state = widget.save();
	// Interact with widget
	widget.load(state);

Leaves widget in same state as before. Functionally identical to:

	widget.save();
	// Interact with widget
	widget.load();

if `widget.save()` is not called in the code block;

##### State Structure

	{
		_id_: {
			_settings_
		},
		...
	}

## <a name="Drag"></a> DragAndDropWidget

##### The manipulation of the tree

#### Configs:

None
