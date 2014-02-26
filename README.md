# JCTree

###### var widget = JCTree._widgetType_(_target, structure, configuration_);

Where `target` is a jQuery object, `structure` is a JSON object, and `configuration` is an object.

## SimpleWidget

##### The generation of the HTML

####Configs

 Config | Default | Value 
--------|---------|-------
 `globalClass` | postanoTree | A class added to every node in the tree proper.
 `tagClass` | `globalClass` | The class that is by default prepended to the rest of the classes. If `globalClass` is falsy, the default is postanoTree.
 `treeClass` | `tagClass`-tree | The class present in the root `DIV`.
 `groupClass` | `tagClass`-group | The class present in the `UL` elements.
 `elementClass` | `tagClass`-element |  The class present in the `LI` elements.
 `labelClass` | `tagClass`-label | The class present in the `DIV` elements other than the root.

## MouseWidget

##### The opening and closing of elements

####Configs

SimpleWidget configs and:

 Config | Default | Value 
--------|---------|-------
 `folderClass` | `tagClass`-folder | The class for the open-close `A` element
 `folderOpen` | `tagClass`-folderOpen | The class for open
 `folderClosed` | `tagClass`-folderClosed | The class for closed
 `folderIconOpen` | \u25bc  ▼ | The open icon. (Can accept arbitrary HTML.)
 `folderIconClosed` | \u25b6  ▶ | The closed icon. (Can accept arbitrary HTML.)
 `getIdFromLabel` | Outline schema |
 `getElementFromId` | Outline schema |


 ## DragAndDropWidget

 ##### The manipulation of the tree

 #### Configs:

 None